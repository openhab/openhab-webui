/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize',
    'formSelectInput'
])
    .service('dashboardProperties',
    function ($uibModal, $rootScope, growl, locale, UserService) {
        this.editOptions = function (dashboard) {
            var scope = $rootScope.$new();

            // Ensure dashboard is an object
            // If it is, then make a copy of what we've been passed
            if (dashboard !== null && typeof dashboard === 'object') {
                scope.dashboard = angular.copy(dashboard);
            }
            else {
                scope.dashboard = {};
            }

            // Convert the 'menu' from a boolean
            scope.dashboard.menu = scope.dashboard.menu === false ? "no" : "yes";

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $uibModalInstance
             */
            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    // Convert the 'menu' to a boolean
                    scope.dashboard.menu = !(scope.dashboard.menu === "no");

                    $uibModalInstance.close(scope.dashboard);
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
                templateUrl: 'dashboard/dashboardProperties.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

;
