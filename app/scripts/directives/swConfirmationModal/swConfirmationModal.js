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
*/

(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name hz.quickstart.swConfirmationModal
     * @description Provides a confirmation modal
     *
     * @param {string} title
     * The modal's title. Required.
     *
     * @param {string} body
     * The body message. Required
     *
     * @param {function} confirm
     * Function to call when the user confirms. Required.
     *
     * @param {function} cancel
     * Function to call when the user cancels. Required
     */

    angular.module('hz.quickstart')
        .directive('swConfirmationModal', ["$rootScope", "WEBROOT", function($rootScope, WEBROOT) {

            return {
                scope: {
                    title: '@',
                    body: '@',
                    confirm: '&',
                    cancel: '&'
                },
                restrict: 'E',
                templateUrl: WEBROOT + 'static/quickstart/templates/swConfirmationModal.html',
                replace: true,
                controller: 'swConfirmationCtrl',
                controllerAs: 'vm'
            };
        }]).controller('swConfirmationCtrl', ['$scope', function($scope) {
            var self = this;

            activate();

            function activate() {
                self.strings = {
                    confirmString: gettext("Confirm"),
                    cancelString: gettext("Cancel")
                };
                self.title = $scope.title;
                self.body = $scope.body;
                self.confirm = $scope.confirm;
                self.cancel = $scope.cancel;
            }
            //modal controller, handles modal actions
        }]).controller('swConfirmationModalCtrl', ['$uibModalInstance', function($uibModalInstance) {

            var self = this;

            self.confirm = function() {
                $uibModalInstance.close();
            };

            self.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

        }]);
}());
