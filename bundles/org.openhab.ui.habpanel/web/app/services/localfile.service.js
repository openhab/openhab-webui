(function() {
    'use strict';

    angular
        .module('app.services')
        .service('LocalFileReader', LocalFileReader)
        .directive('localFileSelect', LocalFileSelect);

    LocalFileReader.$inject = ['$q'];
    function LocalFileReader($q) {
        this.readFile = readFile;

        function onLoad(reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                })
            }
        }

        function onError(reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                })
            }
        }

        function readFile(file, scope) {
            var reader = new FileReader();
            var deferred = $q.defer();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onLoad(reader, deferred, scope);
            reader.readAsText(file);

            return deferred.promise;
        }
    }

    function LocalFileSelect() {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                localFileSelect: '=',
                onFileSelected: '=',
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            element.bind("change", function (e) {
                scope.localFileSelect = (e.srcElement || e.target).files[0];
                scope.onFileSelected(scope.localFileSelect);
            })
        }
    }
})();
