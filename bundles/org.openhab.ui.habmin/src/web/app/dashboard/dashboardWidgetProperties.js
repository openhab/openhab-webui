/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('dashboardWidgetProperties', [
    'ui.bootstrap',
    'ngSanitize',
    'angular-growl',
    'ngLocalize'
])
    .service('dashboardWidgetProperties',
    function ($uibModal, $rootScope, growl, locale, UserService) {
        this.editOptions = function (widget) {
            var scope = $rootScope.$new();
            scope.showTab = 0;
            scope.widget = angular.copy(widget);

            /**
             * Controller functions get called when the modal closes
             * @param $scope
             * @param $uibModalInstance
             */
            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    widget.options = scope.widget.options;

                    $uibModalInstance.close(result);
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
                templateUrl: 'dashboard/dashboardWidgetProperties.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    })

    .directive('dashboardGeneralProperties', function ($window) {
        return {
            restrict: 'E', // Use as element
            scope: { // Isolate scope
                model: '='
            },
            templateUrl: 'dashboard/dashboardGeneralProperties.tpl.html',
            link: function ($scope, $element, $state) {
            }
        };
    })

;
