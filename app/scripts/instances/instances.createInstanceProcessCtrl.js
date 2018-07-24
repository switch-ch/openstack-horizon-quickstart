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
* Handles the flow (3 steps: form, waiting, complete) when creating an instance
*/

(function () {
    'use strict';
    angular.module('hz.quickstart.instances')
        .controller('CreateInstanceProcessCtrl', ["$scope", "$uibModalInstance", "$state", "flavorsData", "limitsData", "imagesData", "keypairData",
         "securityGroupData", "horizon.app.core.openstack-service-api.nova", "$interval", "InstanceCreationService", "horizon.framework.widgets.modal-wait-spinner.service",
         "UsageService", "$q", "horizon.app.core.openstack-service-api.security-group", function ($scope, $uibModalInstance, $state, flavorsData, limitsData, imagesData, keypairData,
         securityGroupData, novaAPI, $interval, InstanceCreationService, modalWaitSpinnerService,
         UsageService, $q, securityGroup) {

            var self = this;

            activate();

            //init creation
            self.createInstance = function(instance) {
                self.instanceDict = instance;
                InstanceCreationService.createInstance(instance);
            };

            //close modal window
            self.close = function () {
                InstanceCreationService.resetInstance();
                $uibModalInstance.close();
            };

            //try again / add another machine
            self.showForm = function(clear) {

                if(clear) {
                    //reset form & update usage
                    self.instanceDict = {};
                    self.instance = {};
                    self.ip = {};
                    self.step = "waitingNew";
                    $q.all([
                        UsageService.updateUsage().then(function(limits) {
                            self.limits = limits;
                        }),
                        novaAPI.getKeypairs().then(function(keypairData){
                            self.keypairs = keypairData.data.items;
                        }),
                        securityGroup.query().then(function(securityGroupData) {
                            self.securityGroups = securityGroupData.data.items;
                        })]).then(function(){
                        self.step = "form";
                    });
                } else {
                    self.step = "form";
                }
            };

            //handle events from the creationservice
            $scope.$on("instanceCreation:start", function() {
                self.step = "waiting";
            });

            $scope.$on("instanceCreation:complete", function(event, instance) {
                UsageService.resetToAdd();
                self.step = "complete";
            });

            //set state when closed
            $uibModalInstance.result.then(function () {
                $state.go('instances');
            }, function () {
                $state.go('instances');
            });

            function activate() {
                modalWaitSpinnerService.hideModalSpinner();
                self.step = "form";
                self.instanceDict = {};
                self.instance = {};
                self.ip = {};
                self.limits = limitsData;
                self.flavors = flavorsData.data.items;
                self.images = imagesData.data.items;
                self.keypairs = keypairData.data.items;
                self.securityGroups = securityGroupData.data.items;
            }
        }]
    );
}());
