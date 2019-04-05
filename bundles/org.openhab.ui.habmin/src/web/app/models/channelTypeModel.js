/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.channelTypeModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('ChannelTypeModel', function ($http, $q, UserService, RestService) {
        var svcChannelTypes = "channel-types";
        var channelTypeList = [];

        this.getList = function (update) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcChannelTypes).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(null);
                        return deferred.promise;
                    }

                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            angular.forEach(data, function (newChannelType) {
                                var found = false;
                                angular.forEach(channelTypeList, function (channelType) {
                                    if (channelType.id == newChannelType.id) {
                                        // Copy new data over old
                                        for (var i in newChannelType) {
                                            channelType[i] = newChannelType[i];
                                        }
                                        found = true;
                                    }
                                });

                                // Is this a new channelType we've not seen before?
                                if (found == false) {
                                    channelTypeList.push(newChannelType);
                                }
                            });

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(channelTypeList);
                        })
                        .error(function (data, status) {
                            deferred.reject();
                        });
                },
                function () {
                    deferred.reject();
                }
            );

            return deferred.promise;
        };

        this.getChannelType = function (uid) {
            var deferred = $q.defer();

            var found = false;
            angular.forEach(channelTypeList, function (channelType) {
                if (channelType.UID == uid) {
                    deferred.resolve(channelType);
                    found = true;
                }
            });

            // Is this a new channelType we've not seen before?
            if (found == true) {
                return deferred.promise;
            }

            RestService.getService(svcChannelTypes).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(null);
                        return deferred.promise;
                    }

                    $http.get(url + "/" + uid)
                        .success(function (data) {
                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            var found = false;
                            var response = data;
                            angular.forEach(channelTypeList, function (channelType) {
                                if (channelType.UID == data.UID) {
                                    // Copy new data over old
                                    for (var i in data) {
                                        channelType[i] = data[i];
                                    }
                                    found = true;
                                    response = channelType;
                                }
                            });

                            // Is this a new channelType we've not seen before?
                            if (found == false) {
                                channelTypeList.push(data);
                            }

                            deferred.resolve(response);
                        })
                        .error(function (data, status) {
                            deferred.reject();
                        });
                },
                function () {
                    deferred.reject();
                }
            );

            return deferred.promise;
        }
    }
);
