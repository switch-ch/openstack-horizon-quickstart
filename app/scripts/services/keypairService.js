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
  * @name hz.quickstart.KeypairService
  * @description
  * Contains logic for images
  *
  */

  angular.module('hz.quickstart')
  .factory('KeypairService', [ 'apiExtensionService', function(apiExtensionService) {

    function deleteKeypair(keypair, keypairs) {

      var instanceKeypair = null;
      keypair.delete = true;
      return apiExtensionService.keypairs.delete(keypair.keypair.name).then(function(data) {
        keypairs = _.without(keypairs, keypair);
        //if keypairs are left in the list, select the first as default
        if (keypairs.length > 0) {
          instanceKeypair = keypairs[0];
        }
        return {
          keypairs: keypairs,
          instanceKeypair: instanceKeypair
        }
      }, function (error) {
        keypair.delete = false;
        Raven.captureException(error);
      })
    };

    function hasMaxKeyPairs (keypairs, quota) {
      return keypairs.length === quota.max;
    }

    return {
      hasMaxKeyPairs: hasMaxKeyPairs,
      deleteKeypair: deleteKeypair
    };

  }]);
}());
