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
    angular.module('hz.quickstart', ['hz.quickstart.instances', 'ui.router', 'horizon.framework', 'hz.widget.charts'])
        .config(['$stateProvider', '$urlRouterProvider', '$interpolateProvider', '$httpProvider', 'WEBROOT',
                function ($stateProvider, $urlRouterProvider, $interpolateProvider,
                  $httpProvider, WEBROOT) {

            // remove for mitaka as it uses proper ng-routing
            angular.element(document).find('#sidebar-accordion-quickstart .openstack-panel.active a').removeClass('openstack-spin');

            $urlRouterProvider.otherwise("/");
            $stateProvider
                .state('instances', {
                    url: "/",
                    templateUrl: WEBROOT + "static/quickstart/templates/instances.main.html",
                    controller: "InstanceCtrl",
                    controllerAs: "vm",
                    resolve: {
                        instances: ['apiExtensionService', function (apiExtensionService) {
                            return apiExtensionService.nova.getServers();
                        }],
                        limits: ['UsageService', function (UsageService) {
                            return UsageService.getUsage();
                        }]
                    }
                }).state('instances.create', {
                });


            // Replacing the default angular symbol
            // allow us to mix angular with django templates
            $interpolateProvider.startSymbol('{$');
            $interpolateProvider.endSymbol('$}');

            // Http global settings for ease of use
            $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
            $httpProvider.defaults.xsrfCookieName = 'csrftoken';
            $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            $httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';

            // Global http error handler
            // if user is not authorized, log user out
            // this can happen when session expires
            $httpProvider.interceptors.push(['$q', function($q) {
                return {
                    responseError: function (error) {
                        if (error.status === 401) {
                            window.location.replace('/auth/logout');
                        }
                        return $q.reject(error);
                    }
                };
            }]);
        }])
})();
