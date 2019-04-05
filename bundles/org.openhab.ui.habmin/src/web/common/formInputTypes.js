/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('formSelectInput', [
    'HABmin.smarthomeModel',
    'ngLocalize'
])
    .directive('formSelectYesNo', function (locale) {
        return {
            restrict: 'E',
            template: '<ui-select id="{{id}}" ' +
            'theme="bootstrap"> ' +
            '<ui-select-match placeholder="{{placeholder}}">' +
            '<span ng-class="$select.selected.icon">&nbsp;' +
            '<span>{{$select.selected.label}}</span>' +
            '</ui-select-match>' +
            '<ui-select-choices repeat="option.id as option in options">' +
            '<span ng-class="option.icon">&nbsp;' +
            '<span>{{option.label}}</span>' +
            '</ui-select-choices>' +
            '</ui-select>',
            scope: {
                id: "=",
                ngModel: "=",
                placeholder: '='
            },
            controller: function ($scope) {
                $scope.options = [
                    {id: 'yes', label: locale.getString("common.yes"), icon: "fa fa-fw fa-check"},
                    {id: 'no', label: locale.getString("common.no"), icon: "fa fa-fw fa-times"}
                ];
            }
        };
    })

    .directive('formSelectCategory', function (SmartHomeModel) {
        return {
            restrict: 'E',
            template: '<ui-select id="{{id}}" ' +
            'search-enabled="false" ' +
            'theme="bootstrap"> ' +
            '<ui-select-match placeholder="{{placeholder}}">' +
            '<habmin-icon class="fa fa-fw" category="{{$select.selected.id}}"></habmin-icon>&nbsp;' +
            '{{$select.selected.name}}' +
            '</ui-select-match>' +
            '<ui-select-choices repeat="category.id as category in categories | orderBy: \'name\'">' +
            '<habmin-icon class="fa fa-fw" category="{{category.id}}"></habmin-icon>&nbsp;' +
            '<span>{{category.name}}</span>' +
            '</ui-select-choices>' +
            '</ui-select>',
            scope: {
                id: "=",
                ngModel: "=",
                placeholder: '='
            },
            controller: function ($scope) {
                SmartHomeModel.ready().then(function () {
                    $scope.categories = SmartHomeModel.categories;
                });
            }
        };
    })
;





