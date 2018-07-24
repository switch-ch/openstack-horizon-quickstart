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
from django.views import generic

from openstack_dashboard.api.nova import keypair_delete
from openstack_dashboard.api.rest import urls  # TODO: remove local urls file
from openstack_dashboard.api.rest import utils as rest_utils


@urls.register
class Keypairs(generic.View):
    """API for deleting keypairs"""

    url_regex = r'extension/keypairs/(?P<keypair_id>.+)'

    @rest_utils.ajax()
    def delete(self, request, keypair_id):
        """deletes a given keypair

        :param keypair_id: the keypair's id

        Example DELETE:
        http://localhost/api/extension/keypairs/<keypair>
        """
        try:
            response = keypair_delete(request, keypair_id)
        except Exception, e:
            print e
            response = {}
        return {'response': response}
