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

from django.test import TestCase
from mock import patch
from quickstart.rest.servers import Servers
from quickstart.tests.helpers import Ip, Network, Request, FloatingIpManager


class ServersTests(TestCase):

    def setUp(self):
        self.serversView = Servers()
        self.request = Request()
        self.serversView.request = self.request

    @patch('quickstart.rest.servers.network_list')
    def return_public_network_test(self, network_list_mock):

        auto_network_name = "auto"

        ret_networks = [
            Network("other", "id1", None, None),
            Network("public", "id2", None, None),
            Network("net2", "id3", None, None),
        ]

        network_list_mock.return_value = ret_networks

        public, private, network = self.serversView._get_networks(auto_network_name)

        self.assertEqual(public, ret_networks[1])
        self.assertEqual(private, None)
        self.assertEqual(network, None)

    @patch('quickstart.rest.servers.network_list')
    def return_private_network_test(self, network_list_mock):

        auto_network_name = "auto"

        ret_networks = [
            Network("other", "id1", None, None),
            Network("private", "id2", None, None),
            Network("net2", "id3", None, None),
        ]

        network_list_mock.return_value = ret_networks

        public, private, network = self.serversView._get_networks(auto_network_name)

        self.assertEqual(public, None)
        self.assertEqual(private, ret_networks[1])
        self.assertEqual(network, None)

    @patch('quickstart.rest.servers.network_list')
    def return_auto_network_test(self, network_list_mock):

        auto_network_name = "auto"

        ret_networks = [
            Network("other", "id1", None, None),
            Network("some", "id2", None, None),
            Network(auto_network_name, "id3", None, self.request.user.tenant_id),
        ]

        network_list_mock.return_value = ret_networks

        public, private, network = self.serversView._get_networks(auto_network_name)

        self.assertEqual(public, None)
        self.assertEqual(private, None)
        self.assertEqual(network, ret_networks[2])

    @patch('quickstart.tests.servers_tests.FloatingIpManager.list')
    @patch('quickstart.tests.servers_tests.FloatingIpManager.allocate')
    def allocate_floating_ip_test(self, allocate_mock, list_mock):

        floating_ip_manager = FloatingIpManager()
        ret_floating_ip = {"ip": "floating_ip"}

        list_mock.return_value = []
        allocate_mock.return_value = ret_floating_ip

        public_network = Network("public", "id2", None, None)

        floating_ip = self.serversView._get_or_allocate_floating_ip(public_network,
            floating_ip_manager)

        self.assertEqual(floating_ip, ret_floating_ip)

    @patch('quickstart.tests.servers_tests.FloatingIpManager.list')
    @patch('quickstart.tests.servers_tests.FloatingIpManager.allocate')
    def reuse_floating_ip_test(self, allocate_mock, list_mock):

        floating_ip_manager = FloatingIpManager()
        ret_floating_ip = Ip(None, None)

        list_mock.return_value = [ret_floating_ip]
        allocate_mock.return_value = {"ip": "new_floating"}

        public_network = Network("public", "id2", None, None)

        floating_ip = self.serversView._get_or_allocate_floating_ip(public_network,
            floating_ip_manager)

        self.assertEqual(floating_ip, ret_floating_ip)

    @patch('quickstart.tests.servers_tests.FloatingIpManager.list')
    @patch('quickstart.tests.servers_tests.FloatingIpManager.allocate')
    def dont_reuse__bound_floating_ips_test(self, allocate_mock, list_mock):

        floating_ip_manager = FloatingIpManager()
        ret_floating_ip = {"ip": "new_floating"}

        list_mock.return_value = [Ip("id1", None)]
        allocate_mock.return_value = ret_floating_ip

        public_network = Network("public", "id2", None, None)

        floating_ip = self.serversView._get_or_allocate_floating_ip(public_network,
            floating_ip_manager)

        self.assertEqual(floating_ip, ret_floating_ip)
