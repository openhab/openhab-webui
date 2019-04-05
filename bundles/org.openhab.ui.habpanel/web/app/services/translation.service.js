(function() {
    'use strict';

    angular
        .module('app.services')
        .service('TranslationService', TranslationService)
        .filter('translation', TranslationFilter);

    TranslationService.$inject = ['$translate', '$translatePartialLoader', '$q'];
    function TranslationService($translate, $translatePartialLoader, $q) {
        this.translate = translate;
        this.enterPart = enterPart;

        function translate(id, fallback) {
            var result = $translate.instant(id);
            return (result !== id) ? result : fallback;
        }

        function enterPart(part) {
            var deferred = $q.defer();
            $translatePartialLoader.addPart(part);
            $translate.refresh().then(function () {
                deferred.resolve();
            }, function () {
                deferred.resolve();
            })

            return deferred.promise;
        }
    }

    TranslationFilter.$inject = ['TranslationService'];
    function TranslationFilter(TranslationService) {
        return function(original, id) {
            return TranslationService.translate(id, original);
        }
    }
})();