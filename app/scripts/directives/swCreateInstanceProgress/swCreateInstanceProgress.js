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
*
*/

(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name hz.quickstart.swCreateInstanceProgress
     * @description Provides the progress view (spinner & update messages) in the creation process.
     *
     * @param {function} cancel
     * Function to call when an error occures and the user decides to cancel the creation process. Required.
     *
     * @param {function} showForm
     * Function to call when an error occures and the user decides to restart the creation process. Required.
     */

    angular.module('hz.quickstart')
        .directive('swCreateInstanceProgress', ["WEBROOT", function(WEBROOT) {
            return {
                scope: {
                    cancel: '&',
                    showForm: '&'
                },
                restrict: 'E',
                templateUrl: WEBROOT + 'static/quickstart/templates/swCreateInstanceProgress.html',
                replace: true,
                controller: 'swCreateInstanceProgressCtrl',
                controllerAs: 'vm'
            };
        }]).controller('swCreateInstanceProgressCtrl', ['$scope', function($scope) {

            var self = this;

            activate();

            //handle events from creation service
            $scope.$on("instanceCreation:created", function(event, instance) {
                self.message = "Instance created";
            });

            $scope.$on("instanceCreation:building", function(event, status, task) {
                self.message = status + " " + task;
            });

            $scope.$on("instanceCreation:error", function(event, error) {
                self.error = error;
            });

            $scope.$on("instanceCreation:submitError", function(event, errorResponse) {
                self.error = errorResponse.statusText + " (" + errorResponse.data + ")";
            });

            function activate() {
                self.cancel = $scope.cancel();
                self.showForm = $scope.showForm(false);
                self.message = gettext("Server created");
                self.error = undefined;
            }
        }]);
}());
