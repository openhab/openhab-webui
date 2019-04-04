/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ResizePanel', [])
    .directive('resizePanel', function ($window) {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs) {
                var top = element[0].offsetTop;
                var w = angular.element($window);
                $scope.getWindowDimensions = function () {
                    if ($(element).is(":visible") === false) {
                        return;
                    }

                    var pa = element.parent('.panel');
                    var top = pa.offset().top;
                    var h = pa[0].offsetHeight;
                    var h1 = element[0].offsetHeight;
                    $scope.headerSize = h - h1;

                    var pHeight = (w.height() - $scope.headerSize - top - 25);
                    element.css('height', pHeight + 'px');
                    return {
                        'h': w.height()
                    };
                };
                $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
                }, true);

                w.bind('resize', function () {
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            }
        };
    })

;