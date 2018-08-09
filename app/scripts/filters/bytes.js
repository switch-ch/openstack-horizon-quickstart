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
*
* Created on 17/06/15
* @author: christian.cueni@iterativ.ch
*
* Based on //https://gist.github.com/thomseddon/3511330
*
*/

(function () {
    'use strict';

    /**
     * @ngdoc filter
     * @name hz.quickstart.bytes
     * @description Displays bytes as kB, MB, GB, ...
     *
     * @param {integer} bytes
     * Bytes to display. Required.
     *
     * @param {integer} precision
     * Precision to display. Required.
     *
     **/

    angular.module('hz.quickstart').
        filter('bytes', function() {
            return function(bytes, precision) {
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                    number = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
            }
        });
}());
