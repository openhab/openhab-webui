(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetTemplate', widgetTemplate)
        .controller('WidgetSettingsCtrl-template', WidgetSettingsCtrlTemplate)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'template',
                displayName: 'Template',
                icon: 'edit',
                description: 'A template widget - displays a custom dynamic template'
            });
        });

    widgetTemplate.$inject = ['$rootScope', '$compile', '$timeout', '$filter', 'OHService', '$uibModal'];
    function widgetTemplate($rootScope, $compile, $timeout, $filter, OHService, $uibModal) {
        // Usage: <widget-template ng-model="widget" />
        //
        // Creates: A template widget
        //
        var directive = {
            //bindToController: true,
            //controller: TemplateWidgetController,
            //controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {

            function render() {
                var template;
                if ($rootScope.configWidgets && $rootScope.configWidgets[scope.ngModel.customwidget])
                    template = $rootScope.configWidgets[scope.ngModel.customwidget].template;
                else if ($rootScope.customwidgets[scope.ngModel.customwidget])
                    template = $rootScope.customwidgets[scope.ngModel.customwidget].template;
                else
                    template = scope.ngModel.template;

                scope.config = scope.ngModel.config;

                if (scope.ngModel.nobackground) {
                    element[0].parentElement.parentElement.className += " no-bkg";
                }

                if (!scope.ngModel.dontwrap) {
                    template = "<div class=\"box-content template-container\">" +
                               "<div class=\"template-contents\">" +
                                template + "</div></div>";
                }

                element.html(template);

                $compile(element.contents())(scope);
            }

            scope.getItem = function(itemname) {
                if (!itemname) return "N/A";
                var item = OHService.getItem(itemname);
                if (!item) return "N/A";

                return item;
            }

            scope.itemState = function(itemname, ignoreTransform) {
                if (!itemname) return "N/A";
                var item = OHService.getItem(itemname);
                if (!item) return "N/A";

                var value = (item.transformedState && !ignoreTransform) ? item.transformedState : item.state;
                return value;
            }
 
            scope.itemValue = scope.itemState;

            scope.itemsInGroup = function(group) {
                return $filter('filter')(OHService.getItems(),
                    function (item) {
                        return (item.groupNames && item.groupNames.indexOf(group) !== -1);
                    }
                );
            }

            scope.itemsWithTag = function(tag) {
                return $filter('filter')(OHService.getItems(),
                    function (item) {
                        return (item.tagNames && item.tagNames.indexOf(tag) !== -1);
                    }
                );
            }

            scope.sendCmd = function(item, cmd) {
                var item = OHService.getItem(item);
                if (!item) {
                    return;
                }

                OHService.sendCmd(item.name, cmd);
            }

            scope.openModal = function(templateUrl, noAnimation, size) {
                scope.currentModalInstance = $uibModal.open({
                    templateUrl: templateUrl,
                    size: size,
                    animation: !noAnimation,
                    scope: scope
                }).rendered.then(function () {
                    $timeout(function () {
                        $rootScope.$broadcast('openhab-update');
                        OHService.reloadItems();
                    });
                });
            }

            scope.$on("refreshTemplate", function () {
                render();
            });

            render();
        }
    }

    TemplateWidgetController.$inject = ['$rootScope', '$scope', '$filter', 'OHService'];
    function TemplateWidgetController ($rootScope, $scope, $filter, OHService) {
        var vm = this;
        this.widget = this.ngModel;
        this.items = OHService.getItems();
    }


    // settings dialog
    WidgetSettingsCtrlTemplate.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService', 'FileSaver', 'LocalFileReader'];

    function WidgetSettingsCtrlTemplate($scope, $timeout, $rootScope, $modalInstance, widget, OHService, FileSaver, LocalFileReader) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();


        if ($scope.widget.preview) {
            // inline settings (used in the designer's preview)
            $scope.widgetsettings = angular.copy($scope.widget.settings);
            $scope.customwidget_name = $scope.widget.customwidget_name;
        } else {
            if ($scope.widget.customwidget) {
                // get settings from custom widget
                if ($rootScope.configWidgets && $rootScope.configWidgets[$scope.widget.customwidget]) {
                    $scope.widgetsettings = angular.copy($rootScope.configWidgets[$scope.widget.customwidget].settings);
                    $scope.customwidget_name = $rootScope.configWidgets[$scope.widget.customwidget].name;
                    $scope.customwidget_helpUrl = $rootScope.configWidgets[$scope.widget.customwidget].readme_url;
                } else {
                    $scope.widgetsettings = angular.copy($rootScope.customwidgets[$scope.widget.customwidget].settings);
                    $scope.customwidget_name = $rootScope.customwidgets[$scope.widget.customwidget].name;
                    $scope.customwidget_helpUrl = $rootScope.customwidgets[$scope.widget.customwidget].readme_url;
                }
            }
        }

        $scope.editorOptions = {
            lineNumbers  : true,
            tabSize      : 2,
            matchTags    : {bothTags: true},
            autoCloseTags: true,
            matchBrackets: true,
            mode         : 'template'
        };

        $scope.form = {
            name        : widget.name,
            sizeX       : widget.sizeX,
            sizeY       : widget.sizeY,
            col         : widget.col,
            row         : widget.row,
            template    : widget.template,
            dontwrap    : widget.dontwrap,
            nobackground: widget.nobackground
        };
        if ($scope.widget.customwidget || $scope.widget.settings || $scope.widget.preview) {
            $scope.form.config = $scope.widget.config || {};
            angular.forEach($scope.widgetsettings, function (setting) {
                if (setting.type !== 'icon' && setting.type !== 'heading'
                && setting.default && ($scope.form.config[setting.id] === undefined)) {
                    $scope.form.config[setting.id] = setting.default;
                }
            });
        }

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);
            $modalInstance.close(widget);
        };

        $scope.showImportDialog = function () {
            document.getElementById('template-file-select').click();
        }

        $scope.importFile = function(file) {
            if (!file) return;
            if (file.name.indexOf(".html") == -1) {
                alert("The file must have a .html extension!");
                delete $scope.file;
                return;
            }
            LocalFileReader.readFile(file, $rootScope).then(function (text) {
                $scope.form.template = text;
                console.log('Template loaded from file: ' + file.name);
                delete $scope.file;
            });
        };

        $scope.exportToFile = function() {
            var data = new Blob([$scope.form.template], { type: 'text/html;charset=utf-8'});
            FileSaver.saveAs(data, $scope.form.name + '.tpl.html');
        };

        $timeout(function () {
            $scope.refreshEditor = new Date();
        });

        CodeMirror.defineMode("template", function(config, parserConfig) {
            var templateOverlay = {
                token: function(stream, state) {
                    var ch;
                    if (stream.match("itemState(") || stream.match("sendCmd(")
                     || stream.match("itemsInGroup(") || stream.match("itemsWithTag(")
                     || stream.match("itemValue(") ||  stream.match("getItem(")) {
                         while ((ch = stream.next()) != null)
                         if (ch == ")") {
                             stream.eat(")");
                             return "habpanel-function"
                         }
                    }
                    if (stream.match("{{")) {
                        while ((ch = stream.next()) != null)
                        if (ch == "}" && stream.next() == "}") {
                            stream.eat("}");
                            return "template-expression";
                        }
                    }
                    while (stream.next() != null
                        && (!stream.match("{{", false)) && !stream.match("itemState", false) && !stream.match("itemValue", false)
                            && !stream.match("sendCmd", false) && !stream.match("itemsInGroup", false)
                            && !stream.match("itemsWithTag", false) && !stream.match("getItem", false)) {}
                    return null;
                }
            };
            return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "text/xml"), templateOverlay);
        });
    }

})();
