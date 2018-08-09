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
     * @name hz.quickstart.swQuotaDisplay
     * @description Shows the user's quota for a metric (pie chart & text). In addition to the quota that is actually
     * used it also shows the impact on the user's quota when selecting images & flavors.
     *
     * @param {string} title
     * The title. Required.
     *
     * @param {string} metric
     * The metric that should be shown. This value must be present in the dictionary provided by the UsageService.
     * Required.
     *
     * @param {string} unit
     * The unit (MB, GB, ...) that will be shown along the values. Required.
     *
     * @param {string} isBytes
     * "true" or "false". Indicates whether the values are bytes. If set to "true" a bytes filter will be used
     * to display the values in Mbs or Gbs. Required.
     *
     * @param {string} usedText
     * By default the usage text is "Used xx of yy". This parameter is a key for text to be used. Currently
     * this is the static value of "used". Optional.
     *
     * @param {string} toAddText
     * By default the text for the data to add is "Add xx of yy". This parameter is a key for text to be used.
     * Currently there are "add" and "allocate". Optional.
     *
     * @param {string} size
     * If set to "big", large pie-charts are displayed. Optional.
     *
     * @param {string} changeDisplayValues
     * "true" or "false". If set to "false" the used value = used + toAdd (total of used quota and currently selected
     * quota), if set to "true" used value = used (used quota by the user). Defaults to "false". Optional.
     *
     */

    angular.module('hz.quickstart')
        .directive('swQuotaDisplay', ["WEBROOT", function(WEBROOT) {

            return {
                scope: {
                    title: '@',
                    metric: '@',
                    unit: '@',
                    isBytes: '@',
                    size: '@',
                    usedText: '@',
                    toAddText: '@',
                    changeDisplayValues: '@'
                },
                restrict: 'E',
                templateUrl: WEBROOT + 'static/quickstart/templates/swQuotaDisplay.html',
                controller: 'swQuotaDisplayCtrl',
                controllerAs: 'vm'
            };
        }]).controller('swQuotaDisplayCtrl', ['$scope', 'UsageService', '$filter', function($scope, UsageService, $filter) {

            var self = this;
            var multiplicator = 1;

            activate();

            //update pie-chart
            function updateGraph() {
                self.data = {
                    title: self.title,
                    data: [
                        { label: '', value: self.quota.used, colorClass: 'piechart__slice--current'},
                        { label: '', value: self.quota.toAdd, colorClass: 'piechart__slice--added' },
                        { label: '', value: (self.quota.max - self.quota.toAdd - self.quota.used), colorClass: 'piechart__slice--remaining', hideKey: true }
                    ]
                };
            }

            //assign the values obtained by events & update pie-chart
            function updateUsage(usage) {
                self.quota = usage[$scope.metric];
                self.unlimited = self.quota.unlimited;

                if (self.unlimited) {
                  self.chartSettings.innerRadius = 0;
                }

                if (!self.quota) {
                    self.quota = { used: 0, toAdd: 0, max: 0}
                }
                self.quota.displayValues = getDisplayValues(self.quota);
                updateGraph();
            }

            //handle update events
            $scope.$on("usage:toAddUpdated", function(event, usage) {
                updateUsage(usage);
            });

            $scope.$on("usage:update", function(event, usage) {
                updateUsage(usage);
            });


            //calculate the value to display in the legend based on the unit
            function calculateDisplayValues(values) {
                return _.mapValues(values, function(value) {
                    if (self.useBytesFilter) {
                        if (value > 0) {
                          var calculatedValue = multiplicator * value;
                          return $filter('bytes')(calculatedValue, 0);
                        } else {
                            return 0;
                        }
                    } else {
                        return value;
                    }
                });
            };

            // TODO: Refactor
            function usedDisplayValueForUnlimited(value) {
              if (value > 0) {
                var calculatedValue = multiplicator * value;
                var filterValues = $filter('bytes')(calculatedValue, 0).split(' ');

                return {
                  value: filterValues[0],
                  unit: filterValues[1]
                }
              } else {
                  return {
                    value: '0',
                    unit: self.unit
                  }
              }
            }

            //get values for legend
            function getDisplayValues(quota) {

                var used, toAdd, max;

                //just for the floating ips
                if (self.changeDisplayValues) {
                    used = quota.used;
                    toAdd = quota.toAdd;
                } else {
                    used = quota.used + quota.toAdd;
                    toAdd = quota.toAdd;
                }

                var calculatedDisplayValues = calculateDisplayValues(
                    {
                        used: used,
                        toAdd: toAdd,
                        max: quota.max
                    }
                );

                if (self.unlimited && self.useBytesFilter) {
                  var displayValuesForUnlimited = usedDisplayValueForUnlimited(used);
                  calculatedDisplayValues.used = displayValuesForUnlimited.value;
                  self.unit = displayValuesForUnlimited.unit;
                }
                calculatedDisplayValues.max = self.unlimited ? gettext('unlimited') : calculatedDisplayValues.max;
                return calculatedDisplayValues;
            }

            function activate() {

                self.title = $scope.title;
                self.unit = $scope.unit;

                //different display values for floatingips
                //todo: use eval instead of string
                self.changeDisplayValues = ($scope.changeDisplayValues && $scope.changeDisplayValues === "true");

                //set size
                if ($scope.size) {
                    if ($scope.size === "big") {
                        self.chartSettings = {
                            innerRadius: 30,
                            outerRadius: 50,
                            showLabel: false
                        };
                    }
                }

                if (!$scope.size) {
                    self.chartSettings = {
                        innerRadius: 9,
                        outerRadius: 13,
                        showLabel: false
                    };
                }

                //set values for initial pie-chart
                self.quota = {
                    max: 100,
                    toAdd: 0,
                    used: 0,
                    displayValues: {}
                };

                self.unlimited = false;

                self.data = {
                    title: self.title,
                    data: [
                        {label: '', value: 1, colorClass: 'piechart__slice--remaining'},
                    ]
                };

                //set filter for Byte quotas
                self.useBytesFilter = ($scope.isBytes === 'true');

                if (self.unit === 'MB') {
                  multiplicator = 1024*1024;
                } else if (self.unit === 'GB') {
                  multiplicator = 1024*1024*1024;
                };

                UsageService.getUsage().then(function(usage) {
                    updateUsage(usage);
                });

            }
        }]);
}());
