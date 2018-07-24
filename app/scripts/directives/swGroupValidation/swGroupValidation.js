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
*  Created on 17/06/15
*  @author: christian.cueni@iterativ.ch
*/

(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name hz.quickstart.swGroupValidation
     * @description Validates the group in the creation form. Verifies if the image's required firewall rules are
     * selected by the user.
     *
     * @param {array} securityGroups
     * Initial security groups. Required.
     *
     * @param {boolean} rulesRequired
     * Indicates if the rule validation is required or not. Required.
     *
     * @param {object} initImage
     * The image that is selected initially. Required.
     *
     */
     
    angular.module('hz.quickstart')
        .directive('swGroupValidation', ["SERVICES", function(SERVICES) {

            return {
                scope: {
                    securityGroups: '=',
                    rulesRequired: '=',
                    initImage: '='
                },
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {

                    var image = scope.initImage;
                    setValidity(scope.securityGroups);

                    //search for required rule in the selected security groups
                    function findRule(securityGroups, service) {
                        var rule;

                        rule = _.find(securityGroups, function(group) {

                            // this can also be an array.... (since liberty)
                            if( Object.prototype.toString.call( group ) === '[object Array]' ) {
                                group = group[0];
                            }

                            return _.find(group.security_group_rules, {
                                protocol: service.ip_protocol,
                                port_range_max: service.to_port,
                                port_range_min: service.from_port,
                                direction: service.direction
                            });
                        });

                        return rule;

                    }

                    function setValidityForServices(image) {
                        // Todo: iterate over required services, not all services
                        _.each(_.pairs(SERVICES), function(service) {
                            if (image.properties && image.properties["requires_" + service[0]] === "true") {
                                var rule = findRule(modelValue, service[1]);
                                if (rule) {
                                    ngModel.$setValidity(service[0] + 'Required', true);
                                } else {
                                    ngModel.$setValidity(service[0] + 'Required', false);
                                }
                            }
                            else {
                                ngModel.$setValidity(service[0] + 'Required', true);
                            }
                        });
                    }

                    //check validity of input
                    function setValidity(modelValue) {

                        //validation is not required
                        if (!scope.rulesRequired) {
                            ngModel.$setValidity('sshRequired', true);
                            ngModel.$setValidity('rdpRequired', true);
                            return;
                        }

                        if (image && image.properties) {
                            setValidityForServices(image);
                        }
                    }

                    //handle events
                    scope.$on('createInstance:imageChanged', function(event, newImage) {
                        image = newImage;
                        setValidity(ngModel.$modelValue);
                    });

                    scope.$on('createInstance:securityGroupsChanged', function(event, groups) {
                        setValidity(groups);
                    });
                }
            };
        }]);
}());
