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
     * @name hz.quickstart.swTextSelectCtrl
     * @description Shows the user's quota for a metric (pie chart & text). In addition to the quota that is actually
     * used it also shows the impact on the user's quota when selecting images & flavors.
     *
     * @param {string} title
     *
     * @param {string} id
     *
     * @param {string} value
     *
     */


    angular.module('hz.quickstart')
        .directive('swTextSelect', ["WEBROOT", function(WEBROOT) {
            return {
                scope: {
                    title: '=',
                    id: '@',
                    value: '='
                },
                restrict: 'E',
                templateUrl: WEBROOT + 'static/quickstart/templates/swTextSelect.html',
                replace: true,
                controller: 'swTextSelectCtrl',
                controllerAs: 'vm'
            };
        }]).controller('swTextSelectCtrl', ['$scope', '$element', '$window', function($scope, $element, $window) {
            var self = this;

            activate();

            self.selectText = function() {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    var input = $element.find("input")[0];
                    input.setSelectionRange(0, input.value.length)
                }
            };

            function activate() {
                self.title = $scope.title;
                self.id = $scope.id;
                self.value = $scope.value;
                self.selectString = gettext("Select");
            }
        }]);
}());
