/**
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
*
* Usage:
* <input type="text" sw-autofocus>
* Developed by Iterativ GmbH
* Created on 17/06/15
*
* @author: christian.cueni@iterativ.ch
*/
/*
* https://gist.github.com/mlynch/dd407b93ed288d499778
* the HTML5 autofocus property can be finicky when it comes to dynamically loaded
* templates and such with AngularJS. Use this simple directive to
* tame this beast once and for all.
*/

 (function () {
     'use strict';

     /**
      * @ngdoc directive
      * @name hz.quickstart.swAutofocus
      * @description Autofocus on field
      *
      */

     angular.module('hz.quickstart')
         .directive('swAutofocus', ["$timeout", function($timeout) {

             return {
                 restrict: 'A',
                 link : function($scope, $element) {
                   $timeout(function() {
                     $element[0].focus();
                   }, 0);
                 }
             };
         }])
 }());
