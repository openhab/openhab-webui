/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.dashboard', [
    'ui.router',
    'gridster',
    'HABmin.dashboardModel',
    'dashboardButtonWidget',
    'dashboardChartWidget',
    'dashboardGaugeWidget',
    'dashboardImageWidget',
    'dashboardGroupWidget',
    'dashboardGroupBarWidget',
    'dashboardFloorWidget',
    'dashboardProperties',
    'dashboardWidgetProperties',
    'angular-growl',
    'ngLocalize'
])
    .config(function config($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/dashboard/:dashboardId',
            views: {
                "main": {
                    controller: 'DashboardCtrl',
                    templateUrl: 'dashboard/dashboard.tpl.html'
                },
                "menu": {
                    controller: 'DashboardCtrlMenu',
                    templateUrl: 'dashboard/dashboardMenu.tpl.html'
                }
            },
            data: {pageTitle: 'Dashboard'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function ($q, locale) {
                    return $q.all([
                        locale.ready('common'),
                        locale.ready('dashboard')
                    ]);
                }
            }
        });
    })

    .controller('DashboardCtrl',
    function ($scope, $timeout, $state, $stateParams, growl, locale, dashboardWidgetProperties, dashboardProperties, DashboardModel) {
        $scope.gridsterOptions = {
            outerMargin: false,
            margins: [10, 10],
            columns: 12,
            rowHeight: 20,
            draggable: {enabled: false},
            resizable: {enabled: false}
        };

        $scope.isDirty = false;
        $scope.firstEdit = false;
        $scope.dashboard = {
            id: 0,
            name: '',
            widgets: []
        };

        $scope.editStart = function () {
            $scope.editMode = true;

            // If this is the first time we've edited this dashboard
            // then we reset the dirty flag here.
            // This allows us to avoid dirty calls during startup.
            if ($scope.firstEdit === false) {
                $scope.firstEdit = true;
                $scope.isDirty = false;
            }

            $scope.gridsterOptions.resizable = {
                enabled: true,
                handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
//                resize: function  (event, uiWidget, $element) {
                //                  console.log("Resizeing", uiWidget, $element);
                //            },
                stop: function (event, uiWidget, $element) {
                    console.log("Resize done", uiWidget, $element);
                    $scope.isDirty = true;
                }
            };
            $scope.gridsterOptions.draggable = {
                enabled: true,
                handle: '.box-header'
            };
        };

        $scope.clearDashboard = function () {
            if ($scope.dashboard.widgets.length === 0) {
                return;
            }
            $scope.isDirty = true;
            $scope.dashboard.widgets = [];
        };

        $scope.endEdit = function () {
            $scope.editMode = false;

            $scope.gridsterOptions.resizable = {enabled: false};
            $scope.gridsterOptions.draggable = {enabled: false};
        };

        $scope.saveDashboard = function () {
            // If we don't have a name for this dashboard, open the save dialog first
            if ($scope.dashboard.name == null || $scope.dashboard.name.length === 0) {
                dashboardProperties.editOptions($scope.dashboard).then(
                    function (dashboard) {
                        $scope.dashboard = dashboard;

                        DashboardModel.saveDashboard($scope.dashboard).then(
                            function (dashboard) {
                                $scope.isDirty = false;

                                $scope.dashboard.id = dashboard.id;
                                growl.success(locale.getString('dashboard.SaveOk',
                                    {name: $scope.dashboard.name}));
                            },
                            function () {
                                growl.warning(locale.getString('dashboard.SaveError',
                                    {name: $scope.dashboard.name}));
                            }
                        );
                    }
                );
            }
            else {
                DashboardModel.saveDashboard($scope.dashboard).then(
                    function (dashboard) {
                        $scope.isDirty = false;
                        $scope.dashboard.id = dashboard.id;
                        growl.success(locale.getString('dashboard.SaveOk', {name: $scope.dashboard.name}));
                    },
                    function () {
                        growl.warning(locale.getString('dashboard.SaveError', {name: $scope.dashboard.name}));
                    }
                );
            }
        };

        $scope.deleteDashboard = function () {
            DashboardModel.deleteDashboard($scope.dashboard.id).then(
                function () {
                    $scope.clearDashboard();
                    $scope.isDirty = false;
                    growl.success(locale.getString('dashboard.DeleteOk', {name: $scope.dashboard.name}));
                },
                function () {
                    growl.warning(locale.getString('dashboard.DeleteError', {name: $scope.dashboard.name}));
                }
            );
        };

        /* From Modernizr */
        function whichTransitionEvent() {
            var el = document.createElement('div');
            var transitions = {
                'transition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MozTransition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };
            for (var t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
        }

        function updateDashboard(dashboardDef) {
            // Sanity check
            if (dashboardDef === null || dashboardDef.widget === undefined) {
                return "";
            }

            // Loop through all widgets on the page
            // If the widget model isn't in the $scope, then we assume this is new
            processWidgetUpdate(dashboardDef.widget);
            $scope.$digest();

            function processWidgetUpdate(widgetArray) {
                // Sanity check
                if (widgetArray == null) {
                    return;
                }

                angular.forEach(widgetArray, function (widget) {
                    // Sanity check
                    if (widget == null) {
                        return;
                    }
                });
            }
        }

        // Handle the event update from the main menu to enable edit mode
        $scope.$on("dashboardEdit", function () {
            $scope.editMode = !$scope.editMode;

            if ($scope.editMode === true) {
                $scope.editStart();
            }
            else {
                $scope.endEdit();
            }
        });

        $scope.removeWidget = function (widget) {
            $scope.isDirty = true;
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
        };

        $scope.addWidget = function (type) {
            var newWidget = {
                type: type,
                sizeX: 2,
                sizeY: 2,
                options: {}
            };

            $scope.isDirty = true;
            $scope.dashboard.widgets.push(newWidget);

            $scope.configWidget(newWidget);
        };

        $scope.configWidget = function (widget) {
            dashboardWidgetProperties.editOptions(widget).then(
                function (widget) {
                    $scope.isDirty = true;
                }
            );
        };

        $scope.dashboardProperties = function () {
            dashboardProperties.editOptions($scope.dashboard).then(
                function (dashboard) {
                    $scope.isDirty = true;
                    $scope.dashboard = dashboard;
                }
            );
        };

//        $scope.$on('gridster-resized', function (event, newSizes) {
//            console.log("Gridster resized event", newSizes);
//          var newWidth = sizes[0];
//          var newHeight = sizes[1];
//        });

        $scope.$watch('dashboard.widgets', function (items) {
            console.log("Items updated", items);
            // one of the items changed
            $scope.isDirty = true;
        }, true);

        var dashboardId = $stateParams.dashboardId;
        if (dashboardId == null || dashboardId.length === 0) {
            $scope.editStart();
            $scope.isDirty = false;
            $scope.firstEdit = false;
        }
        else {
            DashboardModel.getDashboard(dashboardId).then(
                function (dashboard) {
                    $scope.isDirty = false;
                    $scope.firstEdit = false;
                    $scope.dashboard = dashboard;
                },
                function (dashboad) {

                }
            );
        }
    })

    .controller('DashboardCtrlMenu',
    function ($scope, $rootScope, locale) {
        $scope.tooltipEdit = locale.getString('habmin.DashboardEdit');

        $scope.dashboardEdit = function () {
            $rootScope.$broadcast("dashboardEdit");
        };
    })

    .directive('dashboardWidget', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            scope: {
                widget: '='
            },
            link: function (scope, element, attrs) {
                var widgetMap = {
                    Button: {
                        directive: "dashboard-button"
                    },
                    Chart: {
                        directive: "dashboard-chart"
                    },
                    Gauge: {
                        directive: "dashboard-gauge"
                    },
                    Image: {
                        directive: "dashboard-image"
                    },
                    Group: {
                        directive: "dashboard-group"
                    },
                    GroupBar: {
                        directive: "dashboard-groupbar"
                    },
                    Floor: {
                        directive: "dashboard-floorplan"
                    }
                };

                var build = function (widget) {
                    if (widget.options == null) {
                        widget.options = {};
                    }

                    var html = '<' + widgetMap[widget.type].directive + ' options="widget.options"></' +
                        widgetMap[widget.type].directive + '>';
                    element.empty().append($compile(html)(scope));
                };
                scope.$watch('widget', function (newValue, oldValue) {
                    if (newValue) {
//                        scope.options = newValue.options;
                        build(newValue);
                    }
                });
            }
        };
    }])
;

