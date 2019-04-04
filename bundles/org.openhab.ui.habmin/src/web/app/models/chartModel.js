/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chartModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('ChartModel', function ($http, $q, UserService, RestService) {
        var svcName = "habmin/charts";
        var chartList = [];

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
                            if (data.chart != null) {
                                chartList = [].concat(data.chart);
                            }
                            else {
                                chartList = [].concat(data);
                            }
                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(chartList);
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

        this.getChart = function (id) {
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


        this.putChart = function (chart) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (chart.id !== undefined && Number(chart.id) > 0) {
                        // This is an existing chart - use PUT
                        $http.put(url + "/" + chart.id, chart)
                            .success(function (data) {
                                console.log("PUT completed in", new Date().getTime() - tStart);

                                // Update the name in the cache. This will update the GUI if needed.
                                angular.forEach(chartList, function (c) {
                                    if (c.id === chart.id) {
                                        c.name = chart.name;
                                    }
                                });

                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                    else {
                        // This is an new chart - use POST
                        $http.post(url, chart)
                            .success(function (data) {
                                console.log("POST completed in", new Date().getTime() - tStart);

                                chartList.push(chart);

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


        this.deleteChart = function (id) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (id !== undefined && Number(id) > 0) {
                        $http['delete'](url + "/" + id)
                            .success(function (data) {
                                console.log("DELETE completed in", new Date().getTime() - tStart);

                                var ref = 0;

                                // Update the name in the cache. This will update the GUI if needed.
                                angular.forEach(chartList, function (c, key) {
                                    if (c.id === id) {
                                        ref = key;
                                    }
                                });

                                if (ref !== 0) {
                                    chartList.splice(ref, 1);
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