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
*  Created on 07/02/18
*  @author: christian.cueni@iterativ.ch
*
*
*/

(function () {
    'use strict';

    /**
     * @ngdoc component
     * @name hz.quickstart.swSecurityGroupsField
     * @description Provides security groups field
     *
     * @param {boolean} securityGroupRequired
     *
     * @param {object} maxSecgroups Number of max security groups
     *
     * @param {Object[]} securityGroups A list of available security groups
     *
     * @param {Object[]} instanceSecurityGroups The instance's security group
     *
     * @param {function} securityGroupSelected
     *
     * @param {boolean} neutronSupport is neutron supported
     *
     * @param {Object[]} securityGroups 
     */

    SwSecurityGroupFieldController.$inject = ['$scope', 'WEBROOT'];

    function SwSecurityGroupFieldController($scope, WEBROOT) {

        $scope.getTemplate = function() {
            return WEBROOT + 'static/quickstart/templates/swSecurityGroupField.html';
        };

        var ctrl = this;

        ctrl.groupSelected = function(group) {
            ctrl.securityGroupSelected({group: group});
        };

        ctrl.isSecurityGroupSelected = function(securityGroup) {
            return _.find(ctrl.instanceSecurityGroups, {'id': securityGroup.id}) !== undefined
        };
    }

    angular.module('hz.quickstart')
        .component('swSecurityGroupsField',  {
                bindings: {
                    securityGroupRequired: '<',
                    maxSecgroups: '<',
                    securityGroups: '<',
                    instanceSecurityGroups: '<',
                    securityGroupSelected: '&',
                    neutronSupport: '<',
                    securityGroups: '<'
                },
                template: '<div ng-include="getTemplate()"></div>',
                controller: SwSecurityGroupFieldController
            }
        )
}());
