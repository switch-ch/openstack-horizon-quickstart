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
*  Created on 22/03/18
*  @author: christian.cueni@iterativ.ch
**/

'use strict';

describe('Service: Keypair', function () {

  // load the service's module
  beforeEach(function() {
    module('hz.quickstart');
  });

  // beforeEach(function() {
  //   module(function($provide) {
  //     $provide.provider('UsageService', function() {
  //       this.$get = function() {
  //         var ramQuotaLeft = jasmine.createSpy('ramQuotaLeft');
  //
  //         return {
  //           ramQuotaLeft: ramQuotaLeft
  //         };
  //       }
  //     });
  //   });
  // });

  // instantiate service
  var KeypairService, httpBackend, $rootScope;
  beforeEach(inject(function (_KeypairService_, _$httpBackend_, _$rootScope_) {
    KeypairService = _KeypairService_;
    httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_.$new();
  }));

  it('should return has not reached maxkeypairs', function () {

    var keypairs = [
      {
        some: 'kepyair'
      }
    ];

    var quota = {
      max: 2
    };

    expect(!!KeypairService).toBe(true);

    var hasMaxReached = KeypairService.hasMaxKeyPairs(keypairs, quota);
    expect(hasMaxReached).toEqual(false);

  });

  it('should return has reached maxkeypairs', function () {

    var keypairs = [
      {
        some: 'kepyair'
      }
    ];

    var quota = {
      max: 1
    };

    var hasMaxReached = KeypairService.hasMaxKeyPairs(keypairs, quota);
    expect(hasMaxReached).toEqual(true);

  });

});
