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
*/
(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name hz.quickstart.UpdateService
     * @description
     * Handles polling operations when waiting for updates from the API.
     *
     */

    angular.module('hz.quickstart')
        .factory('UpdateService', ['apiExtensionService', 'horizon.app.core.openstack-service-api.nova', '$interval', '$q',
            function(apiExtensionService, novaAPI, $interval, $q){

            var stop, interval, timeout, updateService;

            interval = 2000;
            timeout = 30;
            updateService = {};

            var stopServerUpdate = function() {
                if (angular.isDefined(stop)) {
                    $interval.cancel(stop);
                    stop = undefined;
                }
            };

            //start polling
            var startInterval = function(update, parameters) {

                var count = 0;
                var deferred = $q.defer();
                stop = $interval(function() {

                    switch(update) {
                        case "instanceStateChange":
                            novaAPI.getServer(parameters.instance.id).then(function(serverData) {
                                if (parameters.oldState !== serverData.data['OS-EXT-STS:power_state']) {
                                    stopServerUpdate();
                                    deferred.resolve(serverData.data);
                                }
                            }, function(error) {
                                Raven.captureException(error);
                                stopServerUpdate();
                                deferred.reject("error");
                            });
                            break;
                        case "instanceDelete":
                            apiExtensionService.nova.getServers().then(function(serverList){
                                var index = _.findIndex(serverList.data.items, function(server) {
                                    return server.id === parameters.instance.id;
                                });

                                if (index === -1) {
                                    stopServerUpdate();
                                    deferred.resolve(serverList.data.items);
                                }
                            }, function(error) {
                                Raven.captureException(error);
                                stopServerUpdate();
                                deferred.reject("error");
                            });
                            break;
                    }
                    //timeout
                    if (count > timeout) {
                        stopServerUpdate();
                        deferred.reject("timeout");
                    }

                    count += 1;

                }, interval);

                return {
                    promise: deferred.promise,
                    stopId: stop
                }
            };

            updateService.stopInterval = function() {
                stopServerUpdate();
                //TODO: use stopid
            };

            updateService.instanceStateChange = function(instance, oldState) {
                return startInterval('instanceStateChange', {
                    instance: instance,
                    oldState: oldState
                })
            };

            updateService.instanceDelete = function(instance) {
                return startInterval('instanceDelete', {
                    instance: instance
                })
            };

            return updateService;
        }]);
}());
