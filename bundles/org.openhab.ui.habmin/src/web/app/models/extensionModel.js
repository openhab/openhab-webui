/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.extensionModel', [
    'angular-growl',
    'HABmin.eventModel',
    'ngLocalize'
])

    .service('ExtensionModel', function ($http, $q, locale, growl, EventModel) {
        var extensionList = [];
        var extensionTypeList = [];
        var eventSrc;
        var me = this;

        this.listen = function () {
            EventModel.registerEvent('ExtensionEvent', this.extensionEvent);
        };

        this.extensionEvent = function (event, payload) {
            var topic = event.topic.split("/");

            for (var i = 0; i < extensionList.length; i++) {
                if (extensionList[i].id == topic[2]) {
                    extensionList[i].inprogress = false;

                    if (topic[3] == "installed") {
                        extensionList[i].installed = true;
                        growl.error(locale.getString("extensions.InstallOk", {extension: payload[0]}));
                    }
                    if (topic[3] == "uninstalled") {
                        extensionList[i].installed = false;
                        growl.error(locale.getString("extensions.UninstallOk", {extension: payload[0]}));
                    }
                    if (topic[3] == "failed") {
                        growl.error(locale.getString("extensions.CommandFailed", {message: payload[1]}));
                    }
                    break;
                }

            }
        };

        this.getTypes = function () {
            // TODO: Need to work out how to reconnect
            if (eventSrc == null) {
                me.listen();
            }

            var tStart = new Date().getTime();
            var deferred = $q.defer();

            $http.get("/rest/extensions/types")
                .success(function (data) {
                    console.log("Fetch completed in", new Date().getTime() - tStart);

                    // Keep a local copy.
                    // This allows us to update the data later and keeps the GUI in sync.
                    angular.forEach(data, function (newType) {
                        var found = false;
                        angular.forEach(extensionTypeList, function (extensionType) {
                            if (extensionType.id == newType.id) {
                                for (var i in newType) {
                                    extensionType[i] = newType[i];
                                }
                                found = true;
                            }
                        });

                        // Is this a new type we've not seen before?
                        if (found == false) {
                            extensionTypeList.push(newType);
                        }
                    });

                    console.log("Processing completed in", new Date().getTime() - tStart);

                    deferred.resolve(extensionTypeList);
                })
                .error(function (data, status) {
                    deferred.reject();
                });

            return deferred.promise;
        };

        this.getExtensions = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            $http.get("/rest/extensions")
                .success(function (data) {
                    console.log("Fetch completed in", new Date().getTime() - tStart);

                    // Keep a local copy.
                    // This allows us to update the data later and keeps the GUI in sync.
                    angular.forEach(data, function (newExtension) {
                        var found = false;
                        angular.forEach(extensionList, function (extension) {
                            if (extension.id == newExtension.id) {
                                for (var i in newExtension) {
                                    extension[i] = newExtension[i];
                                }
                                found = true;
                            }
                        });

                        // Is this a new type we've not seen before?
                        if (found == false) {
                            extensionList.push(newExtension);
                        }
                    });

                    console.log("Processing completed in", new Date().getTime() - tStart);

                    deferred.resolve(extensionList);
                })
                .error(function (data, status) {
                    deferred.reject();
                });

            return deferred.promise;
        };

        this.installExtension = function (extension) {
            var deferred = $q.defer();

            extension.inprogress = true;
            $http.post("/rest/extensions/" + extension.id + "/install")
                .success(function (data) {
                    deferred.resolve(true);
                })
                .error(function (data, status) {
                    deferred.reject(false);
                });

            return deferred.promise;
        };

        this.uninstallExtension = function (extension) {
            var deferred = $q.defer();

            extension.inprogress = true;
            $http.post("/rest/extensions/" + extension.id + "/uninstall")
                .success(function (data) {
                    deferred.resolve(true);
                })
                .error(function (data, status) {
                    deferred.reject(false);
                });

            return deferred.promise;
        };

    })
;
