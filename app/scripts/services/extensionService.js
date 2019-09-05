/*
* SWTICH https://www.switch.ch
*
* Licensed under the Affero General Public License, Version 3.0 (the "License"); you may
* not use this file except in compliance with the License. You may obtain
* a copy of the License at
*
*       https://www.gnu.org/licenses/agpl-3.0.en.html
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
*  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
*  License for the specific language governing permissions and limitations
*  under the License.
*
*  Developed by Iterativ GmbH
*  Created on 17/06/15
*  @author: christian.cueni@iterativ.ch
**/

(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name hz.quickstart.apiExtensionService
     * @description Provides access to API services not provided by Kilo.
     *
     **/

    angular.module('hz.quickstart')
        .factory('apiExtensionService', ['horizon.framework.util.http.service', function(apiService){

            var extended = {
                nova: {},
                securityGroups: {},
                limits: {},
                keypairs: {}
            };

            //Nova services
            extended.nova.createServer = function(newServer) {
                return apiService.post('api/extension/servers/', newServer);
            };

            extended.nova.getServers = function() {
                return apiService.get('api/extension/servers/')
                    .error(function () {
                        horizon.alert('error', gettext('Unable to retrieve server.'));
                    });
            };

            extended.nova.setPowerState = function(instanceId, state) {
                return apiService.post('api/extension/servers/' + instanceId + '/powerstate', state)
                    .error(function () {
                        horizon.alert('error', gettext('Unable to change powerstate.'));
                    });
            };

            extended.nova.actionOnServer = function(instanceId, action) {
                return apiService.post('api/extension/servers/' + instanceId + '/action', action)
                    .error(function () {
                        horizon.alert('error', gettext('Unable to unshelve server.'));
                    });
            };

            extended.nova.deleteServer = function(instanceId) {
                return apiService.delete('api/extension/servers/' + instanceId);
            };

            extended.nova.createAttachVolume = function(instanceId, size) {
                return apiService.post('api/extension/servers/' + instanceId + '/addvolume', size)
                    .error(function () {
                        horizon.alert('error', gettext('Unable to attach new volume.'));
                    });
            };

            //limits
            extended.limits.getAllLimits = function() {
                return apiService.get('api/extension/limits/')
                    .error(function () {
                        horizon.alert('error', gettext('Unable to retrieve quota.'));
                    });
            };

            extended.securityGroups.addGroupRules = function(group) {
                return apiService.post('api/extension/securitygroups/', group)
                    .error(function () {
                        horizon.alert('error', gettext('Unable to add security groups.'));
                    });
            };

            extended.securityGroups.getServices = function() {
                return apiService.get('api/extension/rules/services')
                    .error(function () {
                        horizon.alert('error', gettext('Unable to retrieve security groups.'));
                    });
            };

            extended.securityGroups.delete = function(securityGroupId) {
                return apiService.delete('api/extension/securitygroups/' + securityGroupId)
                    .error(function () {
                        horizon.alert('error', gettext('Unable to delete security group.'));
                    });
            };

            //keypairs
            extended.keypairs.delete = function(keypairId) {
                return apiService.delete('api/extension/keypairs/' + keypairId)
                    .error(function () {
                        horizon.alert('error', gettext('Unable to delete keypair.'));
                    });
            };
            return extended;
        }]);
}());
