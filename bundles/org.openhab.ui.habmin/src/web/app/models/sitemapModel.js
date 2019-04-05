/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.sitemapModel', [
    'HABmin.userModel',
    'HABmin.restModel'
//    'ngResource'
])
    .service('SitemapModel', function ($http, $q, UserService, RestService) {
        var sitemapURL = '/rest/sitemaps';
        var svcName = 'sitemaps';
        var socket = null;

        var sitemapList = [];

        this.getList = function () {
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url).success(function (data, status) {
                        if (data.sitemap != null) {
                            sitemapList = [].concat(data.sitemap);
                        }
                        else {
                            sitemapList = [].concat(data);
                        }
                        deferred.resolve([].concat(sitemapList));
                    }).error(function (data, status) {
                        deferred.reject(data);
                    });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.getPage = function (page) {
            var deferred = $q.defer();

            RestService.getService(svcName).then(
                function (url) {
                    $http.get(url + "/" + page).success(function (data, status) {
                        // Some extra manipulation on data if you want...
                        deferred.resolve(data);
                    }).error(function (data, status) {
                        deferred.reject(data);
                    });
                },
                function () {
                    deferred.reject(null);
                }
            );

            return deferred.promise;
        };

        this.initWatch = function (page, onData) {
        };

        this.cancelWatch = function () {
        };

    });
