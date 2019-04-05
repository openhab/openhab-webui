/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardImageWidget', [])
    .directive('dashboardImage', function () {
        return {
            restrict: 'E',
            template: '<div style="display:inline-block;height:100%;width:100%"><img ng-src="{{options.uri}}" class="fade" ng-style="style"></div>',
            scope: {
                options: "="
            },
            link: function ($scope, element) {
                $scope.style = {};

                var divElement = element.children();
                var imgElement = divElement.children();

                // Resize the image.
                // Actually, we let CSS do the resizing, we just need
                // to work out how to constrain it
                $scope.resizeImage = function () {
                    var imgH = imgElement[0].naturalHeight;
                    var imgW = imgElement[0].naturalWidth;

                    var h = divElement.height();
                    var w = divElement.width();

                    var rH = h / imgH;
                    var rW = w / imgW;

                    if (rW > rH) {
                        $scope.style = {height: "100%"};
                    }
                    else {
                        $scope.style = {width: "100%"};
                    }
                };

                $scope.$on('gridster-item-resized', function (event, newSizes) {
                    $scope.resizeImage();
                });

                $scope.$on('gridster-item-transition-end', function (event, newSizes) {
                    $scope.resizeImage();
                });

                imgElement.bind('load', function () {
                    $scope.resizeImage();
                    $scope.$apply();
                    imgElement.addClass('in');
                });
                imgElement.bind('error', function () {
                    console.log("Error loading img");
                });
                $scope.$watch('ngSrc', function (newVal) {
                    imgElement.removeClass('in');
                });
            }
        };
    })

    .directive('dashboardImageProperties', function () {
        return {
            restrict: 'E', // Use as element
            scope: {
                options: "="
            },
            templateUrl: 'dashboard/dashboardImageProperties.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

;
