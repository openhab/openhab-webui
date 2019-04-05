/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardChartWidget', [
    'habminChart',
    'HABmin.chartModel',
    'HABmin.persistenceModel',
    'angular-growl'
])
    .directive('dashboardChart', function () {
        return {
            restrict: 'E',
            templateUrl: 'dashboard/dashboardChartWidget.tpl.html',
            scope: {
                options: "="
            },
            link: function ($scope, element, attrs, controller) {
//                $scope.chartId = $scope.options.chartId;
//                $scope.serviceId = $scope.options.serviceId;
            }
        };
    })

    .directive('dashboardChartProperties', function ($window, growl, ChartModel, PersistenceServiceModel) {
        return {
            restrict: 'E', // Use as element
            templateUrl: 'dashboard/dashboardChartProperties.tpl.html',
            scope: {
                options: "="
            },
            link: function ($scope, $element, $state) {
                // The select is expecting an int!
                $scope.options.chartId = parseInt($scope.options.chartId, 10);

                // Load the list of charts
                ChartModel.getList().then(
                    function (charts) {
                        $scope.charts = charts;
                    },
                    function (reason) {
                        // handle failure
                        growl.warning(locale.getString('habmin.chartErrorGettingCharts'));
                    }
                );

                // Load the list of persistence services
                PersistenceServiceModel.getList().then(
                    function (data) {
                        $scope.services = [].concat(data);
                    },
                    function (reason) {
                        // handle failure
                        growl.warning(locale.getString('habmin.chartErrorGettingServices'));
                    }
                );
            }
        };
    })

;
