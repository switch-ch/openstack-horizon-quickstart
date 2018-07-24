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


describe('Directive: swQuotaDisplay', () => {
  let $compile;
  let rootScope;
  let UsageService;
  let $filter;
  let $q;

  // load the service's module
  beforeEach(function() {
    angular.mock.module('hz.quickstart');
    module('templates');
  });

  beforeEach(function() {
    module(function($provide) {
      $provide.constant('WEBROOT', '/quickstart/');
    });
  });

  beforeEach(inject(($rootScope, _UsageService_, _$filter_, _$compile_, _$q_) => {
    rootScope = $rootScope.$new();
    $compile = _$compile_;
    UsageService = _UsageService_;
    $filter = _$filter_;
    $q = _$q_;
  }));

  it('should display the correct quota with unit', () => {

    var max = 20;
    var used = 10;
    var unit = 'MB'

    var deferred = $q.defer();
    deferred.resolve({
      ram: {
        max: max,
        used: used,
        toAdd: 0,
        unlimited: false
      }
    });

    UsageService.getUsage = function() {
      return deferred.promise;
    };

    let element = angular.element(`<sw-quota-display
              class="col-xs-6"
              title="RAM"
              metric="ram"
              unit="${unit}"
              is-bytes="true"></sw-quota-display>`);

    element = $compile(element)(rootScope);
    rootScope.$digest();

    let displayValue = angular.element(element[0].querySelectorAll('.qa-swquota-display-value')[0]);
    expect(displayValue.text().trim()).toBe(`Used ${used} ${unit} of ${max} ${unit}`);
  });

  it('should display the correct quota without unit', () => {

    var max = 20;
    var used = 10;
    var unit = ''

    var deferred = $q.defer();
    deferred.resolve({
      ram: {
        max: max,
        used: used,
        toAdd: 0,
        unlimited: false
      }
    });

    UsageService.getUsage = function() {
      return deferred.promise;
    };

    let element = angular.element(`<sw-quota-display
              class="col-xs-6"
              title="RAM"
              metric="ram"
              is-bytes="false"></sw-quota-display>`);

    element = $compile(element)(rootScope);
    rootScope.$digest();

    let displayValue = angular.element(element[0].querySelectorAll('.qa-swquota-display-value')[0]);
    expect(displayValue.text().trim()).toBe(`Used ${used} of ${max}`);
  });

  it('should display the correct quota with unit for unlimited', () => {

    var max = -1;
    var used = 10;
    var unit = 'GB';

    var deferred = $q.defer();
    deferred.resolve({
      ram: {
        max: max,
        used: used,
        toAdd: 0,
        unlimited: true
      }
    });

    UsageService.getUsage = function() {
      return deferred.promise;
    };

    let element = angular.element(`<sw-quota-display
              class="col-xs-6"
              title="RAM"
              metric="ram"
              unit="${unit}"
              is-bytes="true"></sw-quota-display>`);

    element = $compile(element)(rootScope);
    rootScope.$digest();

    let displayValue = angular.element(element[0].querySelectorAll('.qa-swquota-display-value')[0]);
    expect(displayValue.text().trim()).toBe(`Used ${used} ${unit} (unlimited)`);
  });

  it('should display the correct quota with unit for unlimited', () => {

    var max = -1;
    var used = 10;
    var unit = '';

    var deferred = $q.defer();
    deferred.resolve({
      ram: {
        max: max,
        used: used,
        toAdd: 0,
        unlimited: true
      }
    });

    UsageService.getUsage = function() {
      return deferred.promise;
    };

    let element = angular.element(`<sw-quota-display
              class="col-xs-6"
              title="RAM"
              metric="ram"
              unit="${unit}"
              is-bytes="false"></sw-quota-display>`);

    element = $compile(element)(rootScope);
    rootScope.$digest();

    let displayValue = angular.element(element[0].querySelectorAll('.qa-swquota-display-value')[0]);
    expect(displayValue.text().trim()).toBe(`Used ${used} (unlimited)`);
  });

});
