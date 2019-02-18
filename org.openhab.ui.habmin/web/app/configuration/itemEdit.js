/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.ItemEdit', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'HABmin.itemModel',
    'HABmin.smarthomeModel',
    'ngLocalize'
])
    .service('itemEdit',
    function ($uibModal, $rootScope, growl, locale, UserService, ItemModel, SmartHomeModel) {
        this.edit = function (channel, item, create) {
            var scope = $rootScope.$new();
            scope.newItem = create;
            scope.item = angular.copy(item);
            scope.itemtypes = SmartHomeModel.itemtypes;
            scope.categories = SmartHomeModel.categories;

            if (scope.tags == null) {
                scope.tags = [];
            }

            if(scope.item == null || scope.item.name == null || scope.item.name.length == 0) {
                scope.newItem = true;
            }

            // Get the items list so we can select groups
            scope.items = [];
            ItemModel.getList().then(
                function (list) {
                    scope.items = list;
                }
            );
            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $uibModalInstance
             */
            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    if ($scope.item.groupNames != null) {
                        $scope.item.groupNames = [].concat($scope.item.groupNames);
                    }
                    ItemModel.putItem($scope.item).then(
                        function (newItem) {
                            if (create !== true) {
                                $uibModalInstance.close($scope.item);
                                growl.success(locale.getString("item.SaveOk",
                                    {name: $scope.item.label}));

                                return;
                            }

                            ItemModel.linkItem(channel, newItem).then(
                                function () {
                                    $uibModalInstance.close($scope.item);
                                    growl.success(locale.getString("item.SaveOk",
                                        {name: $scope.item.label}));
                                },
                                function (response) {
                                    var msg;
                                    if (response != null && response.error != null) {
                                        msg = response.error.message;
                                    }
                                    else {
                                        msg = locale.getString("common.noResponse");
                                    }
                                    growl.warning(locale.getString("item.SaveLinkFailed",
                                        {name: $scope.item.label, message: msg}));
                                }
                            );
                        },
                        function (response) {
                            var msg;
                            if (response != null && response.error != null) {
                                msg = response.error.message;
                            }
                            else {
                                msg = locale.getString("common.noResponse");
                            }
                            growl.warning(locale.getString("item.SaveFailed",
                                {name: $scope.item.label, message: msg}));
                        }
                    );
                };
                $scope.cancel = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            return $uibModal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                size: 'lg',
                templateUrl: 'configuration/itemEdit.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
