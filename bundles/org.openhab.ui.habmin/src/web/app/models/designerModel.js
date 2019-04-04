/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.designerModel', [
    'HABmin.userModel',
    'HABmin.restModel'
])

    .service('DesignerModel', function ($http, $q, UserService, RestService) {
        ruleList = [];
        svcName = "habmin/designer";

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
                            ruleList = [].concat(data.designs);
                            console.log("Processing completed in", new Date().getTime() - tStart);

                            deferred.resolve(ruleList);
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

        this.getRule = function (id) {
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

        this.putRule = function (rule) {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    if (rule.id !== undefined && Number(rule.id) > 0) {
                        $http.put(url + "/" + rule.id, rule)
                            .success(function (data) {
                                console.log("PUT completed in", new Date().getTime() - tStart);

                                // Update the name in the cache. This will update the GUI if needed.
                                angular.forEach(ruleList, function (r) {
                                    if (r.id === rule.id) {
                                        r.name = rule.name;
                                    }
                                });

                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                    else {
                        $http.post(url + "/", rule)
                            .success(function (data) {
                                console.log("POST completed in", new Date().getTime() - tStart);

                                ruleList.push(data);

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

        this.deleteRule = function (id) {
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
                                angular.forEach(ruleList, function (r, key) {
                                    if (r.id === id) {
                                        ref = key;
                                    }
                                });

                                if (ref !== 0) {
                                    ruleList.splice(ref, 1);
                                }
                                deferred.resolve(data);
                            })
                            .error(function (data, status) {
                                deferred.reject(data);
                            });
                    }
                    else {
                        deferred.reject(data);
                    }
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };
    })
;