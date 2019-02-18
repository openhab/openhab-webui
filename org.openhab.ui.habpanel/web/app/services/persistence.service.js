(function() {
'use strict';

    angular
        .module('app.services')
        .service('PersistenceService', PersistenceService);

    PersistenceService.$inject = ['$rootScope', '$q', '$filter', 'OH2StorageService', 'localStorageService'];
    function PersistenceService($rootScope, $q, $filter, OH2StorageService, localStorageService) {
        this.getDashboards = getDashboards;
        this.getDashboard = getDashboard;
        this.getCustomWidgets = getCustomWidgets;
        this.getCustomWidget = getCustomWidget;
        this.saveDashboards = saveDashboards;
        this.isEditingLocked = isEditingLocked;

        function loadConfigurationFromLocalStorage() {
            $rootScope.dashboards = localStorageService.get("dashboards") || [];
            $rootScope.menucolumns = localStorageService.get("menucolumns") || 1;
            $rootScope.settings = localStorageService.get("settings") || {};
            $rootScope.customwidgets = localStorageService.get("customwidgets") || {};
        }

        function saveConfigurationToLocalStorage() {
            if (!$rootScope.dashboards) return;

            localStorageService.set("dashboards", $rootScope.dashboards);
            localStorageService.set("menucolumns", $rootScope.menucolumns);
            localStorageService.set("settings", $rootScope.settings);
            localStorageService.set("customwidgets", $rootScope.customwidgets);
        }

        ////////////////

        function loadDashboards(rejectIfEditingLocked) {
            var deferred = $q.defer();
            OH2StorageService.tryGetServiceConfiguration().then(function (data) {
                $rootScope.useRegistry = true;

                if (OH2StorageService.getCurrentPanelConfig()) {
                    OH2StorageService.useCurrentPanelConfig();
                } else {
                    loadConfigurationFromLocalStorage();
                }

                if (rejectIfEditingLocked && isEditingLocked()) {
                    console.log("Rejecting loadDashboards(true) promise because editing is locked!");
                    deferred.reject("Editing is locked");
                }

                deferred.resolve($rootScope.dashboards);
            }, function (err) {
                // No OH2 service, use local storage
                loadConfigurationFromLocalStorage();
                deferred.resolve($rootScope.dashboards);
            });

            // the drawer pinned setting is stored in local storage only
            $rootScope.pinnedDrawer = localStorageService.get("pinneddrawer") === true;

            return deferred.promise;
        }

        function getDashboards(rejectIfEditingLocked) {
            if (!$rootScope.dashboards) {
                return loadDashboards(rejectIfEditingLocked);
            }
            
            return $rootScope.dashboards;
        }

        function getDashboard(id, rejectIfEditingLocked) {
            if (!$rootScope.dashboards) {
                return loadDashboards(rejectIfEditingLocked).then(function () {
                    return $filter('filter')($rootScope.dashboards, {id: id}, true)[0];
                });
            }

            return $filter('filter')($rootScope.dashboards, {id: id}, true)[0];
        }

        function getCustomWidgets() {
            if (!$rootScope.dashboards) {
                return loadDashboards(true).then(function () {
                    return $rootScope.customwidgets;
                }, function (err) {
                    return err;
                });
            }

            return $rootScope.customwidgets;
        }

        function getCustomWidget(id) {
            if (!$rootScope.dashboards) {
                return loadDashboards(true).then(function () {
                    return $rootScope.customwidgets[id];
                });
            }

            return $rootScope.customwidgets[id];
        }

        function saveDashboards() {
            var deferred = $q.defer();

            saveConfigurationToLocalStorage();
            if ($rootScope.useRegistry && OH2StorageService.getCurrentPanelConfig()) {
                OH2StorageService.saveCurrentPanelConfig().then(function (data) {
                    console.log('Saved to openHAB 2 service configuration');
                    deferred.resolve();
                }, function (err) {
                    console.log('Error while saving to openHAB 2 configuration');
                    deferred.reject(err);
                });
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        }

        function isEditingLocked() {
            return $rootScope.lockEditing;
        }
    }
})();
