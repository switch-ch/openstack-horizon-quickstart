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

describe('Component: swFlavorsField', () => {
  let $compile;
  let scope;

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

  beforeEach(inject(($rootScope, _$compile_) => {
    scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it('should display flavors and select the instance\'s flavor', () => {
    scope['flavors'] = [
      {
        vcpus: 3,
        ram: 1024,
        disk: 80,
        name: 'flavor1',
        id: 'flavor1-id'
      },
      {
        vcpus: 1,
        ram: 2048,
        disk: 20,
        name: 'flavor2',
        id: 'flavor2-id'
      }
    ];

    scope['instanceFlavor'] = scope.flavors[0]
    scope['flavorsNotInQuota'] = false;
    scope['flavorsNotForImage'] = false;


    let element = angular.element(`<sw-flavors-field
                      flavors="flavors"
                      select-flavor="null"
                      flavors-not-in-quota="flavorsNotInQuota"
                      flavors-not-for-image="flavorsNotForImage"
                      instance-flavor="instanceFlavor" />`);
    element = $compile(element)(scope);
    scope.$digest();

    let checkbox = angular.element(element[0].querySelectorAll('.qa-flavor-checkbox')[0]);
    expect(element[0].querySelectorAll('.qa-flavors__item').length).toBe(2);
    expect(checkbox.attr('checked')).toBe('checked');
  });

  it('should display the flavors not in quota warning', () => {
    scope['flavors'] = [
      {
        vcpus: 3,
        ram: 1024,
        disk: 80,
        name: 'flavor1',
        id: 'flavor1-id'
      },
      {
        vcpus: 1,
        ram: 2048,
        disk: 20,
        name: 'flavor2',
        id: 'flavor2-id'
      }
    ];

    scope['instanceFlavor'] = scope.flavors[0]
    scope['flavorsNotInQuota'] = true;
    scope['flavorsNotForImage'] = false;

    let element = angular.element(`<sw-flavors-field
                      flavors="flavors"
                      select-flavor="null"
                      flavors-not-in-quota="flavorsNotInQuota"
                      flavors-not-for-image="flavorsNotForImage"
                      instance-flavor="instanceFlavor" />`);
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.qa-not-for-quota-warning').hasClass('ng-hide')).toBe(false);
    expect(element.find('.qa-not-for-image-warning').hasClass('ng-hide')).toBe(true);
  });

  it('should display the flavors not in quota warning', () => {
    scope['flavors'] = [
      {
        vcpus: 3,
        ram: 1024,
        disk: 80,
        name: 'flavor1',
        id: 'flavor1-id'
      },
      {
        vcpus: 1,
        ram: 2048,
        disk: 20,
        name: 'flavor2',
        id: 'flavor2-id'
      }
    ];

    scope['instanceFlavor'] = scope.flavors[0]
    scope['flavorsNotInQuota'] = false;
    scope['flavorsNotForImage'] = true;

    let element = angular.element(`<sw-flavors-field
                      flavors="flavors"
                      select-flavor="null"
                      flavors-not-in-quota="flavorsNotInQuota"
                      flavors-not-for-image="flavorsNotForImage"
                      instance-flavor="instanceFlavor" />`);
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.qa-not-for-quota-warning').hasClass('ng-hide')).toBe(true);
    expect(element.find('.qa-not-for-image-warning').hasClass('ng-hide')).toBe(false);
  });
});
