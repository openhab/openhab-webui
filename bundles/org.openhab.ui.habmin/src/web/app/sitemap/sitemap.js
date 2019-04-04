/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.sitemap', [
    'ui.router',
    'HABmin.itemModel',
    'HABmin.sitemapModel',
    'sitemapColorWidget',
    'sitemapFrameWidget',
    'sitemapSliderWidget',
    'sitemapSelectionWidget',
    'sitemapSwitchWidget',
    'sitemapSetpointWidget',
    'sitemapTextWidget',
    'sitemapChartWidget',
    'ui.bootstrap.tooltip'
])

    .config(function config($stateProvider) {
        $stateProvider.state('sitemap', {
            url: '/sitemap',
            abstract: true,
            views: {
                "main": {
                    templateUrl: 'sitemap/sitemap.tpl.html'
                }
            },
            data: {
                pageTitle: 'Sitemap Main',
                sidepanelEnabled: false
            },
            controller: function ($scope, params) {
                console.log("Sitemap parameters:", params);
//                $scope.title = params.getData()
            }
        })
            .state('sitemap.view', {
                url: '/view/:sitemapName/:sitemapPage',
                //           views: {
                //             "main": {
//                    controller: 'SitemapCtrl',
                //                   templateUrl: 'sitemap/sitemap.tpl.html'
                //           }
                //     },
                data: {pageTitle: 'Sitemap View'},
                onEnter: function () {
                    console.log("onEnter");
                },
                onExit: function () {
                    console.log("onExit");
                }
            });
    })

    .directive('dynamicSitemap', function ($compile, SitemapModel, $stateParams, ItemModel) {
        return {
            restrict: 'A',
            replace: true,
            scope: {},
            controller: function ($scope, $element, $state) {
                // The following table maps widgets to directives
                var widgetMap = {
                    Colorpicker: {
                        directive: "sitemap-color"
                    },
                    Chart: {
                        directive: "sitemap-chart"
                    },
                    Frame: {
                        directive: "sitemap-frame"
                    },
                    Group: {
                        directive: "sitemap-frame"
                    },
                    Image: {
                        directive: "sitemap-text"
                    },
                    List: {
                        directive: "sitemap-text"
                    },
                    Selection: {
                        directive: "sitemap-selection"
                    },
                    Setpoint: {
                        directive: "sitemap-setpoint"
                    },
                    Slider: {
                        directive: "sitemap-slider"
                    },
                    Switch: {
                        directive: "sitemap-switch"
                    },
                    Text: {
                        directive: "sitemap-text"
                    },
                    Video: {
                        directive: "sitemap-text"
                    },
                    Webview: {
                        directive: "sitemap-text"
                    }
                };

                // Click handler to handle page changes within the sitemap
                $scope.click = function (sitemapName, sitemapPage) {
                    $state.go('sitemap.view', {sitemapName: sitemapName, sitemapPage: sitemapPage}, {reload: true});
                    setPage(sitemapName + '/' + sitemapPage);
                };

                // Handler to handle widget updates and send command to server
                $scope.$on('habminGUIUpdate', function (event, item, value) {
                    console.log("Received command for", item, value);
                    ItemModel.sendCommand(item, value);
                });

                // Make sure that we cancel the sitemap watch when we close
                $scope.$on('$destroy', function () {
                    console.log("Destroy...");
                    SitemapModel.cancelWatch();
                });

                var sitemapName = $stateParams.sitemapName;
                var sitemapPage = $stateParams.sitemapPage;

                setPage(sitemapName + '/' + sitemapPage);

                function setPage(pageAddress) {
                    SitemapModel.getPage(pageAddress).then(
                        function (data) {
                            console.log("OPEN Response is", data);
                            $element.empty();
                            $compile(processPage(data))($scope).appendTo($element);

                            SitemapModel.initWatch(pageAddress, updatePage);
                        });
                }

                function updatePage(pageDef) {
                    // Sanity check
                    if (pageDef === null || pageDef.widget === undefined) {
                        return "";
                    }

                    // Loop through all widgets on the page
                    // If the widget model isn't in the $scope, then we assume this is new
                    processWidgetUpdate(pageDef.widget);
                    $scope.$digest();
                    $scope.$broadcast('habminGUIRefresh');

                    // TODO: How to makes things disappear???
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

                            // If this exists, just update the model
                            if ($scope['w' + widget.widgetId] !== undefined) {
                                // Process the value to make it easier for the widgets
                                var t = processWidgetLabel(widget.label);
                                widget.label = t.label;
                                widget.value = t.value;

                                // We have to have a STATE update to update the GUI
                                if (widget.item !== undefined) {
                                    $scope['m' + widget.widgetId] = widget.item.state;
                                    $scope['w' + widget.widgetId] = widget;
                                }
                            }

                            // If it has children - process them
                            if (widget.widget !== undefined) {
                                processWidgetUpdate(widget.widget);
                            }
                        });
                    }
                }

                function processPage(pageDef) {
                    var pageTpl = '<div class=" sitemap-title"><div class="col-md-12">' +
                        '<span class="sitemap-parent">';
                    if (pageDef.parent != null) {
                        pageTpl +=
                            '<span tooltip="Back to ' + pageDef.parent.title +
                            '" tooltip-placement="right" tooltip-popup-delay="500" ng-click="click(\'' +
                            sitemapName + '\',\'' + pageDef.parent.id +
                            '\')" class="fa fa-chevron-circle-left"></span>';
                    }

                    pageTpl += '</span>';

                    var title = processWidgetLabel(pageDef.title);

                    // Handle differences between OH1 and OH2
                    var widgets;
                    if (pageDef.widget != null) {
                        widgets = [].concat(pageDef.widget);
                    }
                    else {
                        widgets = [].concat(pageDef.widgets);
                    }

                    pageTpl += '<span class="sitemap-title-icon">';
                    pageTpl += '<habmin-icon class="icon" icon="' + pageDef.icon + '"></habmin-icon>';
                    pageTpl += '</span>';
                    pageTpl += '<span>' + title.label + '</span>';
                    pageTpl += '<span class="pull-right">' + title.value + '</span></div></div>';
                    pageTpl += '<div class="sitemap-body">';
                    pageTpl += processWidget(widgets) + "</div>";

                    return pageTpl;
                }

                function processWidget(widgetArray) {
                    // Sanity check
                    if (widgetArray == null) {
                        return "";
                    }

                    var output = "";
                    angular.forEach(widgetArray, function (widget) {
                        // Sanity check
                        if (widget == null) {
                            return;
                        }

                        // Process the value to make it easier for the widgets
                        var t = processWidgetLabel(widget.label);
                        widget.label = t.label;
                        widget.value = t.value;

                        var state = "";
                        if (widget.item != null) {
                            state = widget.item.state;
                        }

                        var link = "";
                        if (widget.linkedPage) {
                            link = 'ng-click="click(\'' + sitemapName + '\',\'' + widget.linkedPage.id +
                            '\')"';
                        }

                        // Create a list of CSS classes for this widget
                        var widgetClass = [];
                        if (link !== "") {
                            widgetClass.push("sitemap-link");
                        }

                        // Make sure there's a definition for this widget type!
                        if (widgetMap[widget.type] === undefined) {
                            console.error("Undefined widget found", widget);
                            return;
                        }

                        // Process children
                        // Handle differences between OH1 and OH2
                        var children = "";
                        if (widget.widgets != null && [].concat(widget.widgets).length > 0) {
                            children = "<div>" + processWidget([].concat(widget.widgets)) + "</div>";
                        }
                        else if (widget.widget != null && [].concat(widget.widget).length > 0) {
                            children = "<div>" + processWidget([].concat(widget.widget)) + "</div>";
                        }
                        else {
                            widgetClass.push("sitemap-row");
                        }

                        // Generate the directive definition
                        output += '<div ';

                        if (widgetClass.length > 0) {
                            output += 'class ="' + widgetClass.join(" ");
                        }

                        output += '" id="' + widget.widgetId + '"' + link + '>' +
                        '<' + widgetMap[widget.type].directive +
                        ' widget="w' + widget.widgetId + '"' +
                        ' item-model="m' + widget.widgetId + '"';

                        if (widget.item != null) {
                            output += ' item-id="' + widget.item.name + '"';
                        }
                        output += '>' +
                        children +
                        '</' + widgetMap[widget.type].directive + '>' +
                        '</div>';

                        // Add the model references
                        if (widget.item !== undefined) {
                            $scope["m" + widget.widgetId] = widget.item.state;
                        }
                        $scope["w" + widget.widgetId] = widget;
                    });

                    return output;
                }

                function processWidgetLabel(title) {
                    if (title != null) {
                        var matches = title.match(/\[(.*?)\]/g);
                        var label = title;
                        var value = "";

                        if (matches != null && matches.length !== 0) {
                            value = matches[matches.length - 1].substring(1,
                                matches[matches.length - 1].length - 1);
                            label = label.substr(0, label.indexOf(matches[matches.length - 1]));
                        }

                        return {label: label.trim(), value: value.trim()};
                    }
                    else {
                        return {label: "", value: ""};
                    }
                }
            }
        };
    });
