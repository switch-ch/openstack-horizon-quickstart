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
 * @name hz.quickstart.swFlavorsField
 * @description Component for flavor selection
 *
 * @param {Object[]} flavors
 * @param {callback} selectFlavor
 * @param {boolean} flavorsNotInQuota Indicates whether there are flavors that cannot be used due to the quota
 * @param {boolean} flavorsNotForImage Indicates whether there are flavors that cannot be used for the image
 * @param {Object} instanceFlavor
 *
 */

  SwFlavorsFieldController.$inject = ['$scope', 'WEBROOT'];

  function SwFlavorsFieldController($scope, WEBROOT) {

    $scope.getTemplate = function() {
      return WEBROOT + 'static/quickstart/templates/swFlavorsField.html';
    };

    var ctrl = this;

    ctrl.flavorSelected = function(flavor) {
      if (flavor.allowed && flavor.allowedForImage) {
        ctrl.selectFlavor({flavor: flavor})
      }
    };

    ctrl.flavorTitle = function(flavor) {
      if (!flavor.allowed) {
        return gettext('This flavor is disabled due to your quota')
      } else if (!flavor.allowedForImage) {
        return gettext('This flavor does not meet the selected images\' requirements.')
      }
      return '';
    };

    ctrl.isInstanceFlavor = function(flavor) {
      return flavor.id === ctrl.instanceFlavor.id;
    }

  }

  angular.module('hz.quickstart')
  .component('swFlavorsField',  {
    bindings: {
      flavors: '<',
      selectFlavor: '&',
      flavorsNotInQuota: '<',
      flavorsNotForImage: '<',
      instanceFlavor: '<'
    },
    template: '<div ng-include="getTemplate()">',
    controller: SwFlavorsFieldController
  }
)
}());
