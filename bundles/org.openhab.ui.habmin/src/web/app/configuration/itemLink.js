/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.ItemLink', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'HABmin.itemModel',
    'ngLocalize'
])
    .service('itemLink',
    function ($uibModal, $rootScope, growl, locale, UserService, ItemModel, SmartHomeModel) {
        this.edit = function (channel) {
            var scope = $rootScope.$new();
            scope.result = {name: ""};
            ItemModel.getList().then(function (list) {
                scope.items = list
            });

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $uibModalInstance
             */
            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    ItemModel.linkItem(channel, scope.result).then(
                        function () {
                            $uibModalInstance.close($scope.item);
                            growl.success(locale.getString("item.LinkOk"));
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
                templateUrl: 'configuration/itemLink.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
