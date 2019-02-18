/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardItemWidgets', [
    'HABmin.iconModel',
    'HABmin.itemModel'
])
    .directive('dashboardText', function (ItemModel) {
        return {
            restrict: 'E',
            template: '<habmin-icon class="icon-lg sitemap-widget-icon" category="{{item.category}}"></habmin-icon>' +
            '<div class="sitemap-widget-content">' +
            '  <span ng-style="labelStyle">{{item.label}}</span>' +
            '  <span class="pull-right" ng-style="valueStyle">{{item.value}}</span>' +
            '</div>',
            scope: {
                itemModel: "=",
                item: "="
            },
            link: function ($scope, element, attrs, controller) {
                // First poll the current value
                var item = ItemModel.getItem($scope.item.name);
                if (item != null) {
                    $scope.item.value = item.state;
                }

                // And then watch for changes
                $scope.$on('smarthome/state/' + $scope.item.name + "/state", function (event, value) {
                    $scope.item.value = value;
                    $scope.$apply();
                });
            }
        };
    })

    .directive('dashboardSwitch', function (ItemModel) {
        return {
            restrict: 'E',
            template: '<habmin-icon class="icon-lg sitemap-widget-icon" icon="{{item.category}}"></habmin-icon>' +
            '<div class="sitemap-widget-content">' +
            '  <span ng-style="labelColor">{{item.label}}</span>' +
            '  <span class="pull-right">' +
            '  <span ng-style="valueColor"></span>' +
            '  <small>' +
            '    <toggle-switch ng-model="value" on-label="ON" off-label="OFF"></toggle-switch>' +
            '  </small>' +
            '</div>',
            scope: {
                itemModel: "=",
                item: "="
            },
            link: function ($scope, element, attrs, controller) {
                // First poll the current value
                var item = ItemModel.getItem($scope.item.name);
                if (item != null) {
                    $scope.updateValue(item.state);
                }

                // And then watch for changes
                $scope.$on('smarthome/state/' + $scope.item.name + "/state", function (event, value) {
                    $scope.updateValue(value);
                    $scope.$apply();
                });

                $scope.updateValue = function (value) {
                    // Handle state translation
                    switch ($scope.item.type) {
                        case "Dimmer":
                            if (parseInt(value, 10) > 0) {
                                $scope.value = true;
                            }
                            else {
                                $scope.value = false;
                            }
                            break;
                        case "Switch":
                            if (value == "ON") {
                                $scope.value = true;
                            }
                            else {
                                $scope.value = false;
                            }
                            break;
                    }
                };
            }
        };
    })
;
