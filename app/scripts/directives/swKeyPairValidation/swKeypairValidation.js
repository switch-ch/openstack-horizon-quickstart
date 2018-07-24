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
      * @name hz.quickstart.swKeypairValidation
      * @description Validates the keypairs in the creation form. Verifies whether a keypair is selected if required
      * by the image.
      *
      */

    angular.module('hz.quickstart')
        .directive('swKeypairValidation', function() {

            return {
                scope: {
                  initialImage: '='
                },
                restrict: 'A',
                require: 'ngModel',

                link: function(scope, element, attrs, ngModel) {

                    var image = scope.initialImage;

                    //validate selection based on the image's requirements
                    function setValidity(modelValue) {
                        if (image && image.properties && image.properties.requires_ssh === "true") {
                            if (modelValue) {
                                ngModel.$setValidity('requriesSsh', true);
                            } else {
                                ngModel.$setValidity('requriesSsh', false);
                            }
                        } else {
                            ngModel.$setValidity('requriesSsh', true);
                        }
                    }

                    //dom changes
                    ngModel.$parsers.unshift(function(value) {
                        setValidity(value);
                        return value;
                    });

                    //model changes
                    ngModel.$formatters.unshift(function(value) {
                        setValidity(ngModel.$modelValue);
                        return value;
                    });

                    //TODO: use for newer angluar versions below, or at least the ctrl.$validators part
                    // ngModel.$validators.required = function(modelValue, viewValue) {
                    //    console.log('validatior', modelValue, viewValue);
                    //    if (image && image.properties && image.properties) {
                    //
                    //    }
                    //    return false;
                    // };

                    //handle events
                    scope.$on('createInstance:imageChanged', function(event, newImage) {
                        image = newImage;
                        setValidity(ngModel.$modelValue);
                    });
                }
            };
        });
}());
