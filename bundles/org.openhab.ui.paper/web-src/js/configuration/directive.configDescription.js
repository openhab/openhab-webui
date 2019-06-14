;
(function() {
    'use strict';

    angular.module('PaperUI.directive.configDescription', []).component('configDescription', {
        bindings : {
            configuration : '=',
            parameters : '=',
            expertMode : '=?',
            configArray : '=?',
            form : '=?'
        },
        templateUrl : 'partials/configuration/directive.configDescription.html',
        controller : ConfigDescriptionController
    });

    function ConfigDescriptionController() {
        var ctrl = this;

        this.getName = getName;
        this.getParameterOptions = getParameterOptions;

        function getName(parameter, option) {
            if (!option) {
                return undefined;
            }
            return option.name ? option.name : parameter.context == 'thing' ? option.UID : parameter.context == 'channel' ? option.id : undefined;
        }

        function getParameterOptions(parameter) {
            if (parameter.context == 'serial-port') {
                return parameter.options.sort(function(o1, o2) {
                    return o1.label.localeCompare(o2.label);
                });
            }
            return parameter.options;
        }
    }

})()
