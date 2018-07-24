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

describe('Service: SecurityGroups', function () {

  // load the service's module
  beforeEach(function() {
    module('hz.quickstart');
  });

  // instantiate service
  var SecurityGroupService, rootScope, SERVICES;
  beforeEach(inject(function (_SecurityGroupService_, $rootScope, _SERVICES_) {
    SecurityGroupService = _SecurityGroupService_;
    rootScope = $rootScope;
    SERVICES = _SERVICES_;
  }));


  it('should find one rule', function () {

      var services = [{
        ip_protocol: 'tcp',
        to_port: 22,
        from_port: 22,
        direction: 'ingress'
      }];

      var securityGroup = {
        security_group_rules: [{
          protocol: services[0].ip_protocol,
          port_range_max: services[0].to_port,
          port_range_min: services[0].from_port,
          direction: services[0].direction
        }]
      };

      expect(!!SecurityGroupService).toBe(true);

      var rulesFound = SecurityGroupService._findRules(securityGroup, services)

      expect(rulesFound).toBe(true);

  });

    it('should find two rules', function () {

        var services = [
          {
            ip_protocol: 'tcp',
            to_port: 22,
            from_port: 22,
            direction: 'ingress'
          },
          {
            ip_protocol: 'tcp',
            to_port: 80,
            from_port: 80,
            direction: 'ingress'
          },
        ];

        var securityGroup = {
          security_group_rules: [
            {
              protocol: services[0].ip_protocol,
              port_range_max: services[0].to_port,
              port_range_min: services[0].from_port,
              direction: services[0].direction
            },
            {
              protocol: services[1].ip_protocol,
              port_range_max: services[1].to_port,
              port_range_min: services[1].from_port,
              direction: services[1].direction
            }
          ]
        };

        expect(!!SecurityGroupService).toBe(true);

        var rulesFound = SecurityGroupService._findRules(securityGroup, services)

        expect(rulesFound).toBe(true);

    });

    it('should fail if no required rule is missing for one rule', function () {

        var services = [{
          ip_protocol: 'tcp',
          to_port: 22,
          from_port: 22,
          direction: 'ingress'
        }];

        var securityGroup = {
          security_group_rules: [{
            protocol: services[0].ip_protocol,
            port_range_max: 80,
            port_range_min: 80,
            direction: services[0].direction
          }]
        };

        expect(!!SecurityGroupService).toBe(true);

        var rulesFound = SecurityGroupService._findRules(securityGroup, services)

        expect(rulesFound).toBe(false);

    });

    it('should fail if one out of two rules is missing', function () {

        var services = [
          {
            ip_protocol: 'tcp',
            to_port: 22,
            from_port: 22,
            direction: 'ingress'
          },
          {
            ip_protocol: 'tcp',
            to_port: 80,
            from_port: 80,
            direction: 'ingress'
          },
        ];

        var securityGroup = {
          security_group_rules: [
            {
              protocol: services[0].ip_protocol,
              port_range_max: services[0].to_port,
              port_range_min: services[0].from_port,
              direction: services[0].direction
            },
            {
              protocol: services[1].ip_protocol,
              port_range_max: 443,
              port_range_min: 443,
              direction: services[1].direction
            }
          ]
        };

        expect(!!SecurityGroupService).toBe(true);

        var rulesFound = SecurityGroupService._findRules(securityGroup, services)
        expect(rulesFound).toBe(false);

    });


    it('should find one rule', function () {

        var services = [{
          ip_protocol: 'tcp',
          to_port: 22,
          from_port: 22,
          direction: 'ingress'
        }];

        var securityGroup = {
          security_group_rules: [{
            protocol: services[0].ip_protocol,
            port_range_max: services[0].to_port,
            port_range_min: services[0].from_port,
            direction: services[0].direction
          }]
        };

        expect(!!SecurityGroupService).toBe(true);

        var rulesFound = SecurityGroupService._findRules(securityGroup, services)

        expect(rulesFound).toBe(true);

    });

    it('should state to add default and matching group', function () {

        var image = {
          "properties": {
            "default_user": "'core'",
            "direct_url": "rbd://4daddab0-b466-438b-a6f9-3568dea7f1d0/images/0473391f-f01c-4eef-8507-0c3ba67c047b/snap",
            "requires_rdp": "false",
            "requires_ssh": "true"
          }
        }

        var securityGroupRuleSsh = {
          "created_at": "2018-02-12T13:49:39Z",
          "description": "SSH security group",
          "id": "e6846cfa-9cfd-4d1b-8f4b-8a474874f985",
          "name": "SSH",
          "security_group_rules": [
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv6",
              "protocol": 'tcp'
            },
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv4",
              "id": "f495402a-46c9-4402-bebb-feef6eb9f779",
              "port_range_max": 22,
              "port_range_min": 22,
              "protocol": 'tcp'
            }]
          };

        var securityGroupRuleDefault =           {
                    "name": "default",
                    "security_group_rules": [
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv6",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "egress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      }
                    ]
                  };

        var securityGroups = [ securityGroupRuleDefault, securityGroupRuleSsh];

        expect(!!SecurityGroupService).toBe(true);

        var reqAndMatching = SecurityGroupService.selectSecurityGroup(image, securityGroups);

        expect(reqAndMatching.groupsToAdd.length).toBe(2);
        expect(reqAndMatching.groupsToAdd[0]).toEqual(securityGroupRuleDefault);
        expect(reqAndMatching.groupsToAdd[1]).toEqual(securityGroupRuleSsh);

        expect(reqAndMatching.rulesToCreate.length).toBe(0);
        expect(reqAndMatching.matches.length).toBe(0);

    });

    it('should state to add default group for no requirements', function () {

        var image = {
          "properties": {
            "default_user": "'core'",
            "direct_url": "rbd://4daddab0-b466-438b-a6f9-3568dea7f1d0/images/0473391f-f01c-4eef-8507-0c3ba67c047b/snap",
            "requires_rdp": "false",
            "requires_ssh": "false"
          }
        }

        var securityGroupRuleSsh = {
          "created_at": "2018-02-12T13:49:39Z",
          "description": "SSH security group",
          "id": "e6846cfa-9cfd-4d1b-8f4b-8a474874f985",
          "name": "SSH",
          "security_group_rules": [
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv6",
              "protocol": 'tcp'
            },
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv4",
              "id": "f495402a-46c9-4402-bebb-feef6eb9f779",
              "port_range_max": 22,
              "port_range_min": 22,
              "protocol": 'tcp'
            }]
          };

        var securityGroupRuleDefault =           {
                    "name": "default",
                    "security_group_rules": [
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv6",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "egress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      }
                    ]
                  };

        var securityGroups = [ securityGroupRuleDefault, securityGroupRuleSsh];

        expect(!!SecurityGroupService).toBe(true);

        var reqAndMatching = SecurityGroupService.selectSecurityGroup(image, securityGroups);

        expect(reqAndMatching.groupsToAdd.length).toBe(1);
        expect(reqAndMatching.groupsToAdd[0]).toEqual(securityGroupRuleDefault);

        expect(reqAndMatching.rulesToCreate.length).toBe(0);
        expect(reqAndMatching.matches.length).toBe(0);

    });

    it('should state to add default group and rule if requirment cannot be met', function () {

        var image = {
          "properties": {
            "default_user": "'core'",
            "direct_url": "rbd://4daddab0-b466-438b-a6f9-3568dea7f1d0/images/0473391f-f01c-4eef-8507-0c3ba67c047b/snap",
            "requires_rdp": "true",
            "requires_ssh": "false"
          }
        }

        var securityGroupRuleSsh = {
          "created_at": "2018-02-12T13:49:39Z",
          "description": "SSH security group",
          "id": "e6846cfa-9cfd-4d1b-8f4b-8a474874f985",
          "name": "SSH",
          "security_group_rules": [
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv6",
              "protocol": 'tcp'
            },
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv4",
              "id": "f495402a-46c9-4402-bebb-feef6eb9f779",
              "port_range_max": 22,
              "port_range_min": 22,
              "protocol": 'tcp'
            }]
          };

        var securityGroupRuleDefault =           {
                    "name": "default",
                    "security_group_rules": [
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv6",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "egress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      }
                    ]
                  };

        var securityGroups = [ securityGroupRuleDefault, securityGroupRuleSsh];

        expect(!!SecurityGroupService).toBe(true);

        var reqAndMatching = SecurityGroupService.selectSecurityGroup(image, securityGroups);

        expect(reqAndMatching.groupsToAdd.length).toBe(1);
        expect(reqAndMatching.groupsToAdd[0]).toEqual(securityGroupRuleDefault);

        expect(reqAndMatching.rulesToCreate.length).toBe(1);
        expect(reqAndMatching.rulesToCreate[0]).toEqual(SERVICES.rdp);

        expect(reqAndMatching.matches.length).toBe(0);

    });

    it('should state to add default and list of matching groups', function () {

        var image = {
          "properties": {
            "default_user": "'core'",
            "direct_url": "rbd://4daddab0-b466-438b-a6f9-3568dea7f1d0/images/0473391f-f01c-4eef-8507-0c3ba67c047b/snap",
            "requires_rdp": "false",
            "requires_ssh": "true"
          }
        }

        var securityGroupRuleSsh1 = {
          "created_at": "2018-02-12T13:49:39Z",
          "description": "SSH security group",
          "id": "e6846cfa-9cfd-4d1b-8f4b-8a474874f985",
          "name": "SSH",
          "security_group_rules": [
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv6",
              "protocol": 'tcp'
            },
            {
              "created_at": "2018-02-12T13:49:40Z",
              "description": "",
              "direction": "ingress",
              "ethertype": "IPv4",
              "id": "f495402a-46c9-4402-bebb-feef6eb9f779",
              "port_range_max": 22,
              "port_range_min": 22,
              "protocol": 'tcp'
            }]
          };

          var securityGroupRuleSsh2= {
            "created_at": "2018-02-12T13:49:39Z",
            "description": "SSH2 security group",
            "id": "e6846cfa-9cfd-4d1b-8f4b-8a474874f985",
            "name": "SSH2",
            "security_group_rules": [
              {
                "created_at": "2018-02-12T13:49:40Z",
                "description": "",
                "direction": "ingress",
                "ethertype": "IPv6",
                "protocol": 'tcp'
              },
              {
                "created_at": "2018-02-12T13:49:40Z",
                "description": "",
                "direction": "ingress",
                "ethertype": "IPv4",
                "id": "f495402a-46c9-4402-bebb-feef6eb9f779",
                "port_range_max": 22,
                "port_range_min": 22,
                "protocol": 'tcp'
              }]
            };

        var securityGroupRuleDefault =           {
                    "name": "default",
                    "security_group_rules": [
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv6",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "egress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      },
                      {
                        "created_at": "2018-02-07T06:49:15Z",
                        "description": null,
                        "direction": "ingress",
                        "ethertype": "IPv4",
                        "protocol": 'tcp'
                      }
                    ]
                  };

        var securityGroups = [ securityGroupRuleDefault, securityGroupRuleSsh1, securityGroupRuleSsh2];

        expect(!!SecurityGroupService).toBe(true);

        var reqAndMatching = SecurityGroupService.selectSecurityGroup(image, securityGroups);

        expect(reqAndMatching.groupsToAdd.length).toBe(1);
        expect(reqAndMatching.groupsToAdd[0]).toEqual(securityGroupRuleDefault);

        expect(reqAndMatching.rulesToCreate.length).toBe(0);
        expect(reqAndMatching.matches.length).toBe(2);
        expect(reqAndMatching.matches[0]).toEqual(securityGroupRuleSsh1);
        expect(reqAndMatching.matches[1]).toEqual(securityGroupRuleSsh2);

    });

});
