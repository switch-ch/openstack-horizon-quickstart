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
*  Developed by Iterativ GmbH
*  Created on 26/07/18
*  @author: christian.cueni@iterativ.ch
*/

(function () {
    'use strict';

    /**
   * @ngdoc component
   * @name hz.quickstart.swAddVolume
   * @description Provides a dialog for adding & attaching volumes. Also shows the added volumes in a list.
   *
   * @param {string} instanceId
   * The ID of the instance where the volumes get attached to. Required.
   *
   */

    SwAddVolumeController.$inject = ['$scope', 'apiExtensionService', 'UsageService', '$sce'];

    function SwAddVolumeController($scope, apiExtensionService, UsageService, $sce) {

        $scope.getTemplate = function() {
            return WEBROOT + 'static/quickstart/templates/swAddVolume.html';
        };

        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.size = 1;
            ctrl.showForm = false;
            ctrl.errorMessage = '';
            ctrl.exceedsQuotaMessage = gettext("The entered size exceeds your quota!");
            ctrl.exceedsQuota = false;
            ctrl.volumes = [];
            UsageService.getUsage().then(function (usage) {
                ctrl.limits = usage;
            });
            ctrl.volume = {
                size: 1,
                name: '',
                description: ''
            };
            ctrl.waitForRequest = false;    //shows spinner
        };

        ctrl.setVolumeSizeToDefaultIfInputNotValid = function() {

            var reg = /^\d+$/;

            if (!ctrl.volume.size || !ctrl.volume.size.toString().match(reg) || ctrl.volume.size === 0) {
                ctrl.volume.size = 1;
            }
        };

        //check if there's enough diskspace whenever the input value changes
        ctrl.checkSpace = function() {

            ctrl.setVolumeSizeToDefaultIfInputNotValid();
            ctrl.exceedsQuota = !UsageService.volumeRequiredInQuota(ctrl.volume.size, ctrl.limits.volumeSpace);

            var displaySize = ctrl.exceedsQuota ? ctrl.limits.volumeSpace.max - ctrl.limits.volumeSpace.used : ctrl.volume.size;

            UsageService.updateToAdd({
                volumeSpace: displaySize
            });
        };

        //display form and set initial to add values
        ctrl.displayForm = function () {
            ctrl.showForm = true;
            UsageService.updateToAdd({
                volumes: 1,
                volumeSpace: 1
            });
        };

        //hide form and reset values
        ctrl.hideForm = function () {
            ctrl.showForm = false;
            UsageService.updateToAdd({
                volumes: 0,
                volumeSpace: 0
            });
            ctrl.volume.name = ctrl.volume.description = '';
            ctrl.volume.size = 1;
        };

        ctrl.createVolumeDataObj = function () {
            return {
                name: ctrl.volume.name,
                size: ctrl.volume.size,
                description: ctrl.volume.description
            }
        };

        ctrl.resetAndDisplayErrorMsg = function () {
            UsageService.updateToAdd({
                volumes: 1,
                volumeSpace: 1
            });
            ctrl.errorMessage = gettext('An error occurred. Please try again.');
            ctrl.waitForRequest = false;
            ctrl.showForm = true;
        }

        ctrl.resetAndUpdate = function (data) {
            ctrl.errorMessage = '';
            ctrl.volumes.push(data.data.response);
            ctrl.limits = data.data.limits;
            UsageService.setUsage(ctrl.limits);
            ctrl.waitForRequest = false;
            ctrl.volume.name = ctrl.volume.description = '';
            ctrl.volume.size = 1;
        }

        //add volume & reset values
        ctrl.addVolume = function (form) {
            //double check space (sometimes the input field does not properly fire events)
            ctrl.checkSpace();

            if (form.$valid && !ctrl.exceedsQuota) {

                var inputData = ctrl.createVolumeDataObj();

                ctrl.waitForRequest = true;
                ctrl.showForm = false;
                apiExtensionService.nova.createAttachVolume(ctrl.instanceId, inputData).then(function(data) {
                    if (data.data.response === 'error') {
                        ctrl.resetAndDisplayErrorMsg();
                    } else {
                        ctrl.resetAndUpdate(data);
                    }
                }, function(error) {
                    Raven.captureException(error);
                });
            }
        };

        //handle updates from usage service
        $scope.$on('usage:toAddUpdated', function(event, usage) {
            ctrl.limits = usage
        });

        $scope.$on('usage:update', function(event, usage) {
            ctrl.limits = usage
        });
    }

    angular.module('hz.quickstart')
        .component('swAddVolume',  {
                bindings: {
                    instanceId: '<'
                },
                template: '<div ng-include="getTemplate()">',
                controller: SwAddVolumeController
            }
        )

}());
