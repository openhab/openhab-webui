/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapChartWidget', [
    'HABmin.iconModel',
    'habminChart'
])
    .directive('sitemapChart', function (ImgFactory) {
        return {
            restrict: 'E',
            template: '<div class="box box-success box-solid">' +
            '<habmin-chart style="display:inline-block;height:100%;width:100%" height="300" ' +
            'chart="chartId" service="serviceId"></habmin-chart>' +
            '</div>',
            scope: {
                itemModel: "=",
                widget: "="
            },
            link: function ($scope, element, attrs, controller) {
                $scope.chartId = 20;
                $scope.serviceId = "mysql";
                if ($scope.widget.labelcolor != null) {
                    $scope.labelColor = {color: $scope.widget.labelcolor};
                }
                if ($scope.widget.valuecolor) {
                    $scope.valueColor = {color: $scope.widget.valuecolor};
                }
            }
        };
    });
