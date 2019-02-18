angular.module('showOverflow', [])
    .directive('showOverflow', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                var parent = element.parent()[0];

                scope.$watch(function () {
                    if (parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) {
                        element.css({display: "block"});
                    }
                    else {
                        element.css({display: "none"});
                    }
                });
            }
        }
    });
