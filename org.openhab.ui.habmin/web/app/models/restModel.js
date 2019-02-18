/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.restModel', [
    'HABmin.userModel'
])

    .service('RestService', function ($http, $q, $rootScope, UserService) {
        // Service defaults. We default this to OH1 since OH2 provides the information
        var serviceList = {
            'habmin/designer': '/services/habmin/config/designer',
            'habmin/charts': '/services/habmin/persistence/charts',
            'sitemaps': '/rest/sitemaps',
            'items': '/rest/items',
            'habmin/persistence': '/services/habmin/persistence/services',

            // OH1 only
            'habmin/persistenceitem': '/services/habmin/persistence/items',
            'bindings': '/services/habmin/config/bindings',
            'habmin/dashboards': '/services/habmin/dashboards',
            'habmin/zwave': '/services/habmin/zwave'
        };

        var deferredList = [];
        var initialised = false;
        var me = this;
        var errorCnt = 0;

        this.isServiceSupported = function (svc) {
            if (serviceList[svc] == null) {
                return false;
            }
            return true;
        };

        this.updateServices = function () {
            var tStart = new Date().getTime();
            var deferred = $q.defer();
            deferredList.push(deferred);

            console.log("REST start get", new Date());
            var url = UserService.getServer() + '/rest';
            $http.get(url)
                .success(function (data) {
                    initialised = true;
                    console.log("REST Fetch completed in", new Date().getTime() - tStart);

                    // Handle the online status
                    if (errorCnt == 2) {
                        errorCnt = 0;
                        $rootScope.$broadcast('habminOnline', true);
                    }

                    // Handle the different responses between OH1 and OH2
                    var links;
                    if (data.links != null) {
                        links = data.links;
                    }
                    else {
                        links = data.link;
                    }

                    // For OH2, we use the list from the server directly
                    // This removes any OH1 defaults we've added
                    if (data.version != null) {
                        serviceList = {};
                    }

                    // Copy all the service links into the service list
                    angular.forEach(links, function (svc) {
                        //  create an anchor element (note: no need to append this element to the document)
                        var link = document.createElement('a');

                        //  set href to any path
                        link.setAttribute('href', svc.url);

                        serviceList[svc.type] = link.pathname;

                        //  cleanup for garbage collection
                        link = null;
                    });
                    console.log("REST Processing completed in", new Date().getTime() - tStart);

                    if (deferredList != null) {
                        angular.forEach(deferredList, function (deferred) {
                            deferred.resolve();
                        });
                        deferredList = [];
                    }
                })
                .error(function (data, status) {
                    console.log("REST Processing failed in", new Date().getTime() - tStart);
                    // Handle the online status
                    if (errorCnt++ == 2) {
                        errorCnt--;
                        $rootScope.$broadcast('habminOnline', false);
                    }

                    if (deferredList != null) {
                        angular.forEach(deferredList, function (deferred) {
                            deferred.reject();
                        });
                        deferredList = [];
                    }
                });

            return deferred.promise;
        };

        // Return a url to the requested service
        this.getService = function (svc) {
            var deferred = $q.defer();
            if (initialised === true) {
                if (serviceList[svc] == null) {
                    console.log("Request for unknown service", svc);
                    deferred.resolve(null);
                }
                else {
                    deferred.resolve(UserService.getServer() + serviceList[svc]);
                }
                return deferred.promise;
            }

            me.updateServices().then(
                function () {
                    if (serviceList[svc] == null) {
                        console.log("Request for unknown service", svc);
                        deferred.resolve(null);
                    }
                    else {
                        deferred.resolve(UserService.getServer() + serviceList[svc]);
                    }
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };
    });