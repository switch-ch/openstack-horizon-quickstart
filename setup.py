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
# Created on 09/06/15
#
# @author: pawel kowalski, valery.tschopp@switch.ch
from setuptools import setup, find_packages

setup(name='sw-openstack-quickstart',
      version='1.4',
      author='Christian Cueni, Dario Aebersold',
      author_email='christian.cueni@iterativ.ch, dario.aebersold@iterativ.ch',
      url='http://www.iterativ.ch',
      description='SWITCH OpenStack quickstart dashboard',
      long_description='SWITCH OpenStack quickstart dashboard',
      license='AGPL 3.0',
      packages=find_packages(exclude=['quickstart.tests', 'quickstart.settings']),
      package_data={'quickstart': ['instances/templates/instances/emails/*',
                                   'instances/templates/instances/*.html',
                                   'templates/quickstart/*',
                                   'static/quickstart/assets/*',
                                   'static/quickstart/css/*',
                                   'static/quickstart/fonts/*',
                                   'static/quickstart/js/*',
                                   'static/quickstart/templates/*']},
)
