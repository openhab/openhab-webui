(function() {
'use strict';
    
    angular
        .module('app.services')
        .service('OH3StorageService', OH3StorageService);
  
    OH3StorageService.$inject = ['$rootScope', '$http', '$q', 'localStorageService'];
    function OH3StorageService($rootScope, $http, $q, localStorageService) {
        this.getAccessToken = getAccessToken;
        this.getPanelRegistry = getPanelRegistry;
        this.saveCurrentPanelConfig = saveCurrentPanelConfig;
        this.deletePanelConfig = deletePanelConfig;
        this.setCurrentPanelConfig = setCurrentPanelConfig;
        this.getCurrentPanelConfig = getCurrentPanelConfig;
        this.useCurrentPanelConfig = useCurrentPanelConfig;
        this.useLocalStorage = useLocalStorage;

        function getAccessToken () {
            var deferred = $q.defer();

            // don't implement the OAuth2 authorization; use the refresh token stored in local storage by the main UI
            var refreshToken = localStorage.getItem('openhab.ui:refreshToken');
            if (!refreshToken) {
                deferred.reject('No refresh token found in local storage');
            } else {
                $http({
                    method: 'POST',
                    url: '/rest/auth/token',
                    data: 'grant_type=refresh_token&client_id=' + window.location.origin +
                        '&redirect_uri=' + window.location.origin + '&refresh_token=' + refreshToken,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                .then(function (data) {
                    deferred.resolve(data.data.access_token);
                }, function () {
                    deferred.reject('Cannot get access_token');
                });
            }

            return deferred.promise;
        }

        function getPanelRegistry () {
            var deferred = $q.defer();

            // lock editing if a refresh token cannot be found - use the main UI to sign in as an admin
            var refreshToken = localStorage.getItem('openhab.ui:refreshToken');
            if (!refreshToken) {
                $rootScope.lockEditing = true;
            }
            $http.get('/rest/ui/components/habpanel:panelconfig').then(function (data) {
                console.log('Panel configurations loaded');
                $rootScope.panelsRegistry = transformUIComponentsToPanelRegistry(data.data);
                deferred.resolve($rootScope.panelsRegistry);
            });

            return deferred.promise;
        }

        function saveCurrentPanelConfig () {
            var deferred = $q.defer();

            getAccessToken().then(function (accessToken) {
                var panelConfiguration = {
                    dashboards: angular.copy($rootScope.dashboards),
                    menucolumns: $rootScope.menucolumns,
                    default: $rootScope.default,
                    settings: angular.copy($rootScope.settings),
                    customwidgets: angular.copy($rootScope.customwidgets)
                };

                var headers = { 'Content-Type': 'application/json' }
                if (document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0) {
                    headers['X-OPENHAB-TOKEN'] = accessToken
                } else {
                    headers['Authorization'] = 'Bearer ' + accessToken
                }

                $http.get('/rest/ui/components/habpanel:panelconfig/' + getCurrentPanelConfig()).then(function (data) {
                    // update
                    $http({
                        method: 'PUT',
                        url: '/rest/ui/components/habpanel:panelconfig/' + getCurrentPanelConfig(),
                        data: transformPanelConfigurationToUIComponent(getCurrentPanelConfig(), panelConfiguration),
                        headers: headers
                    }).then (function (resp) {
                        console.log('Panel configuration updated');
                        deferred.resolve();
                    }, function (err) {
                        console.error('Error while saving panel configuration: ' + JSON.stringify(err));
                        deferred.reject();
                    });
                }, function (err) {
                    // assume the error is 404?
                    $http({
                        method: 'POST',
                        url: '/rest/ui/components/habpanel:panelconfig',
                        data: transformPanelConfigurationToUIComponent(getCurrentPanelConfig(), panelConfiguration),
                        headers: headers
                    }).then (function (resp) {
                        console.log('Panel configuration created');
                        deferred.resolve();
                    }, function (err) {
                        console.error('Error while creating panel configuration: ' + JSON.stringify(err));
                        deferred.reject();
                    });
                })
            }, function (err) {
                console.error('Error while retrieving access token: ' + err);
                deferred.reject();
            });
            
            return deferred.promise;
        }

        function deletePanelConfig(id) {
            var deferred = $q.defer();

            getAccessToken().then(function (accessToken) {
                var headers = {}
                if (document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0) {
                    headers['X-OPENHAB-TOKEN'] = accessToken
                } else {
                    headers['Authorization'] = 'Bearer ' + accessToken
                }

                $http({
                    method: 'DELETE',
                    url: '/rest/ui/components/habpanel:panelconfig/' + id,
                    headers: headers
                }).then (function (resp) {
                    console.log('Panel configuration deleted');
                    deferred.resolve();
                }, function (err) {
                    console.error('Error while deleting panel configuration: ' + JSON.stringify(err));
                    deferred.reject();
                });
            }, function (err) {
                console.error('Error while retrieving access token: ' + err);
                deferred.reject();
            });
            
            return deferred.promise;
        }

        function useLocalStorage() {
            $rootScope.currentPanelConfig = undefined;
            localStorageService.set('currentPanelConfig', $rootScope.currentPanelConfig);
        }


        function getCurrentPanelConfig() {
            if (!$rootScope.currentPanelConfig) {
                $rootScope.currentPanelConfig = localStorageService.get('currentPanelConfig');

                if (!$rootScope.currentPanelConfig) {
                    for (var panelConfigId in $rootScope.panelsRegistry) {
                        if ($rootScope.panelsRegistry[panelConfigId].default) {
                            $rootScope.useCurrentPanelConfig = panelConfigId;
                            localStorageService.set('currentPanelConfig', panelConfigId);
                            return panelConfigId;
                        }
                    }
                }
            }

            return $rootScope.currentPanelConfig;
        }

        function useCurrentPanelConfig() {
            var currentPanelConfig = getCurrentPanelConfig();
            if (!currentPanelConfig || !$rootScope.panelsRegistry[currentPanelConfig]) {
                console.warn('Warning: current panel config not found, falling back to local storage!');
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
                if ($rootScope.panelsRegistry[currentPanelConfig].default)
                    $rootScope.default = $rootScope.panelsRegistry[currentPanelConfig].default;
                else
                    $rootScope.default = false;
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
            localStorageService.set('currentPanelConfig', $rootScope.currentPanelConfig);
            useCurrentPanelConfig();
        }


        ////////////////

        function transformUIComponentsToPanelRegistry (components) {
            var panelsRegistry = {};
            angular.forEach(components, function (component) {

                var panelConfig = {
                    dashboards: [],
                    menucolumns: 1,
                    default: false,
                    settings: {},
                    customwidgets: {}
                };
                panelConfig.updatedTime = component.timestamp;
                if (component.config.menucolumns) panelConfig.menucolumns = component.config.menucolumns;
                if (component.config.default) panelConfig.default = component.config.default;
                if (component.config.settings) angular.copy(component.config.settings, panelConfig.settings);

                if (component.slots && component.slots.dashboards) {
                    component.slots.dashboards.forEach(function (dashboardComponent) {
                        var dashboard = angular.copy(dashboardComponent.config);
                        dashboard.widgets = [];
                        if (dashboardComponent.slots && dashboardComponent.slots.widgets) {
                            dashboard.widgets = dashboardComponent.slots.widgets.map(function (widgetComponent) {
                                var widget = angular.copy(widgetComponent.config);
                                widget.type = widgetComponent.component;
                                return widget;
                            });
                        }
                        panelConfig.dashboards.push(dashboard);
                    });
                }

                if (component.slots && component.slots.customwidgets) {
                    component.slots.customwidgets.forEach(function (customWidgetComponent) {
                        var customwidget = angular.copy(customWidgetComponent.config);
                        customwidget.settings = [];
                        if (customWidgetComponent.slots && customWidgetComponent.slots.settings) {
                            customwidget.settings = customWidgetComponent.slots.settings.map(function (settingComponent) {
                                var setting = angular.copy(settingComponent.config);
                                setting.type = settingComponent.component;
                                return setting;
                            });
                        }
                        panelConfig.customwidgets[customWidgetComponent.config.id] = customwidget;
                    });
                }

                panelsRegistry[component.uid] = panelConfig;
            })

            return panelsRegistry;
        }

        function transformPanelConfigurationToUIComponent(id, panelConfiguration) {
            var component = {
                uid: id,
                component: 'panelconfiguration'
            };
            component.uid = id;
            component.config = {
                menucolumns: panelConfiguration.menucolumns,
                default: panelConfiguration.default,
                settings: panelConfiguration.settings
            };

            component.slots = {};
            angular.forEach(panelConfiguration.dashboards, function (dashboard) {
                var dashboardComponent = {
                    component: 'dashboard',
                    config: angular.copy(dashboard),
                    slots: {}
                };
                delete dashboardComponent.config.widgets;

                if (dashboard.widgets) {
                    dashboardComponent.slots.widgets = dashboard.widgets.map(function (widget) {
                        var widgetComponent = {
                            config: angular.copy(widget)
                        };
                        delete widgetComponent.config.type;
                        widgetComponent.component = widget.type;

                        return widgetComponent;
                    });
                }

                if (!component.slots.dashboards) component.slots.dashboards = [];
                component.slots.dashboards.push(dashboardComponent);
            });

            for (var customwidgetId in panelConfiguration.customwidgets) {
                var customwidget = panelConfiguration.customwidgets[customwidgetId];
                var customwidgetComponent = {
                    component: 'customwidget',
                    config: angular.copy(customwidget),
                    slots: {}
                };
                customwidgetComponent.config.id = customwidgetId;
                delete customwidgetComponent.config.settings;

                if (customwidget.settings) {
                    customwidgetComponent.slots.settings = customwidget.settings.map(function (setting) {
                        var settingComponent = {
                            config: angular.copy(setting)
                        };
                        delete settingComponent.config.type;
                        settingComponent.component = setting.type;

                        return settingComponent;
                    });
                }

                if (!component.slots.customwidgets) component.slots.customwidgets = [];
                component.slots.customwidgets.push(customwidgetComponent);
            }

            return component;
        }
    }

})();
