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

describe('Service: Image', function () {

  // load the service's module
  beforeEach(function() {
    module('hz.quickstart');
  });

  beforeEach(function() {
    module(function($provide) {
      $provide.provider('UsageService', function() {
        this.$get = function() {
          var ramQuotaLeft = jasmine.createSpy('ramQuotaLeft');

          return {
            ramQuotaLeft: ramQuotaLeft
          };
        }
      });
    });
  });

  // instantiate service
  var ImageService, UsageService, NON_BOOTABLE_IMAGES;
  beforeEach(inject(function (_ImageService_, _UsageService_, _NON_BOOTABLE_IMAGES_ ) {
    ImageService = _ImageService_;
    UsageService = _UsageService_;
    NON_BOOTABLE_IMAGES = _NON_BOOTABLE_IMAGES_;
  }));

  it('should allow image if it is allowed by quota', function () {

    var image = {
        min_ram: 20,
        allowedQuota: false
    };

    var limits = {
      max: 10,
      used: 0,
      unlimted: false
    };

    UsageService.ramQuotaLeft.and.returnValue(50);

    expect(!!ImageService).toBe(true);

    var imagesNotInQuota = ImageService.checkRamQuotaForImage(image, limits)
    expect(imagesNotInQuota).toEqual(false);
    expect(image.allowedQuota).toEqual(true);

  });

  it('should not allow image if it is not allowed by quota', function () {

    var image = {
        min_ram: 20,
        allowedQuota: false
    };

    var limits = {
      max: 10,
      used: 0,
      unlimted: false
    };

    UsageService.ramQuotaLeft.and.returnValue(10);

    var imagesNotInQuota = ImageService.checkRamQuotaForImage(image, limits)
    expect(imagesNotInQuota).toEqual(true);
    expect(image.allowedQuota).toEqual(false);

  });

  it('should filter non bootable images', function () {

    var images = [
      {
        container_format: 'some',
      },
      {
        container_format: 'other',
      },
      {
        container_format: NON_BOOTABLE_IMAGES[0]
      }
    ]

    var filteredImages = ImageService.filterNonBootableImages(images)
    expect(filteredImages.length).toEqual(2);

  });

  it('should return the image\'s name as version if os version is not available', function () {

    var image = {
      name: 'test1',
      properties: {
        some: 'property'
      }
    };

    var version = ImageService.imageVersion(image)
    expect(version).toEqual(image.name);

  });

  it('should return the image\'s os version as version if os version is available', function () {

    var image = {
      name: 'test1',
      properties: {
        os_version: '1.11'
      }
    };

    var version = ImageService.imageVersion(image)
    expect(version).toEqual(image.properties.os_version);

  });

  it('should return default catgories if not set by image', function () {

    var image = {
      name: 'test1',
      properties: {}
    };

    var categoryData = ImageService.categoryName(image)
    expect(categoryData).toEqual({
      categoryName: '',
      categoryDisplayName: '',
      category: 'other'
    });
  });

  it('should return os_flavor catgories if set by image', function () {

    var image = {
      name: 'test1',
      properties: {
        os_flavor: 'Some Flavor'
      }
    };

    var expectedCategoryName = image.properties.os_flavor.toLowerCase();

    var categoryData = ImageService.categoryName(image)
    expect(categoryData).toEqual({
      categoryName: expectedCategoryName,
      categoryDisplayName: '',
      category: expectedCategoryName
    });
  });

  it('should return os_flavor & os_flavor_name catgories if set by image', function () {

    var image = {
      name: 'test1',
      properties: {
        os_flavor: 'Some Flavor',
        os_flavor_name: 'Some Flavor Name',
      }
    };

    var expectedCategoryName = image.properties.os_flavor.toLowerCase();

    var categoryData = ImageService.categoryName(image)
    expect(categoryData).toEqual({
      categoryName: expectedCategoryName,
      categoryDisplayName: image.properties.os_flavor_name,
      category: expectedCategoryName
    });
  });

  it('should return snapshot if image is snapshot', function () {

    var image = {
      name: 'test1',
      properties: {
        image_type: 'snapshot'
      }
    };

    var expectedCategoryName = 'my snapshots';

    var categoryData = ImageService.categoryName(image)
    expect(categoryData).toEqual({
      categoryName: expectedCategoryName,
      categoryDisplayName: 'My Snapshots',
      category: expectedCategoryName
    });
  });

});
