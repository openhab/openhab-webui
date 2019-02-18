/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('UserChartPrefs', [
//    'angular-bootstrap-select',
    'ngLocalize',
    'HABmin.userModel'
])
    .service('UserChartPrefs',
    function ($uibModal, $rootScope, locale, UserService) {
        this.showModal = function () {
            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    $uibModalInstance.close(result);
                };
                $scope.cancel = function (result) {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            var scope = $rootScope.$new();
            scope.test = "222";
            scope.periodOptions = [
                {value: 600, label: "1"},
                {value: 700, label: "2"},
                {value: 3600, label: locale.getString("common.period1Hour")},
                {value: 7200, label: locale.getString("common.period2Hours")},
                {value: 21600, label: locale.getString("common.period6Hours")},
                {value: 43200, label: locale.getString("common.period12Hours")},
                {value: 86400, label: locale.getString("common.period1Day")},
                {value: 172800, label: locale.getString("common.period2Days")},
                {value: 259200, label: locale.getString("common.period3Days")},
                {value: 432000, label: locale.getString("common.period5Days")},
                {value: 604800, label: locale.getString("common.period1Week")},
                {value: 1209600, label: locale.getString("common.period2Weeks")},
                {value: 2419200, label: locale.getString("common.period1Month")},
                {value: 5184000, label: locale.getString("common.period2Months")},
                {value: 7776000, label: locale.getString("common.period3Months")},
                {value: 15724800, label: locale.getString("common.period6Months")}
            ];
            scope.period = scope.periodOptions[1];

            return $uibModal.open({
                backdrop: 'static',
                keyboard: true,
                modalFade: true,
                templateUrl: 'user/userChart.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    }
);