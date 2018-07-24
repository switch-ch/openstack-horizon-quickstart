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
from horizon import tabs

from quickstart.instances import tabs as instances_tabs


class IndexView(tabs.TabbedTableView):
    tab_group_class = instances_tabs.InstancesTabs
    template_name = 'quickstart/instances/index.html'

    def get_data(self, request, context, *args, **kwargs):
        # Add data to the context here...
        return context
