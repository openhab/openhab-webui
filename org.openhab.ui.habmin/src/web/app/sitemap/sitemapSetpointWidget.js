/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapSetpointWidget', [
    'HABmin.iconModel'
])
    .directive('sitemapSetpoint', function (ImgFactory) {
        return {
            restrict: 'E',
            template: '<habmin-icon class="icon-lg sitemap-widget-icon" icon="{{widget.icon}}"></habmin-icon>' +
            '<div class="sitemap-widget-content">' +
            '  <span ng-style="labelColor">{{widget.label}}</span>' +
            '  <span class="pull-right">' +
            '  <button type="button" class="btn btn-primary btn-sm" ng-click="click(1)"><span class="fa fa-chevron-circle-up"></span></button>' +
            '  <span ng-style="valueColor">{{widget.value}}</span>' +
            '  <button type="button" class="btn btn-primary btn-sm" ng-click="click(-1)"><span class="fa fa-chevron-circle-down"></span></button>' +
            '</div>',
            scope: {
                itemId: "@",
                itemModel: "=",
                widget: "="
            },
            link: function ($scope, element, attrs, controller) {
                if ($scope.widget === undefined) {
                    return;
                }

                // Default the step to 1
                if ($scope.widget.step === undefined) {
                    $scope.widget.step = 1;
                }

                // minValue maxValue step
                $scope.$on('habminGUIRefresh', function (newValue, oldValue) {
                    updateWidget();
                    $scope.$apply();
                });

                if ($scope.widget.item !== undefined) {
                    $scope.click = function (val) {
                        console.log("Changed setpoint", $scope.widget.label, val);

                        $scope.currentValue += ($scope.widget.step * val);
                        if ($scope.widget.minValue !== undefined &&
                            $scope.currentValue < parseInt($scope.widget.minValue, 10)) {
                            $scope.currentValue = parseInt($scope.widget.minValue, 10);
                        }
                        if ($scope.widget.maxValue !== undefined &&
                            $scope.currentValue > parseInt($scope.widget.maxValue, 10)) {
                            $scope.currentValue = parseInt($scope.widget.maxValue, 10);
                        }
                        $scope.$emit('habminGUIUpdate', $scope.widget.item.name, $scope.currentValue);
                    };
                }

                function updateWidget() {
                    if ($scope.widget.item !== undefined) {
                        $scope.value = $scope.widget.item.state;
                    }

                    if ($scope.widget.labelcolor != null) {
                        $scope.labelColor = {color: $scope.widget.labelcolor};
                    }
                    if ($scope.widget.valuecolor) {
                        $scope.valueColor = {color: $scope.widget.valuecolor};
                    }

                    // Keep a record of the current value so we can detect changes from the GUI
                    // and avoid changes coming from the server!
                    $scope.currentValue = parseInt($scope.value, 10);
                }

                // And then watch for changes
                $scope.$on('smarthome/items/' + $scope.itemId + "/state", function (event, state) {
                    var num = Number(state.value);
                    if (!isNaN(num)) {
                        $scope.currentValue = num;
                    }
                    $scope.$apply();
                });

                updateWidget();
            }
        };
    });
