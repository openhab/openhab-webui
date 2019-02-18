/**
 * pick-a-color directive for AngularJS
 * Written by Chris Jackson
 * MIT License
 *
 * See https://github.com/lauren/pick-a-color for the excellent color picker
 */
angular.module('pickAColor', [])
    .provider("pickAColor", function() {
        this.options = {};

        this.$get = function () {
            var localOptions = this.options;
            return {
                getOptions: function () {
                    return localOptions;
                }
            };
        };

        this.setOptions = function (options) {
            this.options = options;
        };
    })

    .directive('pickAColor', function ($parse, pickAColor) {
        return {
            restrict: 'E',
            compile: function (element, attrs) {
                var model = $parse(attrs.ngModel);

                // Compile the HTML template
                var html = "<input type='text' id='" + attrs.id + "'" +
                    "name='" + attrs.name + "'" +
                    "' class='pick-a-color form-control'>" +
                    "</input>";

                var newElem = $(html);
                element.replaceWith(newElem);

                return function (scope, element, attrs, controller) {
                    // Process options
                    var options = pickAColor.getOptions();
                    if (attrs.inlineDropdown != null) {
                        options.inlineDropdown = attrs.inlineDropdown;
                    }
                    if (attrs.showSpectrum != null) {
                        options.showSpectrum = attrs.showSpectrum;
                    }
                    if (attrs.showSavedColors != null) {
                        options.showSavedColors = attrs.showSavedColors;
                    }
                    if (attrs.saveColorsPerElement != null) {
                        options.saveColorsPerElement = attrs.saveColorsPerElement;
                    }
                    if (attrs.fadeMenuToggle != null) {
                        options.fadeMenuToggle = attrs.fadeMenuToggle;
                    }
                    if (attrs.showAdvanced != null) {
                        options.showAdvanced = attrs.showAdvanced;
                    }
                    if (attrs.showBasicColors != null) {
                        options.showBasicColors = attrs.showBasicColors;
                    }
                    if (attrs.showHexInput != null) {
                        options.showHexInput = attrs.showHexInput;
                    }
                    if (attrs.allowBlank != null) {
                        options.allowBlank = attrs.allowBlank;
                    }

                    // Set the value before we initialise the picker
                    element.val(model(scope));

                    // Create the 'pick-a-color control
                    element.pickAColor(
                        options
                    );

                    // Handle changes to the value
                    element.on("change", function () {
                        var value = $(this).val();
                        scope.$apply(function (scope) {
                            // Change bound variable
                            model.assign(scope, value);
                        });
                    });
                };
            }
        };
    });
