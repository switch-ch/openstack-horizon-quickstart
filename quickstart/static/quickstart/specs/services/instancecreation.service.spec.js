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
*  Created on 07/06/16
*  @author: christian.cueni@iterativ.ch
**/


'use strict';

describe('Service: InstanceCreationService', function () {

    // load the service's module
    beforeEach(function() {
        module('hz.quickstart');
    });

    //beforeEach(module(function($provide) {
    //  $provide.value("myDependentService", serviceThatsActuallyASpyObject);
    //}));

    var email = "demo@example.com",
        network = "1fd122abbaf7493ba4b96ca0fac2da35-net",
        serverId = "561f6480-5cb1-46e3-89a1-93e7803ac41c",
        instanceDict = {
                "OS-DCF:diskConfig": "AUTO",
                "OS-EXT-AZ:availability_zone": "nova",
                "OS-EXT-SRV-ATTR:host": null,
                "OS-EXT-SRV-ATTR:instance_name": null,
                "OS-EXT-STS:power_state": 0,
                "OS-EXT-STS:task_state": "spawning",
                VirtualInterfaces: null,
                addresses: {},
                attrs: null,
                created: "2016-01-07T08:55:54Z",
                fault: null,
                flavor: {
                    id: "42",
                    links: [{
                        href: "http://10.0.2.15:8774/1fd122abbaf7493ba4b96ca0fac2da35/flavors/42",
                        rel: "bookmark"
                    }]
                },
                id: serverId,
                image: {
                    id: "48cebb73-cdb9-4eff-96cd-350f18d6c879",
                    links: [{
                        href: "http://10.0.2.15:8774/1fd122abbaf7493ba4b96ca0fac2da35/images/48cebb73-cdb9-4eff-96cd-350f18d6c879",
                        rel: "bookmark"
                    }]},
                image_name: null,
                key_name: "some",
                links: [
                    {
                        href: "http://10.0.2.15:8774/v2/1fd122abbaf7493ba4b96ca0fac2da35/servers/561f6480-5cb1-46e3-89a1-93e7803ac41c",
                        rel: "self"
                    }, {
                        href: "http://10.0.2.15:8774/1fd122abbaf7493ba4b96ca0fac2da35/servers/561f6480-5cb1-46e3-89a1-93e7803ac41c",
                        rel: "bookmark"
                    }
                ],
                metadata: {},
                name: "test2",
                private_ip: null,
                public_ip: null,
                status: "ACTIVE",
                tenant_id: "1fd122abbaf7493ba4b96ca0fac2da35",
                user_id: "d8dbb77075964aebb3c271920f30cdcf",
                uuid: null
        },
        serverResponse = {
            email: email,
            instance: instanceDict,
            network: network
        };

    // instantiate service
    var InstanceCreationService, httpBackend, rootScope, interval;
    beforeEach(inject(function (_InstanceCreationService_, _$httpBackend_, $rootScope, _$interval_) {
        InstanceCreationService = _InstanceCreationService_;
        httpBackend = _$httpBackend_;
        rootScope = $rootScope;
        interval = _$interval_;

        httpBackend.whenPOST("/api/extension/servers/").respond(200, serverResponse);

        httpBackend.whenGET(/static\/quickstart\/templates.*/).respond(200, '');

    }));

    afterEach(function() {
        //httpBackend.flush();
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should send complete message', function () {
        var testInstance = {
            instance: "some",
            id: 1
        };

        expect(!!InstanceCreationService).toBe(true);

        spyOn(rootScope, "$broadcast").and.callThrough();

        httpBackend.whenGET("/api/nova/servers/" + serverId).respond(200, instanceDict);

        InstanceCreationService.createInstance(testInstance);
        httpBackend.flush();

        //flush interval for polling
        interval.flush(2001);
        httpBackend.flush();

        expect(rootScope.$broadcast).toHaveBeenCalledWith("instanceCreation:start", testInstance);
        expect(rootScope.$broadcast).toHaveBeenCalledWith("instanceCreation:created", testInstance);
        expect(rootScope.$broadcast).toHaveBeenCalledWith("instanceCreation:complete", instanceDict);
    });

    it('should send error message on fail', function () {

        var testInstance = {
            instance: "some",
            id: 1
        };

        instanceDict.status = "ERROR";

        expect(!!InstanceCreationService).toBe(true);

        spyOn(rootScope, "$broadcast").and.callThrough();

        httpBackend.whenGET("/api/nova/servers/" + serverId).respond(200, instanceDict);

        InstanceCreationService.createInstance(testInstance);
        httpBackend.flush();

        //flush interval for polling
        interval.flush(2001);
        httpBackend.flush();

        expect(rootScope.$broadcast).toHaveBeenCalledWith("instanceCreation:start", testInstance);
        expect(rootScope.$broadcast).toHaveBeenCalledWith("instanceCreation:created", testInstance);
        expect(rootScope.$broadcast).toHaveBeenCalledWith("instanceCreation:error", instanceDict);
    });

});
