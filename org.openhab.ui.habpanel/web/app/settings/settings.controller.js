(function() {
'use strict';

    angular
        .module('app')
        .controller('SettingsCtrl', SettingsController);

    SettingsController.$inject = ['$rootScope', '$timeout', '$window', 'OHService', 'OH2ServiceConfiguration', 'OH2StorageService', 'PersistenceService', 'SpeechService', 'themes', 'prompt', 'TranslationService'];
    function SettingsController($rootScope, $timeout, $window, OHService, OH2ServiceConfiguration, OH2StorageService, PersistenceService, SpeechService, themes, prompt, TranslationService) {
        var vm = this;

        vm.themes = themes.data;
        //vm.voices = SpeechService.getVoices();
        if (!$rootScope.settings.theme)
            $rootScope.settings.theme = 'default';

        vm.background_image = $rootScope.settings.background_image;
        vm.drawer_heading_image = $rootScope.settings.drawer_heading_image;
        vm.additional_stylesheet_url = $rootScope.settings.additional_stylesheet_url;
        vm.header_clock_format = $rootScope.settings.header_clock_format;

        vm.rawLocalConfig = JSON.stringify($rootScope.dashboards, null, 4);

        //vm.serviceConfiguration = OH2ServiceConfiguration;
        vm.useRegistry = $rootScope.useRegistry;
        vm.panelsRegistry = $rootScope.panelsRegistry;

        vm.saveAsNewPanelConfig = function () {
            prompt({
                title: TranslationService.translate("settings.storage.panelconfiguration.dialog.title", "New panel configuration"),
                message: TranslationService.translate("settings.storage.panelconfiguration.dialog.message", "Please choose a name for the new panel configuration (letters and digits only please):"),
                input: true
            }).then(function (name) {
                vm.panelsRegistry[name] = { 
                    "dashboards"   : $rootScope.dashboards,
                    "menucolumns"  : $rootScope.menucolumns,
                    "customwidgets": $rootScope.customwidgets,
                    "settings"     : $rootScope.settings,
                    "updatedTime"  : new Date().toISOString()
                };
                vm.storageOption = name;
                OH2StorageService.setCurrentPanelConfig(name);
                OH2StorageService.saveCurrentPanelConfig();
            });

        };

        vm.deletePanelConfig = function (name) {
            prompt({
                title: "Remove panel configuration",
                message: "Please confirm you wish to delete this panel configuration from the server's registry: " + name + ". Make sure no other instances are using this panel set!",
            }).then(function () {
                delete vm.panelsRegistry[name];
                OH2StorageService.saveServiceConfiguration();
            });
        };

        vm.switchToPanelConfig = function (evt) {
            if (vm.storageOption === '(localStorage)') {
                OH2StorageService.useLocalStorage();
            } else {
                if (!OH2StorageService.getCurrentPanelConfig() && !confirm("Switching from local storage to a panel configuration will overwrite your local configuration! Are you sure?")) {
                    vm.storageOption = '(localStorage)';
                    evt.preventDefault();
                } else {
                    OH2StorageService.setCurrentPanelConfig(vm.storageOption);
                }
            }
        };

        vm.saveOptions = function () {
            $rootScope.settings.additional_stylesheet_url = vm.additional_stylesheet_url;
            $rootScope.settings.background_image = vm.background_image;
            $rootScope.settings.drawer_heading_image = vm.drawer_heading_image;
            $rootScope.settings.header_clock_format = vm.header_clock_format;
            PersistenceService.saveDashboards();
        }

        vm.getSpeechSynthesisVoices = function () {
            return SpeechService.getVoices();
        }

        vm.speakTestSentence = function () {
            var voice = $rootScope.settings.speech_synthesis_voice;
            SpeechService.speak(voice, "hab panel test 1 2 3");
        };

        vm.isStringItem = function (item) {
            return item.type.startsWith('String');
        }

        vm.supportsSpeech = SpeechService.isSpeechRecognitionSupported();

        vm.supportsTheming = ($window.CSS && $window.CSS.supports && $window.CSS.supports('--a', 0));

        vm.textboxPlaceholders = {
            panel_name: TranslationService.translate('settings.panel.name.hint', 'Replaces \'HABPanel\' in the side drawer when set'),
            additional_stylesheet: TranslationService.translate('settings.panel.appearance.additional_stylesheet.hint', 'Relative URL only; example: /static/example.css'),
            background_image: TranslationService.translate('settings.panel.appearance.background_image.hint', 'Example: //source.unsplash.com/random'),
            drawer_heading_image: TranslationService.translate('settings.panel.appearance.drawer_heading_image.hint', 'Example: //via.placeholder.com/265x95'),
            clock_format: TranslationService.translate('settings.panel.appearance.show_clock.header_format.hint', 'Default: shortTime, use AngularJS date format')
        };

        activate();

        ////////////////

        function activate() {
            vm.storageOption = "(localStorage)";
            if (OH2StorageService.getCurrentPanelConfig()) {
                vm.storageOption = OH2StorageService.getCurrentPanelConfig();
            }

            $timeout(function () {
                vm.voices = SpeechService.getVoices();
                OHService.reloadItems();
            }, 200);

            if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
                speechSynthesis.addEventListener('voiceschanged', function onVoiceChanged() {
                    speechSynthesis.removeEventListener('voiceschanged', onVoiceChanged);

                    vm.voices = speechSynthesis.getVoices();
                });
            }
    
            iNoBounce.disable();
            
        }
    }
})();