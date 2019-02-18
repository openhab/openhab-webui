/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chartSave', [
    'ui.bootstrap',
    'pickAColor',
    'HABmin.chartModel',
    'ngSanitize',
    'angular-growl',
    'ngLocalize',
    'HABmin.userModel'
])
    .service('ChartSave',
    function ($uibModal, $rootScope, ChartModel, growl, locale, UserService) {
        /**
         * Edits a chart given it's chart id.
         * First it loads the chart from the server, then calls the editor
         * @param chartId
         */
        this.editChart = function (chartId) {
            var me = this;

            ChartModel.getChart(chartId).then(function (chart) {
                me.saveChart(chart);
            });
        };

        /**
         * Edits the chart properties
         * @param chart
         * @returns {*}
         */
        this.saveChart = function (chart) {
            var scope = $rootScope.$new();
            scope.showTab = 0;
            scope.general = {
                name: chart.name,
                title: chart.title,
                icon: chart.icon,
                period: chart.period,
                legend: chart.legend
            };

            if (scope.general.legend !== 'false' && scope.general.legend !== false) {
                scope.general.legend = 'true';
            }

            scope.leftaxis = {};
            scope.rightaxis = {};
            if (chart.axis !== undefined) {
                angular.forEach([].concat(chart.axis), function (axis) {
                    if (axis == null) {
                        return;
                    }

                    switch (axis.position) {
                        case "left":
                            scope.leftaxis = {
                                label: axis.label,
                                format: Number(axis.format),
                                textColor: axis.color,
                                minimum: Number(axis.minimum),
                                maximum: Number(axis.maximum),
                                lineStyle: axis.lineStyle
                            };
                            break;
                        case "right":
                            scope.rightaxis = {
                                label: axis.label,
                                format: Number(axis.format),
                                textColor: axis.color,
                                minimum: Number(axis.minimum),
                                maximum: Number(axis.maximum),
                                lineStyle: axis.lineStyle
                            };
                            break;
                    }
                });
            }
            if (chart.items !== undefined) {
                scope.items = [];
                angular.forEach([].concat(chart.items), function (item) {
                    var itemModel = {};

                    // Default the axes to left
                    if (item.axis !== undefined && item.axis.toLowerCase() === 'right') {
                        itemModel.axis = 'right';
                    }
                    else {
                        itemModel.axis = 'left';
                    }
                    itemModel.item = item.item;
                    itemModel.label = item.label;
                    itemModel.format = item.format;
                    itemModel.fill = item.fill;
                    itemModel.fillColor = item.fillColor;
                    itemModel.lineColor = item.lineColor;
                    itemModel.lineStyle = item.lineStyle;
                    itemModel.lineWidth = Number(item.lineWidth);
                    itemModel.repeatTime = Number(item.repeatTime);
                    itemModel.points = Number(item.points);
                    itemModel.pointsSize = Number(item.pointsSize);
                    itemModel.chart = item.chart;

                    scope.items.push(itemModel);
                });
            }

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $uibModalInstance
             */
            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    var query = {};

                    // Make sure to set the ID
                    query.id = chart.id;

                    query.name = scope.general.name;
                    if (scope.general.title !== undefined) {
                        query.title = scope.general.title;
                    }
                    query.icon = scope.general.icon;
                    query.period = scope.general.period;
                    query.legend = scope.general.legend;

                    query.axis = [];
                    if (scope.leftaxis !== undefined) {
                        var leftAxis = {position: "left"};

                        if (scope.leftaxis.label !== undefined) {
                            leftAxis.label = scope.leftaxis.label;
                        }
                        if (scope.leftaxis.textColor !== undefined) {
                            leftAxis.color = scope.leftaxis.textColor;
                        }
                        if (!isNaN(scope.leftaxis.format)) {
                            leftAxis.format = scope.leftaxis.format;
                        }
                        if (!isNaN(scope.leftaxis.minimum)) {
                            leftAxis.minimum = scope.leftaxis.minimum;
                        }
                        if (!isNaN(scope.leftaxis.maximum)) {
                            leftAxis.maximum = scope.leftaxis.maximum;
                        }
                        if (scope.leftaxis.lineStyle !== undefined) {
                            leftAxis.lineStyle = scope.leftaxis.lineStyle;
                        }

                        query.axis.push(leftAxis);
                    }
                    if (scope.rightaxis !== undefined) {
                        var rightAxis = {position: "right"};

                        if (scope.rightaxis.label !== undefined) {
                            rightAxis.label = scope.rightaxis.label;
                        }
                        if (scope.rightaxis.textColor !== undefined) {
                            rightAxis.color = scope.rightaxis.textColor;
                        }
                        if (!isNaN(scope.rightaxis.format)) {
                            rightAxis.format = scope.rightaxis.format;
                        }
                        if (!isNaN(scope.rightaxis.minimum)) {
                            rightAxis.minimum = scope.rightaxis.minimum;
                        }
                        if (!isNaN(scope.rightaxis.maximum)) {
                            rightAxis.maximum = scope.rightaxis.maximum;
                        }
                        if (scope.rightaxis.lineStyle !== undefined) {
                            rightAxis.lineStyle = scope.rightaxis.lineStyle;
                        }
                        query.axis.push(rightAxis);
                    }
                    if (scope.items !== undefined) {
                        query.items = [];
                        angular.forEach([].concat(scope.items), function (item) {
                            var newItem = {};

                            newItem.item = item.item;
                            if (item.label != null) {
                                newItem.label = item.label;
                            }
                            if (item.lineColor != null) {
                                newItem.lineColor = item.lineColor;
                            }
                            if (item.chart != null) {
                                newItem.chart = item.chart;
                            }
                            if (item.lineStyle != null) {
                                newItem.lineStyle = item.lineStyle;
                            }
                            if (!isNaN(item.lineWidth)) {
                                newItem.lineWidth = item.lineWidth;
                            }
                            if (!isNaN(item.repeatTime)) {
                                newItem.repeatTime = item.repeatTime;
                            }
                            if (item.axis != null) {
                                newItem.axis = item.axis;
                            }
                            if (item.fill != null) {
                                newItem.fill = item.fill;
                            }
                            if (item.fillColor != null) {
                                newItem.fillColor = item.fillColor;
                            }
                            if (!isNaN(item.points)) {
                                newItem.points = item.points;
                            }
                            if (!isNaN(item.pointsSize)) {
                                newItem.pointsSize = item.pointsSize;
                            }

                            query.items.push(newItem);
                        });
                    }

                    console.log("Saving query", query);

                    ChartModel.putChart(query).then(
                        function () {
                            growl.success(locale.getString('chart.SaveSuccess', {chartName: query.name}));
                        },
                        function (error) {
                            growl.warning(locale.getString('chart.SaveError',
                                {chartName: query.name, error: error}));
                        });

                    $uibModalInstance.close(result);
                };
                $scope.cancel = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            return $uibModal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                size: 'lg',
                templateUrl: 'chart/chartSave.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

    .directive('chartSaveGeneral', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'chart/chartSaveGeneral.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

    .directive('chartSaveItem', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'chart/chartSaveItem.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

    .directive('chartSaveAxis', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'chart/chartSaveAxis.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

    .directive('selectLineStyle', function ($window, $sce) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                ngModel: '='
            },
            template: '' +
            '<div class="line-selector dropdown"><a class="dropdown-toggle" data-toggle="dropdown">' +
            '<span class="selected" ng-bind-html="getSelected()">' +
            '</span>' +
            '</a>' +
            '<ul class="dropdown-menu" role="menu">' +
            '<li ng-repeat="choice in styles"><a ng-click="setStyle(choice)">' +
            '<span ng-bind-html="getStyle(choice)"></span>' +
            '</a></li>' +
            '</ul>' +
            '</div>',
            link: function ($scope, $element, $state) {
                // Define the array of line styles
                $scope.styles = [
                    {name: "Solid", array: [5, 0]},
                    {name: "ShortDash", array: [7, 3]},
                    {name: "ShortDot", array: [3, 3]},
                    {name: "ShortDashDot", array: [7, 3, 3, 3]},
                    {name: "ShortDashDotDot", array: [7, 3, 3, 3, 3, 3]},
                    {name: "Dot", array: [3, 7]},
                    {name: "Dash", array: [10, 7]},
                    {name: "LongDash", array: [20, 7]},
                    {name: "DashDot", array: [10, 7, 3, 7]},
                    {name: "LongDashDot", array: [20, 7, 3, 7]},
                    {name: "LongDashDotDot", array: [20, 7, 3, 7, 3, 7]}
                ];

                // By default, select the solid line
                $scope.selected = $scope.styles[0];

                // If there's a line style specified, then see if it's valid and use it
                if ($scope.ngModel !== undefined) {
                    var val = $scope.ngModel.toLowerCase();
                    angular.forEach($scope.styles, function (style) {
                        if (style.name.toLowerCase() === val) {
                            $scope.selected = style;
                        }
                    });
                }

                // Return a trusted HTML for the styles
                $scope.getStyle = function (style) {
                    return $sce.trustAsHtml('<svg width="100%" height="10px"><line x1="0" x2="426" y1="5" y2="5" stroke-width="2" stroke-linecap="butt" stroke-dasharray="' +
                    style.array.join(",") + '"/></svg>');
                };

                // Sets the style when the user selects from the menu
                $scope.setStyle = function (style) {
                    $scope.selected = style;
                    $scope.ngModel = style.name;
                };

                // Gets the selected style as trusted HTML
                $scope.getSelected = function () {
                    return $sce.trustAsHtml('<svg width="100%" height="10px"><line x1="0" x2="426" y1="5" y2="5" stroke-width="2" stroke-linecap="butt" stroke-dasharray="' +
                    $scope.selected.array.join(",") + '"/></svg>');
                };
            }
        };
    })
;
