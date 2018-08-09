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
* Created on 17/06/15
* @author: christian.cueni@iterativ.ch
*/
(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name hz.quickstart.SecurityGroupService
     * @description
     * Handles the logic for selecting/creating security groups for a new vm
     *
     */

    angular.module('hz.quickstart')
        .factory('SecurityGroupService', [ 'SERVICES', function(SERVICES) {

            // todo: get services from server
            var securityGroupService = {
              defaultGroup: {}
            };
            var prefix = 'requires_';

            function getRequiredRules(image) {

                var requiredRules = [];

                if (!image['properties']) {
                    return requiredRules;
                }

                Object.keys(image['properties']).forEach(function(key) {
                    if (key.indexOf(prefix) === 0 && image['properties'][key] === 'true') {
                        requiredRules.push(key.replace(prefix, ''))
                    }
                });

                return requiredRules;
            }

            function findMatchingSecuritygroups(requiredServices, securityGroups) {

                var matchingGroups = [];

                if (requiredServices.length === 0) {
                    return matchingGroups;
                }

                _.each(securityGroups, function (securityGroup) {
                    if (securityGroupService._findRules(securityGroup, requiredServices)) {
                        matchingGroups.push(securityGroup);
                    }
                });
                return matchingGroups;
            }

            function getRequiredServices(image) {
                var services = [];
                var requiredRules = getRequiredRules(image);
                _.each(requiredRules, function(requiredRule) {
                    if (SERVICES[requiredRule]) {
                        var service = SERVICES[requiredRule];
                        service.id = requiredRule
                        services.push(service);
                    }
                });
                return services;
            }

            securityGroupService._findRules = function (securityGroup, requiredServices) {

                var rulesFound = true;

                for (var i = 0; i < requiredServices.length; i++) {
                    var rule = _.find(securityGroup.security_group_rules, {
                            protocol: requiredServices[i].ip_protocol,
                            port_range_max: requiredServices[i].to_port,
                            port_range_min: requiredServices[i].from_port,
                            direction: requiredServices[i].direction
                        });

                    if (rule === undefined) {
                        rulesFound = false;
                        break;
                    }
                }

                return rulesFound;
            }

            function getDefaultGroup(securityGroups) {
                return _.find(securityGroups, function (securityGroup) {
                    return securityGroup.name === 'default';
                });
            }

            function selectSecurityGroups(requiredAndMatchingGroups) {
                var groupsToAdd = [requiredAndMatchingGroups.defaultGroup];
                var rulesToCreate = [];
                var matches = [];

                // one group fullfills requirements
                if(requiredAndMatchingGroups.matchingGroups.length === 1) {
                    groupsToAdd = groupsToAdd.concat(requiredAndMatchingGroups.matchingGroups);
                }
                // no groups matches requirements
                else if(requiredAndMatchingGroups.matchingGroups.length === 0) {
                    rulesToCreate = requiredAndMatchingGroups.requiredServices;
                }
                // more than 1 group other than default matches the requirement
                else if (requiredAndMatchingGroups.matchingGroups.length > 1){
                    matches = requiredAndMatchingGroups.matchingGroups;
                }

                return {
                    groupsToAdd: groupsToAdd,
                    rulesToCreate: rulesToCreate,
                    matches: matches
                }
            }

            securityGroupService.selectSecurityGroup = function(image, securityGroups) {

                var requiredServices = getRequiredServices(image);
                var matchingGroups = findMatchingSecuritygroups(requiredServices, securityGroups);
                securityGroupService.defaultGroup = getDefaultGroup(securityGroups);

                var requiredAndMatchingGroups = {
                    requiredServices: requiredServices,
                    matchingGroups: matchingGroups,
                    defaultGroup: securityGroupService.defaultGroup
                };

                return selectSecurityGroups(requiredAndMatchingGroups)
            };
            return securityGroupService;
        }]);
}());
