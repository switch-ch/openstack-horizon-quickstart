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

import random
import string

class Ip(object):
    def __init__(self, instance_id, floating_ip_address):
        self.instance_id = instance_id
        self.floating_ip_address = floating_ip_address
        self.id = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(12))

class Network(object):
    def __init__(self, name, id, subnets, tenant_id):
        self.name = name
        self.id = id
        self.subnets = subnets or []
        self.tenant_id = tenant_id or ''

class SubNetwork(object):
    def __init__(self, name, id):
        self.name = name
        self.id = id

class Router(object):
    def __init__(self, id):
        self.id = id

class Token(object):
    def __init__(self):
        self.id = "token-id-12"

class User(object):
    def __init__(self):
        self.id = "user-id12"
        self.tenant_id = "tenant-id-124"
        self.token = Token()

class Request(object):
    def __init__(self):
        self.user = User()


class FloatingIpManager(object):

    def list():
        pass

    def allocate(id):
        pass
