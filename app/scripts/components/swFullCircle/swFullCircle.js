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
*  Created on 15/02/18
*  @author: christian.cueni@iterativ.ch
*
*/

(function () {
  'use strict';

  /**
 * @ngdoc component
 * @name hz.quickstart.swFullCircle
 * @description Component for displaying the quota as overview
 *
 * @param {string} amount
 * @param {string} unit
 * @param {Object} chartSettings
 *
 */

  SwFullCircleController.$inject = ['$scope', 'WEBROOT'];

  function SwFullCircleController($scope, WEBROOT) {

    $scope.getTemplate = function() {
      return WEBROOT + 'static/quickstart/templates/swFullCircle.html';
    };

    var ctrl = this;
    ctrl.show = false;

    ctrl.$onInit = function() {

      ctrl.settings = angular.extend({}, {}, ctrl.chartSettings);
      ctrl.settings.diameter = ctrl.settings.outerRadius * 2;

      var d3Elt = d3.select(angular.element('.svg-full-circle')[0]);

      var arc = d3.svg.arc()
                      .outerRadius(ctrl.settings.outerRadius)
                      .innerRadius(0);

      ctrl.show = true;

    }

  }

  angular.module('hz.quickstart')
  .component('swFullCircle',  {
    bindings: {
      amount: '<',
      unit: '<',
      chartSettings: '<'
    },
    template: '<div ng-include="getTemplate()">',
    controller: SwFullCircleController
  }
)
}());
