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
from django.conf import settings
from django.views import generic

from openstack_dashboard.api.rest import urls  # TODO: remove local urls file
from openstack_dashboard.api.rest import utils as rest_utils


@urls.register
class ServiceRules(generic.View):
    """API that provides all services"""

    url_regex = r'extension/rules/services$'

    @rest_utils.ajax()
    def get(self, request):
        """Provides a list of services that can be used to create firewall rules

        Example GET:
        http://localhost/api/extension/rules/services
        """
        service_rules = getattr(settings, 'SECURITY_GROUP_RULES', {})
        filtered_service_rules = {key: value for (key, value) in service_rules.iteritems() if 'all_' not in key}
        cleaned_service_rules = []

        # only get name & id
        for k, v in filtered_service_rules.iteritems():
            cleaned_service_rules.append({'id': k, 'name': v['name']})

        return cleaned_service_rules
