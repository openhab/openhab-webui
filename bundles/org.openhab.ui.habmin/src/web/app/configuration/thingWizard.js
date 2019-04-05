/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.ThingWizard', [
    'HABmin.thingModel',
    'HABmin.bindingModel',
    'ngLocalize',
    'ngAnimate',
    'ui.bootstrap',
    'ui.router'
])

    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('/thing-wizard', {
                url: '/thing-wizard',
                views: {
                    "main": {
                        templateUrl: 'configuration/thingWizard.tpl.html',
                        controller: 'thingWizardController'
                    }
                }
            })

            // nested states
            // each of these sections will have their own view
            .state('/thing-wizard.binding', {
                url: '/binding',
                templateUrl: 'configuration/thingWizardSelectBinding.tpl.html'
            })

            .state('/thing-wizard.discovery', {
                url: '/discovery',
                templateUrl: 'configuration/thingWizardDiscovery.tpl.html'
            })

            .state('/thing-wizard.thing', {
                url: '/thing',
                templateUrl: 'configuration/thingWizardSelectThing.tpl.html'
            })

            .state('/thing-wizard.configure', {
                url: '/configure',
                templateUrl: 'configuration/thingWizardConfigure.tpl.html'
            });
    })

    .controller('thingWizardController', function ($scope, $state, locale, ThingModel, BindingModel) {
        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.ErrorGettingBindings"));
            }
        );

        ThingModel.getThingTypes().then(
            function (list) {
                $scope.thingTypes = list;
            }
        );

        $scope.countBindingThings = function (binding) {
            // Create a list of all thingTypes for this binding
            var cnt = 0;
            angular.forEach($scope.thingTypes, function (thingType) {
                var uid = thingType.UID.split(":");
                if (uid[0] == binding.id) {
                    cnt++;
                }
            });

            return cnt;
        };

        $scope.selectBinding = function (binding) {
            $scope.binding = binding;

            // Create a list of all thingTypes for this binding
            $scope.newThings = [];
            angular.forEach($scope.thingTypes, function (thingType) {
                var uid = thingType.UID.split(":");
                if (uid[0] == binding.id && thingType.listed == true) {
                    $scope.newThings.push(thingType);
                }
            });

            $state.go('/thing-wizard.thing');
        };

        $scope.selectThing = function (thing) {
            $scope.selectedThing = thing;

            // Get the thing type
            ThingModel.getThingInfo(thing.UID).then(
                function (type) {
                    $scope.selectedThingType = type;
                    $scope.selectedThing = {
                        UID: type.UID + ':' + new Date().getTime().toString(16),
                        thingTypeUID: type.UID,
                        label: type.label,
                        configuration: {}
                    };

                    // Handle any type conversion and default parameters
                    angular.forEach(type.configParameters, function (parameter) {
                        if (parameter.type == 'BOOLEAN') {
                            $scope.selectedThing.configuration[parameter.name] =
                                parameter.defaultValue === 'true' ? true : false;
                        }
                        else {
                            $scope.selectedThing.configuration[parameter.name] = parameter.defaultValue;
                        }
                    });

//                    if ($scope.selectedThing.item != null) {
//                        $scope.selectedThing.item.category = ThingModel.getThingTypeCategory($scope.selectedThingType);
//                    }

                    // If this thing requires a bridge, see how many things are current defined of the type required
                    // If there's only one, then use it by default
                    if (type.supportedBridgeTypeUIDs != null && type.supportedBridgeTypeUIDs.length !== 0) {
                        var bridgeFound = null;
                        angular.forEach($scope.things, function (thing) {
                            // Check if this is a supported bridge
                            if (type.supportedBridgeTypeUIDs.indexOf(thing.UID.split(':', 2).join(':')) != -1) {
                                if (bridgeFound == null) {
                                    bridgeFound = thing.UID;
                                }
                                else {
                                    bridgeFound = "";
                                }
                            }
                        });

                        // If we found a single bridge, it's now in bridgeFound
                        if (bridgeFound != null && bridgeFound !== "") {
                            $scope.selectedThing.bridgeUID = bridgeFound;
                        }
                    }

                    // Display the form
//                    $timeout(function () {
//                        $scope.thingConfigForm.$setPristine();
//                        $scope.formLoaded = true;
//                    });
                },
                function () {
                    growl.warning(locale.getString("thing.ErrorGettingThing",
                        {name: thing.label}));
                }
            );

            $state.go('/thing-wizard.configure');
        };

        $scope.saveNewThing = function () {
            if ($scope.selectedThing == null) {
                return;
            }

            angular.forEach($scope.selectedThingType.configParameters, function (parameter, key) {
                $scope.selectedThing.configuration[parameter.name] =
                    ThingModel.convertType(parameter.type, $scope.selectedThing.configuration[parameter.name],
                        parameter.multiple);
            });

            ThingModel.postThing($scope.selectedThing).then(
                function () {
                    $state.go('/things');
                },
                function () {
                    growl.error(locale.getString("thing.ErrorSavingThing",
                        {name: name}));
                }
            );
        };

    });
