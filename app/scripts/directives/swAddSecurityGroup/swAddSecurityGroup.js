/**
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
* Created on 17/06/15
* @author: christian.cueni@iterativ.ch
*/

(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name hz.quickstart.swAddSecurityGroup
     * @description Provides a dialog for adding security groups.
     *
     * @param {function} securityGroupCreated
     * Function to call when a new security groups. Required.
     *
     * @param {array} groups
     * The user's security groups. Required
     */

    angular.module('hz.quickstart')
        .directive('swAddSecurityGroup', ["WEBROOT", function(WEBROOT) {
            return {
                scope: {
                    securityGroupCreated: '&',
                    groups: '='
                },
                restrict: 'E',
                templateUrl: WEBROOT + 'static/quickstart/templates/swAddSecurityGroup.html',
                replace: true,
                controller: 'swAddSecurityGroupCtrl',
                controllerAs: 'vm'
            };
        }]).controller('swAddSecurityGroupCtrl', ['$scope', 'apiExtensionService', function($scope, apiExtensionService) {
            var self = this;

            activate();

            //verify input whenever it changes
            self.inputChange = function() {

                var nameIndex;

                self.doesNameAlreadyExist()
                self.isInputNonEmpty()
            };

            self.doesNameAlreadyExist = function() {
              nameIndex = _.findIndex(self.existingGroups, "name", self.group.name);
              if (nameIndex !== -1) {
                  self.showNameWarning = true;
              } else {
                  self.showNameWarning = false;
              }
            }

            self.isInputNonEmpty = function() {
              if (self.group.name !== "" && self.group.description !== "" && self.selectedServices.length > 0 && !self.showNameWarning) {
                  self.formValid = true;
              } else {
                  self.formValid = false;
              }
            }

            //add group & reset datea
            self.addSecurityGroup = function() {

                if (self.formValid) {

                    self.waitForRequest = true;
                    self.showForm = false;

                    var group = {
                        name: self.group.name,
                        description: self.group.description
                    };

                    var groupData = {
                        group: group,
                        rules: self.selectedServices
                    };

                    apiExtensionService.securityGroups.addGroupRules(groupData).then(function (data) {
                        var group = data.data.items;
                        group.security_group_rules = group.rules; // required for rulesToString todo: move elsewhere
                        self.securityGroupCreated({group: group});
                        self.waitForRequest = false;
                        //reset
                        self.group.name = self.group.description = "";
                        self.selectedServices = [];
                    }, function(error) {
                        Raven.captureException(error);
                        self.showForm = true;
                        self.waitForRequest = false;
                    });
                }
            };

            // toggle selection for a given service
            self.toggleSelection = function toggleSelection(serviceName) {
                var idx = self.selectedServices.indexOf(serviceName);

                // is currently selected
                if (idx > -1) {
                    self.selectedServices.splice(idx, 1);
                }
                // is newly selected
                else {
                    self.selectedServices.push(serviceName);
                }
                //validate input
                self.inputChange();
            };

            function activate() {

                self.strings = {
                    title: gettext("Create Firewall Rule-Groups"),
                    addAnotherName: gettext("Please enter another name for this group."),
                    name: gettext("Name"),
                    description: gettext("Description"),
                    addGroup: gettext("Add Group"),
                    cancel: gettext("Cancel")
                };

                self.errorMsg = "";
                self.showForm = false;
                self.waitForRequest = false;
                self.securityGroupCreated = $scope.securityGroupCreated;
                self.group = {
                    name: "",
                    description: ""
                };
                self.formValid = false;
                self.selectedServices = [];
                self.services = [];
                self.existingGroups = [];
                self.showNameWarning = false;

                if ($scope.groups) {
                    self.existingGroups = $scope.groups;
                }

                apiExtensionService.securityGroups.getServices().then(function(data){
                    //sort groups alphabetically
                    self.services = data.data.sort(function(a, b) {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1
                        }
                        return 0;
                    });
                })
            }
        }]);
}());
