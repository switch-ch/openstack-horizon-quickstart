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
     * @ngdoc service
     * @name hz.quickstart.UsageService
     * @description
     * Retrieves the user's quota from the API and caches it. "toAdd" values are values that are yet to be added to the
     * quota when the user selects a flavor.
     *
     */

    angular.module('hz.quickstart')
        .factory('UsageService', ['apiExtensionService', '$state', '$q', '$rootScope',
            function(apiExtensionService, $state, $q, $rootScope){

            var state = $state.current.name;
            var usageService = {
                usage: null
            };

            //parse quota retrieved from API
            function parseUsage(rawUsage) {
                var usage = {
                    volumes: {
                        max: rawUsage.cinderLimits.maxTotalVolumes,
                        used: rawUsage.cinderLimits.totalVolumesUsed,
                        toAdd: 0,
                        unlimited: false,
                        limitReached: false
                    },
                    volumeSpace: {
                        max: rawUsage.cinderLimits.maxTotalVolumeGigabytes,
                        used: rawUsage.cinderLimits.totalGigabytesUsed,
                        toAdd: 0,
                        unlimited: false,
                        limitReached: false
                    },
                    cores: {
                        max: rawUsage.novaLimits.maxTotalCores,
                        used: rawUsage.novaLimits.totalCoresUsed,
                        toAdd: 0,
                        unlimited: false,
                        limitReached: false
                    },
                    ram: {
                        max: rawUsage.novaLimits.maxTotalRAMSize,
                        used: rawUsage.novaLimits.totalRAMUsed,
                        toAdd: 0,
                        unlimited: false,
                        limitReached: false
                    },
                    instances: {
                        max: rawUsage.novaLimits.maxTotalInstances,
                        used: rawUsage.novaLimits.totalInstancesUsed,
                        toAdd: 0,
                        unlimited: false,
                        limitReached: false
                    },
                    novaFloatingIps: {
                        max: rawUsage.novaLimits.maxTotalFloatingIps,
                        used: rawUsage.novaLimits.totalFloatingIpsUsed,
                        toAdd: rawUsage.novaLimits.totalFloatingIpsUsed,
                        unlimited: false,
                        limitReached: false
                    },
                    securityGroups: {
                        max: rawUsage.novaLimits.maxSecurityGroups,
                        used: rawUsage.novaLimits.totalSecurityGroupsUsed,
                        toAdd: 0,
                        unlimited: false,
                        limitReached: false
                    },
                    keyPairs: {
                        max: rawUsage.novaLimits.maxTotalKeypairs,
                        used: rawUsage.novaLimits.totalKeypairs,
                        toAdd: 0,
                        unlimited: false,
                        limitReached: false
                    }
                };

                //only present when using neutron
                if (rawUsage.neutronLimits.maxTotalFloatingIps) {
                    usage.neutronFloatingIps =  {
                        max: rawUsage.neutronLimits.maxTotalFloatingIps,
                        used: rawUsage.neutronLimits.totalFloatingIpsUsed, //totalFloatingIpsUsed only IPs used by instances
                        toAdd: rawUsage.neutronLimits.totalFloatingIps - rawUsage.neutronLimits.totalFloatingIpsUsed, //totalFloatingIps = all allocated IPs
                        unlimted: false,
                        limitReached: false
                    }
                }

                updateQuotas(null, usage);
                return usage;
            }

            //check if a metric is within the limits
            function checkLimit(key, usage) {
                return usage[key].toAdd + usage[key].used >= usage[key].max;
            }

            function checkUnlimited(key, usage) {
              return usage[key].max === -1;
            }

            function checkSingleQuota(key, usage) {
              usage[key].unlimited = checkUnlimited(key, usage);
              usage[key].limitReached = checkLimit(key, usage);
            }

            //check limit for a specific metric (if key is present) or all metrics
            function updateQuotas(key, usage) {
                if (key) {
                    checkSingleQuota(key, usage);
                } else {
                    _.forEach(usage, function(n, aKey) {
                        checkSingleQuota(aKey, usage);
                    });
                }
            }

            // Resets (set to 0) the "to add" values
            usageService.resetToAdd = function () {
                var keys = ["cores", "ram", "volumes", "volumeSpace"];
                keys.forEach(function(key) {
                    usageService.usage[key].toAdd = 0;
                });
                //fire event
                $rootScope.$broadcast("usage:toAddUpdated", usageService.usage);
            };

            //update quota from api
            function updateCall() {
                return apiExtensionService.limits.getAllLimits().then(function(data) {
                    usageService.usage = parseUsage(data.data);
                    $rootScope.$broadcast("usage:update", usageService.usage);
                    return usageService.usage;
                }, function(reason) {
                    Raven.captureException(reason);
                    return reason
                });
            }

            usageService.checkQuotaOkForKey = function (key) {
              if (usageService.usage[key].unlimited) {
                return true;
              }

              if( (key === 'neutronFloatingIps' || key === 'novaFloatingIps') && usageService.usage[key]) {
                  return usageService.usage[key].used < usageService.usage[key].max;
              }
              else {
                return usageService.usage[key] && !usageService.usage[key].limitReached
              }
            }

            usageService.ramQuotaLeft = function (ram) {

              // is unlimited
              if (ram.max === -1) {
                return 1000000;
              }

              return ram.max - ram.used;
            }

            usageService.ramRequiredInQuota = function (requiredRam, ram) {
              if (ram.unlimited) {
                return true;
              };
              return requiredRam <= usageService.ramQuotaLeft(ram)
            }

            usageService.cpusRequiredInQuota = function (requiredCpus, cores) {
              if (cores.unlimited) {
                return true;
              }
              return requiredCpus <= (cores.max - cores.used);
            };

            usageService.volumeRequiredInQuota = function (requiredVolumeSpace, volumeSpace) {
              if (volumeSpace.unlimited) {
                return true;
              }
              return requiredVolumeSpace <= (volumeSpace.max - volumeSpace.used);
            };

            usageService.updateUsage = function () {
                state = $state.current.name;
                return updateCall();
            };

            usageService.getUsage = function() {
                if (!state || !usageService.usage || state !== $state.current.name) {
                    state = $state.current.name;
                    return updateCall();
                } else {
                    var deferred = $q.defer();
                    deferred.resolve(usageService.usage);
                    return deferred.promise;
                }
            };

            usageService.setUsage = function(newUsageData) {
                usageService.usage = parseUsage(newUsageData);
                $rootScope.$broadcast("usage:update", usageService.usage);
            };

            usageService.updateToAdd = function(updatedValues) {
                _.forEach(updatedValues, function(n, key) {
                    try {
                        usageService.usage[key].toAdd = updatedValues[key];
                        updateQuotas(key, usageService.usage);
                    } catch (error) {

                    }
                    $rootScope.$broadcast("usage:toAddUpdated", usageService.usage);
                });
            };
            return usageService;
        }]);
}());
