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
*  Created on 01/02/18
*  @author: christian.cueni@iterativ.ch
*/

(function () {
    'use strict';

    /**
     * @ngdoc component
     * @name hz.quickstart.swKeyPairFieldCtrl
     * @description Provides Keypair input form
     *
     * @param {number} maxKeyPairs
     * Number of max keypairs Required.
     *
     * @param {object} instanceKeypair
     * The instance's keypair
     *
     * @param {array} keypairs
     * A list of available keypairs
     *
     * @param {function} deleteKeypair
     * Function to be called when a keypair is deleted
     *
     * @param {function} keyCreated
     * Function to be called when a keypair is created
     *
     * @param {function} keySelected
     * Function to be called when a keypair is selected
     *
     * @param {boolean} showAddKey
     * Indicates if add key form should be displayed
     */

    SwKeyPairFieldController.$inject = ['$scope', 'WEBROOT'];

    function SwKeyPairFieldController($scope, WEBROOT) {

        $scope.getTemplate = function() {
            return WEBROOT + 'static/quickstart/templates/swKeyPairField.html';
        };

        var ctrl = this;

        ctrl.keySuccessfullyCreated = function(keypair) {
            ctrl.keyCreated({key: keypair});
        };

        ctrl.selectKeyPair = function(keypair) {
            ctrl.instanceKeypair = keypair;
            ctrl.keySelected({key: keypair});
        };

        ctrl.isInstanceKeypair = function(keypair) {
            return keypair.fingerprint === ctrl.instanceKeypair.fingerprint;
        };

    }

    angular.module('hz.quickstart')
        .component('swKeyPairField',  {
                bindings: {
                    maxKeyPairs: '<',
                    instanceKeypair: '<',
                    keypairs: '<',
                    deleteKeypair: '&',
                    keyCreated: '&',
                    keySelected: '&',
                    showAddKey: '<'
                },
                template: '<div ng-include="getTemplate()">',
                controller: SwKeyPairFieldController
            }
        )
}());
