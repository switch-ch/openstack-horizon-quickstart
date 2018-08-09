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
# Created on 13.04.18
# @author: <christian.cueni@iterativ.ch>

from django.views import generic
from quickstart.rest.utils import get_limits

from openstack_dashboard.api.rest import urls  # TODO: remove local urls file
from openstack_dashboard.api.rest import utils as rest_utils


@urls.register
class Limits(generic.View):
    """API for retrieving all limits"""

    url_regex = r'extension/limits'

    @rest_utils.ajax()
    def get(self, request):
        """
        returns all limits (cinder & nova)

        Example GET:
        http://localhost/api/extension/limits
        """
        nova_limits, cinder_limits, neutron_limits = get_limits(request)

        result = {
            'novaLimits': nova_limits,
            'cinderLimits': cinder_limits,
            'neutronLimits': neutron_limits
        }

        return result
