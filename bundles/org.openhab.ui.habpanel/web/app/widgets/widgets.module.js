(function() {
    'use strict';

    angular.module('app.widgets', [
        'app.services',
        'rzModule',
        'ui.knob',
        'web.colorpicker',
        'n3-line-chart',
        'sprintf',
        'ui.codemirror',
        'ds.clock',
        'aCKolor'
    ])
    .value('WidgetTypes', [])
    .factory('Widgets', WidgetsService)
    .directive('genericWidget', GenericWidgetDirective)
    .directive('widgetIcon', WidgetIcon)
    .directive('itemTypeIcon', ItemTypeIcon)
    .directive('itemPicker', ItemPicker)
    .filter('themeValue', ThemeValueFilter)
    

    WidgetsService.$inject = ['WidgetTypes'];
    function WidgetsService(widgetTypes) {

        var service = {
            registerType: registerType,
            getWidgetTypes: getWidgetTypes
        }

        return service;

        ////////////////
        
        function registerType(widget) {
            widgetTypes.push(widget);
            console.log("Registered widget type: " + widget.type);
        }

        function getWidgetTypes() {
            return widgetTypes;
        }

    }

    GenericWidgetDirective.$inject = ['$compile', 'Widgets'];
    function GenericWidgetDirective($compile, widgets) {
        var directive = {
            restrict: 'AE',
            replace: true,
            scope: {
                type   : '=',
                ngModel: '='
            },
            link: function (scope, element, attrs) {
                element.html('<widget-' + scope.type + ' ng-model="ngModel"></widget-' + scope.type + '>');
                $compile(element.contents())(scope);
            }
        }

        return directive;
    }

    WidgetIcon.$inject = ['IconService'];

    function WidgetIcon(IconService) {
        var directive = {
            link: link,
            restrict: 'AE',
            template: 
                '<div class="icon" ng-class="{backdrop: backdrop, center: center, inline: inline}">' +
                '<img ng-if="backdrop" height="100%" ng-class="{ colorize: colorize }" class="icon-tile-backdrop" ng-src="{{iconUrl}}" />' +
                '<img ng-if="!backdrop" ng-style="{ width: size + \'px\' }" ng-class="{ colorize: colorize, off: state==\'OFF\' }" class="icon-tile" ng-src="{{iconUrl}}" />' +
                '</div>',
            scope: {
                iconset : '=',
                icon    : '=',
                backdrop: '=?',
                center  : '=?',
                inline  : '=?',
                size    : '=?',
                state   : '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            if (!scope.size) scope.size = 32;
            scope.colorize = IconService.getIconSet(scope.iconset).colorize;
            scope.iconUrl = IconService.getIconUrl(scope.iconset, scope.icon);

            scope.$watch('state', function (state) {
                scope.iconUrl = IconService.getIconUrl(
                    scope.iconset,
                    scope.icon,
                    (state) ? state.toString() : null
                );
            });
        }
    }

    function ItemTypeIcon() {
        var directive = {
            link: link,
            restrict: 'AE',
            template:
                '<strong ng-if="type.indexOf(\'Number\') >= 0" title="Number" style="font-size: 1.2em; line-height: 0.9em; margin: -0.2em 0.1em;">#</strong>' +
                '<i ng-if="type.indexOf(\'Number\') < 0" title="{{type}}" class="glyphicon glyphicon-{{getGlyph()}}"></i>',
            scope: {
                type: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
            scope.getGlyph = function () {
                switch (scope.type) {
                   case 'Group': return 'th-large';
                    case 'Switch': return 'off';
                    case 'String': return 'font';
                    case 'Number': return 'usd';
                    case 'Color': return 'tint';
                    case 'DateTime': return 'calendar';
                    case 'Dimmer': return 'sort-by-attributes';
                    case 'Rollershutter': return 'oil';
                    case 'Contact': return 'resize-small';
                    case 'Player': return 'fast-forward';
                    case 'Image': return 'picture';
                    case 'Location': return 'map-marker';
                    case 'Call': return 'earphone';
                    default: return 'asterisk';
                }
            };
        }
    }


    ItemPicker.$inject = ['$filter', 'OHService'];

    function ItemPicker($filter, OHService) {
        var directive = {
            bindToController: true,
            link: link,
            controller: ItemPickerController,
            controllerAs: 'vm',
            restrict: 'AE',
            template:
                '<ui-select ng-model="vm.selectedItem" theme="selectize" title="Choose an openHAB item">' +
                '  <ui-select-match placeholder="{{vm.placeholderText}}"><item-type-icon type="$select.selected.type"></item-type-icon>&nbsp;{{$select.selected.name}}</ui-select-match>' +
                '  <ui-select-choices repeat="item in vm.itemlist | filter: $select.search">' +
                '    <div><item-type-icon type="item.type"></item-type-icon>&nbsp;<span ng-bind-html="item.name | highlight: $select.search"></div>' +
                '    <small ng-bind-html="item.label | highlight: $select.search"></small>' +
                '  </ui-select-choices>' +
                '</ui-select>',
            scope: {
                ngModel: '=',
                filterType: '@',
                includeGroups: '=?'
            }
        };
        return directive;

        function link(scope, element, attrs) {
        }
    }
    ItemPickerController.$inject = ['$scope', '$filter', 'OHService', 'TranslationService'];
    function ItemPickerController ($scope, $filter, OHService, TranslationService) {
        var vm = this;
        vm.selectedItem = OHService.getItem(this.ngModel);
        vm.itemlist = OHService.getItems();
        if (this.filterType) {
            vm.itemlist = $filter('filter')(vm.itemlist, function (item) {
                if (vm.includeGroups) {
                    return !item.type.indexOf(vm.filterType) || !item.type.indexOf('Group');
                } else {
                    return !item.type.indexOf(vm.filterType);
                }
            });
        }

        $scope.$watch("vm.selectedItem", function (newitem, oldvalue) {
            if (newitem && newitem.name)
                $scope.vm.ngModel = newitem.name;
        });

        vm.placeholderText = TranslationService.translate('itempicker.placeholder', 'Search or select an openHAB item');
    }

    ThemeValueFilter.$inject = ['$window'];
    function ThemeValueFilter($window) {
        return fallbackToThemeValue;

        ////////////////

        function fallbackToThemeValue(value, themePropertyName) {
            if (value) return value;

            var themeStyles = window.getComputedStyle(document.body);
            var themeValue = themeStyles.getPropertyValue('--' + themePropertyName);
            return (themeValue) ? themeValue.trim() : null;
        }
    }
})();
