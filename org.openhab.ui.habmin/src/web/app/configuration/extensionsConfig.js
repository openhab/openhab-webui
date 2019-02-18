/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Config.Extensions', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.userModel',
    'HABmin.extensionModel',
    'angular-growl',
    'ResizePanel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('extensions', {
            url: '/extensions',
            views: {
                "main": {
                    controller: 'ExtensionsConfigCtrl',
                    templateUrl: 'configuration/extensionsConfig.tpl.html'
                }
            },
            data: {pageTitle: 'Extensions'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('extensions');
                }
            }
        });
    })

    .controller('ExtensionsConfigCtrl',
    function ExtensionsConfigCtrl($scope, locale, growl, $timeout, $window, $http, $interval, UserService, ExtensionModel) {
        $scope.extensions = [];
        $scope.extensionTypes = [];
        $scope.typesCnt = -1;
        $scope.extensionsCnt = -1;

        ExtensionModel.getExtensions().then(
            function (extensions) {
                $scope.extensions = extensions;
                $scope.extensionsCnt = extensions.length;
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("extensions.ErrorGettingExtensions"));
            }
        );

        ExtensionModel.getTypes().then(
            function (extensionTypes) {
                $scope.extensionTypes = extensionTypes;
                $scope.typesCnt = extensionTypes.length;
                $scope.selectedType = $scope.extensionTypes[0];
            },
            function (reason) {
                // Handle failure
                growl.warning(locale.getString("extensions.ErrorGettingExtensions"));
            }
        );

        $scope.selectType = function (extensionType) {
            $scope.selectedType = extensionType;
        };

        $scope.installExtension = function (extension) {
            ExtensionModel.installExtension(extension);
        };

        $scope.uninstallExtension = function (extension) {
            ExtensionModel.uninstallExtension(extension);
        };

    })

;
