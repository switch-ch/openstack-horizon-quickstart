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
# Created on 17/06/15
# @author: christian.cueni@iterativ.ch

# The name of the dashboard to be added to HORIZON['dashboards']. Required.
DASHBOARD = 'quickstart'

# If set to True, this dashboard will not be added to the settings.
DISABLED = False

# A list of applications to be added to INSTALLED_APPS.
ADD_INSTALLED_APPS = [
    'quickstart'
]

ADD_JS_FILES = ['quickstart/js/quickstart.js']

ADD_ANGULAR_MODULES = ['hz.quickstart']
ADD_JS_SPEC_FILES = ['quickstart/js/specs/services/instancecreation.service.spec.js',
                    'quickstart/js/specs/services/usage.service.spec.js',
                    'quickstart/js/specs/services/securitygroup.service.spec.js',
                    'quickstart/js/specs/services/flavors.service.spec.js',]

UPDATE_HORIZON_CONFIG = {
    'SW_OS_COMPUTE_API_VERSION': 2,
    'SW_SEND_VM_CREATED_NOTIFICATION': False,
    'SW_EMAIL_FROM': 'engines-support@switch.ch'
}
