(function() {
'use strict';

    angular
        .module('app')
        .controller('MenuCtrl', MenuController)
        .controller('DashboardSettingsCtrl', DashboardSettingsCtrl);

    MenuController.$inject = ['$rootScope', '$scope', 'dashboards', '$routeParams', '$interval', '$location', 'PersistenceService', 'OHService', 'prompt', '$filter', '$uibModal', 'Fullscreen', 'TranslationService'];
    function MenuController($rootScope, $scope, dashboards, $routeParams, $interval, $location, PersistenceService, OHService, prompt, $filter, $modal, Fullscreen, TranslationService) {
        var vm = this;
        vm.dashboards = dashboards;
        vm.editMode = false;
        vm.customWidgetsModels = {};
        vm.customDrawerWidgetsModels = {};
        vm.canPinToHome = (window.OHApp && typeof window.OHApp.pinToHome === 'function');
        vm.canExitToApp = (window.OHApp && typeof window.OHApp.exitToApp === 'function');
        if (window.OHApp && typeof window.OHApp.goFullscreen === 'function') {
            try {
                window.OHApp.goFullscreen();
            } catch (e) {
            }
        }

        activate();

        ////////////////

        function activate() {
            if ($rootScope.settings.no_scrolling) iNoBounce.enable(); else iNoBounce.disable();
            if ($routeParams.kiosk) $rootScope.kioskMode = ($routeParams.kiosk == 'on');

            OHService.reloadItems();
        }

        if (!$rootScope.menucolumns)
            $rootScope.menucolumns = 1;

        vm.gridsterOptions = {
            margins: [5, 5],
            columns: $rootScope.menucolumns,
            defaultSizeX: 1,
            defaultSizeY: 1,
            rowHeight: 110,
            swapping: true,
            //floating: false,
            mobileModeEnabled: false,
            draggable: { enabled: true, handle: '.handle', stop: function(evt) { PersistenceService.saveDashboards() } },
            resizable: { enabled: false, stop: function(evt) { PersistenceService.saveDashboards() } }
        }

        vm.addNewDashboard = function() {
            prompt({
                title: TranslationService.translate("menu.dialog.newdashboard.title", "New dashboard"),
                message: TranslationService.translate("menu.dialog.newdashboard.message", "Name of your new dashboard:"),
                input: true
            }).then(function (name) {
                dashboards.push({ id: name, name: name, widgets: [] });
                PersistenceService.saveDashboards();
            });

        }

        vm.toggleEditMode = function () {
            vm.editMode = !vm.editMode;
            vm.gridsterOptions.resizable.enabled=vm.editMode;
            if (vm.editMode)
                iNoBounce.disable();
            else
                if ($rootScope.settings.no_scrolling) iNoBounce.enable();
        }

        vm.onChangedColumns = function () {
            if ($rootScope.menucolumns !== vm.gridsterOptions.columns) {
                console.log('columns from ' + $rootScope.menucolumns + " to " + vm.gridsterOptions.columns);
                $rootScope.menucolumns = vm.gridsterOptions.columns;
                PersistenceService.saveDashboards();
            }
            angular.forEach(dashboards, function (dash) {
                if (dash.col > vm.gridsterOptions.columns - 1)
                    dash.col = vm.gridsterOptions.columns - 1;

                if (dash.col + dash.sizeX > vm.gridsterOptions.columns - 1)
                    dash.sizeX = vm.gridsterOptions.columns - dash.col;
            });
        };

        vm.viewDashboard = function (dash) {
            if (vm.editMode) {
                $location.url('/edit/' + dash.id);
            } else {
                $location.url('/view/' + dash.id);
            }
        }

		vm.goFullscreen = function () {
			Fullscreen.toggleAll();
        }
        
        vm.pinToHome = function () {
            if (window.OHApp && window.OHApp.pinToHome) {
                window.OHApp.pinToHome();
            }
        }

        vm.exitToApp = function () {
            if (window.OHApp && window.OHApp.exitToApp) {
                window.OHApp.exitToApp();
            }
        }

        vm.openDashboardSettings = function(dashboard) {
            $modal.open({
                scope: $scope,
                templateUrl: 'app/menu/menu.settings.tpl.html',
                controller: 'DashboardSettingsCtrl',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    dashboard: function() {
                        return dashboard;
                    },
                    translations: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('admin');
                    }],
                    translations_widgets: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('widgets');
                    }]
                }
            });
        };

    }

    // settings dialog
    DashboardSettingsCtrl.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'dashboard', 'OHService', 'PersistenceService', 'prompt', 'TranslationService'];

    function DashboardSettingsCtrl($scope, $timeout, $rootScope, $modalInstance, dashboard, OHService, PersistenceService, prompt, TranslationService) {
        $scope.dashboard = dashboard;
        if (!$scope.dashboard.tile) $scope.dashboard.tile = {};
        if (!$scope.dashboard.drawer) $scope.dashboard.drawer = {};
        if (!$scope.dashboard.header) $scope.dashboard.header = {};
        //$scope.items = OHService.getItems();

        $scope.form = {
            name: dashboard.name,
            sizeX: dashboard.sizeX,
            sizeY: dashboard.sizeY,
            col: dashboard.col,
            row: dashboard.row,
            columns: dashboard.columns,
            row_height: dashboard.row_height,
            widget_margin: dashboard.widget_margin,
            font_scale: dashboard.font_scale,
            mobile_breakpoint: dashboard.mobile_breakpoint,
            mobile_mode_enabled: dashboard.mobile_mode_enabled,
            tile: {
                background_image: dashboard.tile.background_image,
                backdrop_iconset: dashboard.tile.backdrop_iconset,
                backdrop_icon: dashboard.tile.backdrop_icon,
                backdrop_center : dashboard.tile.backdrop_center,
                iconset: dashboard.tile.iconset,
                icon: dashboard.tile.icon,
                icon_size: dashboard.tile.icon_size,
                icon_nolinebreak: dashboard.tile.icon_nolinebreak,
                icon_replacestext: dashboard.tile.icon_replacestext,
                title_color: dashboard.tile.title_color,
                no_click_feedback: dashboard.tile.no_click_feedback,
                use_custom_widget: dashboard.tile.use_custom_widget,
                custom_widget: dashboard.tile.custom_widget,
                custom_widget_dontwrap: dashboard.tile.custom_widget_dontwrap,
                custom_widget_nobackground: dashboard.tile.custom_widget_nobackground,
                custom_widget_config: dashboard.tile.custom_widget_config || {}
            },
            drawer: {
                hide: dashboard.drawer.hide,
                use_custom_widget: dashboard.drawer.use_custom_widget,
                custom_widget: dashboard.drawer.custom_widget,
                custom_widget_config: dashboard.drawer.custom_widget_config || {}
            },
            header: {
                use_custom_widget: dashboard.header.use_custom_widget,
                custom_widget: dashboard.header.custom_widget,
                custom_widget_config: dashboard.header.custom_widget_config || {}
            }
        };

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            prompt({
                title: TranslationService.translate("menu.dialog.removedashboard.title", "Remove dashboard"),
                message: TranslationService.translate("menu.dialog.removedashboard.message", "Please confirm you want to delete this dashboard: ") + dashboard.name
            }).then(function () {
                $rootScope.dashboards.splice($rootScope.dashboards.indexOf(dashboard), 1);
                PersistenceService.saveDashboards().then(function () {
                    $modalInstance.dismiss();
                });
            });
        };

        $scope.updateCustomWidgetSettings = function(erase_config, type) {
            if (!$scope.widgetsettings)
                $scope.widgetsettings = {};
            delete $scope.widgetsettings[type];
            if ($scope.form[type] && $scope.form[type].use_custom_widget && $scope.form[type].custom_widget) {
                if ($rootScope.configWidgets[$scope.form[type].custom_widget]) {
                    $scope.widgetsettings[type] = $rootScope.configWidgets[$scope.form[type].custom_widget].settings;
                } else if ($rootScope.customwidgets[$scope.form[type].custom_widget]) {
                    $scope.widgetsettings[type] = $rootScope.customwidgets[$scope.form[type].custom_widget].settings;
                }
            }
            if (erase_config && $scope.form[type].custom_widget_config) {
                $scope.form[type].custom_widget_config = {};
            }
        };

        $scope.submit = function() {
            angular.extend(dashboard, $scope.form);
            PersistenceService.getDashboard(dashboard.id).tile = angular.copy(dashboard.tile);
            if (!dashboard.tile.use_custom_widget) {
                delete dashboard.tile.custom_widget;
            }
            if (!dashboard.tile.custom_widget) {
                delete dashboard.tile.use_custom_widget;
                delete dashboard.tile.custom_widget;
                delete dashboard.tile.custom_widget_config;
                delete dashboard.tile.custom_widget_dontwrap;
                delete dashboard.tile.custom_widget_nobackground;
            }
            if (!dashboard.drawer.use_custom_widget && !dashboard.drawer.hide) {
                delete dashboard.drawer;
            }
            if (!dashboard.header.use_custom_widget) {
                delete dashboard.header;
            }

            PersistenceService.saveDashboards().then(function () {
                $modalInstance.close();
            }, function (err) {
                alert('Error while saving dashboards:' + err);
            });
        };

        $scope.updateCustomWidgetSettings(false, 'tile');
        $scope.updateCustomWidgetSettings(false, 'drawer');
        $scope.updateCustomWidgetSettings(false, 'header');
    }
    
})();