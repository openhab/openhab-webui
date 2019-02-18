(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetTimeline', widgetTimeline)
        .controller('WidgetSettingsCtrl-timeline', WidgetSettingsCtrlTimeline)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'timeline',
                displayName: 'Timeline',
                icon: 'tasks',
                description: 'Displays a timeline of several items'
            });
        });

    widgetTimeline.$inject = ['$rootScope', '$interval', 'OHService', 'tmhDynamicLocaleCache'];
    function widgetTimeline($rootScope, $interval, OHService, tmhDynamicLocaleCache) {
        // Usage: <widget-timeline ng-model="widget" />
        //
        // Creates: A timeline widget
        //
        var directive = {
            bindToController: true,
            controller: TimelineController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/timeline/timeline.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {

            function redraw() {
                if (!scope.data) return;

                var el = element[0].firstElementChild.firstElementChild;

                if (el.getElementsByTagName('svg').length) {
                    el.removeChild(el.getElementsByTagName('svg')[0]);
                }

                var parentElement = element[0].parentNode.parentNode.parentNode;

                var width = parentElement.style.width.replace('px', '') - 20;
                var height = parentElement.style.height.replace('px', '') - 20;

                var colorScale = d3.scale.ordinal().range(scope.colorScale.colors).domain(scope.colorScale.states);

                var nglocale = tmhDynamicLocaleCache.get(scope.locale.toLowerCase());
                var d3timeformat = (!nglocale) ? d3.time.format :
                    d3.locale({
                        "decimal": nglocale.NUMBER_FORMATS.DECIMAL_SEP,
                        "thousands": nglocale.NUMBER_FORMATS.GROUP_SEP,
                        "grouping": [3],
                        "currency": [nglocale.NUMBER_FORMATS.CURRENCY_SYM, ""],
                        "dateTime": "%a %b %e %X %Y",
                        "date": "%d/%M/%Y",
                        "time": "%H:%M:%S",
                        "periods": nglocale.DATETIME_FORMATS.AMPMS,
                        "days": nglocale.DATETIME_FORMATS.DAY,
                        "shortDays": nglocale.DATETIME_FORMATS.SHORTDAY,
                        "months": nglocale.DATETIME_FORMATS.MONTH,
                        "shortMonths": nglocale.DATETIME_FORMATS.SHORTMONTH
                    }).timeFormat;


                var customTimeFormat = d3timeformat.multi([
                    ["%H:%M", function(d) { return d.getMinutes(); }],
                    ["%H:00", function(d) { return d.getHours(); }],
                    ["%d %b", function (d) { return scope.vm.widget.period === '2M' || scope.vm.widget.period === '4M'; }],
                    ["%a %d", function(d) { return d.getDate() != 1 }],
                    ["1 %b", function(d) { return d.getDate() == 1 }]
                ]);

                var chart = d3.timeline()
                .colors(colorScale)
                .colorProperty('state')
                .width(0)
                .tickFormat({
                    format: customTimeFormat,
                    tickSize: 6
                })
                .showTimeAxisTick()
                .stack()
                .margin({left:scope.margin_left + 20, right:22, top:0, bottom:0})
                .mouseover(function (d, i, datum) {
                    scope.$apply(function () {
                        scope.item = datum.label;
                        scope.starting_time = d.starting_time;
                        scope.ending_time = d.ending_time;
                        var colorIndex = scope.colorScale.states.indexOf(d.state);
                        scope.state_color = scope.colorScale.colors[colorIndex];

                        var item = OHService.getItem(scope.item);
                        if (item && item.stateDescription && item.stateDescription.pattern)
                            scope.state = sprintf(item.stateDescription.pattern, d.state);
                        else
                            scope.state = d.state;
                    });
                }).mouseout(function (d, i, datum) {
                    scope.$apply(function () {
                        scope.item = null;
                        scope.state = null;
                        scope.starting_time = null;
                        scope.ending_time = null;
                    });
                });

                var svg = d3.select(el).append("svg").attr("width", width).attr("height", height)
                .datum(scope.data).call(chart);

            }

            var dataWatcher = scope.$watch("data", redraw);
            var resizeHandler = scope.$on('gridster-resized', redraw);

            scope.$on('$destroy', dataWatcher);
            scope.$on('$destroy', resizeHandler);
            if (scope.vm.refreshInterval) {
                element.on('$destroy', function () {
                    $interval.cancel(scope.vm.refreshInterval);
                });
            }

        }
    }
    TimelineController.$inject = ['$rootScope', '$scope', '$timeout', '$interval', '$http', '$q', 'OHService'];
    function TimelineController ($rootScope, $scope, $timeout, $interval, $http, $q, OHService) {
        var vm = this;
        this.widget = this.ngModel;


        /**
         * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
         * 
         * @param {String} text The text to be rendered.
         * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
         * 
         * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
         */
        function getTextWidth(text, font) {
            // re-use canvas object for better performance
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        }
        

        var partitionData = function (raw) {
            var partitions = [];
            if (!raw.datapoints || raw.datapoints == 0) return;

            var currentState = raw.data[0].state;
            var currentStartTime = raw.data[0].time;

            for (var i = 1; i < raw.data.length; i++) {
                if (raw.data[i].state !== currentState) {
                    partitions.push({
                        state: currentState,
                        starting_time: currentStartTime,
                        ending_time: raw.data[i].time
                    });
                    currentState = raw.data[i].state;
                    currentStartTime = raw.data[i].time;
                }
            }

            // push the last partition
            partitions.push({
                state: currentState,
                starting_time: currentStartTime,
                ending_time: Date.now()
            });

            return partitions;
        }

        var startTime = function () {
            var startDate = new Date();
            switch (vm.widget.period)
            {
                case 'h': startDate.setTime(startDate.getTime() - 60*60*1000); break;
                case '4h': startDate.setTime(startDate.getTime() - 4*60*60*1000); break;
                case '8h': startDate.setTime(startDate.getTime() - 8*60*60*1000); break;
                case '12h': startDate.setTime(startDate.getTime() - 12*60*60*1000); break;
                case 'D': startDate.setTime(startDate.getTime() - 24*60*60*1000); break;
                case '2D': startDate.setTime(startDate.getTime() - 2*24*60*60*1000); break;
                case '3D': startDate.setTime(startDate.getTime() - 3*24*60*60*1000); break;
                case 'W': startDate.setTime(startDate.getTime() - 7*24*60*60*1000); break;
                case '2W': startDate.setTime(startDate.getTime() - 2*7*24*60*60*1000); break;
                case 'M': startDate.setMonth(startDate.getMonth() - 1); break;
                case '2M': startDate.setMonth(startDate.getMonth() - 2); break;
                case '4M': startDate.setMonth(startDate.getMonth() - 4); break;
                case 'Y': startDate.setFullYear(startDate.getFullYear() - 1); break;
                default: startDate.setTime(startDate.getTime() - 24*60*60*1000); break;
            }
            return startDate;
        }

        if (!vm.widget.series || !vm.widget.series.length)
            return;

        $scope.colorScale = { states: [], colors: [] };
        for (var i = 0; i < vm.widget.colorMaps.length; i++) {
            $scope.colorScale.states.push(vm.widget.colorMaps[i].state);
            $scope.colorScale.colors.push(vm.widget.colorMaps[i].color);
        }

        function getData() {
            var startDate = startTime();

            vm.rawdata = [];
            for (var i = 0; i < vm.widget.series.length; i++) {
                vm.rawdata[i] = $http.get('/rest/persistence/items/' + vm.widget.series[i].item + "?boundary=true&starttime=" + startDate.toISOString() + (vm.widget.service ? '&serviceId=' + vm.widget.service : ''));
            }


            $q.all(vm.rawdata).then(function (values) {
                var partitioned = {};
                var data = [];

                for (var i = 0; i < values.length; i++) {
                    partitioned[values[i].data.name] = partitionData(values[i].data);
                }

                $scope.margin_left = 20;

                for (var i = 0; i < vm.widget.series.length; i++) {
                    if (!partitioned[vm.widget.series[i].item]) {
                        continue;
                    }

                    var label = vm.widget.series[i].name || vm.widget.series[i].item;
                    var textWidth = getTextWidth(label, "normal 1.5em Roboto");
                    if ($scope.margin_left < textWidth) {
                        $scope.margin_left = textWidth;
                    }

                    data.push({
                        label: label,
                        times: partitioned[vm.widget.series[i].item]
                    });
                }

                $timeout(function () {
                    $scope.data = data;
                });
            });

        }

        OHService.getLocale().then(function (locale) {
            $scope.locale = locale;
            vm.refreshInterval = $interval(getData, ((new Date).getTime() - startTime()) / 60 / 2);
            getData();
        });
    }


    // settings dialog
    WidgetSettingsCtrlTimeline.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService', 'themeValueFilter'];

    function WidgetSettingsCtrlTimeline($scope, $timeout, $rootScope, $modalInstance, widget, OHService, themeValueFilter) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            service: widget.service,
            period: widget.period || 'D',
            colorMaps: widget.colorMaps || [
                { state: 'ON', color: themeValueFilter(null, 'primary-color') },
                { state: 'OFF', color: themeValueFilter(null, 'switch-off-color') },
                { state: 'OPEN', color: '#CCCC00' },
                { state: 'CLOSED', color: '#CC99FF' },
                { state: 'UP', color: '#FFCC66' },
                { state: 'DOWN', color: '#9999FF' },
                { state: '0', color: '#FFF' },
                { state: '1', color: '#FFCCCC' },
                { state: '2', color: '#FF9999' },
                { state: '3', color: '#FF6666' },
                { state: '4', color: '#CC0000' },
                { state: '5', color: '#993333' }
            ],
            series: widget.series || []
        };

        $scope.colorMapAccordions = [];
        $scope.accordions = [];

        $scope.addColorMap = function () {
            $scope.form.colorMaps.push({ state: '', color: '#FF0000' });
            $scope.colorMapAccordions[$scope.form.colorMaps.length - 1] = true;
        };

        $scope.removeColorMap = function (colorMap) {
            $scope.form.colorMaps.splice($scope.form.colorMaps.indexOf(colorMap), 1);
        }

        $scope.addSeries = function () {
            $scope.form.series.push({ });
            $scope.accordions[$scope.form.series.length - 1] = true;
        };

        $scope.removeSeries = function (series) {
            $scope.form.series.splice($scope.form.series.indexOf(series), 1);
        }
        

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);

            $modalInstance.close(widget);
        };

    }


})();