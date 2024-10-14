angular.module('app')
    .controller('DashboardEditCtrl', ['$scope', '$rootScope', '$location', '$timeout', 'dashboard', 'Widgets', 'PersistenceService', 'OHService', '$ocLazyLoad', '$uibModal', 'TranslationService',
        function($scope, $rootScope, $location, $timeout, dashboard, Widgets, PersistenceService, OHService, $ocLazyLoad, $modal, TranslationService) {
            $scope.dashboard = dashboard;

            $scope.gridsterOptions = {
                margins: $scope.dashboard.widget_margin ?
                            [$scope.dashboard.widget_margin, $scope.dashboard.widget_margin] : [5, 5],
                columns: $scope.dashboard.columns || 12,
                rowHeight: $scope.dashboard.row_height || 'match',
                pushing: false,
                floating: false,
                mobileModeEnabled: false,
                draggable: {
                    handle: '.box-header'
                },
                resizable: {
                    enabled: true,
                    handles: ['se']
                }
            };

            $scope.widgetTypes = Widgets.getWidgetTypes();

            $scope.clear = function() {
                $scope.dashboard.widgets = [];
            };

            $scope.addWidget = function(type) {
                $scope.dashboard.widgets.push({
                    name: TranslationService.translate('designer.newwidget.defaultname', 'New Widget'),
                    sizeX: 4,
                    sizeY: 4,
                    item: null,
                    type: type
                });
            };

            $scope.addCustomWidget = function(id) {
                $scope.dashboard.widgets.push({
                    name: TranslationService.translate('designer.newwidget.defaultname', 'New Widget'),
                    sizeX: 4,
                    sizeY: 4,
                    type: 'template',
                    customwidget: id
                })
            }

            $scope.save = function() {
                PersistenceService.saveDashboards().then(function () {

                }, function (err) {
                    $scope.error = err;
                });
            };

            $scope.run = function() {
                PersistenceService.saveDashboards().then(function () {
                    $location.url('/view/' + $scope.dashboard.id);
                }, function (err) {
                    $scope.error = err;
                });
                
            };

            $scope.openWidgetGallery = function () {
                $ocLazyLoad.load('app/settings/settings.widgets.gallery.controller.js').then(function () {
                    $modal.open({
                        scope: $scope,
                        templateUrl: 'app/settings/settings.widgets.gallery.tpl.html',
                        controller: 'WidgetGalleryCtrl',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'lg',
                    }).result.then(function (widgets) {
                        angular.forEach(widgets, function (widget, id) {
                            delete widget.is_update;
                            $rootScope.customwidgets[id] = angular.copy(widget);
                            $scope.addCustomWidget(id);
                        });
                        PersistenceService.saveDashboards();
                    });
                });
            };


            OHService.reloadItems();
            iNoBounce.disable();

            $scope.widgetGalleryTooltip = TranslationService.translate('designer.addwidget.getmore.tooltip', 'Open the widget gallery to import more widgets');
        }
    ])

    .controller('CustomWidgetCtrl', ['$scope', '$uibModal', 'OHService',
        function($scope, $modal, OHService) {

            $scope.remove = function(widget) {
                $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            };

            $scope.openSettings = function(widget) {
                $modal.open({
                    scope: $scope,
                    templateUrl: 'app/widgets/' + widget.type + '/' + widget.type + '.settings.tpl.html',
                    controller: 'WidgetSettingsCtrl-' + widget.type,
                    backdrop: 'static',
                    size: (widget.type == 'template') ? 'lg' : '',
                    resolve: {
                        widget: function() {
                            return widget;
                        },
                        translations: ['TranslationService', function (TranslationService) {
                            return TranslationService.enterPart('widgets');
                        }]
                    }
                });
            };

            $scope.transferWidget = function(widget) {
                $modal.open({
                    scope: $scope,
                    templateUrl: 'app/dashboard/transferwidget.html',
                    controller: 'TransferWidgetCtrl',
                    backdrop: 'static',
                    resolve: {
                        widget: function() {
                            return widget;
                        }
                     }
                })
            };
        }
    ])

    .controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'OHService',
        function($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
            $scope.widget = widget;
            $scope.items = OHService.getItems();

            $scope.form = {
                name: widget.name,
                sizeX: widget.sizeX,
                sizeY: widget.sizeY,
                col: widget.col,
                row: widget.row,
                item: widget.item
            };

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
    ])


    // transfer (copy/move) dialog
    .controller('TransferWidgetCtrl', ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget',
        function ($scope, $timeout, $rootScope, $modalInstance, widget) {

            $scope.widgetName = widget.name;
            $scope.selDashboards = [];

            // build array with dashboard ids/names and pass to form
            $rootScope.dashboards.forEach( function(arrayItem) {
                $scope.selDashboards.push({id: arrayItem.id, name: arrayItem.name});
            });

            // make current dashboard default target
            $scope.form = {
                targetDashboard: $scope.dashboard.id,
                currentDashboard: $scope.dashboard.id
            };

            $scope.dismiss = function() {
                $modalInstance.dismiss();
            };


            $scope.copyWidget = function(par) {

                // copy widget and reset row and column to get placed automatically
                var copiedWidget = angular.copy(widget);
                delete copiedWidget.col;
                delete copiedWidget.row;
                // get index of target dashboard first and then copy
                var index = $rootScope.dashboards.findIndex( function(element) {return element.id == $scope.form.targetDashboard; });
                $rootScope.dashboards[index].widgets.push(copiedWidget);

                if (par.close) {
                    $modalInstance.close(widget);
                }
            };

            $scope.moveWidget = function() {
                $scope.copyWidget({close: false});

                // remove source widget from current dashboard
                this.remove(widget);

                $modalInstance.close(widget);
            };
        }
    ])

    // helper code
    .filter('object2Array', function() {
        return function(input) {
            var out = [];
            for (i in input) {
                out.push(input[i]);
            }
            return out;
        }
    });
