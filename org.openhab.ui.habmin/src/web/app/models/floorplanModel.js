/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.floorplanModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('FloorplanModel', function ($http, $q, UserService, RestService) {
        var svcName = "habmin/floorplan";
        var floorplanList = [];

        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            floorplanList = [].concat(data);
                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(floorplanList);
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

        this.getFloorplan = function (id) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url + "/" + id)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            console.log("Store completed in", new Date().getTime() - tStart);

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


        this.putFloorplan = function (floorplan) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (floorplan.id !== undefined && Number(floorplan.id) > 0) {
                        // This is an existing floorplan - use PUT
                        $http.put(url + "/" + floorplan.id, floorplan)
                            .success(function (data) {
                                console.log("PUT completed in", new Date().getTime() - tStart);

                                // Update the name in the cache. This will update the GUI if needed.
                                angular.forEach(floorplanList, function (c) {
                                    if (c.id === floorplan.id) {
                                        c.name = floorplan.name;
                                        c.category = floorplan.category;
                                    }
                                });

                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                    else {
                        // This is an new floorplan - use POST
                        $http.post(url, floorplan)
                            .success(function (data) {
                                console.log("POST completed in", new Date().getTime() - tStart);

                                floorplanList.push(data);

                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }

                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };


        this.deleteFloorplan = function (id) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (id !== undefined && Number(id) > 0) {
                        $http['delete'](url + "/" + id)
                            .success(function (data) {
                                console.log("DELETE completed in", new Date().getTime() - tStart);

                                var ref = 0;

                                // Remove from cache. This will update the GUI if needed.
                                angular.forEach(floorplanList, function (c, key) {
                                    if (c.id === id) {
                                        ref = key;
                                    }
                                });

                                if (ref !== 0) {
                                    floorplanList.splice(ref, 1);
                                }
                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

    });