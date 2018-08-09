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
#  Created on 26/02/18
#  @author: christian.cueni@iterativ.ch
from math import isinf

import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import Context
from django.template.loader import get_template
from django.utils.translation import ugettext as _

from openstack_dashboard.api.cinder import tenant_absolute_limits as cinder_tenant_absolute_limits
from openstack_dashboard.api.keystone import user_get, VERSIONS
from openstack_dashboard.api.neutron import FloatingIpManager, is_enabled_by_config, \
    tenant_quota_get
from openstack_dashboard.api.nova import tenant_absolute_limits as nova_tenant_absolute_limits

LOG = logging.getLogger(__name__)


def sg_to_dict(resource):
    """
    Converts a security group to a dict
    """
    obj = {}

    for key in ['id', 'name', 'description', 'tenant_id']:
        obj[key] = getattr(resource, key, None)

    try:
        obj['rules'] = []
        for rule in resource['rules']:
            obj['rules'].append(
                {'ip_protocol': rule['ip_protocol'],
                'direction': rule['direction'],
                 'from_port': rule['from_port'],
                 'to_port': rule['to_port']
                 })
    except Exception, e:
        LOG.debug("Could not convert security group to dict. Reason {}".format(e))
        pass

    return obj

def clean_limts(data):
    """detects unlimited quota and converts it to -1
    :param data: Quota data
    :returns cleaned data
    """
    for key in data.keys():
        if not isinf(data[key]):
            continue
        data[key] = -1

    return data


def get_limits(request):
    """return the user's limits/quota. This includes nova, cinder and if neutron is available the number of attached
    IP addresses
    :param request: The request
    :returns nova, cinder & neutron limits
    """

    cinder_limits = None
    neutron_limits = {}

    # get nova & cinder limits
    reserved = request.GET.get('reserved') == 'true'
    nova_limits = nova_tenant_absolute_limits(request, reserved)

    try:
        cinder_limits = cinder_tenant_absolute_limits(request)
    except:
        pass

    # if neturon is enabled, get the number of floating and attached IP addresses
    if is_enabled_by_config("network"):
        neutron_max = tenant_quota_get(request, request.user.tenant_id)

        for limit in neutron_max:

            # check if the used ips are really attached to an instance
            used_ips = []
            if limit.name == 'floatingip':
                neutron_limits['maxTotalFloatingIps'] = limit.limit
                floating_ip_manager = FloatingIpManager(request)
                floating_ips = floating_ip_manager.list()
                neutron_limits['totalFloatingIps'] = len(floating_ips)
                for ip in floating_ips:
                    if ip.instance_id:
                        used_ips.append(ip)

                neutron_limits['totalFloatingIpsUsed'] = len(used_ips)
    return clean_limts(nova_limits), clean_limts(cinder_limits), clean_limts(neutron_limits)


def autonetwork_name(request):
    auto_network_base = request.user.tenant_id
    return "%s-%s" % (auto_network_base, "net")


def autonetwork_subnet_name(request):
    auto_network_base = request.user.tenant_id
    return "%s-subnet" % auto_network_base


def get_user_info(request):
    if VERSIONS.active >= 3:
        user = user_get(request, request.user.id, admin=False)
        email = user.email
        name = user.name
    else:
        email = request.user.username
        name = email

    return email, name


def send_create_email(request, floating_ip, default_user, server_name):
    """Sends the user an email when an instance is created.
    :param email: the user's email
    :param name: the users'name
    :param floating_ip: the instance's floating IP
    :param default_user: the user that is required to login
    :return: The user's email address
    """

    ip = "undefined"

    try:
        user_email, name = get_user_info(request)
    except Exception as e:
        LOG.debug("send_create_email(): Could not retrieve user email. Reason: {}".format(e))
        user_email = ""

    if not user_email == "":
        if floating_ip:
            ip = floating_ip.ip

        c = Context({'ip': ip, 'default_user': default_user, 'name': name, 'server_name': server_name})

        subject = _('[SWITCHengines] New Instance created')

        LOG.debug("send_create_email(): Get email tempalates")
        html_t = get_template('quickstart/instances/emails/instance_created_email.html')
        text_t = get_template('quickstart/instances/emails/instance_created_email.txt')

        LOG.debug("send_create_email(): render templates")
        html_content = html_t.render(c)
        text_content = text_t.render(c)
        try:
            LOG.debug("send_create_email(): Prepare email")
            msg = EmailMultiAlternatives(subject, text_content, settings.HORIZON_CONFIG['SW_EMAIL_FROM'], [user_email])
            msg.attach_alternative(html_content, "text/html")
            LOG.debug("send_create_email(): Send email")
            msg.send()
            LOG.debug("send_create_email(): Email sent")
        except Exception as e:
            LOG.debug("send_create_email(): Could not send email. Reason: {}".format(e))

    return user_email


def create_security_group(name, description, sec_group_manager):
    return sec_group_manager.create(name, description)


def create_security_rules(services, rules, sec_group_manager, security_group_id):
    """Creates rules for a security group
    :param services: All services
    :param rules: The rules to create
    :param sec_group_manager: The security group manager
    :param security_group_id: The security groups id
    :return: None
    """
    # add rules for v4/6
    for rule in rules:
        print(rule)
        for protocol in [("IPv4", "0.0.0.0/0"), ("IPv6", "::/0")]:
            rule_args = {
                "direction": "ingress",
                "ethertype": protocol[0],
                "ip_protocol": services[rule["id"]]["ip_protocol"],
                "from_port": services[rule["id"]]["from_port"],
                "to_port": services[rule["id"]]["to_port"],
                "cidr": protocol[1]
            }

            sec_group_manager.rule_create(security_group_id, **rule_args)
