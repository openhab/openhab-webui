/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('sitemapSelectionWidget', [])
    .directive('sitemapSelection', function () {
        return {
            restrict: 'E',
            template: '<div><span ng-style="labelColor">{{widget.label}}</span><span class="pull-right" ng-style="valueColor">' +
            '<div class="btn-group">' +
            '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
            'Action <span class="caret"></span>' +
            '</button>' +
            '<ul class="dropdown-menu" role="menu">' +
            '<li><a href="#">Action</a></li>' +
            '<li><a href="#">Another action</a></li>' +
            '<li><a href="#">Something else here</a></li>' +
            '<li class="divider"></li>' +
            '<li><a href="#">Separated link</a></li>' +
            '</ul>' +
            '</div>' +
            '</span></div>',
            scope: {
                itemId: "@",
                label: "@",
                value: "@"
            },
            link: function ($scope, element, attrs, controller) {
                if (attrs.labelColor != null) {
                    $scope.labelColor = {color: attrs.labelColor};
                }
                if (attrs.valueColor) {
                    $scope.valueColor = {color: attrs.valueColor};
                }
            }
        };
    })
;
