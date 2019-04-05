/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ngConfirmClick', [
    'ui.bootstrap',
    'ngSanitize'
])
    .directive('ngConfirmClick', function ($window, $uibModal, $rootScope, $timeout, $parse, $sce) {
        return {
            restrict: 'A',

            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    if (attrs.ngConfirmIf !== undefined && !$parse(attrs.ngConfirmIf)(scope)) {
                        $timeout(function () {
                            scope.$apply(attrs.ngConfirmClick);
                        });

                        return;
                    }

                    var newScope = $rootScope.$new();
                    newScope.message = attrs.ngConfirmMessage || "Are you sure?";
                    newScope.titleMsg = attrs.ngConfirmTitle || "Confirm";
                    newScope.yesMsg = attrs.ngConfirmYesBtn || "Yes";
                    newScope.noMsg = attrs.ngConfirmNoBtn || "No";

                    var icon = "";
                    if (attrs.ngConfirmIcon != null) {
                        switch (attrs.ngConfirmIcon.toLowerCase()) {
                            case 'danger':
                                icon = "text-danger fa fa-exclamation";
                                break;
                            case 'warning':
                                icon = "text-warning fa fa-exclamation-triangle";
                                break;
                            case 'question':
                                icon = "text-success fa fa-question";
                                break;
                            case 'info':
                                icon = "text-info fa fa-info";
                                break;
                        }
                    }

                    var controller = function ($scope, $uibModalInstance) {
                        $scope.ok = function (result) {
                            $uibModalInstance.close(result);

                            $timeout(function () {
                                scope.$apply(attrs.ngConfirmClick);
                            });
                        };
                        $scope.cancel = function (result) {
                            $uibModalInstance.dismiss('cancel');
                        };
                    };

                    if (icon) {
                        newScope.alert = '<span class="text-large ' + icon + '"></span>';
                    }

                    return $uibModal.open({
                        scope: newScope,
                        backdrop: 'static',
                        keyboard: true,
                        modalFade: true,
                        template: '<div class="modal-header"><h3 class="modal-title">{{titleMsg}}</h3></div>' +
                        '<div class="modal-body">' +
                        '<table><tr>' +
                        '<td ng-if="alert" style="padding-right:10px;" ng-bind-html="alert"></td>' +
                        '<td ng-bind-html="message"></td>' +
                        '</table></div>' +
                        '<div class="modal-footer">' +
                        '<button class="btn btn-primary" ng-click="ok()">{{yesMsg}}</button>' +
                        '<button class="btn btn-warning" ng-click="cancel()">{{noMsg}}</button>' +
                        '</div>',
                        controller: controller
                    }).result;
                });
            }
        };
    }
);

