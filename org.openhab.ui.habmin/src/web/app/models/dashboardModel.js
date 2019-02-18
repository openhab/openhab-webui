/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.dashboardModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('DashboardModel', function ($http, $q, UserService, RestService) {
        var svcName = "habmin/dashboards";
        var dashboardList = [];

        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            if (data.dashboard != null) {
                                data = data.dashboard;
                            }
                            dashboardList = [].concat(data);
                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(dashboardList);
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

        this.getDashboard = function (id) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    $http.get(url + "/" + id)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            console.log("Store completed in", new Date().getTime() - tStart);

                            // Make sure widgets is an array
                            data.widgets = [].concat(data.widgets);

                            // Handle the correct types.
                            // Especially important for gridster
                            angular.forEach(data.widgets, function (widget) {
                                widget.row = Number(widget.row);
                                widget.col = Number(widget.col);
                                widget.sizeX = Number(widget.sizeX);
                                widget.sizeY = Number(widget.sizeY);
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


        this.saveDashboard = function (dashboard) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    if (dashboard.id !== undefined && Number(dashboard.id) > 0) {
                        // This is an existing dashboard - use PUT
                        $http.put(url + "/" + dashboard.id, dashboard)
                            .success(function (data) {
                                console.log("PUT completed in", new Date().getTime() - tStart);

                                // Update the cache. This will update the GUI if needed.
                                angular.forEach(dashboardList, function (c) {
                                    if (c.id === dashboard.id) {
                                        c.name = dashboard.name;
                                        c.category = dashboard.category;
                                        c.menu = dashboard.menu;
                                    }
                                });

                                // Make sure widgets is an array
                                data.widgets = [].concat(data.widgets);
                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                    else {
                        // This is an new dashboard - use POST
                        $http.post(url, dashboard)
                            .success(function (data) {
                                console.log("POST completed in", new Date().getTime() - tStart);

                                dashboardList.push(data);

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


        this.deleteDashboard = function (id) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return;
                    }

                    if (id !== undefined && Number(id) > 0) {
                        $http['delete'](url + "/" + id)
                            .success(function (data) {
                                console.log("DELETE completed in", new Date().getTime() - tStart);

                                var ref = 0;

                                // Update the cache. This will update the GUI if needed.
                                angular.forEach(dashboardList, function (c, key) {
                                    if (c.id === id) {
                                        ref = key;
                                    }
                                });

                                if (ref !== 0) {
                                    dashboardList.splice(ref, 1);
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