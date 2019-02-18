(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetKnob', widgetKnob)
        .controller('WidgetSettingsCtrl-knob', WidgetSettingsCtrlKnob)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'knob',
                displayName: 'Knob',
                icon: 'dashboard',
                description: 'A knob for setting numerical openHAB items'
            });
        });

    widgetKnob.$inject = ['$rootScope', '$timeout', '$uibModal', 'OHService'];
    function widgetKnob($rootScope, $timeout, $modal, OHService) {
        // Usage: <widget-knob ng-model="widget" />
        //
        // Creates: A knob widget
        //
        var directive = {
            bindToController: true,
            controller: KnobController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/knob/knob.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {

            function computeSize() {
                $timeout(function () {
                    var width = element[0].parentNode.parentNode.parentNode.style.width.replace('px', '');
                    scope.vm.knob.options.size = width - 20;
                    if (!scope.vm.widget.trackWidth)
                        scope.vm.knob.options.trackWidth = width / 5;
                    if (!scope.vm.widget.barWidth)
                        scope.vm.knob.options.barWidth = width / 5;
                });
            }

            computeSize();
            var resizeHandler = scope.$on('gridster-resized', computeSize);
            scope.$on('$destroy', resizeHandler);
        }
    }
    KnobController.$inject = ['$rootScope', '$scope', 'OHService', '$timeout', 'themeValueFilter'];
    function KnobController ($rootScope, $scope, OHService, $timeout, themeValueFilter) {
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
                // knob received HSB value, use the 3rd (brightness)
                value = parseFloat(parts[2]);
            } else if (parts.length == 1) {
                value = parseFloat(parts[0]);
            } else {
                return undefined;
            }

            if (vm.widget.useserverformat && item.stateDescription && item.stateDescription.pattern) {
                vm.knob.options.inputFormatter = function (input) {
                    return sprintf(item.stateDescription.pattern.replace('%unit%', ''), input);
                }
            }

            return value;
        }

        vm.knob = {
            options: {
                id: 'knob-' + vm.widget.item,
                animate: { enabled: false, duration: 0, ease: 'circle' },
                min: (vm.widget.floor) ? vm.widget.floor : 0,
                max: (vm.widget.ceil) ? vm.widget.ceil : 100,
                step: (vm.widget.step) ? vm.widget.step : 1,
                unit: (vm.widget.unit) ? vm.widget.unit : '',
                size: (vm.widget.size) ? vm.widget.size : 300,
                startAngle: (vm.widget.startAngle) ? vm.widget.startAngle : 0,
                endAngle: (vm.widget.endAngle) ? vm.widget.endAngle : 360,
                displayInput: (angular.isDefined(vm.widget.displayInput)) ? vm.widget.displayInput : true,
                readOnly: (angular.isDefined(vm.widget.readOnly)) ? vm.widget.readOnly : false,
                barWidth: (angular.isDefined(vm.widget.barWidth)) ? vm.widget.barWidth : 50,
                trackWidth: (angular.isDefined(vm.widget.trackWidth)) ? vm.widget.trackWidth : undefined,
                barColor: themeValueFilter(vm.widget.barColor, 'primary-color'),
                prevBarColor: (vm.widget.prevBarColor) ? vm.widget.prevBarColor: '#789',
                trackColor: (vm.widget.trackColor) ? vm.widget.trackColor : '#567',
                textColor: themeValueFilter(vm.widget.textColor, 'primary-color'),
                barCap: (angular.isDefined(vm.widget.barCap)) ? vm.widget.barCap : 0,
                trackCap: (angular.isDefined(vm.widget.trackCap)) ? vm.widget.trackCap : 0,
                fontSize: (vm.widget.fontSize) ? vm.widget.fontSize : 'auto',
                subText: { enabled: vm.widget.subTextEnabled, text: vm.widget.name, color: themeValueFilter(null, 'widget-text-color'), font:'auto' },
                bgColor: (vm.widget.bgColor) ? vm.widget.bgColor : '',
                scale: {
                    enabled: vm.widget.scaleEnabled,
                    type: vm.widget.scaleType,
                    color: (vm.widget.scaleColor) ? vm.widget.scaleColor : '#567',
                    width: (vm.widget.scaleWidth) ? vm.widget.scaleWidth : 2
                },
                displayPrevious: (angular.isDefined(vm.widget.displayPrevious)) ? vm.widget.displayPrevious : true,
                skin: {
                    type: (vm.widget.skinType) ? vm.widget.skinType : 'simple',
                    width: (angular.isDefined(vm.widget.skinWidth)) ? vm.widget.skinWidth : 10,
                    color: (vm.widget.skinColor) ? vm.widget.skinColor : '#abc',
                    spaceWidth: (vm.widget.skinSpaceWidth) ? vm.widget.skinSpaceWidth : 5
                },
                dynamicOptions: true,
                onEnd: function (val) {
                    if (vm.value !== val) {
                        vm.value = val;
                        OHService.sendCmd(vm.widget.item, vm.value.toString());
                    }
                },
                rangesEnabled: (angular.isDefined(vm.widget.rangesEnabled)) ? vm.widget.rangesEnabled : false,
                ranges: []
            }
        };
        if (vm.widget.scaleQuantity) vm.knob.options.scale.quantity = vm.widget.scaleQuantity;
        if (vm.widget.scaleSpaceWidth) vm.knob.options.scale.spaceWidth = vm.widget.scaleSpaceWidth;
        if (vm.widget.format && !vm.widget.useserverformat) {
            vm.knob.options.inputFormatter = function (input) {
                return sprintf(vm.widget.format, input);
            }
        }

        // if ranges are enabled update knob setings
        if ( vm.widget.rangesEnabled) {
          vm.widget.ranges.forEach(function(rangeItem) {
              if (rangeItem.min != 0 || rangeItem.max != 0) {
                  var textColor = themeValueFilter(vm.widget.textColor, 'primary-color');
                  if (vm.widget.rangesTextColorMatching == true) {
                    textColor = rangeItem.barColor;
                  }
                  vm.knob.options.ranges.push({
                      min: rangeItem.min,
                      max: rangeItem.max,
                      barColor: rangeItem.barColor,
                      textColor: textColor
                  })
              }
          });
        }


        var initialValue = getValue();
        vm.value = vm.knob.value = angular.isDefined(getValue()) ? getValue() : 0;

        function updateValue() {
            var value = getValue();

            if (!isNaN(value) && value != vm.knob.value) {
                vm.knob.options.animate.enabled = true;
                vm.value = vm.knob.value = value;
            }

        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlKnob.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlKnob($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.colorPopover = {
            barColorTemplateUrl: 'barColorpopoverTemplate.html',
            textColorTemplateUrl: 'textColorpopoverTemplate.html',
        };

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            floor: widget.floor || 0,
            ceil: widget.ceil || 100,
            step: widget.step || 1,
            unit: widget.unit,
            size: widget.size,
            startAngle: widget.startAngle,
            endAngle: widget.endAngle,
            displayInput: angular.isDefined(widget.displayInput) ? widget.displayInput : true,
            format: widget.format,
            useserverformat: widget.useserverformat,
            readOnly: widget.readOnly,
            barWidth: widget.barWidth,
            trackWidth: widget.trackWidth,
            barColor: widget.barColor,
            prevBarColor: widget.prevBarColor,
            trackColor: widget.trackColor,
            textColor: widget.textColor,
            barCap: widget.barCap,
            trackCap: widget.trackCap,
            fontSize: widget.fontSize,
            subTextEnabled: widget.subTextEnabled,
            scaleEnabled: widget.scaleEnabled,
            scaleType: widget.scaleType,
            scaleColor: widget.scaleColor,
            scaleWidth: widget.scaleWidth,
            scaleQuantity: widget.scaleQuantity,
            scaleSpaceWidth: widget.scaleSpaceWidth,
            displayPrevious: angular.isDefined(widget.displayPrevious) ? widget.displayPrevious : true,
            skinType: widget.skinType,
            skinWidth: widget.skinWidth,
            skinColor: widget.skinColor,
            skinSpaceWidth: widget.skinSpaceWidth,
            rangesEnabled: widget.rangesEnabled,
            rangesTextColorMatching: widget.rangesTextColorMatching,
            ranges: widget.ranges || []
        };


        $scope.removeRange = function(rangeIndex){
            $scope.form.ranges.splice( rangeIndex, 1);
        };


        $scope.addRange = function() {
            var min = $scope.form.floor;
            if ($scope.form.ranges.length > 0) {
                min = $scope.form.ranges[$scope.form.ranges.length - 1].max;  // if not the first range use max of previous range
            }
            $scope.form.ranges.push({
                min: min,   // use max of last range
                max: $scope.form.ceil,
                barColor: widget.barColor,   // use barColor
                textColor: widget.textColor   // use textColor
            });
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
            if (!!widget.displayInput) delete widget.displayInput;
            if (!!widget.displayPrevious) delete widget.displayPrevious;

            $modalInstance.close(widget);
        };

    }


})();
