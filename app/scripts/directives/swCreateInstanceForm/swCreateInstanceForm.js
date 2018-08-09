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
* Created on 17/06/15
* @author: christian.cueni@iterativ.ch
*/

(function () {
    'use strict';

    /**
    * @ngdoc directive
    * @name hz.quickstart.swConfirmationModal
    * @description Provides the form for creating an instance. Selects minimal flavors required by images.
    *
    * @param {object} limits
    * The users quota & limits. Required.
    *
    * @param {array} flavors
    * The available flavors. Required
    *
    * @param {array} images
    * The available images. Required.
    *
    * @param {array} keypairs
    * The users's keypairs. Required.
    *
    * @param {array} securityGroups
    * The users's security groups. Required.
    *
    * @param {function} createInstance
    * Function to call when a instance should be created. Required.
    *
    * @param {function} cancel
    * Function to call when the user cancels the creation process. Required.
    */

    angular.module('hz.quickstart')
        .directive('swCreateInstanceForm',["WEBROOT", function(WEBROOT) {
            return {
                scope: {
                    limits: '=',
                    flavors: '=',
                    images: '=',
                    keypairs: '=',
                    securityGroups: '=',
                    createInstance: '&',
                    cancel: '&'
                },
                restrict: 'E',
                templateUrl: WEBROOT + 'static/quickstart/templates/swCreateInstanceForm.html',
                replace: true,
                controller: 'swCreateInstanceFormCtrl',
                controllerAs: 'vm'
            };
        }])
        .controller('swCreateInstanceFormCtrl', ["$scope", "InstanceCreationService", "UsageService", "SERVICES",
            "apiExtensionService", "NEUTRON_SUPPORT", 'SecurityGroupService', 'FlavorsService', 'ImageService',
            'KeypairService',
            function($scope, InstanceCreationService, UsageService, SERVICES,
                     apiExtensionService, NEUTRON_SUPPORT, SecurityGroupService,
                     FlavorsService, ImageService, KeypairService) {

                var self = this;

                activate();

                //Images
                //
                //select an image
                function selectImage(image, category, toggleDropdown) {
                    //toggle version dropdown
                    if (image === self.instance.image) {
                        self.showImageDropdown = !self.showImageDropdown;
                        return true;
                    }

                    if (isImageUnselectable(image)) {
                        return false;
                    };

                    //update the flavor list with the allowed flavors for this image
                    self.flavorsNotForImage = FlavorsService.checkFlavorForImage(image, self.flavors);

                    //change flavor if required by the minimal requirements
                    if (!self.instance.flavor.allowedForImage) {
                        FlavorsService.selectFlavorForImage(image, self.flavors, self.instance)
                    }

                    self.instance.image = image;
                    updateRequiredAndMatchingSecurityGroups();

                    //sort the image array (selected always first)
                    if (category) {
                        category.images = sortImages(category.images);
                        if (toggleDropdown) {
                            self.showImageDropdown = !self.showImageDropdown;
                        }
                    }

                    //fire change event
                    $scope.$broadcast('createInstance:imageChanged', image);
                }

                function updateRequiredAndMatchingSecurityGroups() {
                    var requiredAndMatchingSecGroups = SecurityGroupService.selectSecurityGroup(self.instance.image, self.securityGroups);

                    self.instance.securityGroups = requiredAndMatchingSecGroups.groupsToAdd;
                    self.instance.groupsToCreate = requiredAndMatchingSecGroups.rulesToCreate;
                    self.securityGroupsSelection = requiredAndMatchingSecGroups.matches;
                    self.maxSecgroups = checkSecurtiyGroupQuota(self.securityGroups,
                        self.limits.securityGroups,
                        requiredAndMatchingSecGroups.rulesToCreate);
                    // user must select a matching security group
                    if (self.securityGroupsSelection.length > 0) {
                        self.showSecurityGroupSelection = true;
                        securityGroupSelected(self.securityGroupsSelection[0]);
                    } else {
                        self.showSecurityGroupSelection = false;
                    }
                }

                function isImageUnselectable(image) {
                    return image.allowedFlavors.length === 0 || !image.allowedQuota;
                }

                //wrapper for template
                self.selectImage = function(image, category) {
                    selectImage(image, category, true);
                };

                //sort the images by version. The selected image is always the first item, not allowed images always at the end
                function sortImages(images) {

                    var selectedImageIndex;

                    images = ImageService.sortImages(images);

                    //if the selected image is here, remove it and add it as first element
                    selectedImageIndex = _.findIndex(images, {image: self.instance.image});
                    if (selectedImageIndex > -1) {
                        var selectedImage = images.splice(selectedImageIndex, 1)[0];
                        images.unshift(selectedImage);
                    }
                    return images;
                }

                //Security Groups
                //
                // wrapper for template
                self.securityGroupSelected = function(securityGroup) {
                    securityGroupSelected(securityGroup);
                }

                function securityGroupSelected(securityGroup) {
                    self.instance.securityGroups = [SecurityGroupService.defaultGroup, securityGroup];
                }

                //makes a string from rule names (..., ...)
                function rulesToString(group) {
                    var text = '(';
                    //verify rules from config
                    _.forEach(group.security_group_rules, function(rule) {

                        //todo move elsehwere
                        //security groups seems to return different kind of structure for security groups

                        if (!rule.port_range_min) {
                            rule.port_range_min = rule.from_port;
                        };

                        if (!rule.port_range_max) {
                            rule.port_range_max = rule.to_port;
                        }

                        if (!rule.protocol) {
                            rule.protocol = rule.ip_protocol;
                        }

                        var serviceKey;
                        serviceKey = _.findKey(SERVICES, function(serviceItem) {
                            isServiceitemMatchingRule(serviceItem, rule);
                        });

                        if (serviceKey) {
                            text += SERVICES[serviceKey].name + ", ";
                        }
                    });

                    group.ruleString =  text.substring(0, text.length -2) + ")";

                    if (group.ruleString === ")") {
                        group.ruleString = "(" + gettext("no rules") + ")";
                    }
                }

                function isServiceitemMatchingRule(serviceItem, rule) {
                    return serviceItem.ip_protocol === 'tcp' && serviceItem.direction === 'ingress' &&
                        serviceItem.from_port === rule.port_range_min && serviceItem.to_port === rule.port_range_max
                        && rule.direction === 'ingress';
                }

                //check other groups can be added
                function checkSecurtiyGroupQuota (groups, quota, rulesToCreate) {
                    return !quota.unlimited && groups.length + rulesToCreate.length === quota.max
                }

                //Keys
                //
                //add newly created keys to the list, select them & make the deleteable
                self.keyCreated = function(key) {
                    var keypair = { keypair: key };
                    keypair.deletable = true;
                    self.keypairs.push(keypair);
                    self.keySelected(keypair);
                };

                self.keySelected = function(keypair) {
                    self.instance.keyPair = keypair;
                    self.keyRequired = false;
                    self.showAddKey = false;
                    self.maxKeyPairsReached = KeypairService.hasMaxKeyPairs(self.keypairs, self.limits.keyPairs);
                };

                // //delete keypairs and remove them from the list
                self.deleteKeypair = function (keypair) {
                    KeypairService.deleteKeypair(keypair, self.keypairs).then(function(data) {
                        self.keypairs = data.keypairs;
                        self.instance.keyPair = data.instanceKeypair;
                        self.maxKeyPairsReached = KeypairService.hasMaxKeyPairs(self.keypairs, self.limits.keyPairs);
                    })
                };

                //Flavor
                //
                //wrapper for template
                self.selectFlavor = function(flavor) {
                    FlavorsService.selectFlavor(flavor, self.instance);
                };

                //check if flavor is in quota
                self.isFlavorInQuota = function() {
                    return !(self.limits.cores.limitReached || self.limits.ram.limitReached)
                };

                //create instance
                self.create = function(form) {

                    var newInstance;

                    if (form.$valid) {
                        newInstance = {
                            name: self.instance.name,
                            source_id: self.instance.image.id,
                            os_class: _.find(self.imageCategories, {active: true}).category,
                            flavor: self.instance.flavor.id,
                            key_name: self.instance.keyPair.keypair.name,
                            user_data: '',
                            security_groups: _.map(self.instance.securityGroups, 'id'),
                            rules_to_create: self.instance.groupsToCreate
                        };

                        if (self.instance.image.properties.default_user) {
                            newInstance.default_user = self.instance.image.properties.default_user;
                        }

                        InstanceCreationService.createInstance(newInstance);
                    }
                };

                //handle updates form the usage service
                $scope.$on('usage:toAddUpdated', function(event, usage) {
                    self.limits = usage
                });

                function activate() {
                    self.instance = InstanceCreationService.instanceDict;
                    self.instance.securityGroups = [];
                    self.limits = $scope.limits;
                    self.keypairs = $scope.keypairs;
                    self.cancel = $scope.cancel();
                    self.createInstance = $scope.createInstance;
                    self.securityGroups = $scope.securityGroups;
                    self.neutron_support = NEUTRON_SUPPORT;
                    self.imageCategories = [];
                    self.securityGroupsSelection = [];

                    //warnings for quota
                    self.showImageDropdown = false;
                    self.flavorsNotInQuota = false;
                    self.flavorsNotForImage = false;
                    self.imagesNotInQuota = false;
                    self.maxKeyPairsReached = false;
                    self.maxSecgroups = false;

                    self.flavors = FlavorsService.sortFlavorsByRam($scope.flavors);

                    _.forEach(self.flavors, function(flavor) {
                        self.flavorsNotInQuota = FlavorsService.flavorInQuota(flavor, self.limits) || self.flavorsNotInQuota;
                    });

                    self.images = ImageService.filterNonBootableImages($scope.images)

                    //assign flavors that can be used to images & check if image is in quota (RAM)
                    _.forEach(self.images, function(image) {
                        //assign an array with ok-ish flavors (only the ids) to the image
                        image.allowedFlavors = _.map(_.filter(self.flavors, function(flavor) {
                            return FlavorsService.flavorAllowedForRequirements(flavor, image.min_ram, image.min_disk);
                        }), 'id');
                        //quota check
                        self.imagesNotInQuota = ImageService.checkRamQuotaForImage(image, self.limits.ram) || self.imagesNotInQuota;

                        //make categories for images
                        if (image.properties) {
                            createCategoriesForImage(image);
                        }
                    });

                    self.imageCategories = self.imageCategories.sort(sortCategoriesByName);

                    _.forEach(self.imageCategories, function(category) {
                        sortAndSelectDefaultImage(category)
                    });

                    //add rule string to group
                    _.forEach(self.securityGroups, function(group) {
                        //existing rules are not deletable
                        group.deletable = false;
                        if (self.neutron_support) {
                            rulesToString(group);
                        }
                    });

                    //existing rules are not deletable
                    _.forEach(self.keypairs, function(keypair) {
                        keypair.deletable = false;
                    });

                    //open add keypair form is user has no keypair
                    self.showAddKey = self.keypairs.length === 0;

                    //select first keypair if there are any
                    if (self.keypairs.length > 0) {
                        self.instance.keyPair = self.keypairs[0];
                    }

                    self.maxKeyPairsReached = KeypairService.hasMaxKeyPairs(self.keypairs, self.limits.keyPairs);

                }

                function createCategoriesForImage(image) {

                    //check for meta data
                    var version = ImageService.imageVersion(image)
                    var categoryData = ImageService.categoryName(image)

                    var categoryName = categoryData.categoryName;
                    var categoryDisplayName = categoryData.categoryDisplayName;
                    var category = categoryData.category;
                    var categoryIndex = -1;

                    //if os_flavor property is set, check if the category exists.
                    //If no category exsits create one. If there's no metadata use the image's name as
                    //category name
                    if (categoryName !== '') {
                        categoryIndex = _.findIndex(self.imageCategories, {'name': categoryName});
                    } else {
                        categoryName = image.name;
                    }

                    //add a new category if necessary
                    if (categoryIndex < 0) {
                        categoryIndex =  self.imageCategories.push({
                            name: categoryName,
                            displayName: categoryDisplayName,
                            category: category,
                            active: false,
                            images: [],
                            notAllowedImage: false
                        }) -1;
                    }

                    //add image to category
                    self.imageCategories[categoryIndex].images.push({
                        version: version,
                        image: image
                    });

                    //mark that there's an image that is not allowed due to the quota
                    if (!image.allowedQuota) {
                        self.imageCategories[categoryIndex].notAllowedImage = true;
                    }
                }

                function sortAndSelectDefaultImage(category) {
                    //sort images
                    category.images = sortImages(category.images);
                    if ((category.images.length == 1 && category.images[0].image.allowedFlavors.length == 0) ) {
                        self.imagesNotInQuota = true;
                    } else if (!self.instance.image) {
                          category.images.forEach(function (image) {
                              if (!self.instance.image && image.image.allowedQuota) {
                                  self.flavorsNotForImage = FlavorsService.checkFlavorForImage(image.image, self.flavors);
                                  FlavorsService.selectFlavorForImage(image.image, self.flavors, self.instance)
                                  selectImage(image.image, category, false);
                                  category.active = true;
                              }
                          });
                      }
                }

                function sortCategoriesByName(a, b) {
                    if (a.name < b.name) {
                        return -1;
                    }
                    if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                }

            }]);
}());
