(function() {
    'use strict';

    angular.module('app', [
        'gridster',
        'ui.bootstrap',
        'ui.select',
        'ngRoute',
        'ngTouch',
        'ngSanitize',
        'app.services',
        'app.widgets',
        'cgPrompt',
        'LocalStorageModule',
        'FBAngular',
        'oc.lazyLoad',
        'angular-clipboard',
        'ngFileSaver',
        'snap',
        'tmh.dynamicLocale',
        'pascalprecht.translate'
    ])
    .config(['$routeProvider', 'localStorageServiceProvider', 'tmhDynamicLocaleProvider', '$translateProvider', '$translatePartialLoaderProvider', function($routeProvider, localStorageServiceProvider, tmhDynamicLocaleProvider, $translateProvider, $translatePartialLoaderProvider) {
        localStorageServiceProvider.setStorageType('localStorage');
        tmhDynamicLocaleProvider.localeLocationPattern('vendor/i18n/angular-locale_{{locale}}.js');
        $translatePartialLoaderProvider.addPart('main');
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'assets/i18n/{part}/{lang}.json'
        });
        $translateProvider.useSanitizeValueStrategy(null);

        $routeProvider
            .when('/', {
                templateUrl: 'app/menu/menu.html',
                controller: 'MenuCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboards: ['PersistenceService', function (persistenceService) {
                        return persistenceService.getDashboards();
                    }]
                }
            })
            .when('/edit/:id', {
                templateUrl: 'app/dashboard/dashboard.edit.html',
                controller: 'DashboardEditCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboard: ['PersistenceService', '$q', '$route', function (persistenceService, $q, $route) {
                        var dashboard = persistenceService.getDashboard($route.current.params.id, true);
                        if (persistenceService.isEditingLocked()) return $q.reject("Editing is locked");
                        return (dashboard) || $q.reject("Unknown dashboard");
                    }],
                    codemirror: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'vendor/cm/lib/codemirror.css',
                            'vendor/cm/lib/codemirror.js'
                        ]).then(function () {
                            return $ocLazyLoad.load([
                                'vendor/cm/addon/fold/xml-fold.js',
                                'vendor/cm/addon/edit/matchbrackets.js',
                                'vendor/cm/addon/edit/matchtags.js',
                                'vendor/cm/addon/edit/closebrackets.js',
                                'vendor/cm/addon/edit/closetag.js',
                                'vendor/cm/addon/mode/overlay.js',
                                'vendor/cm/mode/xml/xml.js'
                            ]);
                        });
                    }],
                    translations: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('admin');
                    }],
                    translations_widgets: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('widgets');
                    }]
                }
            })
            .when('/view/:id', {
                templateUrl: 'app/dashboard/dashboard.view.html',
                controller: 'DashboardViewCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboard: ['PersistenceService', '$q', '$route', function (persistenceService, $q, $route) {
                        var dashboard = persistenceService.getDashboard($route.current.params.id);
                        return (dashboard) || $q.reject("Unknown dashboard");
                    }]
                }
            })
            .when('/settings', {
                templateUrl: 'app/settings/settings.html',
                controller: 'SettingsCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboards: ['PersistenceService', '$q', function (persistenceService, $q) {
                        var dashboards = persistenceService.getDashboards(true);
                        if (persistenceService.isEditingLocked()) return $q.reject("Editing is locked");
                        return dashboards;
                    }],
                    themes: ['$http', function ($http) {
                        return $http.get('assets/styles/themes/themes.json');
                    }],
                    translations: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('admin');
                    }]
                }
            })
            .when('/settings/localconfig', {
                templateUrl: 'app/settings/settings.localconfig.html',
                controller: 'SettingsLocalConfigCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboards: ['PersistenceService', '$q', function (persistenceService, $q) {
                        var dashboards = persistenceService.getDashboards(true);
                        if (persistenceService.isEditingLocked()) return $q.reject("Editing is locked");
                        return dashboards;
                    }],
                    codemirror: ['$ocLazyLoad', '$timeout', function ($ocLazyLoad, $timeout) {
                        return $ocLazyLoad.load([
                            'vendor/cm/lib/codemirror.css',
                            'vendor/cm/lib/codemirror.js',
                            'vendor/cm/theme/rubyblue.css',
                        ]).then (function () {
                            return $ocLazyLoad.load([
                                'vendor/cm/addon/edit/matchbrackets.js',
                                'vendor/cm/addon/edit/closebrackets.js',
                                'vendor/cm/mode/javascript/javascript.js'
                            ]);
                        })
                    }],
                    translations: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('admin');
                    }]
                }
            })
            .when('/settings/widgets', {
                templateUrl: 'app/settings/settings.widgets.list.html',
                controller: 'WidgetListCtrl',
                controllerAs: 'vm',
                resolve: {
                    widgets: ['PersistenceService', '$q', function (persistenceService, $q) {
                        var widgets = persistenceService.getCustomWidgets();
                        if (persistenceService.isEditingLocked()) return $q.reject("Editing is locked");
                        return widgets;
                    }],
                    translations: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('admin');
                    }]
                }
            })
            .when('/settings/widgets/design/:id', {
                templateUrl: 'app/settings/settings.widgets.designer.html',
                controller: 'WidgetDesignerCtrl',
                controllerAs: 'vm',
                resolve: {
                    widget: ['PersistenceService', '$route', '$q', function (persistenceService, $route, $q) {
                        var widget = persistenceService.getCustomWidget($route.current.params.id);
                        if (persistenceService.isEditingLocked()) return $q.reject("Editing is locked");
                        return widget;
                    }],
                    codemirror: ['$ocLazyLoad', '$timeout', function ($ocLazyLoad, $timeout) {
                        return $ocLazyLoad.load([
                            'vendor/cm/lib/codemirror.css',
                            'vendor/cm/lib/codemirror.js',
                            'vendor/cm/theme/rubyblue.css',
                        ]).then (function () {
                            return $ocLazyLoad.load([
                                'vendor/cm/addon/edit/matchbrackets.js',
                                'vendor/cm/addon/edit/matchtags.js',
                                'vendor/cm/addon/edit/closebrackets.js',
                                'vendor/cm/addon/edit/closetag.js',
                                'vendor/cm/addon/mode/overlay.js',
                                'vendor/cm/mode/xml/xml.js'
                            ]);
                        })
                    }],
                    translations: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('admin');
                    }],
                    translations_widgets: ['TranslationService', function (TranslationService) {
                        return TranslationService.enterPart('widgets');
                    }]
                }
            })
            .otherwise({
                redirectTo: '/'
            });

    }])
})();