/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ngCron', [
    'ui.bootstrap'
])
    .directive('ngCron', function ($window, $uibModal, $rootScope, $timeout) {
        return {
            restrict: 'E',

            link: function (scope, element, attrs) {
            }
        };
    }
);

