/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('floorplanHotspotProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize',
    'formSelectInput',
    'HABmin.itemModel'
])
    .service('floorplanHotspotProperties',
    function ($uibModal, $rootScope, growl, locale, UserService, ItemModel) {
        this.editOptions = function (hotspot) {
            var scope = $rootScope.$new();

            // Ensure hotspot is an object
            // If it is, then make a copy of what we've been passed
            if (hotspot !== null && typeof hotspot === 'object') {
                scope.hotspot = angular.copy(hotspot);
            }
            else {
                scope.hotspot = {};
            }

            // Load the list of items
            ItemModel.getList().then(
                function (items) {
                    scope.items = items;
                },
                function (reason) {
                    // handle failure
                    growl.warning(locale.getString('habmin.chartErrorGettingItems'));
                }
            );

            scope.getParentThingItem = function (item) {
                return ItemModel.getParentThingItem(item);
            };

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $uibModalInstance
             */
            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    // Copy over the properties
                    hotspot.itemId = scope.hotspot.itemId;
                    $uibModalInstance.close({cmd: 'save', hotspot: scope.hotspot});
                };
                $scope.cancel = function (result) {
                    $uibModalInstance.dismiss({cmd: 'cancel'});
                };
                $scope.delete = function (result) {
                    $uibModalInstance.close({cmd: 'delete'});
                };
            };

            return $uibModal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                size: 'lg',
                templateUrl: 'floorplan/floorplanHotspotProperties.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
