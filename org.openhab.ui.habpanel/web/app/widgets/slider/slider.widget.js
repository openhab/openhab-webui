(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetSlider', widgetSlider)
        .controller('WidgetSettingsCtrl-slider', WidgetSettingsCtrlSlider)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'slider',
                displayName: 'Slider',
                icon: 'resize-horizontal',
                description: 'A slider for setting numerical openHAB items'
            });
        });

    widgetSlider.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetSlider($rootScope, $modal, OHService) {
        // Usage: <widget-Slider ng-model="widget" />
        //
        // Creates: A Slider widget
        //
        var directive = {
            bindToController: true,
            controller: SliderController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/slider/slider.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    SliderController.$inject = ['$rootScope', '$scope', 'OHService', '$timeout'];
    function SliderController ($rootScope, $scope, OHService, $timeout) {
        var vm = this;
        this.widget = this.ngModel;

        function getValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item) {
                //console.log('item ' + vm.widget.item + ' not found');
                return;
            }

            var parts = item.state.split(',');
            var value;
            if (parts.length == 3) {
                // slider received HSB value, use the 3rd (brightness)
                value = parseFloat(parts[2]);
            } else if (parts.length == 1) {
                 var state = parts[0];
                
                // Handle dimmer-as-switch case for strings, avoids NaN when ON/OFF sent to dimmers
                if (state == "ON"){
                    value = 100;
                } else if (state == "OFF"){
                    value = 0;
                } else {
                    value = parseFloat(state);
                }
            } else {
                return undefined;
            }

            return value.toFixed(((+vm.widget.step).toFixed(2)).replace(/^-?\d*\.?|0+$/g, '').length);
        }

        vm.slider = {
            options: {
                id: 'slider-' + vm.widget.item,
                floor: (vm.widget.floor) ? vm.widget.floor : 0,
                ceil: (vm.widget.ceil) ? vm.widget.ceil : 100,
                step: (vm.widget.step) ? vm.widget.step : 1,
                precision: ((+vm.widget.step).toFixed(2)).replace(/^-?\d*\.?|0+$/g, '').length,
                keyboardSupport: false,
                vertical: vm.widget.vertical,
                showSelectionBar: true,
                hideLimitLabels: vm.widget.hidelimits,
                hidePointerLabels: vm.widget.hidepointer,
                showTicks: vm.widget.showticks || vm.widget.bigslider,
                showTicksValues: vm.widget.showticksvalues,
                rightToLeft: vm.widget.inverted,
                enforceStep: false,
                readOnly: (vm.widget.readonly) ? vm.widget.readonly : false, 
                disabled: (vm.widget.disabled) ? vm.widget.disabled : false,
                translate: function (value) {
                    return (vm.widget.unit) ? value + vm.widget.unit : value;
                },
                onEnd: function (id) {
                    vm.value = vm.slider.value;
                    OHService.sendCmd(vm.widget.item, vm.value.toString());
                }
            }
        };

        function updateValue() {
            var value = getValue();

            $timeout(function () {
                vm.value = vm.slider.value = value;
                vm.ready = true;
            });
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlSlider.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlSlider($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            vertical: widget.vertical,
            hidelabel: widget.hidelabel,
            floor: widget.floor || 0,
            ceil: widget.ceil || 100,
            step: widget.step || 1,
            unit: widget.unit,
            hidelimits: widget.hidelimits,
            hidepointer: widget.hidepointer,
            showticks: widget.showticks,
            showticksvalues: widget.showticksvalues,
            inverted: widget.inverted,
            bigslider: widget.bigslider,
            backdrop_iconset: widget.backdrop_iconset,
            backdrop_icon: widget.backdrop_icon,
            backdrop_center: widget.backdrop_center
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
