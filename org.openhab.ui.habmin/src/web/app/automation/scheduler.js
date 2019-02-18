/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.scheduler', [
    'ui.router',
//    'ui.bootstrap',
    'ngLocalize',
    'ui.calendar',
    'ResizePanel',
    'Automation.editEvent',
    'ngVis'
])

    .config(function config($stateProvider) {
        $stateProvider.state('scheduler', {
            url: '/scheduler',
            views: {
                "main": {
                    controller: 'AutomationSchedulerCtrl',
                    templateUrl: 'automation/scheduler.tpl.html'
                }
            },
            data: {pageTitle: 'Scheduler'}
        });
    })

    .controller('AutomationSchedulerCtrl',
    function AutomationSchedulerCtrl($scope, $sce, $compile, locale, growl, RuleModel, $timeout, $window, uiCalendarConfig, eventEdit, VisDataSet) {
        $scope.view = "agendaWeek";

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        // Event source that contains custom events on the scope
        $scope.events = {
            id: "1",
            name: "Heating",
            events: [
                {title: 'Morning (20C)', start: new Date(y, m, d, 5, 30), end: new Date(y, m, d, 8)},
                {title: 'Day (18C)', start: new Date(y, m, d, 8, 0), end: new Date(y, m, d, 15, 30)},
                {title: 'Evening (21C)', start: new Date(y, m, d, 15, 30), end: new Date(y, m, d, 22, 0)},
                {title: 'Night (17C)', start: new Date(y, m, d, 22, 0), end: new Date(y, m, d + 1, 5, 30)}
            ]
        };

        $scope.calEventsExt = {
            id: "2",
            name: "Ext",
            color: '#f00',
            textColor: 'yellow',
            events: [
                {
                    type: 'party',
                    title: 'Lunch',
                    start: new Date(y, m, d, 12, 0),
                    end: new Date(y, m, d, 14, 0),
                    allDay: false
                },
                {
                    type: 'party',
                    title: 'Click for Google',
                    start: new Date(y, m, 28),
                    end: new Date(y, m, 29),
                    url: 'http://google.com/'
                }
            ]
        };

        // alert on eventClick
        $scope.alertOnEventClick = function (date, jsEvent, view) {
            $scope.alertMessage = (date.title + ' was clicked ');
        };
        /* alert on Drop */
        $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
        };
        /* alert on Resize */
        $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };
        /* add and removes an event source of choice */
        $scope.addRemoveEventSource = function (sources, source) {
            var canAdd = 0;
            angular.forEach(sources, function (value, key) {
                if (sources[key] === source) {
                    sources.splice(key, 1);
                    canAdd = 1;
                }
            });
            if (canAdd === 0) {
                sources.push(source);
            }
        };
        // add custom event
        $scope.addEvent = function () {
            $scope.events.push({
                title: 'Open Sesame',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                className: ['openSesame']
            });
        };
        /* remove event */
        $scope.remove = function (index) {
            $scope.events.splice(index, 1);
        };

        // Change View
        $scope.changeView = function (view) {
            $scope.view = view;
            if ($scope.view != "timeline") {
                uiCalendarConfig.calendars.calendar.fullCalendar('changeView', view);
                $timeout(function () {
                    uiCalendarConfig.calendars.calendar.fullCalendar('changeView', view);
                });
            }
        };

        $scope.stepDate = function (step) {
            if ($scope.view == "timeline") {
                switch (step) {
                    case 'today':
                        $scope.timeline.setWindow(new Date().setHours(0, 0, 0, 0),
                            new Date().setHours(0, 0, 0, 0) + 86400000);
                        break;
                }
            }
            else {
                uiCalendarConfig.calendars.calendar.fullCalendar(step);
            }
        };

        $scope.renderCalender = function (calendar) {
            if (uiCalendarConfig.calendars[calendar]) {
                uiCalendarConfig.calendars[calendar].fullCalendar('render');
            }
        };

        // Render Tooltip
        $scope.eventRender = function (event, element, view) {
            element.attr({
                'tooltip': event.title,
                'tooltip-append-to-body': true
            });
            $compile(element)($scope);
        };

        $scope.dayClick = function (date, jsEvent, view) {
            console.log('Clicked on: ' + date.format());
            console.log('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            console.log('Current view: ' + view.name);

            eventEdit.add(date);
        };

        // Calendar config object
        $scope.calendarCfg = {
            height: 0,
            editable: true,
            header: false,
            defaultView: $scope.view != 'timeline' ? $scope.view : 'agendaWeek',
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender,
            dayClick: $scope.dayClick,
            views: {
                agendaDay: {
                    columnFormat: 'dddd D MMMM'
                },
                agendaWeek: {
                    columnFormat: 'D MMM'
                }
            }
        };

        // event sources array
        $scope.eventSources = [$scope.events, $scope.calEventsExt];

        // TODO: Height is fixed - it needs to account for parent. Should really be in the calendar directive!
        $timeout(function () {
            var w = angular.element($window);
            uiCalendarConfig.calendars.calendar.fullCalendar('option', 'height', w.height() - 152);

            w.bind('resize', function () {
                var w = angular.element($window);
                uiCalendarConfig.calendars.calendar.fullCalendar('option', 'height', w.height() - 152);
            });
        });

        $scope.onLoaded = function (timeline) {
            $scope.timeline = timeline;
        };

        function createTimeline(eventSources) {
            var groups = new VisDataSet();
            var items = new VisDataSet();

            // Loop through all the event sources
            angular.forEach(eventSources, function (source) {
                // Create a group for the source
                groups.add({id: source.id, content: source.name});

                // Add the events for this group
                angular.forEach(source.events, function (event) {
                    items.add({
//                        id: event.id,
                        group: source.id,
                        content: "<span class='fa fa-clock-o'></span>" + event.title,
                        start: event.start,
                        end: event.end,
                        type: event.end ? 'range' : 'box'
                    });
                });
            });

            // create visualization
            $scope.timelineOptions = {
                height: "100%",
                groupOrder: 'content'  // groupOrder can be a property name or a sorting function
            };

            $scope.graphEvents = {
                // rangechange: $scope.onRangeChange,
                // rangechanged: $scope.onRangeChanged,
                onload: $scope.onLoaded
            };

            $scope.timelineData = {
                items: items,
                groups: groups
            };
        }

        createTimeline($scope.eventSources);
    })

;
