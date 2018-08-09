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

describe('Service: Usageservice', function () {

  // load the service's module
  beforeEach(function() {
    module('hz.quickstart');
  });

  // instantiate service
  var apiResponse;
  var UsageService, httpBackend, rootScope;
  beforeEach(inject(function (_UsageService_, _$httpBackend_, $rootScope) {
    UsageService = _UsageService_;
    httpBackend = _$httpBackend_;
    rootScope = $rootScope;

    apiResponse = {
      cinderLimits: {
        maxTotalBackupGigabytes: 1000,
        maxTotalBackups: 10,
        maxTotalSnapshots: 10,
        maxTotalVolumeGigabytes: 1000,
        maxTotalVolumes: 10,
        totalBackupGigabytesUsed: 0,
        totalBackupsUsed: 0,
        totalGigabytesUsed: 0,
        totalSnapshotsUsed: 0,
        totalVolumesUsed: 0
      },
      neutronLimits: {
        maxTotalFloatingIps: 50,
        totalFloatingIps: 1,
        totalFloatingIpsUsed: 0
      },
      novaLimits: {
        maxImageMeta: 128,
        maxPersonality: 5,
        maxPersonalitySize: 10240,
        maxSecurityGroupRules: 20,
        maxSecurityGroups: 10,
        maxServerGroupMembers: 10,
        maxServerGroups: 10,
        maxServerMeta: 128,
        maxTotalCores: 20,
        maxTotalFloatingIps: 10,
        maxTotalInstances: 10,
        maxTotalKeypairs: 100,
        maxTotalRAMSize: 51200,
        totalCoresUsed: 0,
        totalInstancesUsed: 0,
        totalRAMUsed: 0,
        totalSecurityGroupsUsed: 1,
        totalServerGroupsUsed: 0
      }
    };

    httpBackend.whenGET("/api/extension/servers/").respond(200, {});
    httpBackend.whenGET(/static\/quickstart\/templates.*/).respond(200, '');

  }));

  afterEach(function() {
    httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should allow in quota values', function () {

    var updatedUsage = {};
    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    expect(!!UsageService).toBe(true);

    spyOn(rootScope, "$broadcast").and.callThrough();

    UsageService.getUsage().then(function (usage) {

      UsageService.updateToAdd({
        volumeSpace: 10
      });

      expect(rootScope.$broadcast).toHaveBeenCalledWith("usage:update", usage);
      updatedUsage =  rootScope.$broadcast.calls.mostRecent().args[1];

      expect(updatedUsage.volumeSpace.toAdd).toBe(10);
      expect(updatedUsage.volumeSpace.limitReached).toBe(false);


    });
  });

  it('should not allow quota values', function () {

    var updatedUsage = {};
    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    spyOn(rootScope, "$broadcast").and.callThrough();

    UsageService.getUsage().then(function (usage) {

      UsageService.updateToAdd({
        volumeSpace: 1001
      });

      expect(rootScope.$broadcast).toHaveBeenCalledWith("usage:update", usage);
      updatedUsage =  rootScope.$broadcast.calls.mostRecent().args[1];
      expect(updatedUsage.volumeSpace.toAdd).toBe(1001);
      expect(updatedUsage.volumeSpace.limitReached).toBe(true);


    });
  });

  it('should return correct ram quota thats left', function () {

    let ram = {
      max: 20,
      used: 15
    }

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var ramLeft = UsageService.ramQuotaLeft(ram);
    expect(ramLeft).toBe(ram.max - ram.used);
  });

  it('should state ram is in quota if unlimited RAM', function () {

    let ram = {
      max: -1,
      used: 15,
      unlimited: true
    }

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(100, ram);
    expect(inQuota).toBe(true);
  });

  it('should state ram is in quota', function () {

    let ram = {
      max: 120,
      used: 15,
      unlimited: false
    }

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(ram.max-ram.used, ram);
    expect(inQuota).toBe(true);
  });

  it('should state ram is not in quota', function () {

    let ram = {
      max: 20,
      used: 15,
      unlimited: false
    };

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(ram.max-ram.used + 1, ram);
    expect(inQuota).toBe(false);
  });

  it('should state cpus is in quota if unlimited CPUs', function () {

    let cpus = {
      max: -1,
      used: 15,
      unlimited: true
    };

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(100, cpus);
    expect(inQuota).toBe(true);
  });

  it('should state CPU is in quota', function () {

    let cores = {
      max: 120,
      used: 15,
      unlimited: false
    };

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(cores.max - cores.used, cores);
    expect(inQuota).toBe(true);
  });

  it('should state CPU is not in quota', function () {

    let cpu = {
      max: 20,
      used: 15,
      unlimited: false
    };

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(cpu.max - cpu.used + 1, cpu);
    expect(inQuota).toBe(false);
  });

  it('should state volumeSpace is in quota if unlimited VolumeSpace', function () {

    let volumeSpace = {
      max: -1,
      used: 15,
      unlimited: true
    };

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.volumeRequiredInQuota(100, volumeSpace);
    expect(inQuota).toBe(true);
  });

  it('should state volumeSpace is in quota', function () {

    let volumeSpace = {
      max: 120,
      used: 15,
      unlimited: false
    };

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(volumeSpace.max - volumeSpace.used, volumeSpace);
    expect(inQuota).toBe(true);
  });

  it('should state VolumeSpace is not in quota', function () {

    let volumeSpace = {
      max: 20,
      used: 15,
      unlimited: false
    };

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var inQuota = UsageService.ramRequiredInQuota(volumeSpace.max - volumeSpace.used + 1, volumeSpace);
    expect(inQuota).toBe(false);
  });

  it('should state Quota for key is in quota', function () {

    apiResponse.novaLimits.totalCoresUsed = 19;
    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    UsageService.getUsage().then(function (usage) {
      var inQuota = UsageService.checkQuotaOkForKey('cores');
      expect(inQuota).toBe(true);
    });
  });

  it('should state Quota for key is not in quota', function () {

    apiResponse.novaLimits.totalCoresUsed = 20;
    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    UsageService.getUsage().then(function (usage) {
      var inQuota = UsageService.checkQuotaOkForKey('cores');
      expect(inQuota).toBe(false);
    });
  });

  it('should state unlimited for key is in quota', function () {

    apiResponse.novaLimits.maxTotalCores = -1;
    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    UsageService.getUsage().then(function (usage) {
      var inQuota = UsageService.checkQuotaOkForKey('cores');
      expect(inQuota).toBe(true);
    });
  });

  it('should return RAM left (max - used)', function () {

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var ram = {
      max: 10,
      used: 5
    };

    var quotaLeft = UsageService.ramQuotaLeft(ram);
    expect(quotaLeft).toEqual(ram.max - ram.used);
  });

  it('should return RAM left 1000000 if unlimited', function () {

    httpBackend.whenGET("/api/extension/limits/").respond(200, apiResponse);

    var ram = {
      max: -1,
      used: 5
    };

    var quotaLeft = UsageService.ramQuotaLeft(ram);
    expect(quotaLeft).toEqual(1000000);
  });

});
