(function() {
'use strict';

    angular
        .module('app')
        .controller('WidgetDesignerCtrl', WidgetDesignerController);

    WidgetDesignerController.$inject = ['$rootScope', '$scope', '$timeout', '$routeParams', '$uibModal', 'widget', 'OHService', 'PersistenceService', 'TranslationService'];
    function WidgetDesignerController($rootScope, $scope, $timeout, $routeParams, $modal, widget, OHService, PersistenceService, TranslationService) {
        var vm = this;
        vm.widgetId = $routeParams.id;
        vm.widget = angular.copy(widget);

        vm.editorOptions = {
            lineNumbers  : true,
            tabSize      : 2,
            //matchTags    : {bothTags: true},
            autoCloseTags: true,
            matchBrackets: true,
            mode         : 'template'
        };

        vm.gridsterOptions = {
            margins: [5, 5],
            columns: 12,
            defaultSizeX: 4,
            defaultSizeY: 4,
            mobileModeEnabled: false,
            draggable: { enabled: false },
            resizable: {
                enabled: true,
                handles: ['se']
            }
        };

        vm.previewmodel = {
            sizeX: 4,
            sizeY: 4,
            name: TranslationService.translate("customwidgets.designer.preview", "Preview"),
            template: "<h4>here</h4>"
        };

        vm.addSetting = function () {
            if (!vm.widget.settings)
                vm.widget.settings = [];

            vm.widget.settings.push({ type: 'string'});
        };

        vm.deleteSetting = function (setting) {
            vm.widget.settings.splice(vm.widget.settings.indexOf(setting), 1);
        };

        vm.swapSettings = function (indexsrc, indexdest) {
            var tmp = angular.copy(vm.widget.settings[indexdest]);
            vm.widget.settings[indexdest] = angular.copy(vm.widget.settings[indexsrc]);
            vm.widget.settings[indexsrc] = tmp;
        };

        $scope.refreshPreview = function () {
            OHService.reloadItems();
            $timeout(function () {
                $scope.$broadcast('rzSliderForceRender');
                vm.previewmodel.row = 0;
                vm.previewmodel.col = 0;
                vm.previewmodel.customwidget_name = vm.widget.name || vm.widgetId;
                vm.previewmodel.template = vm.widget.template;
                vm.previewmodel.preview = true;
                $scope.$broadcast('refreshTemplate');
            });
        };

        vm.openPreviewSettings = function () {
            vm.previewmodel.settings = vm.widget.settings;
            var modalInstance = $modal.open({
                //scope: $scope,
                templateUrl: 'app/widgets/template/template.settings.tpl.html',
                controller: 'WidgetSettingsCtrl-template',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    widget: function() {
                        return vm.previewmodel;
                    }
                }
            });

            modalInstance.result.then(function (widget) {
                vm.previewmodel.config = widget.config;
                delete vm.previewmodel.settings;
                $scope.$broadcast('refreshTemplate');
            });
        };

        vm.save = function () {
            $rootScope.customwidgets[vm.widgetId] = angular.copy(vm.widget);
            PersistenceService.saveDashboards().then(function () {
                vm.saveLabel = TranslationService.translate("customwidgets.designer.saved", "Saved!");
                $timeout(resetButtons, 2000);
            })
        };

        vm.keyDown = function ($event) {
            if (event.ctrlKey || event.metaKey) {
                if  (String.fromCharCode(event.which).toLowerCase() === 's') {
                    event.preventDefault();
                    vm.save();
                    return false;
                }
            }
        };

        activate();

        ////////////////

        function resetButtons() {
            vm.saveLabel = TranslationService.translate("customwidgets.designer.save", "Save");
        }

        function activate() {
            $timeout(function () {
                vm.refreshEditor = new Date();
            }, 200);

            resetButtons();
        }

        CodeMirror.defineMode("template", function(config, parserConfig) {
            var templateOverlay = {
                token: function(stream, state) {
                    var ch;
                    if (stream.match("itemState(") || stream.match("sendCmd(")
                     || stream.match("itemsInGroup(") || stream.match("itemsWithTag(")
                     || stream.match("itemValue(") || stream.match("getItem(")) {
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
