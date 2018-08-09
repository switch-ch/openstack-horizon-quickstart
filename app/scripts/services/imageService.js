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
*  Created on 21/02/18
*  @author: christian.cueni@iterativ.ch
*/
(function () {
  'use strict';

  /**
  * @ngdoc service
  * @name hz.quickstart.ImageService
  * @description
  * Contains logic for images
  *
  */

  angular.module('hz.quickstart')
  .factory('ImageService', [ 'UsageService', 'NON_BOOTABLE_IMAGES', function(UsageService, NON_BOOTABLE_IMAGES) {

    var SNAPSHOT = 'snapshot'


    function checkRamQuotaForImage(image, ramLimits) {
      var imagesNotInQuota = false;

      if ( image.min_ram > UsageService.ramQuotaLeft(ramLimits) ) {
        image.allowedQuota = false;
        imagesNotInQuota = true;
      } else {
        image.allowedQuota = true;
      }

      return imagesNotInQuota;
    }

    function filterNonBootableImages(images) {
      var filteredImages = images.filter(function(image) {
        if (_.indexOf(NON_BOOTABLE_IMAGES, image.container_format) < 0) {
          return image;
        }
      });

      return filteredImages;
    };

    function imageVersion(image) {
      var version = image.name;

      if (image.properties && 'os_version' in image.properties) {
        version = image.properties.os_version;
      }

      return version;
    };

    function sortImages(images) {
      return images.sort(function(a, b) {

        //move not allowed images to the back
        if (a.image.allowedQuota && !b.image.allowedQuota) {
          return -1;
        }

        if (!a.image.allowedQuota && b.image.allowedQuota) {
          return 1;
        }

        if (a.version < b.version) {
          return 1
        }
        if (b.version > a.version) {
          return -1
        }

        return 0
      });
    };

    // Returns the image's category names
    function categoryName(image) {

      var categoryName = '';
      var categoryDisplayName = '';
      var category = 'other';

      if (image.properties && 'os_flavor' in image.properties) {
        categoryName = image.properties.os_flavor.toLowerCase();
        category = categoryName;

        if ('os_flavor_name' in image.properties) {
          categoryDisplayName = image.properties.os_flavor_name
        }
      }

      if (image.properties && 'image_type' in image.properties
          && image.properties.image_type === SNAPSHOT) {
        var text = gettext('My Snapshots');
        categoryName = text.toLowerCase();
        category = categoryName;
        categoryDisplayName = text;
      }

      return {
        categoryName: categoryName,
        categoryDisplayName: categoryDisplayName,
        category: category
      };
    };


    return {
      checkRamQuotaForImage: checkRamQuotaForImage,
      filterNonBootableImages: filterNonBootableImages,
      imageVersion: imageVersion,
      categoryName: categoryName,
      sortImages: sortImages
    };

  }]);
}());
