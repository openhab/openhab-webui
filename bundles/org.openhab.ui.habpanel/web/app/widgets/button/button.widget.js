(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetButton', widgetButton)
        .controller('WidgetSettingsCtrl-button', WidgetSettingsCtrlButton)
        .config(function (WidgetsProvider) {
            WidgetsProvider.$get().registerType({
                type: 'button',
                displayName: 'Button',
                icon: 'download-alt',
                description: 'A button performing a certain action, like sending a command to an openHAB item'
            });
        });

    widgetButton.$inject = ['$rootScope', '$uibModal', 'Widgets', 'OHService'];
    function widgetButton($rootScope, $modal, Widgets, OHService) {
        // Usage: <widget-Button ng-model="widget" />
        //
        // Creates: A Button widget
        //
        var directive = {
            bindToController: true,
            controller: ButtonController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/button/button.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
            element[0].parentElement.parentElement.className += " activefeedback";
        }
    }
    ButtonController.$inject = ['$rootScope', '$scope', '$location', 'OHService', '$window', 'themeValueFilter'];
    function ButtonController($rootScope, $scope, $location, OHService, $window, themeValueFilter) {
        var vm = this;
        this.widget = this.ngModel;

        vm.background = this.widget.background;
        vm.foreground = this.widget.foreground;
        vm.font_size = this.widget.font_size;

        function updateValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item) {
                vm.value = vm.state = "N/A";
                return;
            }
            var value = item.transformedState || item.state;
            if (vm.widget.value_format) {
                if (item.type === "DateTime" || item.type === "DateTimeItem") {
                    value = $filter('date')(value, vm.widget.value_format);
                } else if (item.type.indexOf('Number:') === 0 && value.indexOf(' ') > 0) {
                    var format = vm.widget.value_format.replace('%unit%', value.split(' ')[1].replace('%', '%%'));
                    value = sprintf(format, value.split(' ')[0]);
                } else {
                    value = sprintf(vm.widget.value_format, value);
                }
            }
            if (vm.widget.value_useserverformat && item.stateDescription && item.stateDescription.pattern) {
                if (item.type.indexOf('Number:') === 0 && value.indexOf(' ') > 0) {
                    var format = item.stateDescription.pattern.replace('%unit%', value.split(' ')[1].replace('%', '%%'));
                    value = sprintf(format, value.split(' ')[0]);
                } else {
                    value = sprintf(item.stateDescription.pattern, value);
                }
            }
            vm.value = value;
            vm.state = item.state;

            var isActive = (vm.state === vm.widget.command || (vm.widget.action_type === 'navigate' && vm.widget.show_item_value && vm.state == vm.widget.navigate_active_state));
            vm.background = (isActive) ? vm.widget.background_active : vm.widget.background;
            vm.foreground = (isActive) ? vm.widget.foreground_active : vm.widget.foreground;
            if (vm.widget.show_item_value) {
                vm.value_color = themeValueFilter((isActive) ? vm.widget.value_color_active : vm.widget.value_color, 'primary-color');
            }
        }

        function onNavigate() {
            if (vm.widget.navigate_dashboard) {
                $location.url('/view/' + vm.widget.navigate_dashboard);
                return;
            }

            if (!vm.widget.navigate_url)
                return;

            switch (vm.widget.navigate_target || 'self') {
                case 'new_tab':
                    var w = $window.open(vm.widget.navigate_url);
                    w && (w.opener = null);
                    break;

                case 'new_window':
                    var w = $window.open(vm.widget.navigate_url, "_blank", "resizable=1", true);
                    w && (w.opener = null);
                    break;

                default:
                case 'self': {
                    $window.location.href = vm.widget.navigate_url;
                    break;
                }
            }

        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

        vm.sendCommand = function () {
            switch (vm.widget.action_type) {
                case "navigate":
                    onNavigate();
                    break;

                case "toggle":
                    if (vm.widget.command && vm.widget.command_alt) {
                        if (vm.state === vm.widget.command) {
                            OHService.sendCmd(this.widget.item, this.widget.command_alt);
                        } else {
                            OHService.sendCmd(this.widget.item, this.widget.command);
                        }
                    }
                    break;
                default:
                    OHService.sendCmd(this.widget.item, this.widget.command);
                    break;
            }
        }

    }


    // settings dialog
    WidgetSettingsCtrlButton.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlButton($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            action_type: widget.action_type || 'command',
            command: widget.command,
            command_alt: widget.command_alt,
            background: widget.background,
            foreground: widget.foreground,
            value_color: widget.value_color,
            font_size: widget.font_size,
            background_active: widget.background_active,
            foreground_active: widget.foreground_active,
            value_color_active: widget.value_color_active,
            backdrop_iconset: widget.backdrop_iconset,
            backdrop_icon: widget.backdrop_icon,
            backdrop_center: widget.backdrop_center,
            iconset: widget.iconset,
            icon: widget.icon,
            icon_size: widget.icon_size,
            icon_nolinebreak: widget.icon_nolinebreak,
            icon_replacestext: widget.icon_replacestext,
            navigate_type: (widget.navigate_url) ? 'url' : 'dashboard',
            navigate_url: widget.navigate_url,
            navigate_dashboard: widget.navigate_dashboard,
            navigate_target: widget.navigate_target || 'self',
            navigate_active_state: widget.navigate_active_state,
            show_item_value: widget.show_item_value,
            value_unit: widget.value_unit,
            value_font_size: widget.value_font_size,
            value_format: widget.value_format,
            value_useserverformat: widget.value_useserverformat,
            value_nolinebreak: widget.value_nolinebreak
        };

        $scope.dismiss = function () {
            $modalInstance.dismiss();
        };

        $scope.remove = function () {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function () {
            angular.extend(widget, $scope.form);
            switch (widget.action_type) {
                case "navigate":
                    delete widget.command;
                    delete widget.command_alt;

                    if ($scope.form.navigate_type === 'dashboard') {
                        delete widget.navigate_url;
                        delete widget.navigate_target;
                    } else {
                        delete widget.navigate_dashboard;
                    }

                    if (!$scope.form.show_item_value) {
                        delete widget.item;
                        delete widget.navigate_active_state;
                    } else {
                        delete widget.background_active;
                        delete widget.foreground_active;
                        delete widget.value_color_active;
                    }

                    break;

                case "toggle":
                    delete widget.navigate_url;
                    delete widget.navigate_dashboard;
                    delete widget.navigate_type;
                    delete widget.navigate_target;
                    delete widget.navigate_active_state;
                    break;

                default:
                    delete widget.command_alt;
                    delete widget.navigate_url;
                    delete widget.navigate_dashboard;
                    delete widget.navigate_type;
                    delete widget.navigate_target;
                    delete widget.navigate_active_state;
                    delete widget.action_type;
                    break;
            }

            if (!widget.show_item_value) {
                delete widget.show_item_value;
                delete widget.value_unit;
                delete widget.value_font_size;
                delete widget.value_format;
                delete widget.value_useserverformat;
                delete widget.value_nolinebreak;
                delete widget.value_color;
                delete widget.value_color_active;
            }

            $modalInstance.close(widget);
        };

    }


})();
