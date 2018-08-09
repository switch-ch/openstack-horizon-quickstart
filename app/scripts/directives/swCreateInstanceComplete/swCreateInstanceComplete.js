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

  /**
   * @ngdoc directive
   * @name hz.quickstart.swCreateInstanceComplete
   * @description Provides the success screen after creating an instance
   *
   * @param {function} close
   * Function to call when the user closes the modal. Required.
   *
   * @param {function} showForm
   * Function to call when the user wants to add another instance. Required
   *
   */

    angular.module('hz.quickstart')
        .directive('swCreateInstanceComplete',["WEBROOT", function(WEBROOT) {
            return {
                scope: {
                    close: '&',
                    showForm: '&'
                },
                restrict: 'E',
                templateUrl: WEBROOT + 'static/quickstart/templates/swCreateInstanceComplete.html',
                replace: true,
                controller: 'swCreateInstanceCompleteCtrl',
                controllerAs: 'vm'
            };
        }]).controller('swCreateInstanceCompleteCtrl', ['$scope', 'InstanceCreationService', '$sce',
                    function($scope, InstanceCreationService, $sce) {

            var ctrl = this;
            activate();

            //show form again in order to add a new instance
            ctrl.newInstance = function() {
                ctrl.showForm({"clear": true});
            };

            function activate() {

                ctrl.winHelp = $sce.trustAsHtml(gettext('Read more in the <a href="http://help.switch.ch/engines/faq/how-do-i-start-a-windows-vm/" target="_blank">FAQs</a>.'));

                ctrl.close = $scope.close();
                ctrl.showForm = $scope.showForm;
                ctrl.userEmail = null;

                var instance = InstanceCreationService.instance || {};
                var instanceDict = InstanceCreationService.createdInstanceDict || {};
                ctrl.osCategory = instanceDict.os_class;

                ctrl.ip = getPublicIp(instance.addresses, instanceDict.network);
                ctrl.defaultUser = getDefaultUserForImage(instanceDict)

                if (instanceDict.userEmail !== "") {
                    ctrl.userEmail = instanceDict.userEmail;
                }

                ctrl.login = ctrl.defaultUser + '@' + ctrl.ip;
                ctrl.instanceId = instance.id;
            }

            function getPublicIp(addresses, network) {
                try {
                    var ips = addresses[network];

                    if (ips) {
                        var addr = _.find(ips, {'OS-EXT-IPS:type': 'floating'});
                        return addr.addr;
                    } else {
                        return 'undefined';
                    }
                } catch(error) {
                    return 'undefined';
                    Raven.captureException(error);
                }
            }

            function getDefaultUserForImage(instanceDict) {
                if (instanceDict.default_user && instanceDict.default_user !== '') {
                    return instanceDict.default_user;
                } else {
                    return "<user>";
                };
            }
        }]);
}());
