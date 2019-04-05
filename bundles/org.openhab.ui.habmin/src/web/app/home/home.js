/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copywrite of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.home', [
    'ui.router',
    'HABmin.userModel'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
    .config(function config($stateProvider) {
        $stateProvider.state('home', {
            url: '/home',
            views: {
                "main": {
                    controller: 'HomeCtrl',
                    templateUrl: 'home/home.tpl.html'
                }
            },
            data: {pageTitle: 'Home'}
        });
    })

/**
 * And of course we define a controller for our route.
 */
    .controller('HomeCtrl', function HomeController($scope, UserService) {
        $scope.version = document.HABminVersionString;
        $scope.date = document.HABminVersionDate;
        $scope.phone = document.HABminCordova;
        $scope.server = UserService.getServer();
    })

;

