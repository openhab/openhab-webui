/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Binding.config', [
//    'angular-bootstrap-select',
    'ngSanitize'
])
    .run([
        '$templateCache',
        function ($templateCache) {
            // Update the notification template. The use of <button> causes problems with some templates
            $templateCache.put('binding/bindingHelp.tpl.html',
                '<div class="popover-content"><span ng-bind-html="popup_text"></span></div>'
            );
        }
    ])

    .directive('bindingConfig',
    function ($q, $parse, $compile, $document, $timeout) {
        return {
            restrict: 'E', // supports using directive as element only
            scope: {
                template: "@",
                bindingChange: "=",
                bindingData: "="
            },
            link: function ($scope, element, attrs) {
                // Basic initialization
                var newElement = null,
                    newChild = null,
                    newInput = null,
                    newOption = null;

                var buildFields = function (field, id) {
                    newElement = angular.element('<div></div>');
                    newElement.attr('class', 'form-group');

                    newChild = angular.element('<label></label>');
                    newChild.attr('for', field.name);
                    newChild.attr('class', 'control-label');


                    angular.element(newChild).html(field.label);
                    newElement.append(newChild);

                    newChild = angular.element('<span></span>');
                    newChild.attr('class', 'pull-right label label-success status_pending');
                    newChild.attr('ng-show', 'bindingData.' + field.name + '.dirty==true');
                    angular.element(newChild).html("updated");
                    newElement.append(newChild);

                    newChild = angular.element('<span></span>');
                    newChild.attr('class', 'pull-right');
                    angular.element(newChild).html("&nbsp;");
                    newElement.append(newChild);

                    newChild = angular.element('<span></span>');
                    newChild.attr('class', 'pull-right label label-warning status_pending');
                    newChild.attr('ng-show', 'bindingData.' + field.name + '.pending==true');
                    angular.element(newChild).html("update pending");
                    newElement.append(newChild);

                    newChild = angular.element('<div></div>');
                    newChild.attr('class', 'input-group');

                    switch (field.type) {
                        case "BYTE":
                        case "SHORT":
                            newInput = angular.element('<input>');
                            newInput.attr('id', field.name);
                            newInput.attr('type', 'number');
                            newInput.attr('class', 'form-control');
                            if (field.value !== undefined) {
                                field.value = parseInt(field.value, 10);
                            }
                            else {
                                field.value = "";
                            }
                            break;
                        case "LIST":
                            newInput = angular.element('<select></select>');
                            newInput.attr('id', field.name);
//                            newInput.attr('selectpicker', "");
                            newInput.attr('class', 'form-control');
                            if (field.value === undefined) {
                                newOption = angular.element('<option></option>');
                                newOption.attr('value', "");
                                newOption.attr('selected');
                                newOption.attr('disabled');
                                newOption.attr('hidden');
                                newInput.append(newOption);
                            }
                            angular.forEach(field.valuelist.entry, function (value) {
                                newOption = angular.element('<option></option>');
                                newOption.attr('value', value.key);
                                angular.element(newOption).html(value.value);
                                //        if(field.value == value.key) {
                                //          newOption.attr('selected');
                                //    }
                                newInput.append(newOption);
                            });
                            break;
                        default:
                            newInput = angular.element('<input>');
                            newInput.attr('id', field.name);
                            newInput.attr('type', 'text');
                            newInput.attr('class', 'form-control');
                            break;
                    }

                    if (newInput !== null) {
                        if (field.readonly == "true") {
                            newInput.attr('readonly', 'true');
                        }

                        $scope.bindingData[field.name] = {
                            domain: field.domain,
                            value: field.value,
                            org: field.value,
                            dirty: false,
                            pending: false
                        };

                        if (field.state == "PENDING") {
                            $scope.bindingData[field.name].pending = true;
                        }

                        newInput.attr('ng-model', 'bindingData.' + field.name + '.value');

                        if (attrs.bindingChange !== undefined) {
//                            newInput.attr('ng-change', attrs.bindingChange);
                        }
                        newInput.attr('ng-change', 'changeHandler("' + field.name + '","' + field.domain + '")');

                        newChild.append(newInput);

                        newInput = angular.element('<span></span>');
                        newInput.attr('class', 'input-group-btn');

                        newOption = angular.element('<button></button>');
                        newOption.attr('class', 'btn btn-default');
                        newOption.attr('type', 'button');
                        if (field.description == null || field.description.length === 0) {
                            newOption.attr('disabled', '');
                        }
                        else {
                            newOption.attr('popup-show', 'binding/bindingHelp.tpl.html');
                            newOption.attr('popup-placement', 'left');
                            newOption.attr('popup-shown', 'popup_text="' + field.description + '"');
                        }
                        angular.element(newOption).html('<span class="fa fa-question-circle"></span>');
                        newInput.append(newOption);
                        newChild.append(newInput);

                        newElement.append(newChild);
                    }
                    this.append(newElement);
                };

                function getElement(domain) {
                    var found = null;
                    angular.forEach($scope.jsonTemplate, function (element) {
                        if (element.domain == domain) {
                            found = element;
                        }
                    });

                    return found;
                }

                $scope.changeHandler = function (name, domain) {
                    console.log("changeHandler", name, domain);
                    var el = getElement(domain);
                    if (el == null) {
                        console.log("Element not found:", domain);
                        return;
                    }

                    if ($scope.bindingData[name].value === el.value) {
                        $scope.bindingData[name].dirty = false;
                    } else {
                        $scope.bindingData[name].dirty = true;
                    }

                    if ($scope.bindingChange !== undefined) {
                        $scope.bindingChange(domain);
                    }
                };

                $scope.$watch("template", function (template) {
                    element.empty();
                    if (template == null || template.length === 0) {
                        return;
                    }
                    console.log("New template:", template);

                    if ($scope.bindingData === undefined) {
                        $scope.bindingData = {};
                    }
                    try {
                        $scope.jsonTemplate = [].concat(angular.fromJson(template));
                        console.log("Update template", $scope.jsonTemplate);
                        angular.forEach($scope.jsonTemplate, buildFields, element);
                    }
                    catch (err) {
                        console.log("Error parsing JSON", template, err);
                        element.empty();
                        return;
                    }

                    newElement = angular.element("<form></form>");
                    newElement.attr('class', "panel-form form-horizontal");
                    newElement.attr('role', "form");
                    newElement.attr('model', attrs.bindingData);
                    newElement.removeAttr('ng-model');

                    angular.forEach(element[0].classList, function (clsName) {
                        newElement[0].classList.add(clsName);
                    });
                    newElement.addClass('dynamic-form');
                    newElement.append(element.contents());

                    // Compile and update DOM
                    element.empty();
                    $compile(newElement)($scope).appendTo(element);
                });
            }
        };
    })
;
