(function () {
    var module = angular.module('toggle-switch', ['ng']);

    module.provider('toggleSwitchConfig', [function () {
        this.onLabel = 'On';
        this.offLabel = 'Off';
        this.knobLabel = '\u00a0';
        this.onValue = true;
        this.offValue = false;

        var self = this;
        this.$get = function () {
            return {
                onLabel: self.onLabel,
                onValue: self.onValue,
                offLabel: self.offLabel,
                offValue: self.offValue,
                knobLabel: self.knobLabel
            };
        };
    }]);

    module.directive('toggleSwitch', ['toggleSwitchConfig', function (toggleSwitchConfig) {
        return {
            restrict: 'EA',
            replace: true,
            require: 'ngModel',
            scope: {
                disabled: '@',
                onLabel: '@',
                onValue: '@',
                offLabel: '@',
                offValue: '@',
                knobLabel: '@'
            },
            template: '<div role="radio" class="toggle-switch" ng-class="{ \'disabled\': disabled }">' +
            '<div class="toggle-switch-animate" ng-class="{\'switch-off\': !state, \'switch-on\': state}">' +
            '<span class="switch-left" ng-bind="onLabel"></span>' +
            '<span class="knob" ng-bind="knobLabel"></span>' +
            '<span class="switch-right" ng-bind="offLabel"></span>' +
            '</div>' +
            '</div>',
            compile: function (element, attrs) {
                if (!attrs.onLabel) {
                    attrs.onLabel = toggleSwitchConfig.onLabel;
                }
                if (!attrs.onValue) {
                    attrs.onValue = toggleSwitchConfig.onValue;
                }
                if (!attrs.offLabel) {
                    attrs.offLabel = toggleSwitchConfig.offLabel;
                }
                if (!attrs.offValue) {
                    attrs.offValue = toggleSwitchConfig.offValue;
                }
                if (!attrs.knobLabel) {
                    attrs.knobLabel = toggleSwitchConfig.knobLabel;
                }

                return this.link;
            },
            link: function (scope, element, attrs, ngModelCtrl) {
                var KEY_SPACE = 32;

                element.on('click', function () {
                    scope.$apply(scope.toggle);
                });

                element.on('keydown', function (e) {
                    var key = e.which ? e.which : e.keyCode;
                    if (key === KEY_SPACE) {
                        scope.$apply(scope.toggle);
                    }
                });

                ngModelCtrl.$formatters.push(function (modelValue) {
                    if (modelValue == 0) {
                        modelValue = scope.offValue;
                    }
                    scope.state = modelValue == scope.offValue ? false : true;
                    return modelValue;
                });

                ngModelCtrl.$parsers.push(function (viewValue) {
                    return viewValue;
                });

                ngModelCtrl.$viewChangeListeners.push(function () {
                    scope.$eval(attrs.ngChange);
                });

                ngModelCtrl.$render = function () {
                    scope.model = ngModelCtrl.$viewValue;
                };

                scope.toggle = function toggle() {
                    if (!scope.disabled) {
                        scope.state = !scope.state;
                        scope.model = scope.state ? scope.onValue : scope.offValue;
                        ngModelCtrl.$setViewValue(scope.model);
                    }
                };
            }
        };
    }]);
})();
