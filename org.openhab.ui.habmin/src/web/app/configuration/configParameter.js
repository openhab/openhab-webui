/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.parameter', [
//    'ui.select',
    'ngSanitize'
])

    .directive('configParameter',
    function ($q, $parse, $compile, $document, $timeout) {
        return {
            restrict: 'A', // supports using directive as element only
            scope: {
                template: "@",
                bindingChange: "=",
                bindingData: "="
            },
            link: function ($scope, element, attrs) {

                var cfg = angular.fromJson(attrs.configParameter);

                if (cfg.readOnly) {
                    element.attr('readonly', 'true');
                }

                switch (cfg.type) {
                    case 'INTEGER':
                        element.attr('type', 'number');
                        if (cfg.min) {
                            element.attr('min', cfg.min);
                        }
                        if (cfg.max) {
                            element.attr('max', cfg.max);
                        }
//                        if (cfg.step) {
//                            element.attr('min', cfg.step);
//                        }
                        break;
                    default:
                        break;
                }
            }
        };
    })
;