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
# Created on 17/06/15
# @author: christian.cueni@iterativ.ch

from keystoneclient.auth.identity import v2
from keystoneclient import session
from keystoneclient.v2_0 import client as keystone_client
from novaclient import client as nova_client
from django.conf import settings


def get_nova_client(auth_session, region_name=""):

    if region_name == "":
        nova = nova_client.Client(settings.HORIZON_CONFIG['SW_OS_COMPUTE_API_VERSION'], session=auth_session)
    else:
        nova = nova_client.Client(settings.HORIZON_CONFIG['SW_OS_COMPUTE_API_VERSION'], session=auth_session, region_name=region_name)

    return nova
