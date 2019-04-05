/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('serverMonitor', [
    'ui.bootstrap',
    'ngSanitize',
    'ngLocalize',
    'HABmin.userModel'
])
    .service('ServerMonitor',
    function ($uibModal, $rootScope, ChartModel, growl, locale, UserService) {
        var modalInstance = null;
        var reset = false;

        /**
         * Listen for the online/offline broadcasts and display a modal
         * dialog when the server is not responding.
         */
        this.monitor = function () {
            $rootScope.$on("habminOnline", function (event, status) {
                if (status == false) {
                    if (modalInstance == null && reset == false) {
                        reset = true;
                        var scope = $rootScope.$new();

                        scope.cancel = function () {
                            modalInstance.dismiss("cancel");
                            modalInstance = null;
                        };

                        modalInstance = $uibModal.open({
                            backdrop: 'static',
                            keyboard: true,
                            modalFade: true,
                            size: 'lg',
                            template: '<div class="modal-body"><h3 class="text-center">' +
                            '<span class="fa fa-exclamation-triangle text-danger"></span>' +
                            '&nbsp;' +
                            '<span i18n="habmin.StatusOffline"></span>' +
                            '</h3></div>' +
                            '<div class="modal-footer">' +
                            '<button class="btn btn-xs btn-warning" type="button" ng-click="cancel()" i18n="common.close"></button>' +
                            '</div>',
                            windowClass: UserService.getTheme(),
                            scope: scope
                        });
                    }
                }
                else {
                    reset = false;
                    if (modalInstance != null) {
                        modalInstance.close();
                        modalInstance = null;
                    }
                }
            });
        };
    })

;
