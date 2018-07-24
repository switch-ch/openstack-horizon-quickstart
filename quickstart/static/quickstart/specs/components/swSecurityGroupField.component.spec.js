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


describe('Component: swSwcurityGroupField', () => {
  let $compile;
  let scope;

  // load the service's module
  beforeEach(function() {
    angular.mock.module('hz.quickstart');
    module('templates');
  });

  // beforeEach();

  beforeEach(function() {
    module(function($provide) {
      $provide.constant('WEBROOT', '/quickstart/');
    });
  });

  beforeEach(inject(($rootScope, _$compile_) => {
    scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it('should display field if required', () => {
    scope['maxSecgroups'] = false;
    scope['securityGroupRequired'] = true;
    scope['securityGroups'] = [];
    scope['instanceSecurityGroups'] = null;
    scope['securityGroupSelected'] = null;
    scope['neutronSupport'] = true;
    scope['securityGroups'] = [];

    let element = angular.element(`<sw-security-groups-field
                      max-secgroups="maxSecgroups"
                      security-group-required="securityGroupRequired"
                      security-groups="securityGroups"
                      instance-security-groups="instanceSecurityGroups"
                      security-group-selected="securityGroupSelected"
                      neutron-support="neutronSupport"
                      security-groups="securityGroups" />`);
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.qa-sec-group-field').hasClass('ng-hide')).toBe(false);
    expect(element.find('.qa-sec-group-title').text()).toEqual('Firewall Rules');
    expect(element.find('.qa-max-sec-group-warning').hasClass('ng-hide')).toBe(true);
  });

  it('should display field if max groups reached', () => {
    scope['maxSecgroups'] = true;
    scope['securityGroupRequired'] = false;
    scope['securityGroups'] = [];
    scope['instanceSecurityGroups'] = null;
    scope['securityGroupSelected'] = null;
    scope['neutronSupport'] = true;
    scope['securityGroups'] = [];

    let element = angular.element(`<sw-security-groups-field
                      max-secgroups="maxSecgroups"
                      security-group-required="securityGroupRequired"
                      security-groups="securityGroups"
                      instance-security-groups="instanceSecurityGroups"
                      security-group-selected="securityGroupSelected"
                      neutron-support="neutronSupport"
                      security-groups="securityGroups" />`);
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.qa-sec-group-field').hasClass('ng-hide')).toBe(false);
    expect(element.find('.qa-sec-group-title').text()).toEqual('Firewall Rules');
  });

  it('should hide if field not required', () => {
    scope['maxSecgroups'] = false;
    scope['securityGroupRequired'] = false;
    scope['securityGroups'] = [];
    scope['instanceSecurityGroups'] = null;
    scope['securityGroupSelected'] = null;
    scope['neutronSupport'] = true;
    scope['securityGroups'] = [];

    let element = angular.element(`<sw-security-groups-field
                      max-secgroups="maxSecgroups"
                      security-group-required="securityGroupRequired"
                      security-groups="securityGroups"
                      instance-security-groups="instanceSecurityGroups"
                      security-group-selected="securityGroupSelected"
                      neutron-support="neutronSupport"
                      security-groups="securityGroups" />`);
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.qa-sec-group-field').hasClass('ng-hide')).toBe(true);
  });

  it('should display the flavors not in quota warning', () => {
    scope['maxSecgroups'] = true;
    scope['securityGroupRequired'] = false;
    scope['securityGroups'] = [];
    scope['instanceSecurityGroups'] = null;
    scope['securityGroupSelected'] = null;
    scope['neutronSupport'] = true;
    scope['securityGroups'] = [];

    let element = angular.element(`<sw-security-groups-field
                      max-secgroups="maxSecgroups"
                      security-group-required="securityGroupRequired"
                      security-groups="securityGroups"
                      instance-security-groups="instanceSecurityGroups"
                      security-group-selected="securityGroupSelected"
                      neutron-support="neutronSupport"
                      security-groups="securityGroups" />`);
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.qa-max-sec-group-warning').hasClass('ng-hide')).toBe(false);
  });

});
