/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 *
 */
angular.module('HABmin.smarthomeModel', [
    'ngLocalize'
])
    .service("SmartHomeModel", function ($q, locale) {
        var me = this;
        var deferredList = [];

        var loaded = false;
        me.itemtypes = [];
        me.categories = [];
        locale.ready('smarthome').then(
            function () {
                me.itemtypes = [
//                        {id: 'CallItem', name: locale.getString("smarthome.itemCallItem")},
                    {id: 'Color', name: locale.getString("smarthome.itemColorItem")},
                    {id: 'Contact', name: locale.getString("smarthome.itemContactItem")},
                    {id: 'DateTime', name: locale.getString("smarthome.itemDateTimeItem")},
                    {id: 'Dimmer', name: locale.getString("smarthome.itemDimmerItem")},
                    {id: 'Group', name: locale.getString("smarthome.itemGroupItem")},
                    {id: 'Image', name: locale.getString("smarthome.itemImageItem")},
                    {id: 'Location', name: locale.getString("smarthome.itemLocationItem")},
                    {id: 'Number', name: locale.getString("smarthome.itemNumberItem")},
                    {id: 'Player', name: locale.getString("smarthome.itemPlayerItem")},
                    {id: 'Rollershutter', name: locale.getString("smarthome.itemRollershutterItem")},
                    {id: 'String', name: locale.getString("smarthome.itemStringItem")},
                    {id: 'Switch', name: locale.getString("smarthome.itemSwitchItem")}
                ];

                me.categories = [
                    {id: 'Alarm', name: locale.getString("smarthome.categoryAlarm")},
                    {id: 'Battery', name: locale.getString("smarthome.categoryBattery")},
                    {id: 'Blinds', name: locale.getString("smarthome.categoryBlinds")},
                    {id: 'CarbonDioxide', name: locale.getString("smarthome.categoryCarbonDioxide")},
                    {id: 'ColorLight', name: locale.getString("smarthome.categoryColorLight")},
                    {id: 'Contact', name: locale.getString("smarthome.categoryContact")},
                    {id: 'DimmableLight', name: locale.getString("smarthome.categoryDimmableLight")},
                    {id: 'Door', name: locale.getString("smarthome.categoryDoor")},
                    {id: 'Energy', name: locale.getString("smarthome.categoryEnergy")},
                    {id: 'Fan', name: locale.getString("smarthome.categoryFan")},
                    {id: 'Fire', name: locale.getString("smarthome.categoryFire")},
                    {id: 'Flow', name: locale.getString("smarthome.categoryFlow")},
                    {id: 'GarageDoor', name: locale.getString("smarthome.categoryGarageDoor")},
                    {id: 'Gas', name: locale.getString("smarthome.categoryGas")},
                    {id: 'Humidity', name: locale.getString("smarthome.categoryHumidity")},
                    {id: 'Light', name: locale.getString("smarthome.categoryLight")},
                    {id: 'Motion', name: locale.getString("smarthome.categoryMotion")},
                    {id: 'MoveControl', name: locale.getString("smarthome.categoryMoveControl")},
                    {id: 'Player', name: locale.getString("smarthome.categoryPlayer")},
                    {id: 'PowerOutlet', name: locale.getString("smarthome.categoryPowerOutlet")},
                    {id: 'Pressure', name: locale.getString("smarthome.categoryPressure")},
                    {id: 'QualityOfService', name: locale.getString("smarthome.categoryQualityOfService")},
                    {id: 'Rain', name: locale.getString("smarthome.categoryRain")},
                    {id: 'Recorder', name: locale.getString("smarthome.categoryRecorder")},
                    {id: 'Smoke', name: locale.getString("smarthome.categorySmoke")},
                    {id: 'SoundVolume', name: locale.getString("smarthome.categorySoundVolume")},
                    {id: 'Switch', name: locale.getString("smarthome.categorySwitch")},
                    {id: 'Temperature', name: locale.getString("smarthome.categoryTemperature")},
                    {id: 'Water', name: locale.getString("smarthome.categoryWater")},
                    {id: 'Wind', name: locale.getString("smarthome.categoryWind")},
                    {id: 'Window', name: locale.getString("smarthome.categoryWindow")},
                    {id: 'Zoom', name: locale.getString("smarthome.categoryZoom")}
                ];

                if (deferredList != null) {
                    angular.forEach(deferredList, function (deferred) {
                        deferred.resolve();
                    });
                    deferredList = [];
                }

                loaded = true;
            });

        me.ready = function () {
            var deferred = $q.defer();
            if (loaded === true) {
                deferred.resolve();
                return deferred.promise;
            }

            deferredList.push(deferred);
            return deferred.promise;
        };
    })
;