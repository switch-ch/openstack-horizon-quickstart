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
'use strict';

angular.module('hz.quickstart')
    .constant('SERVICES', {
        ssh: {
            direction: 'ingress',
            name: 'SSH',
            ip_protocol: 'tcp',
            from_port: 22,
            to_port: 22
        },
        rdp: {
            direction: 'ingress',
            name: 'RDP',
            ip_protocol: 'tcp',
            from_port: 3389,
            to_port: 3389
        },
        smtp: {
            direction: 'ingress',
            name: 'SMTP',
            ip_protocol: 'tcp',
            from_port: 25,
            to_port: 25
        },
        dns: {
            direction: 'ingress',
            name: 'DNS',
            ip_protocol: 'tcp',
            from_port: 53,
            to_port: 53
        },
        http: {
            direction: 'ingress',
            name: 'HTTP',
            ip_protocol: 'tcp',
            from_port: 80,
            to_port: 80
        },
        pop3: {
            direction: 'ingress',
            name: 'POP3',
            ip_protocol: 'tcp',
            from_port: 110,
            to_port: 110
        },
        imap: {
            direction: 'ingress',
            name: 'IMAP',
            ip_protocol: 'tcp',
            from_port: 143,
            to_port: 143
        },
        ldap: {
            direction: 'ingress',
            name: 'LDAP',
            ip_protocol: 'tcp',
            from_port: 389,
            to_port: 389
        },
        https: {
            direction: 'ingress',
            name: 'HTTPS',
            ip_protocol: 'tcp',
            from_port: 443,
            to_port: 443
        },
        smtps: {
            direction: 'ingress',
            name: 'SMTP',
            ip_protocol: 'tcp',
            from_port: 465,
            to_port: 465
        },
        imaps: {
            direction: 'ingress',
            name: 'IMAPS',
            ip_protocol: 'tcp',
            from_port: 993,
            to_port: 993
        },
        pop3s: {
            direction: 'ingress',
            name: 'POP3S',
            ip_protocol: 'tcp',
            from_port: 995,
            to_port: 995
        },
        msSql: {
            direction: 'ingress',
            name: 'MS SQL',
            ip_protocol: 'tcp',
            from_port: 1433,
            to_port: 1433
        },
        mysql: {
            direction: 'ingress',
            name: 'MYSQL',
            ip_protocol: 'tcp',
            from_port: 3306,
            to_port: 3306
        },
    })
    .constant('POWERSTATES', {
        0: "NO STATE",
        1: "RUNNING",
        2: "BLOCKED",
        3: "PAUSED",
        4: "SHUTDOWN",
        5: "SHUTOFF",
        6: "CRASHED",
        7: "SUSPENDED",
        8: "FAILED",
        9: "BUILDING"
    })
    .constant("NEUTRON_SUPPORT", true)
    .constant("NON_BOOTABLE_IMAGES", ['aki', 'ari'])
    .constant("WEBROOT", "@@webroot");
