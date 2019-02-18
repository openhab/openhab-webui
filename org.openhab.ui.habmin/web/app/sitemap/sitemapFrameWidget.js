/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapFrameWidget', [])

    .directive('sitemapFrame', function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '<div class="col-md-3 box box-default collapsed-box">' +
            '<div class="box-header with-border">' +
            '  <h3 class="box-title">' +
            '    <habmin-icon class="icon-lg" icon="{{widget.icon}}"></habmin-icon>' +
            '    <span ng-style="labelColor">{{widget.label}}</span>' +
            '    <span class="pull-right" ng-style="valueColor"></span>' +
            '  </h3>' +
            '</div>' +
            '<div class="sitemap-frame" ng-transclude></div>' +
            '</div>',
            scope: {
                itemId: "@",
                itemModel: "=",
                widget: "="
            },
            link: function ($scope, element, attrs, controller) {
                if ($scope.widget.labelcolor != null) {
                    $scope.labelColor = {color: $scope.widget.labelcolor};
                }
                if ($scope.widget.valuecolor) {
                    $scope.valueColor = {color: $scope.widget.valuecolor};
                }
            }
        };
    })
;
