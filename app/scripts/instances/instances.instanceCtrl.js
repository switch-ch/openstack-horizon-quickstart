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

    angular.module('hz.quickstart.instances')
        .controller('InstanceCtrl',['$uibModal', '$state', 'instances', 'limits', 'apiExtensionService',
            'horizon.app.core.openstack-service-api.nova', 'horizon.app.core.openstack-service-api.glance',
            'horizon.app.core.openstack-service-api.security-group', 'UsageService', 'UpdateService',
            'horizon.framework.widgets.modal-wait-spinner.service', '$scope', 'WEBROOT',
            'horizon.framework.util.i18n.gettext',
            function ($uibModal, $state, instances, limits, apiExtensionService, novaAPI, glanceAPI, securityGroup,
                      UsageService, UpdateService, modalWaitSpinnerService, $scope, WEBROOT, gettext) {

                var self = this;

                activate();

                //set state of instance as text
                function setState() {

                    self.instances.forEach(function(instance) {
                        switch(instance["OS-EXT-STS:power_state"]) {
                            case 1:
                                instance.stateString = gettext("Running");
                                break;
                            case 3:
                                instance.stateString = gettext("Paused");
                                break;
                            case 4:
                                if (instance.status === "SHUTOFF") {
                                    instance.stateString = gettext("Shut down");
                                } else {
                                    instance.stateString = gettext("Suspended");
                                }
                                break;
                            default:
                                instance.stateString = gettext("n/a");
                        }
                    });
                }

                //update view
                function update() {
                    apiExtensionService.nova.getServers().then(function(instances) {
                        self.instances = instances.data.items;
                        setState();
                    });
                    UsageService.updateUsage();
                }

                //check quota and update warning list
                function checkQuota() {
                    //reset
                    self.warnings = [];
                    self.allowNew = true;

                    _.forIn(self.warningMessages, function(value, key) {

                      if (!UsageService.checkQuotaOkForKey(key)) {
                        self.warnings.push(value);
                        self.allowNew = false;
                      }
                    });
                }

                //delete instance after action is confirmed
                function deleteInstance(instance) {

                    var interval;

                    //show modal and delete
                    modalWaitSpinnerService.showModalSpinner(gettext("Deleting"));
                    apiExtensionService.nova.deleteServer(instance.id).then(function(data) {

                    }, function(reason) {
                        if (interval) {
                            UpdateService.stopInterval(interval.stopId);
                        };
                        Raven.captureException(reason);
                    });

                    //start polling for results
                    //hide spinner in case of success or failure
                    interval = UpdateService.instanceDelete(instance);
                    interval.promise.then(function(data) {
                        self.instances = data;
                        UsageService.updateUsage();
                    }, function(reason) {
                        Raven.captureException(reason);
                        modalWaitSpinnerService.hideModalSpinner();
                    }).finally(function() {
                        modalWaitSpinnerService.hideModalSpinner();
                    });
                }

                //show confirmation for delete
                self.deleteInstance = function(instance) {
                    var modalInstance = $uibModal.open({
                        template: '<sw-confirmation-modal title="Delete instance' +
                        ' &quot;' + instance.name + '&quot;"' + ' body="'+
                        gettext('Do you really want to delete instance') +
                       ' &quot;' + instance.name + '&quot;? ' + gettext('This cannot be undone.') +
                        '" confirm="vm.confirm()" cancel="vm.cancel()"></sw-confirmation-modal>',
                        controller: "swConfirmationModalCtrl as vm",
                        size: "md"
                    });

                    modalInstance.result.then(function () {
                        deleteInstance(instance);
                    }, function(reason) {
                        Raven.captureException(reason);
                    });
                };

                //show modal for state change
                self.changeInstanceState = function(instance, state) {

                    var oldState, interval, message;

                    switch(state) {
                        case 'suspend':
                            message = gettext("Suspending");
                            break;
                        case 'stop':
                            message = gettext("Powering off");
                            break;
                        case 'resume':
                            message = gettext("Resuming");
                            break;
                        case 'start':
                            message = gettext("Starting");
                            break;
                        default:
                            message = gettext("Changing state");
                    }

                    modalWaitSpinnerService.showModalSpinner(message);

                    oldState = instance['OS-EXT-STS:power_state'];
                    apiExtensionService.nova.setPowerState(instance.id, {state: state}).then(function(data) {

                    }, function(reason) {
                        Raven.captureException(reason);
                    });

                    //poll for new state
                    interval = UpdateService.instanceStateChange(instance, oldState);
                    interval.promise.then(function(updatedInstance) {
                        var index = _.findIndex(self.instances, function(server) {
                            return server.id === instance.id;
                        });
                        if (index !== -1) {
                            self.instances[index] = updatedInstance;
                            setState();
                        }

                    }, function(reason) {
                        Raven.captureException(reason);
                        modalWaitSpinnerService.hideModalSpinner();
                    }).finally(function() {
                        modalWaitSpinnerService.hideModalSpinner();
                    });
                };

                //change state and wait for success event
                //(this is required by the updateservice as it depends on the state)
                self.createInstance = function() {
                    if (self.allowNew) {
                        $state.go("instances.create");
                        modalWaitSpinnerService.showModalSpinner(gettext("Loading"));
                    }
                };

                //init creation form when state is ready
                $scope.$on('$stateChangeSuccess', function (event, toState) {
                    if (toState.name == "instances.create") {
                        var modalInstance = $uibModal.open({
                            templateUrl: WEBROOT + "static/quickstart/templates/instances.createInstanceProcess.html",
                            controller: "CreateInstanceProcessCtrl as vm",
                            size: "lg",
                            windowClass: "createmodal",
                            resolve: {
                                limitsData: ["UsageService", function (UsageService) {
                                    return UsageService.updateUsage();
                                }],
                                flavorsData: ['horizon.app.core.openstack-service-api.nova', function (novaAPI) {
                                    return novaAPI.getFlavors()
                                }],
                                imagesData: ['horizon.app.core.openstack-service-api.glance', function (glanceAPI) {
                                    return glanceAPI.getImages();
                                }],
                                keypairData: ['horizon.app.core.openstack-service-api.nova', function (novaAPI) {
                                    return novaAPI.getKeypairs();
                                }],
                                securityGroupData: ['horizon.app.core.openstack-service-api.security-group', function (securityGroup) {
                                    return securityGroup.query();
                                }]
                            }
                        });

                        //reset "to add" data, change state when done
                        modalInstance.result.then().finally(function() {
                            UsageService.resetToAdd();
                            $state.go("instances");
                            update();
                        });
                    }
                });

                //get all ip addresses for an instance
                self.instanceIps = function(instance) {

                    var ips = [];
                    _.keys(instance.addresses).forEach(function(address) {
                        try {
                            ips.push.apply(ips, instance.addresses[address]);
                        } catch (err) {
                            ips.push('undefined');
                        }
                    });
                    return ips;
                };

                //handle usage update
                $scope.$on('usage:update', function(event, usage) {
                    self.limits = usage;
                    checkQuota();
                });

                function activate() {

                    self.instances = instances.data.items;
                    setState();
                    self.limits = limits;
                    self.allowNew = true;
                    self.warnings = [];

                    self.warningMessages = {
                        cores: gettext("You have no cores left!"),
                        neutronFloatingIps: gettext("You have no floating IPs left!"),
                        ram: gettext("You have no RAM left!"),
                        instances: gettext("You have no free instances left!")
                    };
                    checkQuota();
                }
            }
        ])
}());
