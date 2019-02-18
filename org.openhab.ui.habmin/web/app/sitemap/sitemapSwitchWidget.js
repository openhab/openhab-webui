/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapSwitchWidget', [
    'HABmin.iconModel',
    'toggle-switch'
])
    .directive('sitemapSwitch', function (ImgFactory) {
        return {
            restrict: 'E',
            template: '<habmin-icon class="icon-lg sitemap-widget-icon" icon="{{widget.icon}}"></habmin-icon>' +
            '<div class="sitemap-widget-content">' +
            '  <span ng-style="labelColor">{{widget.label}}</span>' +
            '  <span class="pull-right">' +
            '  <span ng-style="valueColor"></span>' +
            '  <small>' +
            '    <toggle-switch ng-if="toggle" ng-model="value" on-label="ON" off-label="OFF"></toggle-switch>' +
            '    <ui-select ng-if="!toggle"' +
            '        ng-model="value"' +
            '        theme="bootstrap"' +
            '        on-select="selectUpdate($item)"' +
            '        search-enabled="false">' +
            '      <ui-select-match>{{$select.selected.label}}' +
            '      </ui-select-match>' +
            '      <ui-select-choices repeat="mapping.command as mapping in widget.mappings">' +
            '        <div>{{mapping.label}}</div>' +
            '      </ui-select-choices>' +
            '    </ui-select>' +
            '  </small>' +
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

                $scope.selectUpdate = function (item) {
                    if (item.command != $scope.currentValue) {
                        // Keep a record of the current value so we can detect changes from the GUI
                        // and avoid changes coming from the server!
                        $scope.currentValue = item.command;
                        $scope.$emit('habminGUIUpdate', $scope.widget.item.name, $scope.currentValue);
                    }
                };

                if ($scope.widget.mappings != null && $scope.widget.mappings.length > 0) {
                    $scope.toggle = false;

                    if ($scope.widget.item !== undefined) {
                        $scope.$watch('value', function (newValue, oldValue) {
                            console.log("Changed switch", $scope.widget.label, newValue, oldValue);
                            if (newValue != $scope.currentValue) {
                                // Keep a record of the current value so we can detect changes from the GUI
                                // and avoid changes coming from the server!
                                $scope.currentValue = newValue;
                                $scope.$emit('habminGUIUpdate', $scope.widget.item.name,
                                    $scope.currentValue === true ? "ON" : "OFF");
                            }
                        });
                    }
                }
                else {
                    $scope.toggle = true;

                    if ($scope.widget.item !== undefined) {
                        $scope.$watch('value', function (newValue, oldValue) {
                            console.log("Changed switch", $scope.widget.label, newValue, oldValue);
                            if (newValue != $scope.currentValue) {
                                // Keep a record of the current value so we can detect changes from the GUI
                                // and avoid changes coming from the server!
                                $scope.currentValue = newValue;
                                $scope.$emit('habminGUIUpdate', $scope.widget.item.name,
                                    $scope.currentValue === true ? "ON" : "OFF");
                            }
                        });
                    }
                }

                $scope.$on('habminGUIRefresh', function (newValue, oldValue) {
                    updateWidget();
                    $scope.$apply();
                });

                function updateWidget() {
                    if ($scope.widget.item !== undefined) {
                        // Handle state translation
                        switch ($scope.widget.item.type) {
                            case "Dimmer":
                                if (parseInt($scope.widget.item.state, 10) > 0) {
                                    $scope.value = true;
                                }
                                else {
                                    $scope.value = false;
                                }
                                break;
                            case "Switch":
                                if ($scope.widget.item.state == "ON") {
                                    $scope.value = true;
                                }
                                else {
                                    $scope.value = false;
                                }
                                break;
                            case "Number":
                                $scope.value = $scope.widget.item.state;
                                break;
                        }
                    }

                    if ($scope.widget.labelcolor != null) {
                        $scope.labelColor = {color: $scope.widget.labelcolor};
                    }
                    if ($scope.widget.valuecolor) {
                        $scope.valueColor = {color: $scope.widget.valuecolor};
                    }

                    // Keep a record of the current value so we can detect changes from the GUI
                    // and avoid changes coming from the server!
                    $scope.currentValue = $scope.value;
                }

                // And then watch for changes
                $scope.$on('smarthome/items/' + $scope.itemId + "/state", function (event, state) {
                    if (state.type == "OnOffType") {
                        $scope.value = (state.value == "ON") ? true : false;
                    }
                    else {
                        if ($scope.toggle == true) {
                            var num = Number(state.value);
                            if (!isNaN(num)) {
                                $scope.value = num == 0 ? false : true;
                            }
                        } else {
                            $scope.value = state.value;
                        }
                    }
                    // Keep a record of the current value so we can detect changes from the GUI
                    // and avoid changes coming from the server!
                    $scope.currentValue = $scope.value;

//                    $scope.$apply();
                });

                updateWidget();
            }
        };
    });
