/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('habminChart', [
    'ngLocalize',
    'HABmin.persistenceModel',
    'HABmin.chartModel',
    'HABmin.userModel',
    'ngVis',
    'angular-growl'
])

    .directive('habminChart',
    function (PersistenceDataModel, ChartModel, UserService, VisDataSet, growl, locale) {
        return {
            restrict: 'E',
            scope: {
                chart: '=',
                service: '=',
                options: '=',
                items: '=',
                events: '=',
                height: '=',
                width: '=',
                liveupdate: '='
            },
            template: '<vis-graph2d data="graphData" options="graphOptions" events="graphEvents"></vis-graph2d>',
            transclude: false,
            link: function (scope, element, attr) {
            },
            controller: function ($scope) {
                var roundingTime;
                var itemsLoading;
                var itemsLoaded;
                var valuesLoaded;
                var newChart;
                var dataGroups;
                var dataItems;
                var chartDef;

                var graph2d;

                var listeners = [];

                var tStart;

                var lineStyles = {
                    solid: [5, 0],
                    shortdash: [7, 3],
                    shortdot: [3, 3],
                    shortdashdot: [7, 3, 3, 3],
                    shortdashdotdot: [7, 3, 3, 3, 3, 3],
                    dot: [3, 7],
                    dash: [10, 7],
                    longdash: [20, 7],
                    dashdot: [10, 7, 3, 7],
                    longdashdot: [20, 7, 3, 7],
                    longdashdotdot: [20, 7, 3, 7, 3, 7]
                };

                var chartOptions = {
                    height: '100%',
                    width: '100%',
                    dataAxis: {
                        icons: true,
                        showMajorLabels: true,
                        showMinorLabels: false
                    },
                    showCurrentTime: false,
                    legend: true,
                    zoomMin: 60000,
                    locale: UserService.getLanguage()
                    // TODO: locales[]
                };

                $scope.graphOptions = chartOptions;

                // ------------------------------------------------
                // Private functions

                function _initChart(period) {
                    // The following sets the number of chart points to approximately 2000
                    roundingTime = Math.floor(period / 2000000) * 1000;
//                    console.log("Setting rounding time to", roundingTime);

                    itemsLoaded = 0;
                    itemsLoading = 0;
                    valuesLoaded = 0;

                    newChart = [];

                    chartOptions.dataAxis.left = {title: {}};//, range: {}};
                    chartOptions.dataAxis.right = {title: {}};//, range: {}};

                    dataGroups = new VisDataSet();
                    dataItems = new VisDataSet();
                }

                function _displayChart(id) {
                    tStart = new moment().valueOf();
                    ChartModel.getChart(id).then(
                        function (chart) {
                            $scope.stopTime = Math.floor((new moment()).valueOf());
                            $scope.startTime = $scope.stopTime - (chart.period * 1000);
                            _initChart($scope.stopTime - $scope.startTime);

                            chart.items = [].concat(chart.items);
                            chartDef = chart;
                            angular.forEach(chart.items, function (item) {
                                itemsLoading++;
                                _loadItem(item.item, $scope.startTime, $scope.stopTime);
                            });
                        },
                        function (reason) {
                            // Notify the user...
                            $scope.events.onload(null);
                        }
                    );
                }

                function _displayItems(items) {
                    items = [].concat(items);
                    $scope.stopTime = Math.floor((new moment()).valueOf());
                    $scope.startTime = $scope.stopTime - (86400 * 1000);
                    _initChart($scope.stopTime - $scope.startTime);

                    angular.forEach(listeners, function (listener) {
                        listener();
                    });

                    chartDef = {items: []};
                    angular.forEach(items, function (item) {
                        itemsLoading++;
                        var i = {};
                        i.item = item.item;
                        i.label = item.label;
                        i.axis = "left";
                        chartDef.items.push(i);
                        _loadItem(item.item, $scope.startTime, $scope.stopTime);
                    });
                }

                function _loadItem(itemRef, start, stop) {
                    console.log("Requesting ", itemRef);
                    var parms = {starttime: start, endtime: stop};
                    var me = this;

                    PersistenceDataModel.get($scope.service, itemRef, start, stop).then(
                        function (response) {
                            _addChartItem(itemRef, response);

                            listeners.push($scope.$on('smarthome/items/' + itemRef + "/state", function (event, state) {
                                if ($scope.liveupdate === false) {
                                    return;
                                }
                                var num = Number(state.value);
                                if (!isNaN(num)) {
                                    var now = moment().valueOf();
                                    var range = graph2d.getWindow();
                                    var interval = range.end - range.start;
                                    dataItems.add({x: now, y: num, group: itemRef});
                                    graph2d.setOptions({max: now});
                                    graph2d.setWindow(now - interval, now);
                                }
                            }));
                        },
                        function (reason) {
                            // Handle failure
                            growl.warning(locale.getString('habmin.ErrorLoadingItem', itemRef));
                        }
                    );
                }

                function _addChartItem(itemRef, data) {
                    // Find the chart config for this item
                    var itemCfg = null;
                    for (var i = 0; i < chartDef.items.length; i++) {
                        if (itemRef == chartDef.items[i].item) {
                            itemCfg = chartDef.items[i];
                            break;
                        }
                    }

                    if (itemCfg == null) {
                        console.error("Unable to find definition for ", itemRef, chartDef);
                        return;
                    }

                    // If there's no repeat time, then set it to 'infinity'
                    // Otherwise turn into milliseconds
                    if (itemCfg.repeatTime == null || itemCfg.repeatTime < 1) {
                        itemCfg.repeatTime = 9007199254740000;
                    }
                    else {
                        itemCfg.repeatTime *= 1000;
                    }

//                    console.log("Adding", itemRef, "- repeat is ", itemCfg.repeatTime);

                    var style = "";
                    if (itemCfg.lineColor !== undefined) {
                        var t = tinycolor(itemCfg.lineColor);
                        if (t.ok === true) {                // isValid!!!
                            style += "stroke:" + t.toHexString() + ";";
                        }
                    }
                    if (itemCfg.lineWidth !== undefined) {
                        style += "stroke-width:" + itemCfg.lineWidth + ";";
                    }

                    if (itemCfg.lineStyle !== undefined && itemCfg.lineStyle.length > 0) {
                        style += "stroke-dasharray:" + lineStyles[itemCfg.lineStyle.toLowerCase()].join(' ') + ";";
                    }

                    var shaded = {enabled: false};
                    if (itemCfg.fill !== undefined) {
                        if (Boolean(itemCfg.fill) === true) {
                            shaded = {orientation: "bottom"};
                        }
                    }

                    var options = {
                        id: itemRef,
                        content: itemCfg.label,
                        style: style,
                        options: {
                            yAxisOrientation: itemCfg.axis,
                            drawPoints: false,
                            //{
                            //          style: 'square' // square, circle
                            //    },
                            shaded: shaded
                        }
                    };

                    if (["bar", "line"].indexOf(itemCfg.chart) != -1) {
                        options.options.style = itemCfg.chart;
                    }

                    dataGroups.add(options);

                    newChart = addSeries(newChart, data, itemCfg.repeatTime, itemRef);

                    // If everything is loaded, render the chart
                    itemsLoaded++;
                    valuesLoaded += data != null ? data.length : 0;
                    console.log("Loaded " + itemsLoaded + " of " + itemsLoading);
                    if (itemsLoaded >= itemsLoading) {
                        // All items loaded
                        if (chartDef.title) {
                        }

                        if (chartDef.axis) {
                            angular.forEach(chartDef.axis, function (axis) {
                                if (axis == null) {
                                    return;
                                }
                                var min = null;
                                var max = null;
                                var label = {};
                                if (axis.label !== undefined) {
                                    var style = "";
                                    if (axis.color != null && axis.color.length > 0) {
                                        // Sanatise the colours with tinycolor
                                        var t = tinycolor(axis.color);
                                        if (t.ok === true) {                // isValid!!!
                                            label.style = "color:" + t.toHexString() + ";";
                                        }
                                    }
                                    label.text = axis.label;
                                }
                                chartOptions.dataAxis[axis.position].title = label;

                                switch (axis.position) {
                                    default:
                                    case 'left':
                                        if (axis.minimum !== undefined || axis.maximum !== undefined) {
                                            if (axis.minimum !== undefined) {
                                                min = Number(axis.minimum);
                                            }
                                            if (axis.maximum !== undefined) {
                                                max = Number(axis.maximum);
                                            }
                                        }
                                        break;
                                    case 'right':
                                        if (axis.minimum !== undefined || axis.maximum !== undefined) {
                                            if (axis.minimum !== undefined) {
                                                min = Number(axis.minimum);
                                            }
                                            if (axis.maximum !== undefined) {
                                                max = Number(axis.maximum);
                                            }
                                        }
                                        break;
                                }
                            });
                        }

                        dataItems.add(newChart);

//                console.log(angular.toJson(dataItems));
//                console.log(angular.toJson(dataGroups));

                        // Update the vis data
                        $scope.graphData = {
                            items: dataItems,
                            groups: dataGroups
                        };

                        if ($scope.height !== undefined) {
                            chartOptions.height = $scope.height;
                        }
                        if ($scope.width !== undefined) {
                            chartOptions.width = $scope.width;
                        }

                        chartOptions.max = moment().valueOf();
                        $scope.graphOptions = chartOptions;

                        console.log("We're done :)", chartOptions, dataItems, dataGroups);
                        // TODO: Notify the user.

                        console.log("Chart completed. Loaded " + valuesLoaded + " values in " + itemsLoaded +
                        " items in " + (new Date().getTime() - tStart) + " ms");
                    }
                }

                // Sequentially step through the new data and add it to a new array along with the old data
                function addSeries(curData, newData, repeatTime, group) {
                    // If no data exists for this channel, just return the current data
                    if (newData == null || newData.length == 0 || newData[0].time == null) {
                        return curData;
                    }

                    // Record the starting time/value of the new series
                    var lastTime = Math.floor(Number(newData[0].time) / roundingTime) * roundingTime;

                    var curTime;
                    var newTime;
                    // Process merging of the two data arrays
                    for (var cntNew = 0; cntNew < newData.length; cntNew++) {
                        if (newData[cntNew + 1] !== undefined &&
                            newData[cntNew + 1].time > newData[cntNew].time + repeatTime) {
                            // The next value is more than 'repeatTime' in the future. We need to record this value
                            newTime = Math.floor(Number(newData[cntNew].time) / 1000) * 1000;
                        }
                        else {
                            // Round the time down to the closest second
                            newTime = Math.floor(Number(newData[cntNew].time) / roundingTime) * roundingTime;
                        }

                        // Check if we need to repeat the data
                        if (newTime > lastTime + repeatTime) {
                            // Repeat needed
                            curData.push({x: newTime - repeatTime, y: Number(newData[cntNew].state), group: group});
                        }

                        lastTime = newTime;

                        curData.push({x: newTime, y: Number(newData[cntNew].state), group: group});
                    }

                    return curData;
                }

                /**
                 * Callback from the chart whenever the range is updated
                 * This is called once at the end of zooming and scrolling
                 * @param period
                 */
                $scope.onRangeChanged = function (period) {
//                    console.log("Range changed", period);

                    // We want to add any additional data at the beginning, and/or end of the current data
                    /*

                     $scope.stopTime = Math.floor((new Date()).getTime());
                     $scope.startTime = $scope.stopTime - (chart.period * 1000);

                     console.log("Requesting ", itemRef);
                     var parms = {starttime: start, endtime: stop};
                     var me = this;*/

                    var allowableDelta = ($scope.stopTime - $scope.startTime) / 100;
                    console.log("AllowableDelta", allowableDelta);

                    var startTime = moment(period.start).valueOf();
                    var stopTime = moment(period.end).valueOf();

//                    console.log("Start", startTime, $scope.startTime, startTime - $scope.startTime);
//                    console.log("Stop", stopTime, $scope.stopTime, stopTime - $scope.stopTime);

                    if (startTime >= $scope.startTime - allowableDelta &&
                        stopTime <= $scope.stopTime + allowableDelta) {
                        return;
                    }

                    $scope.chartLoading = true;

                    $scope.startTime = moment(period.start).valueOf();
                    $scope.stopTime = moment(period.end).valueOf();

                    newChart = [];
                    var cnt = chartDef.items.length;
                    angular.forEach(chartDef.items, function (item) {
//                        console.log("Range changed on item", item);

                        PersistenceDataModel.get($scope.service, item.item, $scope.startTime,
                            $scope.stopTime).then(
                            function (data) {
//                                console.log("The item definition is: ", data);
                                newChart = addSeries(newChart, data, item.repeatTime, item.item);
                                cnt--;

                                if (cnt === 0) {
                                    $scope.chartLoading = false;
                                    dataItems.update(newChart);
                                }
                            },
                            function (reason) {
                                // Handle failure
                                growl.warning(locale.getString('habmin.ErrorLoadingItem', item.item));
                                cnt--;
                            }
                        );
                    });
                };

                $scope.graphEvents = {
                    rangechanged: $scope.onRangeChanged,
                    onload: function (chart) {
                        graph2d = chart;
                        if ($scope.events.onload != null) {
                            $scope.events.onload(chart);
                        }

                    }
                };

                $scope.$watch('events', function () {
                    if ($scope.events != null) {
                        if ($scope.events.rangechange != null) {
                            $scope.graphEvents.rangechange = $scope.events.rangechange;
                        }
                    }
                });

                $scope.$watch('chart', function () {
                    // Sanity check
                    if ($scope.chart == null) {
                        return;
                    }

                    _displayChart($scope.chart);
                });

                $scope.$watch('items', function () {
                    // Sanity check
                    if ($scope.items == null || $scope.items.length === 0) {
                        return;
                    }

                    _displayItems($scope.items);
                });

                $scope.$on('$destroy', function () {
                    angular.forEach(listeners, function (listener) {
                        listener();
                    })
                });
            }
        };
    })
;






