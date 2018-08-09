# -*- coding: utf-8 -*-
#
# SWTICH https://www.switch.ch
#
# Licensed under the Affero General Public License, Version 3.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#       https://www.gnu.org/licenses/agpl-3.0.en.html
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#  License for the specific language governing permissions and limitations
#  under the License.
#
#  Developed by Iterativ GmbH
#
# Created on 13.04.18
# @author: <christian.cueni@iterativ.ch>
import logging
import time
from django.conf import settings
from django.utils import http as utils_http
from django.views import generic
from quickstart.rest.utils import get_limits, autonetwork_name, autonetwork_subnet_name, \
    send_create_email, create_security_group, create_security_rules

from openstack_dashboard.api.cinder import volume_create, \
    volume_get
from openstack_dashboard.api.neutron import FloatingIpManager, SecurityGroupManager, is_enabled_by_config, \
    network_list, network_create, subnet_create, router_add_interface, router_create, tenant_floating_ip_list, \
    tenant_floating_ip_release, \
    network_list_for_tenant, neutronclient, Port, \
    subnet_delete, router_list, router_delete, network_delete, router_remove_interface
from openstack_dashboard.api.nova import server_create, server_list, instance_volume_attach, server_delete
from openstack_dashboard.api.nova import server_suspend, \
    server_resume, server_unpause, server_stop, server_start
from openstack_dashboard.api.rest import urls  # TODO: remove local urls file
from openstack_dashboard.api.rest import utils as rest_utils

LOG = logging.getLogger(__name__)
SW_METADATA = ("sw_quickstart", "autocreate")
PRIVATE_NETWORK = "private"
USE_PRIVATE_NETWORK = True


@urls.register
class Servers(generic.View):
    """API over all servers."""

    url_regex = r'extension/servers/$'

    _optional_create = [
        'block_device_mapping', 'block_device_mapping_v2', 'nics', 'meta',
        'availability_zone', 'instance_count', 'admin_pass', 'disk_config',
        'config_drive'
    ]

    def _get_or_allocate_floating_ip(self, public_network, floating_ip_manager):
        floating_ip = None

        # find unused floating ip
        for ip in floating_ip_manager.list():
            if not ip.instance_id:
                floating_ip = ip
                LOG.debug("Servers._get_or_allocate_floating_ip(): Using existing Floating IP")

        # allocate if no floating ip is available
        if not floating_ip:
            floating_ip = floating_ip_manager.allocate(public_network.id)
            LOG.debug("Servers._get_or_allocate_floating_ip(): Allocating new Floating IP")

        return floating_ip

    def _associate_floating_ip(self, neutron_enabled, floating_ip_manager, instance, floating_ip, request):
        # attach IP if neturon is enabled
        if neutron_enabled:
            for j in range(10):
                target_id = self._get_target_id_by_instance(instance.id, request)
                LOG.debug(("Servers._associate_floating_ip(): Floating IP target_id {}".format(target_id)))
                if target_id:
                    floating_ip_manager.associate(floating_ip.id, target_id)
                    break
                else:
                    time.sleep(1)
                    LOG.debug("Servers._associate_floating_ip(): Floating IP associated")

    # As horizon caches the ports request we need to clone it here
    # Shamelessly copied from https://github.com/openstack/horizon/blob/stable/pike/openstack_dashboard/api/neutron.py
    def _get_target_id_by_instance(self, instance_id, request):
        """Returns a target ID of floating IP association.

        :param instance_id: ID of target VM instance
        :param request: The original request

        """
        # In Neutron one port can have multiple ip addresses, so this
        # method picks up the first one and generate target id.

        ports = neutronclient(request).list_ports(device_id=instance_id).get('ports')
        ports_array = [Port(p) for p in ports]
        if not ports_array:
            return None
        return '{0}_{1}'.format(ports_array[0].id, ports_array[0].fixed_ips[0]['ip_address'])

    #will be removed in the next release
    def _create_auto_network(self, request, public_network):
        """Associates a floating ip to an instance
        :param request: The request object
        :param public_network: The public network
        :return: The network interfaces
        """
        LOG.debug("Servers._create_auto_network: Network created")
        auto_network_base = request.user.tenant_id
        auto_network_name = autonetwork_name(request)
        network = network_create(request, name=auto_network_name)
        subnet = subnet_create(request,
                               allocation_pools=[{"start": "192.168.1.100", "end": "192.168.1.200"}],
                               cidr="192.168.1.1/24",
                               enable_dhcp=True,
                               gateway_ip="192.168.1.1",
                               ip_version=4,
                               name=autonetwork_subnet_name(request),
                               network_id=network.id)

        router = router_create(request, external_gateway_info={"network_id": public_network.id},
                               name="%s-router" % auto_network_base)

        router_add_interface(request, router.id, subnet_id=subnet.id)
        nics = [{"net-id": network.id, "v4-fixed-ip": ""}]

        return nics

    def _create_security_group_name_desc(self, rules):
        name = ",".join(map(lambda rule: rule['name'], rules))
        description = "{} security group".format(name)

        return name, description

    def _create_security_group(self, request, rules):
        LOG.debug("Servers._create_security_groups()")
        sec_group_manager = SecurityGroupManager(request)
        name, description = self._create_security_group_name_desc(rules)
        security_group = create_security_group(name, description, sec_group_manager)

        service_rules = getattr(settings, 'SECURITY_GROUP_RULES', {})
        create_security_rules(service_rules, rules, sec_group_manager,
                            security_group.id)
        return security_group.id

    def _does_automatic_network_exist(self, network, auto_network_name):
        return network.name == auto_network_name and network.tenant_id == self.request.user.tenant_id

    def _get_networks(self, auto_network_name):
        """Gets the required networks
        :param request: The request object
        :param auto_network_name: The name of the autonetwork
        :return: The public, private and tenant's network
        """
        public_network = None
        private_network = None
        network = None
        LOG.debug("Servers._get_networks()")
        networks = network_list(self.request)
        for net in networks:
            if net.name == "public": #TODO: add to settings
                public_network = net
            elif net.name == PRIVATE_NETWORK:
                private_network = net
            # check if the automatic network already exists
            elif self._does_automatic_network_exist(net, auto_network_name):
                network = net

        return public_network, private_network, network

    def _create_and_add_security_group(self, security_groups):
        LOG.debug("Servers._create_and_add_security_group()")
        if 'rules_to_create' in self.request.DATA and len(self.request.DATA['rules_to_create']) > 0:
            automatic_security_group = self._create_security_group(self.request, self.request.DATA['rules_to_create'])
            security_groups.append(automatic_security_group)

    def _get_nics_and_floating_ip(self, floating_ip_manager, neutron_enabled):

        nics = []
        floating_ip = None

        auto_network_name = autonetwork_name(self.request)
        # if neutron is enabled get the networks
        if neutron_enabled:
            public_network, private_network, network = self._get_networks(auto_network_name)

            # remove in next release
            # if the automatic network does not exists, create it plus subnets & routers
            if not USE_PRIVATE_NETWORK:
                LOG.debug("Servers._get_nics_and_floating_ip(): Create autonetwork")
                if not network:
                    nics = self._create_auto_network(self.request, public_network)
                else:
                    nics = [{"net-id": network.id, "v4-fixed-ip": ""}]
            # end remove
            else:
                LOG.debug("Servers._get_nics_and_floating_ip(): Get private network")
                # private net only
                nics = [{"net-id": private_network.id, "v4-fixed-ip": ""}]
                # end private

            floating_ip = self._get_or_allocate_floating_ip(public_network, floating_ip_manager)
            return nics, floating_ip

    def _verify_arguments(self, security_groups):
        try:
            args = (
                self.request,
                self.request.DATA['name'],
                self.request.DATA['source_id'],
                self.request.DATA['flavor'],
                self.request.DATA['key_name'],
                None,
                security_groups,
            )

        except KeyError as e:
            raise rest_utils.AjaxError(400, 'missing required parameter '
                                            "'%s'" % e.args[0])

        return args

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a server.

        Create a server using the parameters supplied in the POST
        application/json object. The required parameters as specified by
        the underlying novaclient are:

        :param name: The new server name.
        :param source_id: The ID of the image to use.
        :param flavor_id: The ID of the flavor to use.
        :param key_name: (optional extension) name of previously created
                      keypair to inject into the instance.
        :param user_data: user data to pass to be exposed by the metadata
                      server this can be a file type object as well or a
                      string.
        :param security_groups: An array of one or more objects with a "name"
            attribute.

        Other parameters are accepted as per the underlying novaclient:
        "block_device_mapping", "block_device_mapping_v2", "nics", "meta",
        "availability_zone", "instance_count", "admin_pass", "disk_config",
        "config_drive"

        This returns the new server object on success.
        """
        default_user = ""
        user_email = ""
        floating_ip_manager = FloatingIpManager(request)
        security_groups = request.DATA['security_groups']
        neutron_enabled = is_enabled_by_config('neutron')

        # default user for instance
        if 'default_user' in request.DATA:
            default_user = request.DATA['default_user']

        self._create_and_add_security_group(security_groups)
        nics, floating_ip = self._get_nics_and_floating_ip(floating_ip_manager, neutron_enabled)

        args = self._verify_arguments(security_groups)

        # set keyword arguments
        kw = {
            'nics': nics,
            'disk_config': "AUTO",
            'availability_zone': "nova",
            'meta': {
                SW_METADATA[0]: SW_METADATA[1]
            }
        }

        instance = server_create(*args, **kw)

        self._associate_floating_ip(neutron_enabled, floating_ip_manager, instance, floating_ip, request)

        if settings.HORIZON_CONFIG['SW_SEND_VM_CREATED_NOTIFICATION']:
            LOG.debug("Servers.create(): Send Email")
            user_email = send_create_email(request, floating_ip, default_user, request.DATA['name'])

        return rest_utils.CreatedResponse(
            '/api/nova/servers/%s' % utils_http.urlquote(instance.id),
            {
                "instance": instance.to_dict(),
                "email": user_email,
                "network": PRIVATE_NETWORK
            }
        )

    @rest_utils.ajax()
    def get(self, request):
        """Provides a list with the user's servers

        Example GET:
        http://localhost/api/extension/servers
        """
        try:
            instances, _more = server_list(
                request,
                search_opts=rest_utils.parse_filters_kwargs(request)[0])
        except Exception as e:
            raise rest_utils.AjaxError(400, 'Unable to retrieve instances. '
                                            "'%s'" % e.args[0])

        all_servers = [u.to_dict() for u in instances]

        return {
            'items': all_servers
        }


@urls.register
class ServerPowerStates(generic.View):
    """API for changing a server's powerstate"""

    url_regex = r'extension/servers/(?P<server_id>.+)/powerstate$'

    def _is_state_valid(self):
        return self.request.DATA and 'state' in self.request.DATA and \
               self.request.DATA['state'] in ['suspend', 'stop', 'resume', 'start']

    @rest_utils.ajax()
    def post(self, request, server_id):
        """Changes a server's powerstate
        :param server_id: the server's id

        The data must have "state" field that respresents the required state

        Example POST:
        http://localhost/api/extension/servers/<server_id>/powerstate
        """
        # verify the state
        if self._is_state_valid():
            try:
                if request.DATA['state'] == 'suspend':
                    response = server_suspend(request, server_id)
                elif request.DATA['state'] == 'resume':
                    response = server_resume(request, server_id)
                elif request.DATA['state'] == 'unpause':
                    response = server_unpause(request, server_id)
                elif request.DATA['state'] == 'stop':
                    response = server_stop(request, server_id)
                elif request.DATA['state'] == 'start':
                    response = server_start(request, server_id)
            except:
                response = {}

            return {'response': response}

        return 'notallowed'


@urls.register
class ServerCreateAttachVolume(generic.View):
    """API for creating and attaching a volume"""

    url_regex = r'extension/servers/(?P<server_id>.+)/addvolume$'
    SECONDS_TO_WAIT = 10

    def _is_data_valid(self):
        return 'size' in self.request.DATA and 'name' in self.request.DATA and 'description' in self.request.DATA

    @rest_utils.ajax()
    def post(self, request, server_id):
        """creates and attaches a volume
        :param server_id: the server's id

        The data must have "name", "description" and "size" field that respresent the volumes name, description & size

        Example POST:
        http://localhost/api/extension/servers/<server_id>/addvolume
        """
        # verify data
        if self._is_data_valid():

            v_args = (
                request.DATA['size'],
                request.DATA['name'],
                request.DATA['description'],
                ""
            )

            volume = volume_create(request, *v_args)

            # try for 10 seconds if volume is being created
            for i in range(self.SECONDS_TO_WAIT):
                if volume.status == 'available':
                    attachment = instance_volume_attach(request, volume.id, server_id, "/dev/vdb")
                    response = {
                        'name': volume.name,
                        'description': volume.description,
                        'device': attachment.device,
                        'size': volume.size
                    }
                    break
                elif volume.status == 'error':
                    response = 'error'
                    break
                else:
                    time.sleep(1)
                    volume = volume_get(request, volume.id)
                    response = "trying"

            # get limits for piggybacking
            nova_limits, cinder_limits, neutron_limits = get_limits(request)

            return {'response': response,
                    'limits':
                        {'cinderLimits': cinder_limits,
                         'novaLimits': nova_limits,
                         'neutronLimits': neutron_limits
                         }
                    }

        return 'notallowed'


@urls.register
class ServerDelete(generic.View):
    """API for deleting servers"""

    url_regex = r'extension/servers/(?P<server_id>.+)'

    def _get_address_type(self, type, addresses):
        try:
            return filter(lambda address: address['OS-EXT-IPS:type'] == type, addresses)
        except Exception:
            return []

    def _get_floating_ips(self, network):
        return self._get_address_type("floating", network)

    def _has_no_other_networks(self, server_networks, network_name):
        return len(server_networks) == 1 and network_name in list(server_networks.keys())

    def _get_floating_ip_from_tenant(self, tenant_floating_ips, floating_ip, instance_id):
        try:
            return filter(lambda ip: ip.instance_id == instance_id and ip.floating_ip_address == floating_ip['addr']
                          , tenant_floating_ips)[0]
        except Exception as e:
            LOG.debug("_get_floating_ip_from_tenant".format(e))
            return None

    def _check_and_release_floating_ip(self, request, server, server_networks, autonetwork):
        # was the vm created by quickstart
        if autonetwork in list(server_networks):
            self._release_floating_ip(request, server_networks, autonetwork, server['id'])
        elif SW_METADATA[0] in list(server["metadata"].keys()) and server["metadata"][SW_METADATA[0]] == SW_METADATA[1]:
            self._release_floating_ip(request, server_networks, PRIVATE_NETWORK, server['id'])

    def _release_floating_ip(self, request, server_networks, network, server_id):
        # release floating ip only if the server was in the specific network and has no other networks
        if not self._has_no_other_networks(server_networks, network):
            return

        tenant_floating_ips = tenant_floating_ip_list(request)
        for ip in self._get_floating_ips(server_networks[network]):
            tenant_floating_ip = self._get_floating_ip_from_tenant(tenant_floating_ips, ip, server_id)
            if tenant_floating_ip:
                tenant_floating_ip_release(request, tenant_floating_ip.id)

    def _remove_server_from_serverlist(self, servers, server_id):
        return filter(lambda server: server['id'] != server_id, servers)

    def _servers_in_autonetwork(self, servers, autonetwork):
        server_in_network = False
        for server in servers:
            server_networks = server['addresses']
            if autonetwork in server_networks:
                server_in_network = True
                break

        return server_in_network

    def _remove_autonetwork(self, server_networks, request):
        """
        Removes the automatically created network that was used prior to
        v1.4. 
        """
        server_networks_keys = list(server_networks.keys())
        neutron_enabled = is_enabled_by_config('network')
        # delete only if vm has one network
        if neutron_enabled and len(server_networks) == 1:
            networks = network_list_for_tenant(request, request.user.tenant_id)
            autonetwork = filter(lambda network: network.name in server_networks_keys, networks)
            auto_subnet_name = autonetwork_subnet_name(request)
            if len(autonetwork) != 1:
                return
            autonetwork_subnet = filter(lambda subnet: subnet.name == auto_subnet_name, autonetwork[0].subnets)
            if len(autonetwork_subnet) != 1:
                return
            router = router_list(request, network_id=autonetwork_subnet[0])
            if len(router) != 1:
                return

            router_remove_interface(request, router[0].id, subnet_id=autonetwork_subnet[0].id)
            router_delete(request, router[0].id)
            subnet_delete(request, autonetwork_subnet[0].id)
            network_delete(request, autonetwork[0].id)


    @rest_utils.ajax()
    def delete(self, request, server_id):
        """deletes a server
        :param request: The request object
        :param server_id: the server's id

        Example DELETE:
        http://localhost/api/extension/servers/<server_id>
        """

        autonetwork = autonetwork_name(request)

        # todo: multiple try/catch blocks
        try:
            instances, _more = server_list(request)
            servers = [u.to_dict() for u in instances]
            server_to_delete = filter(lambda server: server['id'] == server_id, servers)[0]
            server_networks = server_to_delete['addresses']

            response = server_delete(request, server_id)
            self._check_and_release_floating_ip(request, server_to_delete, server_networks, autonetwork)

            updated_servers = self._remove_server_from_serverlist(servers, server_id)
            if not self._servers_in_autonetwork(updated_servers, autonetwork):
                self._remove_autonetwork(server_networks, request)

        except Exception, e:
            LOG.debug("Server.delete(): {}".formant(e))
            raise rest_utils.AjaxError(400, 'Unable to delete instance. ' "'%s'" % e.args[0])

        return {'response': response}
