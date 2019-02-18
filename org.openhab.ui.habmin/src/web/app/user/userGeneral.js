/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('UserGeneralPrefs', [
    'HABmin.userModel',
    'ui.select',
    'ngLocalize'
])
    .service('UserGeneralPrefs',
    function ($uibModal, $rootScope, UserService, localeSupported, locale) {
        this.showModal = function () {
            var scope = $rootScope.$new();
            scope.model = {};
            scope.model.theme = UserService.getTheme();
            scope.model.themes = [
                {
                    id: "slate",
                    name: locale.getString("habmin.themeSlateName"),
                    desc: locale.getString("habmin.themeSlateDesc")
                },
                {
                    id: "yeti",
                    name: locale.getString("habmin.themeYetiName"),
                    desc: locale.getString("habmin.themeYetiDesc")
                },
                {
                    id: "paper",
                    name: locale.getString("habmin.themePaperName"),
                    desc: locale.getString("habmin.themePaperDesc")
                }
            ];
            scope.model.language = UserService.getLanguage();
            scope.model.languages = [];
            angular.forEach(localeSupported, function (loc, key) {
                scope.model.languages.push({
                    id: key,
                    flag: key.split('-')[1].toLowerCase(),
                    name: loc.name,
                    desc: loc.desc
                });
            });

            var controller = function ($scope, $uibModalInstance) {
                $scope.ok = function (result) {
                    UserService.setTheme(scope.model.theme);
                    UserService.setLanguage(scope.model.language);

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
                templateUrl: 'user/userGeneral.tpl.html',
                controller: controller,
                windowClass: UserService.getTheme(),
                scope: scope
            }).result;
        };
    }
);