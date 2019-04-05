/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.configModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])
    .service('ConfigModel', function ($http, $q, $rootScope, UserService, RestService) {
        var svcConfig = "config-descriptions";

        var me = this;

        this.getConfig = function (uri) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcConfig).then(
                function (url) {
                    $http.get(url + "/" + uri)
                        .success(function (data) {
                            angular.forEach(data.parameters, function (param) {
                                if (param.type == "BOOLEAN" && (param.options == null || param.options.length == 0)) {
                                    param.options = [
                                        {label: "true", value: "true"},
                                        {label: "false", value: "false"}
                                    ];
                                }
                            });

                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.putConfig = function (thing, cfg) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcConfig).then(
                function (url) {
                    $http.put(url + "/" + thing.UID + "/config", cfg)
                        .success(function (thing) {
                            me.addOrUpdateThing(thing);
                            deferred.resolve(thing);
                        })
                        .error(function (data, status) {
                            deferred.reject(data);
                        });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        function _convertType(type, value) {
            switch (type) {
                case "INTEGER":
                    if (value == null) {
                        return 0;
                    }
                    return Math.round(value);
                case "TEXT":
                    if (value == undefined) {
                        return "";
                    }
                    return value.toString();
                case "BOOLEAN":
                    if (value == undefined) {
                        return false;
                    }
                    return (value.toString() == "true");
                case "DECIMAL":
                    if (value == undefined) {
                        return 0.0;
                    }
                    return Number(value);
            }
        }

        this.convertType = function (type, value, multiple) {
            if (multiple) {
                value = [].concat(value);
            }
            if (angular.isArray(value)) {
                angular.forEach(value, function (val) {
                    val = _convertType(type, val);
                });
            }
            else {
                value = _convertType(type, value);
            }

            return value;
        };

    })
;
