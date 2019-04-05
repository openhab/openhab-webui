/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapTextWidget', [
    'HABmin.iconModel'
])
    .directive('sitemapText', function (ImgFactory) {
        return {
            restrict: 'E',
            template: '<habmin-icon class="icon-lg sitemap-widget-icon" icon="{{widget.icon}}"></habmin-icon>' +
            '<div class="sitemap-widget-content">' +
            '  <span ng-style="labelColor">{{widget.label}}</span>' +
            '  <span class="pull-right" ng-style="valueColor">{{itemModel}}</span>' +
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

                // And then watch for changes
                $scope.$on('smarthome/items/' + $scope.itemId + "/state", function (event, state) {
                    var num = Number(state.value);
                    if (!isNaN(num)) {
                        $scope.itemModel = num;
                    }
//                    $scope.$apply();
                });
            }
        };
    })
;
