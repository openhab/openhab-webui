(function () {
    'use strict';

    angular
        .module('app.services')
        .service('SpeechService', SpeechService);

    SpeechService.$inject = ['$window', '$q', '$filter', '$rootScope'];
    function SpeechService($window, $q, $filter, $rootScope) {
        this.getVoices = getVoices;
        this.speak = speak;

        this.isSpeechRecognitionSupported = isSpeechRecognitionSupported;
        this.startSpeechRecognition = startSpeechRecognition;
        this.stopSpeechRecognition = stopSpeechRecognition;


        var voices = getVoices();

        var speech = isSpeechRecognitionSupported() ? new webkitSpeechRecognition() : null;

        ////////////////


        // Text-to-speech

        function getVoices() {
            if (!('SpeechSynthesisUtterance' in window))
                return [];

            return speechSynthesis.getVoices();
        }

        function speak(voicename, text) {
            if (!('SpeechSynthesisUtterance' in window)) {
                console.error('No support for speech synthesis on this platform!');
                return;
            }

            if (!speechSynthesis.getVoices()) {
                console.warn("No voices?");
            }

            var utterance = new SpeechSynthesisUtterance(text);
            var voice = $filter('filter')(speechSynthesis.getVoices(), { name: voicename })[0];
            utterance.voice = voice;
            if (voice.lang) utterance.lang = voice.lang;

            speechSynthesis.speak(utterance);
        }


        // Speech-to-text

        function isSpeechRecognitionSupported() {
            return ('webkitSpeechRecognition' in $window);
        }

        function startSpeechRecognition(locale) {
            if (!speech || !locale) {
                return;
            }

            speech.continuous = true;
            speech.interimResults = true;
            speech.lang = locale;

            speech.onresult = function (e) {
                var interim_transcript = '';
                var final_transcript = '';

                if (typeof (e.results) === 'undefined') {
                    return;
                }

                for (var i = e.resultIndex; i < e.results.length; ++i) {
                    var val = e.results[i][0].transcript;
                    if (e.results[i].isFinal) {
                        final_transcript += " " + val;
                    } else {
                        interim_transcript += " " + val;
                    }
                }

                $rootScope.$broadcast('speech-recognition', { interim_transcript: interim_transcript });

                if (final_transcript) {
                    $rootScope.$broadcast('speech-recognition', { final_transcript: final_transcript.trim() });
                }
            };

            speech.onend = function (e) {
                console.log('Stopped listening');
                $rootScope.$broadcast('speech-recognition', { stop_listening: true });
            }

            speech.onerror = function (e) {
                $rootScope.$broadcast('speech-recognition', { error: e.error });
                console.warn('Speech recognition error: ' + e.error);
            }

            speech.start();
        }

        function stopSpeechRecognition() {
            speech.stop();
        }


    }
})();