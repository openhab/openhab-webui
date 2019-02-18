/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Items', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.itemModel',
    'Config.parameter',
    'angular-growl',
    'ngVis',
    'ResizePanel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('items', {
            url: '/items',
            views: {
                "main": {
                    controller: 'ItemConfigCtrl',
                    templateUrl: 'configuration/itemConfig.tpl.html'
                }
            },
            data: {pageTitle: 'Items'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('item');
                }
            }
        });
    })

    .controller('ItemConfigCtrl',
    function ItemConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ItemModel) {
        $scope.items = null;
        $scope.itemsCnt = -1;
        $scope.filterItems = [
            "thing",
            "channel-group"
        ];

        $scope.filterDefaultString = locale.getString('common.filter');

        $scope.filter = {text: ''};
        $scope.filterFunction = function (element) {
            if ($scope.filter.text === "") {
                return true;
            }
            if (element.label == null) {
                return false;
            }
            return element.label.toLowerCase().indexOf($scope.filter.text.toLowerCase()) !== -1 ? true : false;
        };

        ItemModel.getList().then(
            function (items) {
                $scope.items = items;
                $scope.itemsCnt = items.length;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("habmin.ErrorGettingBindings"));
            }
        );

        $scope.selectItem = function (item) {
            $scope.selectedItem = item;
            $scope.formLoaded = true;
        };

        $scope.getParentThingItem = function (item) {
            return ItemModel.getParentThingItem(item);
        };

        $scope.itemDelete = function () {
            ItemModel.deleteItem($scope.selectedItem);
        };
    })

;
