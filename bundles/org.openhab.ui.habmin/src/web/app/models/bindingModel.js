/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.bindingModel', [
    'HABmin.userModel',
    'HABmin.restModel',
    'angular-growl',
])

    .service('BindingModel', function ($http, $q, UserService, RestService, growl) {
        var svcBind = "bindings";
        var svcDisc = "discovery";
        var iconList = {
            astro: {icon: "moon"},
            sonos: {icon: "soundcloud"},
            yahooweather: {icon: "weather"},
            zwave: {icon: "zwave"}
        };
        var bindingList = [];
        var eventSrc;

        var me = this;

        this.listen = function () {
            return;
            eventSrc = new EventSource("/rest/events?topics=smarthome/binding/*");

            eventSrc.addEventListener('message', function (event) {
                console.log(event.data);

                var evt = angular.fromJson(event.data);
                var payload = angular.fromJson(evt.payload);
                var topic = evt.topic.split("/");

                switch (evt.type) {
                    case 'BindingEvent':
                        growl.warning(payload.message);
                        break;
                }
            });
        };


        this.getList = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();

            var defBind = $q.defer();
            RestService.getService(svcBind).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(null);
                        return;
                    }

                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // OH1 detection
                            if (data.binding != null) {
                                data = data.binding;
                            }

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            angular.forEach(data, function (newBinding) {
                                var found = false;
                                angular.forEach(bindingList, function (binding) {
                                    if (binding.id == newBinding.id) {
                                        for (var i in newBinding) {
                                            binding[i] = newBinding[i];
                                        }
                                        found = true;
                                    }
                                });

                                // Is this a new binding we've not seen before?
                                if (found == false) {
                                    bindingList.push(newBinding);
                                }
                            });

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            defBind.resolve();
                        })
                        .error(function (data, status) {
                            defBind.reject();
                        });
                },
                function () {
                    defBind.reject();
                }
            );

            var defDisc = $q.defer();
            RestService.getService(svcDisc).then(
                function (url) {
                    if (url == null) {
                        defDisc.resolve();
                        return defDisc.promise;
                    }

                    $http.get(url)
                        .success(function (data) {
                            console.log("Fetch completed in", new Date().getTime() - tStart);

                            // Keep a local copy.
                            // This allows us to update the data later and keeps the GUI in sync.
                            angular.forEach(data, function (newBinding) {
                                var found = false;
                                angular.forEach(bindingList, function (binding) {
                                    if (binding.id == newBinding) {
                                        binding.discovery = true;
                                        found = true;
                                    }
                                });

                                if (found == false) {
                                    bindingList.push({id: newBinding, discovery: true});
                                }
                            });

                            console.log("Processing completed in", new Date().getTime() - tStart);

                            defDisc.resolve();
                        })
                        .error(function (data, status) {
                            defDisc.reject();
                        });
                },
                function () {
                    defDisc.reject();
                }
            );

            // Wait for all the promises to be resolved
            $q.all([defBind.promise, defDisc.promise]).then(
                function () {
                    deferred.resolve(bindingList);
                }
            );

            return deferred.promise;
        };

        this.startDiscovery = function (binding) {
            var deferred = $q.defer();

            RestService.getService(svcDisc).then(
                function (url) {
                    if (url == null) {
                        deferred.resolve(false);
                        return deferred.promise;
                    }

                    $http.post(url + "/bindings/" + binding + "/scan") //, {bindingId: binding})
                        .success(function (data) {
                            deferred.resolve(true);
                        })
                        .error(function (data, status) {
                            deferred.reject(false);
                        });
                },
                function () {
                    deferred.reject(false);
                }
            );

            return deferred.promise;
        };

    })
;
