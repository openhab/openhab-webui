/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardGaugeWidget', [
    "angular-dialgauge",
    'angular-growl',
    'HABmin.itemModel',
    'ngLocalize',
    'ui.select'
])
    .directive('dashboardGauge', function (ItemModel) {
        return {
            restrict: 'E',
            templateUrl: 'dashboard/dashboardGaugeWidget.tpl.html',
            scope: {
                options: "="
            },
            link: function ($scope) {
                $scope.options.percent = true;
//                $scope.borderWidth = $scope.options.borderWidth;
                $scope.$watch("options", function (newOptions) {
//                    $scope.value++;
//                    $scope.options = {borderWidth:4};
//                    $scope.borderWidth = $scope.options.borderWidth;
                });
            },
            controller: function ($scope) {
                // First poll the current value
                var item = ItemModel.getItem($scope.options.itemId);
                if (item != null) {
                    var num = Number(item.state);
                    if (!isNaN(num)) {
                        $scope.value = num;
                    }
                }

                // And then watch for changes
                $scope.$on('smarthome/items/' + $scope.options.itemId + "/state", function (event, state) {
                    var num = Number(state.value);
                    if (!isNaN(num)) {
                        $scope.value = num;
                    }
                    $scope.$apply();
                });
            }
        };
    })

    .directive('dashboardGaugeProperties', function ($window, growl, locale, ItemModel) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                options: '='
            },
            templateUrl: 'dashboard/dashboardGaugeProperties.tpl.html',
            link: function ($scope, $element, $state) {
                $scope.gaugeThemes = [
                    {
                        name: "",
                        desc: "",
                        options: {
                            barWidth: 20,
                            borderWidth: 0,
                            angle: 315,
                            rotate: 180,
                            barAngle: 0,
                            lineCap: 'butt',
                            percent: true
                        }
                    },
                    {
                        name: "",
                        desc: "",
                        options: {
                            barWidth: 20,
                            borderWidth: 0,
                            angle: 315,
                            rotate: 180,
                            barAngle: 10,
                            lineCap: 'round',
                            percent: true
                        }
                    }
                ];
                $scope.endCaps = [
                    {id: "round", name: locale.getString("dashboard.GaugeEndCapRound")},
                    {id: "butt", name: locale.getString("dashboard.GaugeEndCapSquare")}
                ];

                $scope.selectTheme = function (theme) {
                    if (theme == null || theme.options == null) {
                        return;
                    }
                    $scope.options.barWidth = theme.options.barWidth;
                    $scope.options.borderWidth = theme.options.borderWidth;
                    $scope.options.angle = theme.options.angle;
                    $scope.options.rotate = theme.options.rotate;
                    $scope.options.barAngle = theme.options.barAngle;
                };

                if ($scope.options.barWidth != null) {
                    $scope.options.barWidth = Number($scope.options.barWidth);
                }
                if ($scope.options.borderWidth != null) {
                    $scope.options.borderWidth = Number($scope.options.borderWidth);
                }
                if ($scope.options.angle != null) {
                    $scope.options.angle = Number($scope.options.angle);
                }
                if ($scope.options.rotate != null) {
                    $scope.options.rotate = Number($scope.options.rotate);
                }
                if ($scope.options.barAngle != null) {
                    $scope.options.barAngle = Number($scope.options.barAngle);
                }
                $scope.removeNull = function (item) {
                    if (item == null || item.label == null || item.label.title == null ||
                        item.label.title.length === 0) {
                        return false;
                    }
                    return true;
                };

                // Load the list of items
                ItemModel.getList().then(
                    function (items) {
                        $scope.items = items;
                    },
                    function (reason) {
                        // handle failure
                        growl.warning(locale.getString('habmin.chartErrorGettingItems'));
                    }
                );
            }
        };
    })
;
