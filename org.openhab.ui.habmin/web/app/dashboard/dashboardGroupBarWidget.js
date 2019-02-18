/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardGroupBarWidget', [
    'HABmin.itemModel',
    'dashboardItemWidgets',
    'dndLists'
])
    .directive('dashboardGroupbar', function (ItemModel) {
        return {
            restrict: 'E',
            templateUrl: 'dashboard/dashboardGroupBarWidget.tpl.html',
            scope: {
                options: "="
            },
            link: function ($scope, element) {
                $scope.groupMembers = ItemModel.getGroupMembers($scope.options.group);
            }
        };
    })

    .directive('dashboardGroupbarProperties', function (ItemModel) {
        return {
            restrict: 'E', // Use as element
            scope: {
                options: "="
            },
            templateUrl: 'dashboard/dashboardGroupBarProperties.tpl.html',
            link: function ($scope, $element, $state) {
                $scope.itemList = [];
                ItemModel.getList().then(
                    function (list) {
                        $scope.itemList = list;
                    }
                );

                $scope.list = [];
                $scope.list.push({label: "test 1"});
                $scope.list.push({label: "test 2"});
                $scope.list.push({label: "test 3"});
                $scope.list.push({label: "test 4"});
            }
        };
    })

;
