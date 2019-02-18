/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
describe('Thing Configuration', function () {
    beforeEach(module('Config.Things'));

    var $controller;
    var $scope;
    var mockThingModel = {};

    function addThings() {
        return [
            {
                "configuration": {},
                "properties": {},
                "statusInfo": {
                    "status": "UNINITIALIZED",
                    "statusDetail": "NONE"
                },
                "UID": "binding1:thingtype1:thing1",
                "channels": [
                    {
                        "linkedItems": [],
                        "id": "online",
                        "itemType": "Switch"
                    }
                ]
            },
            {
                "configuration": {},
                "properties": {},
                "statusInfo": {
                    "status": "UNINITIALIZED",
                    "statusDetail": "NONE"
                },
                "UID": "binding1:thingtype2:thing1",
                "channels": [
                    {
                        "linkedItems": [],
                        "id": "online",
                        "itemType": "Switch"
                    }
                ]
            },
            {
                "configuration": {},
                "properties": {},
                "statusInfo": {
                    "status": "UNINITIALIZED",
                    "statusDetail": "HANDLER_INITIALIZING_ERROR",
                    "description": "java.lang.String cannot be cast to java.math.BigDecimal"
                },
                "UID": "binding1:bridgetype1:bridge1",
                "channels": []
            }
        ];
    }

    function addThingTypes($scope) {
        return [
            {
                "channels": [
                    {
                        "description": "Channel 1",
                        "id": "switch",
                        "label": "Power",
                        "tags": [],
                        "category": "Light",
                        "advanced": false
                    }
                ],
                "channelGroups": [],
                "supportedBridgeTypeUIDs": [],
                "properties": {},
                "description": "Bridge1",
                "label": "Label Bridge 1",
                "UID": "binding1:bridgetype1",
                "bridge": true
            },
            {
                "channels": [
                    {
                        "description": "Channel 1",
                        "id": "switch",
                        "label": "Power",
                        "tags": [],
                        "category": "Light",
                        "advanced": false
                    }
                ],
                "channelGroups": [],
                "supportedBridgeTypeUIDs": [
                    "binding1:bridgetype1"
                ],
                "properties": {},
                "description": "Description1",
                "label": "Label 1",
                "UID": "binding1:thingtype1",
                "bridge": false
            }
        ];
    }

    beforeEach(inject(function (_$controller_, $rootScope) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
        $scope = $rootScope.$new();

        inject(function ($q) {
            mockThingModel.putThing = function (thing) {
                mockThingModel.thing = thing;
                var defer = $q.defer();
                defer.resolve(this.data);
                return defer.promise;
            };
            mockThingModel.getList = function () {
                var defer = $q.defer();
                defer.resolve(addThings());
                return defer.promise;
            };
            mockThingModel.getThingTypes = function () {
                var defer = $q.defer();
                defer.resolve(addThingTypes());
                return defer.promise;
            };
        });
    }));

    describe('$scope.getThingType', function () {
        it('Check that getThingType finds the thing type', function () {
            var controller = $controller('ThingConfigCtrl', {$scope: $scope});
            $scope.things = addThings();
            $scope.thingTypes = addThingTypes();
            var result = $scope.getThingType({UID: "binding1:thingtype1:thing1"});
            expect(result.UID).toEqual("binding1:thingtype1");
        });
    });

    describe('$scope.bridgeFilter', function () {
        it('Check that bridgeFilter finds the bridge', function () {
            var controller = $controller('ThingConfigCtrl', {$scope: $scope});
            $scope.things = addThings();
            $scope.thingTypes = addThingTypes();
            $scope.selectedThingType = $scope.thingTypes[1];
            var result = $scope.bridgeFilter({UID: "binding1:bridgetype1:bridge1"});
            expect(result).toEqual(true);
        });
        it('Check that bridgeFilter doesnt find the bridge', function () {
            var controller = $controller('ThingConfigCtrl', {$scope: $scope});
            $scope.things = addThings();
            $scope.thingTypes = addThingTypes();
            $scope.selectedThingType = $scope.thingTypes[0];
            var result = $scope.bridgeFilter({UID: "binding1:bridgetype1:bridge1"});
            expect(result).toEqual(false);
        });
    });

    describe('$scope.thingSave', function () {
        it('Check that thingSave converts a string to INTEGER', function () {
            var controller = $controller('ThingConfigCtrl', {$scope: $scope, ThingModel: mockThingModel});
            $scope.things = addThings();
            $scope.thingTypes = addThingTypes();
            $scope.selectedThing = $scope.things[0];
            $scope.selectedThingType = $scope.thingTypes[1];
            $scope.selectedThing.configuration = {key: "23"};
            $scope.selectedThingType.configParameters = [{name: 'key', type: "INTEGER"}];
            $scope.thingSave();
            expect(mockThingModel.thing.configuration.key).toEqual(23);
        });
        it('Check that thingSave leaves a string as a STRING', function () {
            var controller = $controller('ThingConfigCtrl', {$scope: $scope, ThingModel: mockThingModel});
            $scope.things = addThings();
            $scope.thingTypes = addThingTypes();
            $scope.selectedThing = $scope.things[0];
            $scope.selectedThingType = $scope.thingTypes[1];
            $scope.selectedThing.configuration = {key: "42"};
            $scope.selectedThingType.configParameters = [{name: 'key', type: "STRING"}];
            $scope.thingSave();
            expect(mockThingModel.thing.configuration.key).toEqual("42");
        });
        it('Check that thingSave converts a number to STRING', function () {
            var controller = $controller('ThingConfigCtrl', {$scope: $scope, ThingModel: mockThingModel});
            $scope.things = addThings();
            $scope.thingTypes = addThingTypes();
            $scope.selectedThing = $scope.things[0];
            $scope.selectedThingType = $scope.thingTypes[1];
            $scope.selectedThing.configuration = {key: 42};
            $scope.selectedThingType.configParameters = [{name: 'key', type: "STRING"}];
            $scope.thingSave();
            expect(mockThingModel.thing.configuration.key).toEqual("42");
        });
    });

});

