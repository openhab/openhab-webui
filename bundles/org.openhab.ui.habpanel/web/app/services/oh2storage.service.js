(function() {
'use strict';
  
    angular
        .module('app.services')
        .value('OH2ServiceConfiguration', {})
        .service('OH2StorageService', OH2StorageService);

    OH2StorageService.$inject = ['OH2ServiceConfiguration', 'OH3StorageService', '$rootScope', '$http', '$q', 'localStorageService'];
    function OH2StorageService(OH2ServiceConfiguration, OH3StorageService, $rootScope, $http, $q, localStorageService) {
        var SERVICE_NAME = 'org.openhab.habpanel';

        this.tryGetServiceConfiguration = tryGetServiceConfiguration;
        this.saveServiceConfiguration = saveServiceConfiguration;
        this.saveCurrentPanelConfig = saveCurrentPanelConfig;
        this.setCurrentPanelConfig = setCurrentPanelConfig;
        this.getCurrentPanelConfig = getCurrentPanelConfig;
        this.useCurrentPanelConfig = useCurrentPanelConfig;
        this.useLocalStorage = useLocalStorage;

        function tryGetServiceConfiguration() {
            var deferred = $q.defer();

            OH3StorageService.getAccessToken().then(function (accessToken) {
                var headers = { 'Content-Type': 'application/json' }
                if (document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0) {
                    headers['X-OPENHAB-TOKEN'] = accessToken
                } else {
                    headers['Authorization'] = 'Bearer ' + accessToken
                }

                $http({
                    method: 'GET',
                    url: '/rest/services/' + SERVICE_NAME + '/config',
                    headers: headers
                }).then(function (resp) {
                    console.log('openHAB 2 service configuration loaded');
                    OH2ServiceConfiguration = resp.data;
                    if (!OH2ServiceConfiguration.panelsRegistry) {
                        $rootScope.panelsRegistry = OH2ServiceConfiguration.panelsRegistry = {};
                    } else {
                        $rootScope.panelsRegistry = JSON.parse(resp.data.panelsRegistry);
                    }
                    if (OH2ServiceConfiguration.lockEditing === true) {
                        $rootScope.lockEditing = true;
                    }
                    // iterate over the config to find widgets added there
                    $rootScope.configWidgets = {};
                    angular.forEach(OH2ServiceConfiguration, function (value, key) {
                        if (key.indexOf("widget.") === 0) {
                            var widgetname = key.replace("widget.", "");
                            console.log("Adding widget from configuration: " + widgetname);
                            $rootScope.configWidgets[widgetname] = JSON.parse(value);
                        }
                    });

                    deferred.resolve();
                }, function (err) {
                    console.error('Cannot load openHAB 2 service configuration: ' + JSON.stringify(err));
                    deferred.reject();
                });
            }, function (err) {
                console.error('Cannot get access token: ' + err);
                deferred.reject();
            });

            return deferred.promise;
        }

        function saveServiceConfiguration() {
            var deferred = $q.defer();

            if ($rootScope.panelsRegistry) {
                OH2ServiceConfiguration.panelsRegistry = JSON.stringify($rootScope.panelsRegistry, null, 4);
            }

            OH3StorageService.getAccessToken().then(function (accessToken) {
                $http({
                    method: 'PUT',
                    url: '/rest/services/' + SERVICE_NAME + '/config',
                    data: OH2ServiceConfiguration,
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + accessToken }
                }).then (function (resp) {
                    console.log('openHAB 2 service configuration saved');
                    deferred.resolve();
                }, function (err) {
                    console.error('Error while saving openHAB 2 service configuration: ' + JSON.stringify(err));
                    deferred.reject();
                });
            }, function (err) {
                console.error('Error while retrieving access token: ' + err);
                deferred.reject();
            });

            return deferred.promise;
        }

        function saveCurrentPanelConfig() {
            var deferred = $q.defer();

            var lastUpdatedTime = $rootScope.panelsRegistry[getCurrentPanelConfig()].updatedTime; 

            // fetch the current configuration again (to perform optimistic concurrency on the current panel config only)
            tryGetServiceConfiguration().then(function () {
                var config = $rootScope.panelsRegistry[getCurrentPanelConfig()];
                if (!config) {
                    console.warn('Warning: creating new panel config!');
                    config = $rootScope.panelsRegistry[getCurrentPanelConfig()] = { };
                }
                var currentUpdatedTime = config.updatedTime;
                if (Date.parse(currentUpdatedTime) > Date.parse(lastUpdatedTime)) {
                    deferred.reject('Panel configuration has a newer version on the server updated on ' + currentUpdatedTime);
                    return;
                }
                config.updatedTime = new Date().toISOString();
                config.dashboards = angular.copy($rootScope.dashboards);
                config.menucolumns = $rootScope.menucolumns;
                config.settings = $rootScope.settings;
                config.customwidgets = $rootScope.customwidgets;
                return saveServiceConfiguration().then(function () {
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });
            });

            return deferred.promise;
        }

        function useLocalStorage() {
            $rootScope.currentPanelConfig = undefined;
            localStorageService.set("currentPanelConfig", $rootScope.currentPanelConfig);
        }

        function getCurrentPanelConfig() {
            if (!$rootScope.currentPanelConfig) {
                $rootScope.currentPanelConfig = localStorageService.get("currentPanelConfig");

                if (!$rootScope.currentPanelConfig) {
                    // if it's still not set and we have an initial panel config, switch to it
                    var initialPanelConfig = OH2ServiceConfiguration.initialPanelConfig;
                    if (initialPanelConfig && $rootScope.panelsRegistry[initialPanelConfig]) {
                        $rootScope.currentPanelConfig = initialPanelConfig;
                        localStorageService.set("currentPanelConfig", initialPanelConfig);
                    }
                }
            }

            return $rootScope.currentPanelConfig;
        }

        function useCurrentPanelConfig() {
            var currentPanelConfig = getCurrentPanelConfig();
            if (!currentPanelConfig || !$rootScope.panelsRegistry[currentPanelConfig]) {
                console.warn("Warning: current panel config not found, falling back to local storage!");
                useLocalStorage();
            } else {
                if ($rootScope.panelsRegistry[currentPanelConfig].dashboards)
                    $rootScope.dashboards = angular.copy($rootScope.panelsRegistry[currentPanelConfig].dashboards);
                else
                    $rootScope.dashboards = [];
                if ($rootScope.panelsRegistry[currentPanelConfig].menucolumns)
                    $rootScope.menucolumns = $rootScope.panelsRegistry[currentPanelConfig].menucolumns;
                else
                    $rootScope.menucolumns = 1;
                if ($rootScope.panelsRegistry[currentPanelConfig].settings)
                    $rootScope.settings = $rootScope.panelsRegistry[currentPanelConfig].settings;
                else
                    $rootScope.settings = {};
                if ($rootScope.panelsRegistry[currentPanelConfig].customwidgets)
                    $rootScope.customwidgets = $rootScope.panelsRegistry[currentPanelConfig].customwidgets;
                else
                    $rootScope.customwidgets = {};
            }
        }

        function setCurrentPanelConfig(name) {
            $rootScope.currentPanelConfig = name;
            localStorageService.set("currentPanelConfig", $rootScope.currentPanelConfig);
            useCurrentPanelConfig();
        }
    }
})();
