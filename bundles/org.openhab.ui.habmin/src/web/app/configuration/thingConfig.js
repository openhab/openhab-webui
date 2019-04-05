/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Things', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.itemModel',
    'HABmin.configModel',
    'HABmin.thingModel',
    'HABmin.bindingModel',
    'HABmin.smarthomeModel',
    'HABmin.channelTypeModel',
    'Config.parameter',
    'Config.ItemEdit',
    'Config.ItemLink',
    'angular-growl',
    'ResizePanel',
    'showOverflow',
    'ngHelpDialog',
    'ngInputModified',
    'ngPromiseExtras',
    'sitemapSwitchWidget',
    'bootstrapCombo',
    'angularMoment'
])

    .config(function config($stateProvider) {
        $stateProvider.state('things', {
            url: '/things',
            views: {
                "main": {
                    controller: 'ThingConfigCtrl',
                    templateUrl: 'configuration/thingConfig.tpl.html'
                },
                "menu": {
                    controller: 'ThingConfigMenuCtrl',
                    templateUrl: 'configuration/thingConfigMenu.tpl.html'
                }
            },
            data: {pageTitle: 'Things'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function ($q, locale) {
                    return $q.all([
                        locale.ready('thing'),
                        locale.ready('smarthome')
                    ]);
                }
            }
        });
    })

    // Service used to communicate between controllers
    .factory('ThingConfigService', function () {
        var Service = {
            graphItems: [],
            service: ""
        };

        Service.getItems = function () {
            return Service.graphItems;
        };

        Service.getService = function () {
            return Service.service;
        };

        return Service;
    })

    .controller('ThingConfigCtrl',
    function ($scope, $q, ThingConfigService, locale, growl, $timeout, $window, $http, $interval, UserService, ThingModel, ConfigModel, BindingModel, ItemModel, itemEdit, itemLink, SmartHomeModel, ChannelTypeModel) {
        $scope.panelDisplayed = 'PROPERTIES';
        $scope.thingCnt = -1;

        $scope.formLoaded = false;

        $scope.newThings = [];
        $scope.thingTypes = [];
        $scope.newThing = false;
        $scope.insertMode = false;

        $scope.selectedThingHasProperties = false;
        $scope.showAdvancedSettings = false;

        $scope.filterStatus = [];
        $scope.filterBindings = [];

        SmartHomeModel.ready().then(
            function () {
                $scope.itemtypes = SmartHomeModel.itemtypes;
                $scope.categories = SmartHomeModel.categories;
            });

        var promises = {};

        promises.things = ThingModel.getList();
        //.then(
        //    function (list) {
        //      $scope.things = list;
        //},
        //   function (reason) {
        // Handle failure
        //     growl.warning(locale.getString("habmin.ErrorGettingThings"));
        //      }
        //);

        // If the list ever changes, update the counter
        /*
         $scope.$watch("things", function () {
         if ($scope.things === undefined) {
         return;
         }
         if ($scope.things == null) {
         $scope.thingCnt = 0;
         }
         else {
         $scope.thingCnt = $scope.things.length;

         // Loop through all the things and derive battery status
         // TODO: Maybe this should move to the ThingModel?
         angular.forEach($scope.things, function (thing) {
         for (var i = 0; i < thing.channels.length; i++) {
         if (thing.channels[i].id == "battery-level") {
         //ItemModel.getItem(thing.channels[i].linkedItems[0]).then(
         //function (item) {
         //if (item == null) {
         //thing.batteryIcon = "fa fa-question-circle";
         //}
         //}
         //);

         return;
         }
         }
         });
         }
         }, true);
         */

        promises.types = ThingModel.getThingTypes();

        $q.allSettled(promises).then(
            function (values) {
                if (values.things.state == 'fulfilled') {
                    $scope.things = values.things.value;
                    $scope.thingCnt = $scope.things.length;
                }
                else {
                    growl.warning(locale.getString("habmin.ErrorGettingThings"));
                }
                if (values.types.state == 'fulfilled') {
                    $scope.thingTypes = values.types.value;
                }
            }
        );

        ItemModel.getList().then(
            function (list) {
                $scope.itemList = list;
            }
        );

        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;

                // Add all bindings into the filter
                angular.forEach($scope.bindings, function (binding) {
                    if (binding.discovery) {
                        $scope.discoveryEnabled = true;
                    }
                    $scope.filterBindings.push(binding.id);
                });
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.ErrorGettingBindings"));
            }
        );

        /**
         * Function to filter things depending on selected bindings and status
         * @param element
         * @returns {boolean}
         */
        $scope.filterFunction = function (element) {
            if ($scope.filterBindings.indexOf(element.binding) != -1) {
                return false;
            }
            if (element.statusInfo != null && $scope.filterStatus.indexOf(element.statusInfo.status) != -1) {
                return false;
            }
            var uid = element.thingTypeUID.split(":");
            if ($scope.filterBindings.indexOf(uid[0]) == -1) {
                return false;
            }

            return true;
        };

        $scope.dec2hex = function (value, places) {
            var template = "";
            for (var c = 0; c < places; c++) {
                template += "0";
            }
            return (template + Number(value).toString(16)).substr(-places);
        };

        $scope.checkActions = function () {
            return function (config) {
                if (config.groupName != 'actions') {
                    return false;
                }
                if (config.advanced == false) {
                    return true;
                }
                return $scope.showAdvancedSettings;
            }
        };

        $scope.toggleStatusFilter = function (status) {
            var p = $scope.filterStatus.indexOf(status);
            if (p == -1) {
                $scope.filterStatus.push(status);
            }
            else {
                $scope.filterStatus.splice(p, 1);
            }
        };

        $scope.toggleBindingFilter = function (binding) {
            var p = $scope.filterBindings.indexOf(binding.id);
            if (p == -1) {
                $scope.filterBindings.push(binding.id);
            }
            else {
                $scope.filterBindings.splice(p, 1);
            }
        };

        $scope.configGroupFilter = function (config, group) {
            // Sanity check
            if (config == null) {
                return false;
            }

            // Are we looking for ungrouped parameters
            if (group == null) {
                if (config.groupName == null || config.groupName === "") {
                    return true;
                }
                return false;
            }

            if (config.groupName == group) {
                return true;
            }

            return false;
        };

        $scope.configGroupAdvanced = function (group) {
            if (group.advanced === true || group == null || group.length === 0) {
                return false;
            }

            for (var i = 0; i < $scope.selectedThingConfig.parameters.length; i++) {
                if ($scope.selectedThingConfig.parameters[i].groupName == group.name &&
                    ($scope.selectedThingConfig.parameters[i].advanced === false)) {
                    return true;
                }
            }

            return false;
        };

        $scope.thingHasUngroupedParams = function () {
            if ($scope.selectedThingConfig == null || $scope.selectedThingConfig.parameters == null) {
                return false;
            }

            for (var cnt1 = 0; cnt1 < $scope.selectedThingConfig.parameters.length; cnt1++) {
                // If there's no group name, then it's not grouped
                if ($scope.selectedThingConfig.parameters[cnt1].groupName == null ||
                    $scope.selectedThingConfig.parameters[cnt1].groupName === "") {
                    return true;
                }

                // If it has a group name, but the group doesn't exist, then it's ungrouped
                var found = false;
                for (var cnt2 = 0; cnt2 < $scope.selectedThingConfig.parameterGroups.length; cnt2++) {
                    if ($scope.selectedThingConfig.parameterGroups[cnt2].name ==
                        $scope.selectedThingConfig.parameters[cnt1].groupName) {
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    return true;
                }
            }

            return false;
        };

        /**
         * Filter used to test if the thing is of a type included in the bridge types
         * supported by the selected thing.
         * @param thing
         * @returns {boolean}
         */
        $scope.bridgeFilter = function (bridge) {
            if ($scope.selectedThingType == null) {
                return false;
            }

            var thingType = $scope.getThingType(bridge);
            if (thingType == null || $scope.selectedThingType.supportedBridgeTypeUIDs == null ||
                thingType.bridge === false) {
                return false;
            }

            return $scope.selectedThingType.supportedBridgeTypeUIDs.indexOf(thingType.UID) != -1;
        };

        $scope.setPanelDisplayed = function (panel) {
            $scope.panelDisplayed = panel;
        };

        /**
         * Get the thing type, given the thing
         * @param thing
         * @returns thingType
         */
        $scope.getThingType = function (thing) {
            for (var i = 0; i < $scope.thingTypes.length; i++) {
                if ($scope.thingTypes[i].UID == thing.thingTypeUID) {
                    return $scope.thingTypes[i];
                }
            }

            return null;
        };

        $scope.channelExists = function (thing, channelId) {
            angular.forEach(thing.channels, function (channel) {
                if (channel.id == channelId) {
                    return channel;
                }
            });
        };

        $scope.selectThing = function (thing) {
            console.debug("Selected thing", thing);
            $scope.formLoaded = false;
            $scope.newThing = false;
            $scope.selectedThing = null;
            $scope.panelDisplayed = 'OVERVIEW';

            $scope.selectedThingHasProperties = false;
            for (var key in thing.properties) {
                $scope.selectedThingHasProperties = true;
                break;
            }
            $scope.thingConfigForm.reset();

            var promises = {};

            // Get the configuration and config status
            promises.config = ThingModel.getConfig(thing.UID);
            promises.configStatus = ThingModel.getConfigStatus(thing.UID);

            // Get the channels
            angular.forEach(thing.channels, function (channel) {
                promises[channel.id] = ConfigModel.getConfig("channel:" + thing.UID + ":" + channel.id);
                promises[channel.channelTypeUID] = ChannelTypeModel.getChannelType(channel.channelTypeUID);
            });

            // Wait for all the promises to complete before processing the data
            $q.allSettled(promises).then(
                function (values) {
                    for (var value in values) {
                        if (values[value].state == 'fulfilled') {
                            values[value] = values[value].value;
                        }
                    }

                    // We make a copy here so that we're not editing the live version
                    $scope.selectedThing = angular.copy(thing);
                    // But keep references to the 'real' channels so they update correctly
                    $scope.selectedThing.channels = thing.channels;

                    // Handle config status
                    // This is messy. In order to get the event changes flowing directly to the UI
                    // we need to have an object for each parameter, and then update it in the event handler.
                    // For now, just take a copy, but below we'll add in any parameter status that dont exist.
                    $scope.selectedThingStatus = values.configStatus;

                    $scope.selectedThingType = $scope.getThingType(thing);
                    if ($scope.selectedThingType == null) {
                        console.log("selectedThingType is null!");
                        return;
                    }

                    $scope.selectedThingConfig = values.config;

                    // Convert all configuration values to strings for processing internally...
                    // We'll convert them back later!
                    angular.forEach($scope.selectedThingConfig.parameters, function (parameter) {
                        // Handle config status
                        if ($scope.selectedThingStatus[parameter.name] == null) {
                            $scope.selectedThingStatus[parameter.name] = {type: ""};
                        }

                        var val = $scope.selectedThing.configuration[parameter.name];
                        if (val == null || val == "null") {
                            if (parameter.defaultValue != null && parameter.defaultValue != "null") {
                                val = parameter.defaultValue;
                            }
                            else {
                                val = "";
                            }
                        }
                        if (parameter.multiple === true) {
                            if (val === "") {
                                val = [];
                            }
                            else {
                                val = [].concat(val);
                            }
                            angular.forEach(val, function (option) {
                                option = option.toString();
                            });
                            $scope.selectedThing.configuration[parameter.name] = val;
                        }
                        else {
                            $scope.selectedThing.configuration[parameter.name] = val.toString();
                        }
                    });

                    // Ensure the options are converted to a string for internal processing
                    angular.forEach($scope.selectedThingConfig.parameters, function (parameter) {
                        angular.forEach(parameter.options, function (option) {
                            option.value = option.value.toString();
                        });
                    });

                    // Process all the channel types
                    angular.forEach($scope.selectedThing.channels, function (channel) {
                        channel.configDescription = values[channel.id];
                        channel.channelType = values[channel.channelTypeUID];

                        // Ensure the options are converted to a string for internal processing
                        angular.forEach(channel.configDescription.parameters, function (parameter) {
                            if (channel.configuration == null) {
                                channel.configuration = {};
                            }
                            var val = channel.configuration[parameter.name];
                            if (val == null || val == "null") {
                                if (parameter.defaultValue != null && parameter.defaultValue != "null") {
                                    val = parameter.defaultValue;
                                }
                                else {
                                    val = "";
                                }
                            }
                            if (parameter.multiple === true) {
                                if (val === "") {
                                    val = [];
                                }
                                else {
                                    val = [].concat(val);
                                }
                                angular.forEach(val, function (option) {
                                    option = option.toString();
                                });
                                channel.configuration[parameter.name] = val;
                            }
                            else {
                                channel.configuration[parameter.name] = val.toString();
                            }

                            angular.forEach(parameter.options, function (option) {
                                option.value = option.value.toString();
                            });
                        });
                    });

                    $timeout(function () {
                        $scope.thingConfigForm.$setPristine();
                        $scope.formLoaded = true;
                    });
                }
            )
        };

        $scope.getChannelItems = function (channel) {
            if ($scope.selectedThing == null || $scope.selectedThing.channels == null) {
                return [];
            }

            for (var i = 0; i < $scope.selectedThing.channels.length; i++) {
                if ($scope.selectedThing.channels[i].id == channel.id) {
                    return $scope.selectedThing.channels[i].linkedItems;
                }
            }
            return [];
        };

        $scope.editItem = function (item, channel) {
            itemEdit.edit(channel, item);
        };

        $scope.linkItem = function (channel) {
            itemLink.edit(channel);
        };

        $scope.unlinkItem = function (item, channel) {
            ItemModel.unlinkItem(channel, item).then(
                function () {
                    growl.success(locale.getString("thing.UnlinkItemOk"));
                },
                function (response) {
                    var msg;
                    if (response != null && response.error != null) {
                        msg = response.error.message;
                    }
                    else {
                        msg = locale.getString("common.noResponse");
                    }
                    growl.warning(locale.getString("thing.UnlinkItemFailed", {message: msg}));
                }
            );
        };

        $scope.refreshChannelItems = function () {
            if ($scope.selectedThing == null || $scope.selectedThing.channels == null) {
                return;
            }

            for (var c = 0; c < $scope.selectedThing.channels.length; c++) {
                for (var i = 0; i < $scope.selectedThing.channels[c].linkedItems.length; i++) {
                    ItemModel.sendCommand($scope.selectedThing.channels[c].linkedItems[i], "REFRESH");
                }
            }
        };

        $scope.addItem = function (channel) {
            var newItem = {
                label: channel.channelType.label,
                type: channel.itemType,
                category: channel.channelType.category
            };

            var name = channel.uid.replace(/[:-]/g, "_");
            if (ItemModel.getItem(name) == null) {
                newItem.name = name;
            }

            itemEdit.edit(channel, newItem, true);
        };

        $scope.deleteItem = function (item, channel) {
            // We need to first unlink the channel, then delete the item...
            ItemModel.unlinkItem(channel, item).then(
                function () {
                    ItemModel.deleteItem(item).then(
                        function () {
                            growl.success(locale.getString("thing.DeleteItemOk"));
                        },
                        function (response) {
                            var msg;
                            if (response != null && response.error != null) {
                                msg = response.error.message;
                            }
                            else {
                                msg = locale.getString("common.noResponse");
                            }
                            growl.warning(locale.getString("thing.DeleteItemFailed", {message: msg}));
                        }
                    );
                },
                function (response) {
                    var msg;
                    if (response != null && response.error != null) {
                        msg = response.error.message;
                    }
                    else {
                        msg = locale.getString("common.noResponse");
                    }
                    growl.warning(locale.getString("thing.DeleteItemFailed", {message: msg}));
                }
            );
        };

        $scope.getValue = function (channel, value) {
            if (value == "NULL") {
                return "";
            }
            if (channel == null || channel.channelType == null || channel.channelType.stateDescription == null) {
                return value;
            }
            for (var state in channel.channelType.stateDescription.options) {
                if (channel.channelType.stateDescription.options[state].value == value) {
                    return channel.channelType.stateDescription.options[state].label;
                }
            }

            return value;
        };

        $scope.getItem = function (itemName) {
            for (var i = 0; i < $scope.itemList.length; i++) {
                if ($scope.itemList[i].name == itemName) {
                    return $scope.itemList[i];
                }
            }
            return {label: itemName};
        };

        $scope.getChannel = function (channelId) {
            for (var cnt = 0; cnt < $scope.selectedThing.channels.length; cnt++) {
                if ($scope.selectedThing.channels[cnt].id == channelId) {
                    return $scope.selectedThing.channels[cnt];
                }
            }
            return null;
        };

        $scope.channelEnable = function (channel) {
            if ($scope.channelEnabled(channel)) {
                ThingModel.disableChannel($scope.selectedThing.UID + ":" + channel.id).then(
                    function () {
                        growl.success(locale.getString("thing.ChannelDisabledOk",
                            {thing: $scope.selectedThing.label, channel: channel.label}));

                        ThingModel.getThing($scope.selectedThing.UID).then(
                            function (data) {
                                $scope.selectedThing = data;
                            }
                        );
                    },
                    function () {
                        growl.warning(locale.getString("thing.ChannelDisabledError",
                            {thing: $scope.selectedThing.label, channel: channel.label}));
                    }
                );
            }
            else {
                ThingModel.enableChannel($scope.selectedThing.UID + ":" + channel.id).then(
                    function () {
                        growl.success(locale.getString("thing.ChannelEnabledOk",
                            {thing: $scope.selectedThing.label, channel: channel.label}));

                        $scope.selectedThing = ThingModel.getThing($scope.selectedThing.UID);
                    },
                    function () {
                        growl.warning(locale.getString("thing.ChannelDisabledError",
                            {thing: $scope.selectedThing.label, channel: channel.label}));
                    }
                );
            }
        };

        $scope.channelEnabled = function (channel) {
            if ($scope.selectedThing == null || $scope.selectedThing.channels == null) {
                return false;
            }

            for (var i = 0; i < $scope.selectedThing.channels.length; i++) {
                if ($scope.selectedThing.channels[i].id == channel.id) {
                    if ($scope.selectedThing.channels[i].linkedItems.length) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            return false;
        };

        $scope.countActiveChannels = function () {
            if ($scope.selectedThing == null || $scope.selectedThing.channels == null) {
                return 0;
            }
            var linked = 0;
            for (var cnt = 0; cnt < $scope.selectedThing.channels.length; cnt++) {
                if ($scope.selectedThing.channels[cnt].linkedItems != null &&
                    $scope.selectedThing.channels[cnt].linkedItems.length) {
                    linked++;
                }
            }

            return linked;
        };

        $scope.getChannelType = function (channelId) {
            for (var cnt = 0; cnt < $scope.selectedThingType.channels.length; cnt++) {
                if ($scope.selectedThingType.channels[cnt].id == channelId) {
                    return $scope.selectedThingType.channels[cnt];
                }
            }

            return null;
        };

        $scope.thingSave = function () {
            var promises = [];

            // Check if anything at thing level needs updating (ie Channel Configuration)
            var thingUpdated = false;
            var updatedThing = {};
            if ($scope.thingConfigForm.modifiedChildFormsCount !== 0) {
                angular.forEach($scope.thingConfigForm.modifiedChildForms, function (childForm) {
                    var channel = $scope.getChannel(childForm.$name);
                    if (channel == null) {
                        return;
                    }

                    // Get the channel type so we can get the type information
//                    var channelType = $scope.getChannelType(channel.id);
//                    if (channelType == null) {
//                        return;
//                    }

                    if (channel.configuration == null) {
                        channel.configuration = {};
                    }

                    // Loop over all the modified parameters
                    angular.forEach(childForm.modifiedModels, function (model) {
                        // Get the configuration description
                        for (var cnt = 0; cnt < channel.configDescription.parameters.length; cnt++) {
                            if (channel.configDescription.parameters[cnt].name == model.$name) {
                                channel.configuration[model.$name] =
                                    ThingModel.convertType(channel.configDescription.parameters[cnt].type,
                                        model.$modelValue,
                                        channel.configDescription.parameters[cnt].multiple);

                                thingUpdated = true;
                            }
                        }
                    });
                });
            }

            // Check if the name has changed
            if ($scope.thingConfigForm.thingLabel.$dirty === true) {
                thingUpdated = true;
                $scope.selectedThing.label = $scope.thingConfigForm.thingLabel.$modelValue;
            }

            // Check if the location has changed
            if ($scope.thingConfigForm.thingLocation.$dirty === true) {
                thingUpdated = true;
                $scope.selectedThing.location = $scope.thingConfigForm.thingLocation.$modelValue;
            }

            // Check if the bridge has changed
            if ($scope.thingConfigForm.thingBridge != null &&
                $scope.thingConfigForm.thingBridge.$dirty === true) {
                thingUpdated = true;
                $scope.selectedThing.bridgeUID = $scope.thingConfigForm.thingBridge.$modelValue;
            }

            if (thingUpdated === true) {
                promises.push(ThingModel.putThing($scope.selectedThing));
            }

            // Keep track of configs that have changed
            var dirtyCfg = {};
            var workToDo = false;

            // Perform type conversion to ensure that any INTEGER types are sent as a number
            angular.forEach($scope.selectedThingConfig.parameters, function (parameter, key) {
                // If this value doesn't exist in the object, then return!
                // This can happen for advanced parameters when not in advanced mode
                // If this value hasn't changed, then don't send an update
                if ($scope.thingConfigForm[parameter.name] === undefined ||
                    $scope.thingConfigForm[parameter.name].$dirty !== true) {
                    return;
                }

                dirtyCfg[parameter.name] =
                    ThingModel.convertType(parameter.type, $scope.thingConfigForm[parameter.name].$modelValue,
                        parameter.multiple);
                workToDo = true;
            });

            // Is there anything for us to do?
            if (workToDo === true) {
                promises.push(ThingModel.putConfig($scope.selectedThing, dirtyCfg));
            }

            // Now wait for any promises to complete before notifying our users
            $q.allSettled(promises).then(
                function (values) {
                    var error = "";
                    for (var value in values) {
                        if (values[value].state == 'fulfilled') {
                            values[value] = values[value].value;
                        }
                    }

                    var name = "";
                    if ($scope.selectedThing.item != null) {
                        name = $scope.selectedThing.item.label;
                    }

                    if (error.length == 0) {
                        $scope.newThing = false;

                        growl.success(locale.getString("thing.SuccessSavingThing",
                            {name: name}));

                        $timeout(function () {
                            $scope.thingConfigForm.$setPristine();
                        });
                    }
                    else {
                        growl.error(locale.getString("thing.ErrorSavingThing",
                            {name: name, error: error}));
                    }

                }
            );
        };

        $scope.thingDelete = function (thing) {
            // TODO - detect if this is in the removing state and send force true
//            if(thing.)
//            thing.
            var force = true;

            ThingModel.deleteThing(thing, force).then(
                function () {
                    var name = "";
                    if (thing.item != null) {
                        name = thing.item.label;
                    }
                    growl.success(locale.getString("thing.SuccessDeletingThing",
                        {name: name}));
                    $scope.selectedThing = null;
                    $scope.formLoaded = false;
                    $scope.thingConfigForm.$setPristine();
                },
                function () {
                    var name = "";
                    if (thing.item != null) {
                        name = thing.item.label;
                    }
                    growl.error(locale.getString("thing.ErrorDeletingThing",
                        {name: name}));
                }
            );
        };

        $scope.doAction = function (config, value) {
            if (value === undefined) {
                if (config.options.length != 0) {
                    value = config.options[0].value;
                }
                else {
                    value = 1234;
                }
            }
            var cfg = {};
            cfg[config.name] = ThingModel.convertType(config.type, value, false);
            ThingModel.putConfig($scope.selectedThing, cfg).then(
                function () {
                    growl.success(locale.getString("thing.ActionSentOk",
                        {name: name}));
                },
                function () {
                    growl.error(locale.getString("thing.ActionSentError",
                        {name: name}));
                }
            );
        };

        $scope.createNewThing = function (binding) {
            $scope.insertMode = true;

            // Create a list of all thingTypes for this binding
            $scope.newThings = [];
            angular.forEach($scope.thingTypes, function (thingType) {
                var uid = thingType.UID.split(":");
                if (uid[0] == binding.id) {
                    $scope.newThings.push(thingType);
                }
            });
        };

        $scope.selectNewThing = function (thing) {
            $scope.newThing = true;
            $scope.insertMode = false;
            $scope.panelDisplayed = 'OVERVIEW';

            // Get the thing type
            ThingModel.getThingInfo(thing.UID).then(
                function (type) {
                    $scope.selectedThingType = type;
                    $scope.selectedThing = {
                        UID: type.UID + ":",
                        item: {
                            // Default the thing name to the thing type name
                            label: type.label,
                            groupNames: []
                        },
                        configuration: {}
                    };

                    // Handle any type conversion and default parameters
                    angular.forEach(type.configParameters, function (parameter) {
                        ThingModel.convertType(parameter.type, parameter.defaultValue, parameter.multiple);
                    });

                    if ($scope.selectedThing.item != null) {
                        $scope.selectedThing.item.category =
                            ThingModel.getThingTypeCategory($scope.selectedThingType);
                    }

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
                    $timeout(function () {
                        $scope.thingConfigForm.$setPristine();
                        $scope.formLoaded = true;
                    });
                },
                function () {
                    growl.warning(locale.getString("thing.ErrorGettingThing",
                        {name: thing.item.label}));
                }
            );
        };

        $scope.copySuccess = function (itemName) {
            growl.success(locale.getString("item.NameCopiedOk", {name: itemName}));
        };

        $scope.copyFailure = function (error) {
            growl.warning(locale.getString("common.clipboardError"));
        };
    }
)

    .controller('ThingConfigMenuCtrl',
    function ($scope, ThingConfigService, BindingModel, locale, growl) {
        $scope.tooltipDiscover = locale.getString('habmin.Discovery');
        $scope.tooltipManualAdd = locale.getString('habmin.AddThing');

        $scope.discoveryEnabled = true;

        BindingModel.getList().then(
            function (bindings) {
                $scope.bindings = bindings;

                // Set a flag if at least one binding is discoverable
                angular.forEach($scope.bindings, function (binding) {
                    if (binding.discovery) {
                        $scope.discoveryEnabled = true;
                    }
                });
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.ErrorGettingBindings"));
            }
        );

        $scope.startDiscovery = function (binding) {
            BindingModel.startDiscovery(binding.id).then(
                function () {
                    growl.success(locale.getString("discovery.StartOk", {name: binding.name}));
                },
                function () {
                    growl.error(locale.getString("discovery.StartFail", {name: binding.name}));
                }
            );
        };

    })
;
