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
*  Created on 17/06/15
*  @author: christian.cueni@iterativ.ch
*/

(function () {
    'use strict';

    /**
   * @ngdoc component
   * @name hz.quickstart.swAddKey
   * @description Provides a dialog for adding keypairs.
   * @param {function} keyCreated
   * Function to call when a new key is created. Required.
   *
   * @param {boolean} showForm
   * Indicates whether the form is shown on init. Required.
   *
   * @param {array} keys
   * The user's keypairs. Required
   */

    SwAddKeyController.$inject = ['$scope', 'WEBROOT', 'horizon.app.core.openstack-service-api.nova'];

    function SwAddKeyController($scope, WEBROOT, novaAPI) {

        $scope.getTemplate = function () {
            return WEBROOT + 'static/quickstart/templates/swAddKey.html';
        };

        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.key = '';
            ctrl.keyName = '';
            ctrl.showNameWarning = false;
            ctrl.showKeyWarning = false;
            ctrl.keypairs = _.map(ctrl.keys, 'keypair');
            ctrl.formValid = false;
            ctrl.waitForRequest = false;
        };

        //hide form & reset input fields
        ctrl.hideKeyForm = function () {
            ctrl.showForm = false;
            ctrl.formValid = false;
            ctrl.key = self.keyName = '';
        };

        //verify input when input fields change
        ctrl.inputChange = function () {

            var keyIndex, nameIndex;

            //check if key exists
            keyIndex = _.findIndex(ctrl.keypairs, {'public_key': ctrl.key});
            ctrl.showKeyWarning = keyIndex !== -1;

            //check if the name already exists
            nameIndex = _.findIndex(ctrl.keypairs, {'name': ctrl.keyName});
            ctrl.showNameWarning = nameIndex !== -1;

            //check if fields are non-empty
            ctrl.formValid = ctrl.keyName !== '' && ctrl.key !== '' && !ctrl.showKeyWarning && !ctrl.showNameWarning

        };

        ctrl.addKey = function () {

            if (ctrl.formValid) {
                var keyPair = {
                    name: ctrl.keyName,
                    public_key: ctrl.key
                };

                // reset form
                ctrl.key = ctrl.keyName = '';
                ctrl.formValid = false;

                novaAPI.createKeypair(keyPair).then(function (data) {
                    ctrl.keyCreated({key: data.data});
                    ctrl.showForm = false;
                })
            }
        };

    }

    angular.module('hz.quickstart')
        .component('swAddKey', {
                bindings: {
                  keyCreated: '&',
                  showForm: '<',
                  keys: '<'
                },
                template: '<div ng-include="getTemplate()">',
                controller: SwAddKeyController
            }
        )
}());
