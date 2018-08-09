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
*  Created on 14/02/18
*  @author: christian.cueni@iterativ.ch
*/
(function () {
  'use strict';

  /**
  * @ngdoc service
  * @name hz.quickstart.FlavorsService
  * @description
  * Contains logic to match flavors to images
  *
  */

  angular.module('hz.quickstart')
  .factory('FlavorsService', [ 'UsageService', function(UsageService) {


    // check if a given flavor is allowed for the selected image i.e.
    // it meets the minimal requirements
    function checkFlavorForImage(image, flavors) {

      var flavorsNotForImage = false;

      // we're changing the flavor objects. Bit of  no-no.
      // This should be changed to follow a more immutable approach.
      _.forEach(flavors, function(flavor) {
        var index = _.findIndex(image.allowedFlavors, function(allowedFlavor) {
          return flavor.id === allowedFlavor;
        });

        if (index > -1) {
          flavor.allowedForImage = true;
        } else {
          flavorsNotForImage = true;
          flavor.allowedForImage = false;
        }
      });

      return flavorsNotForImage;
    }

    function selectFlavorForImage(image, flavors, instance) {
      var found = false;
      for (var i = 0; i < image.allowedFlavors.length; i++) {
        var flavorId = image.allowedFlavors[i];
        if (!found) {
          var flavor = _.find(flavors, {'id': flavorId });
          if (flavor !== undefined && flavor.allowed && flavor.allowedForImage) {
            selectFlavor(flavor, instance);
            found = true;
          }
        }
      };
    }

    function selectFlavor(flavor, instance) {

      var vcpus, ram;
      vcpus = ram = 0;

      //verify if the flavor is allowed.
      if (flavor.allowed && flavor.allowedForImage) {
        instance.flavor = flavor;
        vcpus = instance.flavor.vcpus;
        ram = instance.flavor.ram;
      } else {
        instance.flavor = null;
      }

      UsageService.updateToAdd({
        cores: vcpus,
        ram: ram
      });
    }

    function sortFlavorsByRam (flavors) {
      return flavors.sort(function(a, b) {
        if (a.ram < b.ram) {
          return -1;
        }
        if (a.ram > b.ram) {
          return 1;
        }
        return 0;
      });
    }

    function flavorInQuota (flavor, limits) {

      var flavorsNotInQuota = false;

      if (UsageService.cpusRequiredInQuota(flavor.vcpus, limits.cores) &&
          UsageService.ramRequiredInQuota(flavor.ram, limits.ram) ) {
        flavor.allowed = true;
      } else {
        flavor.allowed = false;
        flavorsNotInQuota = true;
      }

      return flavorsNotInQuota;
    }

    function flavorAllowedForRequirements (flavor, min_ram, min_disk) {
      return (min_ram <= flavor.ram && min_disk <= flavor.disk) && !flavor.flavorsNotInQuota;
    }

    return {
      checkFlavorForImage: checkFlavorForImage,
      selectFlavorForImage: selectFlavorForImage,
      selectFlavor: selectFlavor,
      sortFlavorsByRam: sortFlavorsByRam,
      flavorInQuota: flavorInQuota,
      flavorAllowedForRequirements: flavorAllowedForRequirements
    };

  }]);
}());
