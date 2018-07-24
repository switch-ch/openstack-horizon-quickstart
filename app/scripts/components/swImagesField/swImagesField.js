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
    * @name hz.quickstart.swImagesField
    * @description Provides Images Field for the instance form
    *
    * @param {boolean} imagesNotInQuota
    * Indicates if some images cannot be used due to the quota
    *
    * @param {Array} imageCategories
    * List of all image categories
    *
    * @param {array} showImageDropdown
    * Indicates if dropdown for images is shown
    *
    * @param {function} imageSelected
    * Called if an image is selected
    *
    * @param {Object} instanceImage
    * The instance's image
    */

    SwImagesFieldController.$inject = ['$scope', 'WEBROOT'];

    function SwImagesFieldController($scope, WEBROOT) {

        $scope.getTemplate = function() {
            return WEBROOT + 'static/quickstart/templates/swImagesField.html';
        };

        var ctrl = this;

        ctrl.selectImage = function(image, imageCategory, toggleDropdown) {
            ctrl.imageSelected(
                {
                    image: image,
                    imageCategory: imageCategory,
                    toggleDropdown: toggleDropdown
                });
        }

        ctrl.activateImageCategory = function (imageCategory) {
            if (hasImageCategoryMultipleAllowedImages(imageCategory)) {
                activateNewAndDeactivateOldCategory(imageCategory);
            }
        };

        function hasImageCategoryMultipleAllowedImages(imageCategory) {
            return !(imageCategory.notAllowedImage && imageCategory.images.length === 1)
                || (imageCategory.images.length === 1 && imageCategory.images[0].image.allowedFlavors.length === 0);
        }

        function activateNewAndDeactivateOldCategory(imageCategory) {
            var oldActive;
            oldActive = _.find(ctrl.imageCategories, {active: true});
            if (imageCategory !== oldActive) {
                if (oldActive) {
                    oldActive.active = false;
                }
                imageCategory.active = true;
                //select the first image
                ctrl.selectImage(imageCategory.images[0].image, null, true);
            }
        }

    }

    angular.module('hz.quickstart')
        .component('swImagesField',  {
                bindings: {
                    imagesNotInQuota: '<',
                    imageCategories: '<',
                    showImageDropdown: '<',
                    imageSelected: '&',
                    instanceImage: '<',
                },
                template: '<div ng-include="getTemplate()">',
                controller: SwImagesFieldController
            }
        )
}());
