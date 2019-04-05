/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardButtonWidget', [
    'HABmin.itemModel'
])
    .directive('dashboardButton', function (ItemModel) {
        return {
            restrict: 'E',
            templateUrl: 'dashboard/dashboardButtonWidget.tpl.html',
            scope: {
                options: "="
            },
            link: function ($scope, element) {
                var item = ItemModel.getItem($scope.options.group);
                if (item != null) {
                    $scope.groupItem = item;
                }

                $scope.buttonClick = function () {
                    if ($scope.state == 'circle-on') {
                        $scope.state = 'circle-off';
                    }
                    else {
                        $scope.state = 'circle-on';
                    }
                };
            }
        };
    })

    .directive('dashboardButtonProperties', function (ItemModel) {
        return {
            restrict: 'E', // Use as element
            scope: {
                options: "="
            },
            templateUrl: 'dashboard/dashboardButtonProperties.tpl.html',
            link: function ($scope, $element, $state) {
                $scope.itemList = [];
                ItemModel.getList().then(
                    function (list) {
                        $scope.itemList = list;
                    }
                );
            }
        };
    })

;
