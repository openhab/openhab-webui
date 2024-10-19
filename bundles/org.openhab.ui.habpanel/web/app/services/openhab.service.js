(function() {
'use strict';

    angular
        .module('app.services')
        .service('OHService', OHService);

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
            /* send the update event early if the items are already there (to speed up the dashboard switches) */
            if ($rootScope.items && $rootScope.items.length > 0) {
                $timeout($rootScope.$emit('openhab-update'));
            }

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
                $http.get('/rest/')
                .then(function (response) {
                    if (!response.data.locale) {
                        if (navigator && navigator.languages) {
                            locale = navigator.languages[0];
                        } else if (navigator && navigator.language) {
                            locale = navigator.language;
                        } else {
                            locale = 'en';
                        }
                    } else {
                        locale = response.data.locale.replace('_', '-')
                    }

                    var language = locale.split('-')[0];

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
                var source = new EventSource('/rest/events?topics=openhab/items/*/statechanged,openhab/items/*/*/statechanged,openhab/webaudio/playurl');
                liveUpdatesEnabled = true;

                source.onmessage = function (event) {
                    try {
                        var evtdata = JSON.parse(event.data);
                        var topicparts = evtdata.topic.split('/');

                        if (evtdata.type === 'ItemStateChangedEvent' || evtdata.type === 'GroupItemStateChangedEvent') {
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
                        } else if (evtdata.topic === "openhab/webaudio/playurl") {
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

})();
