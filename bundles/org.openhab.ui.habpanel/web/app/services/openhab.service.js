(function() {
'use strict';

    angular
        .module('app.services')
        .service('OHService', OHService)
        .value('OH2ServiceConfiguration', {})
        .service('OH2StorageService', OH2StorageService);

    OHService.$inject = ['$rootScope', '$http', '$q', '$timeout', '$interval', '$filter', '$location', 'SpeechService', 'tmhDynamicLocale', '$translate'];
    function OHService($rootScope, $http, $q, $timeout, $interval, $filter, $location, SpeechService, tmhDynamicLocale, $translate) {
        this.getItem = getItem;
        this.getItems = getItems;
        this.getLocale = getLocale;
        this.onUpdate = onUpdate;
        this.sendCmd = sendCmd;
        this.sendVoice = sendVoice;
        this.reloadItems = reloadItems;

        var liveUpdatesEnabled = false, prevAudioUrl = '', locale = null, eventSource = null;

        ////////////////

        function onUpdate(scope, name, callback) {
            var handler = $rootScope.$on('openhab-update', callback);
            scope.$on('$destroy', handler);
            //watchItem(name);
            //longPollUpdates(name);
        }

        function loadItems() {
            $http.get('/rest/items')
            .then(function (data) {
                if (angular.isArray(data.data)) {
                    console.log("Loaded " + data.data.length + " openHAB items");
                    $rootScope.reconnecting = false;
                    $rootScope.items = data.data;
                    if (!liveUpdatesEnabled) registerEventSource();
                } else {
                    console.warn("Items not found? Retrying in 5 seconds");
                    $rootScope.reconnecting = true;
                    $rootScope.items = [];
                    $timeout(loadItems, 5000);
                }
                $rootScope.$emit('openhab-update');
            },
            function (err) {
                console.warn("Error loading openHAB items... retrying in 5 seconds");
                $rootScope.reconnecting = true;
                $timeout(loadItems, 5000);
            });
        }

        function getItem(name) {
            var item = $filter('filter')($rootScope.items, {name: name}, true); 
            return (item) ? item[0] : null;
        }

        function getItems() {
            return $rootScope.items;
        }

        /**
         * Sends command to openHAB
         * @param  {string} item Item's id
         * @param  {string} cmd  Command
         */
        function sendCmd(item, cmd) {
            $http({
                method : 'POST',
                url    : '/rest/items/' + item,
                data   : cmd,
                headers: { 'Content-Type': 'text/plain' }
            }).then(function (data) {
                console.log('Command sent: ' + item + '=' + cmd);

                // should be handled by server push messages but their delivery is erratic
                // so perform a full refresh every time a command is sent
                //loadItems();
            });
        }

        /**
         * Returns a promise with the configured locale
         */
        function getLocale() {
            var deferred = $q.defer();

            if (locale) {
                deferred.resolve(locale);
            } else {
                $http.get('/rest/services/org.eclipse.smarthome.core.i18nprovider/config')
                .then(function (response) {
                    var language;
                    if (!response.data.language) {
                        if (navigator && navigator.languages) {
                            locale = navigator.languages[0];
                            language = locale.split('-')[0];
                        } else if (navigator && navigator.language) {
                            locale = navigator.language;
                            language = locale.split('-')[0];
                        } else {
                            locale = language = 'en';
                        }
                    } else {
                        language = response.data.language;
                        locale = response.data.language + ((response.data.region) ? '-' + response.data.region : '');
                    }

                    /* consider the region only for selected common exceptions where the date/number formats
                        are significantly different than the language's default.
                        If more are needed change the gulpfile.js too and run the 'vendor-angular-i18n' gulp task */
                    if (['es-ar', 'de-at', 'en-au', 'fr-be', 'es-bo', 'pt-br', 'en-ca',
                            'fr-ca', 'fr-ch', 'es-co', 'en-gb', 'en-hk', 'zh-hk', 'en-ie',
                            'en-in', 'fr-lu', 'es-mx', 'en-nz', 'en-sg', 'zh-sg',
                            'es-us', 'zh-tw', 'en-za'].indexOf(locale.toLowerCase()) < 0) {
                        locale = language;
                    }

                    if (language !== "en") {
                        console.log('Setting interface language to: ' + language);
                        $translate.use(language);
                    }

                    console.log('Setting locale to: ' + locale);
                    tmhDynamicLocale.set(locale.toLowerCase());

                    deferred.resolve(locale);
                }, function(error) {
                    console.warn('Couldn\'t retrieve locale settings. Setting default to "en-US"');
                    locale = 'en-US';
                    deferred.resolve(locale);
                });
            }

            return deferred.promise;
        }

        /**
         * Sends POST request to openHAB REST
         * voice interpreters
         * @param  {string} text - STT output
         */
        function sendVoice(text) {
            $http({
                method : 'POST',
                url    : '/rest/voice/interpreters',
                data   : text,
                headers: { 'Content-Type': 'text/plain' }
            }).then(function (data) {
                console.log('Voice command sent: "' + text + '"');
            }, function(error) {
                console.error('Error occured while sending voice command.');
            });
        }

        function reloadItems() {
            loadItems();
        }
        
        function registerEventSource() {
            if (typeof(EventSource) !== "undefined") {
                var source = new EventSource('/rest/events');
                liveUpdatesEnabled = true;

                source.onmessage = function (event) {
                    try {
                        var evtdata = JSON.parse(event.data);
                        var topicparts = evtdata.topic.split('/');

                        if (evtdata.type === 'ItemStateEvent' || evtdata.type === 'ItemStateChangedEvent' || evtdata.type === 'GroupItemStateChangedEvent') {
                            var payload = JSON.parse(evtdata.payload);
                            var newstate = payload.value;
                            var item = $filter('filter')($rootScope.items, {name: topicparts[2]}, true)[0];
                            if (item && item.state !== payload.value) {
                                $rootScope.$apply(function () {
                                    console.log("Updating " + item.name + " state from " + item.state + " to " + payload.value);
                                    item.state = payload.value;

                                    if (!item.transformedState) {
                                        // no transformation on state
                                        $rootScope.$emit('openhab-update', item);

                                        if (item.state && $rootScope.settings.speech_synthesis_item === item.name) {
                                            console.log('Speech synthesis item state changed! Speaking it now.');
                                            SpeechService.speak($rootScope.settings.speech_synthesis_voice, item.state);
                                        }
                                        if (item.state && $rootScope.settings.dashboard_control_item === item.name) {
                                            console.log('Dashboard control item state changed, attempting navigation to: ' + item.state);
                                            $location.url('/view/' + item.state);
                                        }
                                    } else {
                                        // fetch the new transformed state
                                        $http.get('/rest/items/' + item.name).then(function (response) {
                                            if (response.data && response.data.transformedState) {
                                                item.transformedState = response.data.transformedState;
                                                $rootScope.$emit('openhab-update', item);
                                            } else {
                                                console.error("Failed to retrieve the new transformedState of item: " + item.name);
                                                item.transformedState = null;
                                                $rootScope.$emit('openhab-update', item);
                                            }
                                        });
                                    }


                                });
                            }
                        } else if (evtdata.topic === "smarthome/webaudio/playurl") {
                            var context, audioBuffer;
                            try {
                                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                                if (typeof (window.AudioContext) != "undefined") {
                                    context = new AudioContext();
                                }

                                var audioUrl = JSON.parse(evtdata.payload);
                                console.log("Audio event received: playing " + audioUrl);

                                if (prevAudioUrl !== audioUrl) {
                                    if (context) {
                                        $http({
                                            url : audioUrl,
                                            method : 'GET',
                                            responseType : 'arraybuffer'
                                        }).then(function(response) {
                                            context.decodeAudioData(response.data, function(buffer) {
                                                audioBuffer = buffer;
                                                var source = context.createBufferSource();
                                                source.buffer = buffer;
                                                source.connect(context.destination);
                                                source.onended = function () {
                                                    context.close();
                                                }
                                                source.start(0);
                                            });
                                        });
                                    } else {
                                        if (!angular.element(document).find("bgsound").length) {
                                            angular.element(document).find("body").append("<bgsound loop='1' />");
                                        }

                                        angular.element(document).find("bgsound").attr('src', audioUrl);
                                    }
                                    prevAudioUrl = audioUrl;
                                }
                            }
                            catch (e) {
                                console.warn("Error while handling audio event: " + e.toString());
                                if (context)
                                  context.close();
                            }
                        } else if (topicparts[0] !== 'smarthome') {
                            var payload = JSON.parse(evtdata.payload);
                            var ohEvent = { topic: evtdata.topic, type: evtdata.type, payload: payload };
                            $rootScope.$apply(function () {
                                console.log("Emitting event type=" + ohEvent.type + ", topic=" + ohEvent.topic);
                                $rootScope.$emit('openhab-event', ohEvent);
                            });
                        }
                    } catch (e) {
                        console.warn('SSE event issue: ' + e.message);
                    }
                }
                source.onerror = function (event) {
                    console.error('SSE error, closing EventSource');
                    liveUpdatesEnabled = false;
                    this.close();
                    $timeout(loadItems, 5000);
                }
            }
        }

    }

    OH2StorageService.$inject = ['OH2ServiceConfiguration', '$rootScope', '$http', '$q', 'localStorageService'];
    function OH2StorageService(OH2ServiceConfiguration, $rootScope, $http, $q, localStorageService) {
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

            $http.get('/rest/services/' + SERVICE_NAME + '/config').then(function (resp) {
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

            return deferred.promise;
        }

        function saveServiceConfiguration() {
            var deferred = $q.defer();

            if ($rootScope.panelsRegistry) {
                OH2ServiceConfiguration.panelsRegistry = JSON.stringify($rootScope.panelsRegistry, null, 4);
            }

            $http({
                method: 'PUT',
                url: '/rest/services/' + SERVICE_NAME + '/config',
                data: OH2ServiceConfiguration,
                headers: { 'Content-Type': 'application/json' }
            }).then (function (resp) {
                console.log('openHAB 2 service configuration saved');
                deferred.resolve();
            }, function (err) {
                console.error('Error while saving openHAB 2 service configuration: ' + JSON.stringify(err));
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
