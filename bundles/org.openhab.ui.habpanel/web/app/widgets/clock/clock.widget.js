(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetClock', widgetClock)
        .controller('WidgetSettingsCtrl-clock', WidgetSettingsCtrlClock)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'clock',
                displayName: 'Clock',
                icon: 'time',
                description: 'A clock widget - displays an analog or digital clock'
            });
        });

    widgetClock.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetClock($rootScope, $modal, OHService) {
        // Usage: <widget-clock ng-model="widget" />
        //
        // Creates: A clock widget
        //
        var directive = {
            bindToController: true,
            controller: ClockController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/clock/clock.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
        }
    }
    ClockController.$inject = ['$rootScope', '$scope', '$filter', 'OHService'];
    function ClockController ($rootScope, $scope, $filter, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item) {
                vm.value = "N/A";
                return;
            }
            var value = item.state;

            vm.value = value;
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlClock.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlClock($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            mode: widget.mode,
            analog_theme: widget.analog_theme,
            font_size: widget.font_size,
            nobackground: widget.nobackground,
            digital_format: widget.digital_format,
            digital_color: widget.digital_color
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
