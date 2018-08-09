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
*
* Created on 17/06/15
* @author: christian.cueni@iterativ.ch
*
*/

(function () {
    'use strict';

    angular.module('hz.quickstart').factory('InstanceCreationService', ["horizon.app.core.openstack-service-api.nova",
        "apiExtensionService", "$rootScope", "$interval", function(novaAPI, apiExtensionService, $rootScope, $interval){
        var factory = {};
        var stop;

        factory.instanceDict = {};

        //stop polling
        function stopServerUpdate () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        }

        /**
         * @name hz.quickstart.InstanceCreationService.createInstance
         * @description
         * Initiates the creation process & polling for updates. Fires events upon changes.
         * "instanceCreation:start" Process initialized
         * "instanceCreation:created" Instance was successfully created
         * "instanceCreation:building" Instance is built
         * "instanceCreation:complete" Instance & network are ready
         * "instanceCreation:error"
         *
         *
         * @param {Object} instance
         * Object that holds the server's configuration. Required.
         *
         * Required fields are "name", "source_id", "flavor", "key_name", "user_data", "security_groups"
         *
         */

        factory.createInstance = function(instance) {
            factory.instanceDict = instance;

            $rootScope.$broadcast("instanceCreation:start", instance);

            apiExtensionService.nova.createServer(factory.instanceDict).then(function(data) {
                factory.instance = data.data.instance;
                factory.instanceDict.userEmail = data.data.email;
                factory.instanceDict.network = data.data.network;
                $rootScope.$broadcast("instanceCreation:created", instance);

                var count = 0;

                stop = $interval(function() {
                     novaAPI.getServer(factory.instance.id).then(function(serverData) {
                        var state;
                        state = serverData.data["status"];
                        factory.instance = serverData.data;
                        if (state == "ACTIVE") { //TODO: move to config
                            stopServerUpdate();
                            factory.createdInstanceDict = factory.instanceDict;
                            factory.instanceDict = {};
                            $rootScope.$broadcast("instanceCreation:complete", factory.instance);
                            return factory.instance;
                        }
                        else if(state == "ERROR") {
                            stopServerUpdate();
                            $rootScope.$broadcast("instanceCreation:error", factory.instance);
                            return factory.instance;
                        }

                        //send update
                        if (count < 31) {
                            $rootScope.$broadcast("instanceCreation:building", serverData.data["status"], serverData.data["OS-EXT-STS:task_state"]);
                        }
                    });

                    //quit after 30 seconds
                    if (count > 30) {
                        var message = "The operation did timeout";
                        stopServerUpdate();
                        $rootScope.$broadcast("instanceCreation:error", message);
                        return message;
                    }

                    count++;

                }, 2000);

            }, function(errorResponse) {
                Raven.captureException(errorResponse);
                $rootScope.$broadcast("instanceCreation:submitError", errorResponse);
                return errorResponse;
            });

        };

        factory.resetInstance = function() {
            factory.instanceDict = {};
        };

        return factory
    }]);
}());
