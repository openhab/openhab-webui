/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.chart', [
    'ui.router',
    'ui.bootstrap',
    'ui.bootstrap.datepicker',
    'ngLocalize',
    'angular-growl',
    'HABmin.persistenceModel',
    'HABmin.itemModel',
    'HABmin.chartModel',
    'HABmin.chartSave',
    'HABmin.userModel',
    'HABmin.iconModel',
    'ngVis',
    'ngConfirmClick',
    'ResizePanel',
    'habminChart'
])

    .config(function config($stateProvider) {
        $stateProvider.state('chart', {
            url: '/chart/:chartId',
            views: {
                "main": {
                    controller: 'ChartCtrl',
                    templateUrl: 'chart/chart.tpl.html'
                },
                "menu": {
                    controller: 'ChartCtrlMenu',
                    templateUrl: 'chart/chartMenu.tpl.html'
                }
            },
            data: {pageTitle: 'Charting'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                // Make sure the localisation files are resolved before the controller runs
                localisations: function ($q, locale) {
                    return $q.all([
                        locale.ready('common'),
                        locale.ready('habmin'),
                        locale.ready('chart')
                    ]);
                }
            }
        });
    })

    // Service used to communicate between controllers
    .factory('ChartService', function () {
        var Service = {
            graphItems: [],
            selectedChart: undefined,
            service: ""
        };

        Service.getItems = function () {
            return Service.graphItems;
        };

        Service.getChart = function () {
            return Service.selectedChart;
        };

        Service.getService = function () {
            return Service.service;
        };

        return Service;
    })

    .controller('ChartCtrl',
    function ($scope, $q, $stateParams, ChartService, UserService, locale, ChartModel, growl, VisDataSet, $interval, $timeout) {
        var itemsLoaded = 0;
        var itemsLoading = 0;
        var newChart;
        var chartDef;
        var graph2d;

        $scope.liveupdate = false;

        $scope.graphLoaded = false;
        $scope.chartLoading = false;
        $scope.selectedChart = ChartService.getChart;
        $scope.graphItems = ChartService.getItems;
        $scope.persistenceService = ChartService.getService;

        // ------------------------------------------------
        // Load model data
//        var promises = [];

        // ------------------------------------------------
        // Event Handlers

        $scope.onLoaded = function (graphRef) {
            $scope.graphLoaded = true;
            $scope.chartLoading = false;
            console.log("graph loaded callback", graphRef);
            graph2d = graphRef;
            graph2d.setWindow($scope.startTime, $scope.stopTime);
            angular.forEach($scope.charts, function (chart) {
                if (chart.selected == 'loading') {
                    chart.selected = 'yes';
                }
            });
        };

        $scope.setWindow = function (window) {
            var periodStart = moment().subtract(1, window);
            $scope.timeNow = moment().valueOf();

            if (graph2d === undefined) {
                return;
            }

            graph2d.setOptions({max: $scope.timeNow});
            graph2d.setWindow(periodStart, $scope.timeNow);
        };

        $scope.setNow = function (direction) {
            var range = graph2d.getWindow();
            var interval = range.end - range.start;
            $scope.timeNow = moment().valueOf();

            if (graph2d === undefined) {
                return;
            }

            graph2d.setOptions({max: $scope.timeNow});
            graph2d.setWindow($scope.timeNow - interval, $scope.timeNow);
        };

        $scope.stepWindow = function (direction) {
            var percentage = (direction > 0) ? 0.2 : -0.2;
            var range = graph2d.getWindow();
            var interval = range.end - range.start;

            if (graph2d === undefined) {
                return;
            }

            graph2d.setWindow({
                start: range.start.valueOf() - interval * percentage,
                end: range.end.valueOf() - interval * percentage
            });
        };

        $scope.zoomWindow = function (percentage) {
            var range = graph2d.getWindow();
            var interval = range.end - range.start;

            if (graph2d === undefined) {
                return;
            }

            graph2d.setWindow({
                start: range.start.valueOf() - interval * percentage,
                end: range.end.valueOf() + interval * percentage
            });
        };

        $scope.refreshChart = function () {
            // Make sure the directive detects the change - use copy
            if (ChartService.selectedChart === undefined) {
                var updateItem = ChartService.graphItems;
                $timeout(function () {
                    ChartService.graphItems = angular.copy(updateItem);
                });
            }
            else {
                var updateChart = ChartService.selectedChart;
                $timeout(function () {
                    ChartService.selectedChart = angular.copy(updateChart);
                });
            }
            ChartService.graphItems = undefined;
            ChartService.selectedChart = undefined;
        };

        $scope.setDateRange = function () {
            $scope.timeNow = moment().valueOf();

            if (graph2d === undefined) {
                return;
            }

            graph2d.setOptions({max: $scope.timeNow});
            graph2d.setWindow($scope.startTime, $scope.stopTime);
        };

        /**
         * Callback from the chart whenever the range is updated
         * This is called repeatedly during zooming and scrolling
         * @param period
         */
        $scope.onRangeChange = function (period) {
            console.log("Range changing", period);
            function splitDate(date) {
                var m = moment(date);
                return {
                    year: m.get('year'),
                    month: {
                        number: m.get('month'),
                        name: m.format('MMM')
                    },
                    week: m.format('w'),
                    day: {
                        number: m.get('date'),
                        name: m.format('ddd')
                    },
                    hour: m.format('HH'),
                    minute: m.format('mm'),
                    second: m.format('ss')
                };
            }

            var p = {
                s: splitDate(period.start),
                e: splitDate(period.end)
            };

            // Set the window for so the appropriate buttons are highlighted
            // We give some leeway to the interval -:
            // A day, +/- 1 minutes
            // A week, +/- 1 hour
            // A month is between 28 and 32 days
            var interval = period.end - period.start;
            if (interval > 86340000 && interval < 86460000) {
                $scope.graphWindow = 'day';
            }
            else if (interval > 601200000 && interval < 608400000) {
                $scope.graphWindow = 'week';
            }
            else if (interval > 2419200000 && interval < 2764800000) {
                $scope.graphWindow = 'month';
            }
            else {
                $scope.graphWindow = 'custom';
            }

            if (p.s.year == p.e.year) {
                $scope.graphTimeline =
                    p.s.day.name + ' ' + p.s.day.number + '-' + p.s.month.name + '  -  ' +
                    p.e.day.name + ' ' + p.e.day.number + '-' + p.e.month.name + ' ' + p.s.year;

                if (p.s.month.number == p.e.month.number) {
                    $scope.graphTimeline =
                        p.s.day.name + ' ' + p.s.day.number + '  -  ' +
                        p.e.day.name + ' ' + p.e.day.number + ' ' +
                        p.s.month.name + ' ' + p.s.year;

                    if (p.s.day.number == p.e.day.number) {
                        if (p.e.hour == 23 && p.e.minute == 59 && p.e.second == 59) {
                            p.e.hour = 24;
                            p.e.minute = '00';
                            p.e.second = '00';
                        }

                        $scope.graphTimeline =
                            p.s.hour + ':' + p.s.minute + '  -  ' +
                            p.e.hour + ':' + p.e.minute + ' ' +
                            p.s.day.name + ' ' + p.s.day.number + ' ' + p.s.month.name + ' ' + p.s.year;
                    }
                }
            }
            else {
                $scope.graphTimeline =
                    p.s.day.name + ' ' + p.s.day.number + '-' + p.s.month.name + ', ' + p.s.year + '  -  ' +
                    p.e.day.name + ' ' + p.e.day.number + '-' + p.e.month.name + ', ' + p.e.year;
            }

            // Call apply since this is updated in an event and angular may not know about the change!
            if (!$scope.$$phase) {
                $timeout(function () {
                    $scope.$apply();
                });
            }
        };

        $scope.graphEvents = {
            rangechange: $scope.onRangeChange,
            onload: $scope.onLoaded
        };

        if ($stateParams.chartId != null && $stateParams.chartId.length !== 0) {
            ChartService.graphItems = [];
            ChartModel.getChart($stateParams.chartId).then(
                function (chart) {
                    // Make sure the directive detects the change - use copy
                    ChartService.graphItems = [];
                    ChartService.selectedChart = angular.copy(chart);
                }
            );
        }
    })

    .controller('ChartCtrlMenu',
    function ($scope, locale, growl, ChartModel, ChartService, UserService, PersistenceServiceModel, ItemModel, ChartSave) {
        $scope.items = [];

        $scope.itemsTotal = -1;
        $scope.itemsSelected = 0;

        $scope.tooltipItems = locale.getString('chart.SelectItems');
        $scope.tooltipSave = locale.getString('chart.SaveChart');
        $scope.tooltipDelete = locale.getString('chart.DeleteChart');

        if (ChartService.service == null || ChartService.service.length == 0) {
            ChartService.service = UserService.getPersistence();
        }

        // Load the list of persistence services
        PersistenceServiceModel.getList().then(
            function (data) {
                $scope.services = data;
                if ($scope.services.length > 0) {
                    // Check that the default service exists
                    if (ChartService.service != null) {
                        var found = false;
                        for (var service in $scope.services) {
                            if ($scope.services[service].id == ChartService.service) {
                                found = true;
                                break;
                            }
                        }

                        if (found == true) {
                            return;
                        }
                    }

                    // Use the first service as the default if there isn't a default set
                    $scope.services[0].selected = true;
                    ChartService.service = $scope.services[0].id;
                }
            },
            function (reason) {
                // handle failure
                growl.warning(locale.getString('chart.ErrorGettingServices'));
            }
        );

        // Load the list of items
//        var pItems = $q.defer();
//        promises.push(pItems.promise);
        ItemModel.getList().then(
            function (items) {
                $scope.items = items;
                if ($scope.items != null) {
                    $scope.itemsTotal = $scope.items.length;
                }
//                            pItems.resolve();
            },
            function (reason) {
                // handle failure
                growl.warning(locale.getString('chart.ErrorGettingItems'));
//                            pItems.resolve();
            }
        );

        $scope.selectItem = function (parm) {
            parm.selected = !parm.selected;

            $scope.itemsSelected = 0;
            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    $scope.itemsSelected++;
                }
            });
        };

        $scope.selectService = function (svc) {
            angular.forEach($scope.services, function (service) {
                if (service.id == svc.id) {
                    service.selected = true;
                }
                else {
                    service.selected = false;
                }
            });
            ChartService.service = svc.id;
        };

        $scope.clearList = function () {
            $scope.itemsSelected = 0;
            angular.forEach($scope.items, function (item) {
                item.selected = false;
            });
        };

        $scope.filterDefaultString = locale.getString('common.filter');

        // This is what we will bind the filter to
        $scope.filter = {text: ''};
        $scope.filterFunction = function (element) {
            if ($scope.filter.text === "") {
                return true;
            }
            if (element.label == null) {
                return false;
            }
            return element.label.toLowerCase().indexOf($scope.filter.text.toLowerCase()) !== -1 ? true : false;
        };

        $scope.doGraph = function () {
            ChartService.selectedChart = undefined;

            // Close the channel list
            $scope.itemListOpen = false;

            var items = [];
            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    var i = {};
                    i.item = item.name;
                    i.label = item.label;
                    i.axis = "left";
                    items.push(i);
                }
            });

            // Make sure the directive detects the change - use copy
            ChartService.graphItems = angular.copy(items);
        };

        $scope.deleteChart = function () {
            if (ChartService.selectedChart === undefined) {
                return;
            }

            ChartModel.deleteChart(ChartService.selectedChart.id).then(
                function () {
                    growl.success(locale.getString('chart.DeleteOk', {name: ChartService.selectedChart.name}));
                },
                function () {
                    growl.warning(locale.getString('chart.DeleteError', {name: ChartService.selectedChart.name}));
                }
            );
        };

        $scope.saveChart = function () {
            // If we have a chart selected, then edit it
            if (ChartService.selectedChart !== undefined) {
                ChartSave.editChart(ChartService.selectedChart.id);
                return;
            }

            // Otherwise save the existing chart
            var chart = {};
            chart.name = locale.getString('chart.SaveNewName');
            chart.period = 86400;
            chart.items = [];

            angular.forEach($scope.items, function (item) {
                if (item.selected === true) {
                    var newItem = {};
                    newItem.item = item.name;
                    newItem.label = item.label;
                    chart.items.push(newItem);
                }
            });

            ChartSave.saveChart(chart);
        };
    })

;
