/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.serviceModel', [
    'angular-growl',
    'ngLocalize'
])

    .service('ServiceModel', function ($http, $q, locale, growl) {
        var serviceList = [];
        var me = this;

        this.getServices = function () {
            var deferred = $q.defer();

            $http.get("/rest/services")
                .success(function (data) {
                    // Keep a local copy.
                    // This allows us to update the data later and keeps the GUI in sync.
                    angular.forEach(data, function (newService) {
                        var found = false;
                        angular.forEach(serviceList, function (service) {
                            if (service.id == newService.id) {
                                for (var i in newService) {
                                    service[i] = newService[i];
                                }
                                found = true;
                            }
                        });

                        // Is this a new service we've not seen before?
                        if (found == false) {
                            serviceList.push(newService);
                        }
                    });

                    deferred.resolve(serviceList);
                })
                .error(function (data, status) {
                    deferred.reject();
                });

            return deferred.promise;
        };

        this.getServiceConfig = function (service) {
            var deferred = $q.defer();

            $http.get("/rest/services/" + service.id + "/config")
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.putServiceConfig = function (service, config) {
            var deferred = $q.defer();

            $http.put("/rest/services/" + service.id + "/config", config)
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    })
;