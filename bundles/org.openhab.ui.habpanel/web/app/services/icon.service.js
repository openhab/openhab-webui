(function() {
'use strict';

    angular
        .module('app.services')
        .service('IconService', IconService)
        .directive('iconPicker', IconPicker)

    IconService.$inject = ['$http', '$q', '$filter'];
    function IconService($http, $q, $filter) {
        this.getIconUrl = getIconUrl;
        this.getIconSets = getIconSets;
        this.getIconSet = getIconSet;
        this.getIcons = getIcons;

        var iconsets = [
            { id: 'freepik-household', name: 'Builtin: Freepik Household', type: 'builtin', colorize: true },
            { id: 'freepik-gadgets', name: 'Builtin: Freepik Gadgets', type: 'builtin', colorize: true },
            { id: 'freepik-housethings', name: 'Builtin: Freepik House Things', type: 'builtin', colorize: true },
            { id: 'smarthome-set', name: 'Builtin: Smart Home Set', type: 'builtin', colorize: true },
            { id: 'eclipse-smarthome-classic', name: 'Eclipse SmartHome Classic', type: 'oh2', oh2iconset: 'classic', colorize: false }
        ];
        
        ////////////////

        function getIconUrl(iconset, icon, state) {
            if (iconset === 'custom-icon') {
                return '/icon/' + icon + '?format=svg' + ((state) ? '&state=' + state : '');
            } else if (iconset === 'custom-url') {
                return icon;
            }

            var set = $filter('filter')(iconsets, {id: iconset}, true)[0];
            if (set.type === 'builtin') {
                return 'assets/icons/' + set.id + '/' + icon + '.svg';
            } else {
                return '/icon/' + icon + '?format=svg' + ((state) ? '&state=' + state : '');
            }
        }

        function getIconSets() {
            // TODO: get iconsets from the API if using OH2
            return iconsets;
        }

        function getIconSet(iconset) {
            if (iconset === 'custom-icon' || iconset === 'custom-url') {
                return { colorize: false };
            }
            return $filter('filter')(iconsets, {id: iconset}, true)[0];
        }

        function getIcons(iconset) {
            return $http.get('assets/icons/' + iconset + '.list.json');
        }

    }


    // TODO: Move this directive elsewhere
    IconPicker.$inject = ['IconService', 'TranslationService'];
    function IconPicker(IconService, TranslationService) {
        var directive = {
            link: link,
            restrict: 'AE',
            template: 
                // TODO put this template in a HTML file
                '<img ng-if="(iconset === \'custom-icon\' || iconset === \'custom-url\') && iconUrl" width="64px" height="64px" style="float:right; border: 0;" ng-src="{{iconUrl}}" />' +
                '<div class="btn-group" uib-dropdown is-open="status.isopen2">' +
                '<a href id="iconset-picker-btn" class="btn btn-default" uib-dropdown-toggle>' +
                '{{setdropdownlabel}}&nbsp;<span class="caret" /></a>' +
                '<ul class="dropdown-menu" role="menu" aria-labelledby="iconset-picker-btn">' +
                '<li><a ng-click="clearIcon()"><em translate-keep-content translate="iconpicker.none">(none)</em></a></li>' +
                '<li ng-repeat="iconset in iconsets"><a ng-click="selectIconset(iconset.id)">{{iconset.name}}</a></li>' +
                '<li class="divider"></li>' +
                '<li><a ng-click="selectCustomIcon()" translate-keep-content translate="iconpicker.customicon">Custom icon</a></li>' +
                '<li><a ng-click="selectCustomURL()" translate-keep-content translate="iconpicker.customurl">Custom URL</a></li>' +
                '</ul>' +
                '</div><br /><br />' +
                '<div ng-if="iconset && iconset !== \'custom-icon\' && iconset !== \'custom-url\'" class="btn-group" uib-dropdown is-open="status.isopen">' +
                '<a href id="icon-picker-btn" class="btn btn-default" uib-dropdown-toggle>' +
                '<img width="64px" height="64px" ng-src="{{iconUrl}}" />&nbsp;{{icon}}&nbsp;<span class="caret" />' +
                '</a>' +
                '<ul style="width: 420px" class="dropdown-menu" role="menu" aria-labelledby="icon-picker-btn">' +
                '<li class="iconpicker-icon" style="display: inline-flex" ng-repeat="icon in icons"><a style="display:inline" ng-click="selectIcon(icon)"><img width="64px" height="64px" ng-src="{{iconService.getIconUrl(iconset, icon)}}" title="{{icon}}" /></a></li> ' +
                '</ul>' +
                '<br /><br /><small ng-if="notice" style="display:inherit"><a target="_blank" href="{{noticeUrl}}">{{notice}}</a></small><br />' +
                '</div>' +
                '<div ng-show="iconset === \'custom-icon\'"><span translate>Name</span>:&nbsp;<input type="text" ng-model="icon" ng-model-options="{ updateOn: \'blur\' }" uib-tooltip-html="customIconTooltip" tooltip-trigger="focus" tooltip-placement="right" /><br /><br /></div>' +
                '<div ng-show="iconset === \'custom-url\'">URL:&nbsp;<input type="text" ng-model="icon" ng-model-options="{ updateOn: \'blur\' }" /><br /><br /></div>',
            scope: {
                iconset: '=',
                icon: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            scope.iconsets = IconService.getIconSets();
            scope.iconService = IconService;

            scope.selectIconset = function (iconset) {
                scope.icons = [];
                scope.icon = undefined;
                scope.iconUrl = '';
                scope.iconset = iconset;
            };

            scope.selectIcon = function (icon) {
                scope.icon = icon;
            };

            scope.selectCustomIcon = function () {
                scope.clearIcon();
                scope.iconset = 'custom-icon';
            }

            scope.selectCustomURL = function () {
                scope.clearIcon();
                scope.iconset = 'custom-url';
            }

            scope.clearIcon = function () {
                scope.icons = [];
                scope.icon = undefined;
                scope.iconUrl = '';
                scope.iconset = undefined;
                scope.noticeUrl = undefined;
                scope.notice = undefined;
            }

            scope.$watch('iconset', function (iconset) {
                if (!iconset) {
                    scope.setdropdownlabel = TranslationService.translate('iconpicker.selecticonset', 'Select icon set');
                    return;
                } else if (iconset === 'custom-icon') {
                    scope.setdropdownlabel = TranslationService.translate('iconpicker.customicon', 'Custom icon');
                    return;
                } else if (iconset === 'custom-url') {
                    scope.setdropdownlabel = TranslationService.translate('iconpicker.customurl', 'Custom URL');
                    return;
                }
                var set = IconService.getIconSet(iconset);
                scope.setdropdownlabel = set.name;

                IconService.getIcons(set.id).then(function (res) {
                    scope.icons = res.data.icons;
                    scope.notice = res.data.notice;
                    scope.noticeUrl = res.data.url;
                })
            });

            scope.$watch('icon', function (set) {
                scope.iconUrl = '';
                if (!scope.iconset || !scope.icon) return;
                scope.iconUrl = IconService.getIconUrl(scope.iconset, scope.icon);
            });

            scope.customIconTooltip = TranslationService.translate('iconpicker.customicontooltip', 'Type the name of a <a href="http://docs.openhab.org/configuration/items.html#icons" target="_blank">registered icon</a> (only SVG supported)<br />Examples: <em>switch</em>, <em>temperature</em> or an additional icon in your configuration\'s <code>icons/classic</code> folder');

        }
    }


})();
