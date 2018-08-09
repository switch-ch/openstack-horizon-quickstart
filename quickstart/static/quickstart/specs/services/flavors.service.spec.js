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

describe('Service: Flavors', function () {

  // load the service's module
  beforeEach(function() {
    module('hz.quickstart');
  });

  beforeEach(function() {
    module(function($provide) {
      $provide.provider('UsageService', function() {
        this.$get = function() {
          var updateToAdd = jasmine.createSpy('updateToAdd');
          var cpusRequiredInQuota = jasmine.createSpy('cpusRequiredInQuota');
          var ramRequiredInQuota = jasmine.createSpy('ramRequiredInQuota');

          return {
            updateToAdd: updateToAdd,
            cpusRequiredInQuota: cpusRequiredInQuota,
            ramRequiredInQuota: ramRequiredInQuota
          };
        }
      });
    });
  });

  // instantiate service
  var FlavorsService, UsageService;
  beforeEach(inject(function (_FlavorsService_, _UsageService_ ) {
    FlavorsService = _FlavorsService_;
    UsageService = _UsageService_;
  }));

  it('should have an instance of the FlavorService', function () {
    expect(!!FlavorsService).toBe(true);
  });

  describe('should allow flavors >', function () {

    var flavors;

    beforeEach(function () {
      flavors = [
        {
          id: "f-id-1",
          allowedForImage: false
        },
        {
          id: "f-id-2",
          allowedForImage: false
        }
      ];
    });

    it('for one image', function () {

      var image = {
        allowedFlavors: [flavors[0].id]
      };

      var flavorsNotForImage = FlavorsService.checkFlavorForImage(image, flavors)
      expect(flavorsNotForImage).toBe(true);
      expect(flavors[0].allowedForImage).toBe(true);
      expect(flavors[1].allowedForImage).toBe(false);
    });

    it('for all images', function () {

      var image = {
        allowedFlavors: [flavors[0].id, flavors[1].id]
      };

      var flavorsNotForImage = FlavorsService.checkFlavorForImage(image, flavors)
      expect(flavorsNotForImage).toBe(false);
      expect(flavors[0].allowedForImage).toBe(true);
      expect(flavors[1].allowedForImage).toBe(true);

    });
  });

  it('should not allow flavors if they allowed by the image', function () {

    var flavors = [
      {
        id: "f-id-1",
        allowedForImage: false
      },
      {
        id: "f-id-2",
        allowedForImage: false
      }
    ];

    var image = {
      allowedFlavors: ['some-oter', 'oh-oh-my-my']
    };

    var flavorsNotForImage = FlavorsService.checkFlavorForImage(image, flavors)
    expect(flavorsNotForImage).toBe(true);
    expect(flavors[0].allowedForImage).toBe(false);
    expect(flavors[1].allowedForImage).toBe(false);

  });

  it('should select a flavor for an instance if it meets the requirements', function () {

    var flavor = {
      id: "f-id-1",
      allowed: true,
      allowedForImage: true,
      vcpus: 3,
      ram: 512
    };

    var instance = {
      flavor: {},
    }

    expect(!!FlavorsService).toBe(true);

    FlavorsService.selectFlavor(flavor, instance)
    expect(instance.flavor).toBe(flavor);
    expect(UsageService.updateToAdd).toHaveBeenCalledWith({
      cores: flavor.vcpus,
      ram: flavor.ram
    });
  });

  it('should not select a flavor for an instance if it is not allowed', function () {

    var flavor = {
      id: "f-id-1",
      allowed: false,
      allowedForImage: true,
      vcpus: 3,
      ram: 512
    };

    var instance = {
      flavor: {},
    }

    FlavorsService.selectFlavor(flavor, instance)
    expect(instance.flavor).toBe(null);
    expect(UsageService.updateToAdd).toHaveBeenCalledWith({
      cores: 0,
      ram: 0
    });
  });

  it('should not select a flavor for an instance if it is not allowed for the image', function () {

    var flavor = {
      id: "f-id-1",
      allowed: true,
      allowedForImage: false,
      vcpus: 3,
      ram: 512
    };

    var instance = {
      flavor: {},
    }

    FlavorsService.selectFlavor(flavor, instance)
    expect(instance.flavor).toBe(null);
    expect(UsageService.updateToAdd).toHaveBeenCalledWith({
      cores: 0,
      ram: 0
    });
  });

  it('should select the first flavor that meets the images minimal requirements', function () {

    var flavors = [
      {
        id: "f-id-1",
        allowed: true,
        allowedForImage: false,
        vcpus: 3,
        ram: 512
      },
      {
        id: "f-id-2",
        allowed: true,
        allowedForImage: true,
        vcpus: 3,
        ram: 512
      },
      {
        id: "f-id-3",
        allowed: true,
        allowedForImage: true,
        vcpus: 3,
        ram: 512
      },
    ]

    var image = {
      allowedFlavors: [flavors[1].id, flavors[2].id]
    }

    var instance = {
      flavor: {},
    }

    FlavorsService.selectFlavorForImage(image, flavors, instance)
    expect(instance.flavor).toBe(flavors[1]);
    expect(UsageService.updateToAdd).toHaveBeenCalledWith({
      cores: flavors[1].vcpus,
      ram: flavors[1].ram
    });
  });

  it('should sort the flavors in ascending order by ram', function () {

    var flavors = [
      {
        id: "f-id-1",
        ram: 512
      },
      {
        id: "f-id-2",
        ram: 1024
      },
      {
        id: "f-id-3",
        ram: 256
      },
    ];

    var expected_ordered_flavors = [flavors[2], flavors[0], flavors[1]];

    var sorted_flavors = FlavorsService.sortFlavorsByRam(flavors)
    expect(sorted_flavors).toEqual(expected_ordered_flavors);

  });

  it('should allow flavor in quota if requirements are matched', function () {

    var flavor = {
        vcpus: 3,
        ram: 40,
        allowed: false
    };

    var limits = {
      ram: {
        max: 10,
        used: 0,
        unlimted: false
      },
      cpus: {
        max: 10,
        used: 0,
        unlimted: false
      }
    };

    UsageService.cpusRequiredInQuota.and.returnValue(true);
    UsageService.ramRequiredInQuota.and.returnValue(true);

    var flavorsNotInQuota = FlavorsService.flavorInQuota(flavor, limits)
    expect(flavorsNotInQuota).toEqual(false);
    expect(flavor.allowed).toEqual(true);

  });

  it('should not allow flavor in quota if requirements for cpus are not matched', function () {

    var flavor = {
        vcpus: 3,
        ram: 40,
        allowed: false
    };

    var limits = {
      ram: {
        max: 10,
        used: 0,
        unlimted: false
      },
      cpus: {
        max: 10,
        used: 0,
        unlimted: false
      }
    };

    UsageService.cpusRequiredInQuota.and.returnValue(false);
    UsageService.ramRequiredInQuota.and.returnValue(true);

    var flavorsNotInQuota = FlavorsService.flavorInQuota(flavor, limits)
    expect(flavorsNotInQuota).toEqual(true);
    expect(flavor.allowed).toEqual(false);

  });

  it('should not allow flavor in quota if requirements for ram are not matched', function () {

    var flavor = {
        vcpus: 3,
        ram: 40,
        allowed: false
    };

    var limits = {
      ram: {
        max: 10,
        used: 0,
        unlimted: false
      },
      cpus: {
        max: 10,
        used: 0,
        unlimted: false
      }
    };

    UsageService.cpusRequiredInQuota.and.returnValue(true);
    UsageService.ramRequiredInQuota.and.returnValue(false);

    var flavorsNotInQuota = FlavorsService.flavorInQuota(flavor, limits)
    expect(flavorsNotInQuota).toEqual(true);
    expect(flavor.allowed).toEqual(false);

  });

  it('should allow flavor for image if it fullfills the requirements', function () {

    var flavor = {
        vcpus: 3,
        disk: 20,
        ram: 40,
        allowed: false,
        flavorsNotInQuota: false
    };

    var flavorAllowed = FlavorsService.flavorAllowedForRequirements(flavor, 40, 20)
    expect(flavorAllowed).toEqual(true);

  });

  it('should not allow flavor for image if disk requirements are not met', function () {

    var flavor = {
        vcpus: 3,
        disk: 20,
        ram: 40,
        allowed: false,
        flavorsNotInQuota: false
    };

    var flavorAllowed = FlavorsService.flavorAllowedForRequirements(flavor, 40, 21)
    expect(flavorAllowed).toEqual(false);

  });

  it('should not allow flavor for image if ram requirements are not met', function () {

    var flavor = {
        vcpus: 3,
        disk: 20,
        ram: 40,
        allowed: false,
        flavorsNotInQuota: false
    };

    var flavorAllowed = FlavorsService.flavorAllowedForRequirements(flavor, 41, 20)
    expect(flavorAllowed).toEqual(false);

  });

  it('should not allow flavor for image if flavor is not in quota', function () {

    var flavor = {
        vcpus: 3,
        disk: 20,
        ram: 40,
        allowed: false,
        flavorsNotInQuota: true
    };

    var flavorAllowed = FlavorsService.flavorAllowedForRequirements(flavor, 41, 20)
    expect(flavorAllowed).toEqual(false);

  });

});
