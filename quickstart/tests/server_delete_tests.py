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
# Created on 14.02.18
# @author: chrigu <christian.cueni@iterativ.ch>

from mock import patch
from django.test import TestCase
from quickstart.rest.servers import ServerDelete

from quickstart.tests.helpers import Ip, Router, Network, SubNetwork, Token, \
    User, Request

class ServerDeleteTests(TestCase):

    def setUp(self):
        self.serverDeleteView = ServerDelete()
        self.request = Request()

    def get_address_type_floating_test(self):
        self.serverDeleteView = ServerDelete()
        address_type = "floating"
        addresses = [
            {
                'OS-EXT-IPS:type': "floating"
            },
            {
                'OS-EXT-IPS:type': "static"
            },
            {
                'OS-EXT-IPS:type': "floating"
            }
        ]

        ret_addresses = self.serverDeleteView._get_address_type(address_type, addresses)
        self.assertEqual(ret_addresses, [addresses[0], addresses[2]])

    def has_no_other_networks_with_one_correct_network_test(self):
        self.serverDeleteView = ServerDelete()
        network_name = "autonetwork"
        server_networks = {
            network_name: {"some": "networkstuff"}
        }

        self.assertTrue(self.serverDeleteView._has_no_other_networks(server_networks, network_name))

    def is_only_netowrk_with_one_wrong_network_test(self):
        self.serverDeleteView = ServerDelete()
        network_name = "autonetwork"
        server_networks = {
            "othername": {"some": "networkstuff"}
        }

        self.assertFalse(self.serverDeleteView._has_no_other_networks(server_networks, network_name))

    def is_only_netowrk_with_multiple_networks_test(self):

        network_name = "autonetwork"
        server_networks = {
            "othername": {"some": "networkstuff"},
            network_name: {"some": "othernetworkstuff"}
        }

        self.assertFalse(self.serverDeleteView._has_no_other_networks(server_networks, network_name))

    def get_floating_ip_from_tenant_one_floating_test(self):

        instance_id = "some-id-1"
        floating_ip = {
            "addr": "192.168.1.1"
        }

        tenant_floating_ip = Ip(instance_id, floating_ip["addr"])
        tenant_floating_ips = [tenant_floating_ip]

        ip = self.serverDeleteView._get_floating_ip_from_tenant(tenant_floating_ips, floating_ip, instance_id)
        self.assertEqual(ip, tenant_floating_ip)

    def get_floating_ip_from_tenant_first_floating_test(self):

        instance_id = "some-id-1"
        floating_ip1 = {
            "addr": "192.168.1.1"
        }

        floating_ip2 = {
            "addr": "192.168.1.1"
        }

        tenant_floating_ip1 = Ip(instance_id, floating_ip1["addr"])
        tenant_floating_ip2 = Ip(instance_id, floating_ip2["addr"])

        tenant_floating_ips = [tenant_floating_ip1, tenant_floating_ip2]

        ip = self.serverDeleteView._get_floating_ip_from_tenant(tenant_floating_ips, floating_ip1, instance_id)
        self.assertEqual(ip, tenant_floating_ip1)

    def get_floating_ip_from_tenant_no_match_floating_test(self):

        instance_id = "some-id-1"
        floating_ip1 = {
            "addr": "192.168.1.1"
        }

        floating_ip2 = {
            "addr": "192.168.1.1"
        }

        floating_ip3 = {
            "addr": "192.168.1.3"
        }

        tenant_floating_ip1 = Ip(instance_id, floating_ip1["addr"])
        tenant_floating_ip2 = Ip(instance_id, floating_ip2["addr"])

        tenant_floating_ips = [tenant_floating_ip1, tenant_floating_ip2]

        ip = self.serverDeleteView._get_floating_ip_from_tenant(tenant_floating_ips, floating_ip3, instance_id)
        self.assertEqual(ip, None)

    @patch('quickstart.rest.servers.tenant_floating_ip_release')
    @patch('quickstart.rest.servers.tenant_floating_ip_list')
    def release_floating_ip_if_only_network_test(self, fip_list_mock,
                                                       tenant_fip_release_mock):

        instance_id = "some_id"
        network_name = "autonetwork_343434"
        server_networks = {
            network_name: [{
                "OS-EXT-IPS:type": "floating",
                "addr": "192.168.3.45"
            }]
        }

        ip = Ip(instance_id, server_networks[network_name][0]["addr"])

        fip_list_mock.return_value = [
            ip,
            Ip('other-id', "10.2.15.2")
        ]

        self.serverDeleteView._release_floating_ip(self.request, server_networks,
                                                    network_name, instance_id)

        self.assertTrue(tenant_fip_release_mock.called)
        self.assertEqual(tenant_fip_release_mock.call_args[0][1], ip.id)

    @patch('openstack_dashboard.api.neutron.tenant_floating_ip_list')
    @patch('quickstart.rest.servers.ServerDelete._has_no_other_networks')
    def dont_release_floating_ip_if_not_only_network_test(self, only_net_mock,
                                                     fip_list_mock):
        only_net_mock.return_value = False
        fip_list_mock.return_value = []

        network_name = "autonetwork_343434"
        server_networks = [{
            network_name: {"othernet": "networkstuff"}
        }]

        self.serverDeleteView._release_floating_ip(self.request, server_networks,
                                                    network_name, 'server-id')

        self.assertFalse(fip_list_mock.called)

    # todo: check & release, release flaoting ips

    def remove_server_from_serverlist_test(self):

        server_id = "some-id-12"
        server1 = {
            "id": server_id
        }

        server2 = {
            "id": "other-id-34"
        }

        servers = [server1, server2]

        filtered_servers = self.serverDeleteView._remove_server_from_serverlist(servers, server_id)
        self.assertEqual(filtered_servers, [server2])

    def servers_in_autonetwork_true_test(self):

        network_name = "autonetwork"

        servers = [
            {"addresses": [network_name, "othernet"]}
        ]

        self.assertTrue(self.serverDeleteView._servers_in_autonetwork(servers, network_name))

    def servers_in_autonetwork_false_test(self):

        network_name = "autonetwork"

        servers = [
            {"addresses": ["mynet", "othernet"]}
        ]

        self.assertFalse(self.serverDeleteView._servers_in_autonetwork(servers, network_name))

    @patch('quickstart.rest.servers.is_enabled_by_config')
    @patch('quickstart.rest.servers.router_list')
    @patch('quickstart.rest.servers.network_list_for_tenant')
    @patch('quickstart.rest.servers.router_remove_interface')
    @patch('quickstart.rest.servers.router_delete')
    @patch('quickstart.rest.servers.subnet_delete')
    @patch('quickstart.rest.servers.network_delete')
    @patch('quickstart.rest.servers.autonetwork_subnet_name')
    def remove_autonetwork_can_remove_test(self, autonetwork_subnet_name,
                                    network_delete,
                                    subnet_delete,
                                    router_delete,
                                    router_remove_interface,
                                    network_list_for_tenant,
                                    router_list,
                                    is_enabled_by_config):

        autonetwork = "autonet"
        autonetwork_id = "some-id-12"
        subnet = "subnet"
        subnet_id = "sub-id-01"
        router_id = "router-id-34"

        server_networks = {
            autonetwork: {}
        }

        subnets = [SubNetwork(subnet, subnet_id)]
        networks_for_tenant = [Network(autonetwork, autonetwork_id, subnets, None)]

        is_enabled_by_config.return_value = True
        network_list_for_tenant.return_value = networks_for_tenant
        autonetwork_subnet_name.return_value = subnet
        router_list.return_value = [Router(router_id)]

        self.serverDeleteView._remove_autonetwork(server_networks, self.request)

        # router interface
        self.assertTrue(router_remove_interface.called)
        args, kwargs = router_remove_interface.call_args
        self.assertEqual(args, (self.request, router_id))
        self.assertEqual(kwargs, { "subnet_id": subnet_id })

        # router delete
        self.assertTrue(router_delete.called)
        self.assertEqual(router_delete.call_args[0][1], router_id)

        # subnet delete
        self.assertTrue(subnet_delete.called)
        self.assertEqual(subnet_delete.call_args[0][1], subnet_id)

        # network delete
        self.assertTrue(network_delete.called)
        self.assertEqual(network_delete.call_args[0][1], autonetwork_id)


    @patch('quickstart.rest.servers.is_enabled_by_config')
    @patch('quickstart.rest.servers.router_list')
    @patch('quickstart.rest.servers.network_list_for_tenant')
    @patch('quickstart.rest.servers.router_remove_interface')
    @patch('quickstart.rest.servers.router_delete')
    @patch('quickstart.rest.servers.subnet_delete')
    @patch('quickstart.rest.servers.network_delete')
    @patch('quickstart.rest.servers.autonetwork_subnet_name')
    def remove_autonetwork_cannot_remove_if_not_only_net_test(self, autonetwork_subnet_name,
                                    network_delete,
                                    subnet_delete,
                                    router_delete,
                                    router_remove_interface,
                                    network_list_for_tenant,
                                    router_list,
                                    is_enabled_by_config):

        autonetwork = "autonet"
        autonetwork_id = "some-id-12"
        subnet = "subnet"
        subnet_id = "sub-id-01"
        router_id = "router-id-34"

        server_networks = {
            autonetwork: {},
            "other": {}
        }

        subnets = [SubNetwork(subnet, subnet_id)]
        networks_for_tenant = [
            Network(autonetwork, autonetwork_id, subnets, None),
            Network("other", "other_id", [], None)
        ]

        is_enabled_by_config.return_value = True
        network_list_for_tenant.return_value = networks_for_tenant
        autonetwork_subnet_name.return_value = subnet
        router_list.return_value = [Router(router_id)]

        self.serverDeleteView._remove_autonetwork(server_networks, self.request)

        # router interface
        self.assertFalse(router_remove_interface.called)

        # router delete
        self.assertFalse(router_delete.called)

        # subnet delete
        self.assertFalse(subnet_delete.called)

        # network delete
        self.assertFalse(network_delete.called)


    @patch('quickstart.rest.servers.is_enabled_by_config')
    @patch('quickstart.rest.servers.router_list')
    @patch('quickstart.rest.servers.network_list_for_tenant')
    @patch('quickstart.rest.servers.router_remove_interface')
    @patch('quickstart.rest.servers.router_delete')
    @patch('quickstart.rest.servers.subnet_delete')
    @patch('quickstart.rest.servers.network_delete')
    @patch('quickstart.rest.servers.autonetwork_subnet_name')
    def remove_autonetwork_cannot_remove_if_autonet_not_found_test(self, autonetwork_subnet_name,
                                    network_delete,
                                    subnet_delete,
                                    router_delete,
                                    router_remove_interface,
                                    network_list_for_tenant,
                                    router_list,
                                    is_enabled_by_config):

        autonetwork = "autonet"
        subnet = "subnet"
        router_id = "router-id-34"

        server_networks = {
            autonetwork: {}
        }

        networks_for_tenant = [Network("other", "other_id", [], None)]

        is_enabled_by_config.return_value = True
        network_list_for_tenant.return_value = networks_for_tenant
        autonetwork_subnet_name.return_value = subnet
        router_list.return_value = [Router(router_id)]

        self.serverDeleteView._remove_autonetwork(server_networks, self.request)

        # router interface
        self.assertFalse(router_remove_interface.called)

        # router delete
        self.assertFalse(router_delete.called)

        # subnet delete
        self.assertFalse(subnet_delete.called)

        # network delete
        self.assertFalse(network_delete.called)

    @patch('quickstart.rest.servers.is_enabled_by_config')
    @patch('quickstart.rest.servers.router_list')
    @patch('quickstart.rest.servers.network_list_for_tenant')
    @patch('quickstart.rest.servers.router_remove_interface')
    @patch('quickstart.rest.servers.router_delete')
    @patch('quickstart.rest.servers.subnet_delete')
    @patch('quickstart.rest.servers.network_delete')
    @patch('quickstart.rest.servers.autonetwork_subnet_name')
    def remove_autonetwork_cann_remove_if_no_subnet_test(self, autonetwork_subnet_name,
                                    network_delete,
                                    subnet_delete,
                                    router_delete,
                                    router_remove_interface,
                                    network_list_for_tenant,
                                    router_list,
                                    is_enabled_by_config):

        autonetwork = "autonet"
        autonetwork_id = "some-id-12"
        subnet = "subnet"
        router_id = "router-id-34"

        server_networks = {
            autonetwork: {}
        }

        subnets = []
        networks_for_tenant = [Network(autonetwork, autonetwork_id, subnets, None)]

        is_enabled_by_config.return_value = True
        network_list_for_tenant.return_value = networks_for_tenant
        autonetwork_subnet_name.return_value = subnet
        router_list.return_value = [Router(router_id)]

        self.serverDeleteView._remove_autonetwork(server_networks, self.request)

        # router interface
        self.assertFalse(router_remove_interface.called)

        # router delete
        self.assertFalse(router_delete.called)

        # subnet delete
        self.assertFalse(subnet_delete.called)

        # network delete
        self.assertFalse(network_delete.called)


    @patch('quickstart.rest.servers.is_enabled_by_config')
    @patch('quickstart.rest.servers.router_list')
    @patch('quickstart.rest.servers.network_list_for_tenant')
    @patch('quickstart.rest.servers.router_remove_interface')
    @patch('quickstart.rest.servers.router_delete')
    @patch('quickstart.rest.servers.subnet_delete')
    @patch('quickstart.rest.servers.network_delete')
    @patch('quickstart.rest.servers.autonetwork_subnet_name')
    def remove_autonetwork_cannot_remove_if_no_router_test(self, autonetwork_subnet_name,
                                    network_delete,
                                    subnet_delete,
                                    router_delete,
                                    router_remove_interface,
                                    network_list_for_tenant,
                                    router_list,
                                    is_enabled_by_config):

        autonetwork = "autonet"
        autonetwork_id = "some-id-12"
        subnet = "subnet"
        subnet_id = "sub-id-01"
        router_id = "router-id-34"

        server_networks = {
            autonetwork: {}
        }

        subnets = [SubNetwork(subnet, subnet_id)]
        networks_for_tenant = [Network(autonetwork, autonetwork_id, subnets, None)]

        is_enabled_by_config.return_value = True
        network_list_for_tenant.return_value = networks_for_tenant
        autonetwork_subnet_name.return_value = subnet
        router_list.return_value = []

        self.serverDeleteView._remove_autonetwork(server_networks, self.request)

        # router interface
        self.assertFalse(router_remove_interface.called)

        # router delete
        self.assertFalse(router_delete.called)

        # subnet delete
        self.assertFalse(subnet_delete.called)

        # network delete
        self.assertFalse(network_delete.called)
