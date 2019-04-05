/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('bootstrapCombo', [
])
    .directive('bootstrapCombo', function ($compile) {
        return {
            restrict: 'E',
            require: "ngModel",
            scope: {
                items: '=dropdownData',
                selectedItem: '=preselectedItem',
                ngModel: '=',
                placeholder: '@'
            },
            link: function (scope, element, attrs,ngModel) {
                scope.value = scope.ngModel;
                for(var item in scope.items) {
                    if(scope.items[item].value == parseInt(scope.ngModel)) {
                        scope.value = scope.items[item].label;
                        break;
                    }
                }

                scope.selectVal = function (item) {
                    scope.value = item.label;
                    ngModel.$setViewValue(item.value);
                };

                ngModel.$render = function() {
                    var value = ngModel.$viewValue;
                    for(var item in scope.items) {
                        if(scope.items[item].value == parseInt(ngModel.$viewValue)) {
                            value = scope.items[item].label;
                            break;
                        }
                    }
                    scope.value = value;
                };

                scope.$watch("value", function() {
                    for(var item in scope.items) {
                        if(scope.items[item].label == scope.value) {
                            ngModel.$setViewValue(scope.items[item].value);
                            return;
                        }
                    }
                    ngModel.$setViewValue(scope.value);
                });

                var html = '';
                html += '  <div class="input-group">';
                html += '    <input class="form-control" type="text" ng-model="value" ng-attr-placeholder="{{placeholder}}" />';
                html += '    <div class="input-group-btn" data-ng-if="items.length">';
                html += '      <div class="btn-group " uib-dropdown>';
                html += '        <button class="btn btn-default dropdown-toggle" type="button" uib-dropdown-toggle>';
                html += '          <span class="caret"></span>';
                html += '        </button>';
                html += '        <ul class="dropdown-menu dropdown-menu-right dropdown-scroll" role="menu" uib-dropdown-menu>';
                html += '          <li data-ng-repeat="item in items"><a data-ng-href="" role="menuitem" tabindex="-1" data-ng-click="selectVal(item)">{{item.label}}</a></li>';
                html += '        </ul>';
                html += '      </div>';
                html += '    </div>';
                html += '  </div>';

                element.append($compile(html)(scope));
            }
        };
    })
;