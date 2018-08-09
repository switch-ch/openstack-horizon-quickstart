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
from django.conf import settings
from django.views import generic
from quickstart.rest.utils import sg_to_dict, create_security_group, create_security_rules

from openstack_dashboard.api.neutron import SecurityGroupManager
from openstack_dashboard.api.rest import urls  # TODO: remove local urls file
from openstack_dashboard.api.rest import utils as rest_utils

LOG = logging.getLogger(__name__)

@urls.register
class SecurityGroups(generic.View):
    """API for adding security groups"""

    url_regex = r'extension/securitygroups/$'

    @rest_utils.ajax()
    def post(self, request):
        """Add security group & rules

        request requires to have a dict with "name" and "description". In addition an array with the required rule's
        names must be provided

        Example POST:
        http://localhost/api/extension/network/securitygroups
        """

        try:
            group_args = (request.DATA['group']['name'],
                          request.DATA['group']['description'],
                          )

        except KeyError as e:
            raise rest_utils.AjaxError(400, 'missing required parameter '
                                            "'%s'" % e.args[0])

        sec_group_manager = SecurityGroupManager(request)
        security_group = create_security_group(group_args(0), group_args(1),
                                                sec_group_manager)
        #TODO: do same as juno, map predefined ports to args

        service_rules = getattr(settings, 'SECURITY_GROUP_RULES', {})
        create_security_rules(service_rules, request.DATA['rules'],
                            sec_group_manager, security_group.id)
        security_group = sec_group_manager.get(security_group.id)

        return {'items': sg_to_dict(security_group)}


@urls.register
class SecurityGroupsDelete(generic.View):
    """API for deleting Security Groups
    """
    url_regex = r'extension/securitygroups/(?P<securitygroups_id>.+)$'

    @rest_utils.ajax()
    def delete(self, request, securitygroups_id):
        """
        Delete a security group

        Example DELETE:
        http://localhost/api/extension/network/securitygroups/<group_id>
        """
        sec_group_manager = SecurityGroupManager(request)
        try:
            response = sec_group_manager.delete(securitygroups_id)
        except Exception, e:
            print e
            response = "error"
        return {'response': response}
