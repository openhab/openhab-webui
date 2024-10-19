(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetDummy', widgetDummy)
        .controller('WidgetSettingsCtrl-dummy', WidgetSettingsCtrlDummy)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'dummy',
                displayName: 'Dummy',
                icon: 'text-color',
                description: 'A dummy widget - displays the value of an openHAB item'
            });
        });

    widgetDummy.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetDummy($rootScope, $modal, OHService) {
        // Usage: <widget-dummy ng-model="widget" />
        //
        // Creates: A dummy widget
        //
        var directive = {
            bindToController: true,
            controller: DummyController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/dummy/dummy.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    DummyController.$inject = ['$rootScope', '$scope', '$filter', 'OHService'];
    function DummyController ($rootScope, $scope, $filter, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item) {
                vm.value = "N/A";
                return;
            }

            var value = item.transformedState || item.state;
            
            function filterOption(option, i, options) {
                if (option.value === item.state) return true;
                return false;
            }
            if (vm.widget.usedescription) {
                var options = item.stateDescription.options;
                if (angular.isArray(options) && $filter('filter')(options, filterOption, true).length > 0) {
                    var option = $filter('filter')(options, filterOption, true)[0];
                    if (option.label) {
                        value = option.label;
                    }
                }
            }

            if (vm.widget.format) {
                if (item.type === "DateTime" || item.type === "DateTimeItem") {
                    value = $filter('date')(value, vm.widget.format);
                } else if (item.type.indexOf('Number:') === 0 && value.indexOf(' ') > 0) {
                    var format = vm.widget.format.replace('%unit%', value.split(' ')[1].replace('%', '%%'));
                    value = sprintf(format, value.split(' ')[0]);
                } else {
                    value = sprintf(vm.widget.format, value);
                }
            }
            if (vm.widget.useserverformat && item.stateDescription && item.stateDescription.pattern) {
                if (item.type.indexOf('Number:') === 0 && value.indexOf(' ') > 0) {
                    var format = item.stateDescription.pattern.replace('%unit%', value.split(' ')[1].replace('%', '%%'));
                    value = sprintf(format, value.split(' ')[0]);
                } else {
                    value = sprintf(item.stateDescription.pattern, value);
                }
            }
            vm.value = value;
            vm.state = item.state;
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlDummy.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlDummy($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name             : widget.name,
            sizeX            : widget.sizeX,
            sizeY            : widget.sizeY,
            col              : widget.col,
            row              : widget.row,
            item             : widget.item,
            // background       : widget.background,
            // foreground       : widget.foreground,
            font_size        : widget.font_size,
            nolinebreak      : widget.nolinebreak,
            unit             : widget.unit,
            format           : widget.format,
            useserverformat  : widget.useserverformat,
            backdrop_iconset : widget.backdrop_iconset,
            backdrop_icon    : widget.backdrop_icon,
            backdrop_center  : widget.backdrop_center,
            iconset          : widget.iconset,
            icon             : widget.icon,
            icon_size        : widget.icon_size,
            icon_nolinebreak : widget.icon_nolinebreak,
            icon_replacestext: widget.icon_replacestext,
            value_color      : widget.value_color,
            usedescription   : widget.usedescription
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


})();
