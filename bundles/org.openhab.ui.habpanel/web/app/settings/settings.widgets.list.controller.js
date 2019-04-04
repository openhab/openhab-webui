(function() {
'use strict';

    angular
        .module('app')
        .controller('WidgetListCtrl', WidgetListController);

    WidgetListController.$inject = ['$rootScope', '$scope', '$http', 'widgets', 'PersistenceService', 'prompt', 'FileSaver', 'LocalFileReader', '$uibModal', '$ocLazyLoad', 'TranslationService'];
    function WidgetListController($rootScope, $scope, $http, widgets, PersistenceService, prompt, FileSaver, LocalFileReader, $modal, $ocLazyLoad, TranslationService) {
        var vm = this;

        vm.addNewWidget = function () {
            prompt({
                title: TranslationService.translate("customwidgets.list.add.dialog.title", "New custom widget"),
                message: TranslationService.translate("customwidgets.list.add.dialog.message", "Please choose a short name as an identifier for your widget (for example, 'window-shutter', 'up-down-button, 'weather-forecast' etc.). If a widget with the same identifier already exists, it will be replaced!"),
                input: true
            }).then(function (id) {
                $rootScope.customwidgets[id] = { 
                };
                PersistenceService.saveDashboards();
            });
        };

        vm.showImportDialog = function () {
            document.getElementById('widget-file-select').click();
        }

        vm.importFile = function (file) {
            if (!file) return;
            if (file.name.indexOf(".json") == -1) {
                alert(TranslationService.translate("customwidgets.list.import.nojson", "The file must have a .json extension!"));
                delete $scope.file;
                return;
            }
            prompt({
                title: TranslationService.translate("customwidgets.list.import.dialog.title", "Import widget"),
                message: TranslationService.translate("customwidgets.list.import.dialog.message", "Please confirm or change the identifier of your widget (avoid spaces and special chars!). If a widget with the same identifier already exists, it will be replaced!"),
                input: true,
                value: file.name.replace(".widget", "").replace(".json", "")
            }).then(function (id) {
                LocalFileReader.readFile(file, $rootScope).then(function (text) {
                    try {
                        var json = JSON.parse(text);
                        if (!json.template) throw "Invalid widget - no template";
                        console.log('Widget loaded from file: ' + file.name);
                        $rootScope.customwidgets[id] = json;
                        delete $scope.file;
                    } catch (e) {
                        prompt({
                            title: "Error",
                            message: TranslationService.translate("customwidgets.list.import.error", "Widget import error: ") + e,
                            buttons: [{ label:'OK', primary: true }]
                        });
                    }
                });
            });
        };

        vm.showImportGalleryDialog = function () {
            $ocLazyLoad.load('app/settings/settings.widgets.gallery.controller.js').then(function () {
                $modal.open({
                    scope: $scope,
                    templateUrl: 'app/settings/settings.widgets.gallery.tpl.html',
                    controller: 'WidgetGalleryCtrl',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                }).result.then(function (widgets) {
                    angular.forEach(widgets, function (widget, id) {
                        delete widget.is_update;
                        $rootScope.customwidgets[id] = angular.copy(widget);
                    });
                    PersistenceService.saveDashboards();
                });
            });
        };

        vm.exportToFile = function (id, widget) {
            var data = new Blob([JSON.stringify(widget, null, 4)], { type: 'application/json;charset=utf-8'});
            FileSaver.saveAs(data, id + '.widget.json');
        };

        vm.updateWidget = function (id) {
            var widget = $rootScope.customwidgets[id];
            if (widget.source_url) {
                var source_url = widget.source_url;
                var readme_url = widget.readme_url;

                prompt({
                    title: TranslationService.translate("customwidgets.list.update.dialog.title", "Update widget"),
                    message: TranslationService.translate("customwidgets.list.update.dialog.message", "This will update widget <id> from <source_url>. Any changes you made will be overwritten! Continue?")
                                               .replace('<id>', id).replace('<source_url>', source_url),
                }).then(function () {
                    $http.get(widget.source_url).then(function (resp) {
                        if (resp.data) {
                            if (!resp.data.template) {
                                vm.updateErrorMessage = TranslationService.translate("customwidgets.list.update.error.notemplatefound", "Couldn't update widget <id> from <source_url>: no template found")
                                                                          .replace('<id>', id).replace('<source_url>', source_url);
                            } else {
                                resp.data.source_url = source_url;
                                resp.data.readme_url = readme_url;
                                $rootScope.customwidgets[id] = resp.data;
                                PersistenceService.saveDashboards();
                                vm.updatedMessage = TranslationService.translate("customwidgets.list.update.success", "Widget <id> updated successfully from <source_url>")
                                                                      .replace('<id>', id).replace('<source_url>', source_url);
                            }
                        } else {
                            vm.updateErrorMessage = TranslationService.translate("customwidgets.list.update.error.unknown", "Couldn't update widget <id> from <source_url>: ")
                                                                      .replace('<id>', id).replace('<source_url>', source_url)
                                                                      + resp.statusText;
                        }
                    });
                });
            }
        };

        vm.deleteWidget = function (id) {
            prompt({
                title: TranslationService.translate("customwidgets.list.delete.dialog.title", "Remove widget"),
                message: TranslationService.translate("customwidgets.list.delete.dialog.message", "Please confirm you want to delete this widget: ") + id,
            }).then(function () {
                delete $rootScope.customwidgets[id];
                PersistenceService.saveDashboards();
            });
        };

        vm.cloneConfigWidget = function (originalId) {
            prompt({
                title: TranslationService.translate("customwidgets.list.clone.dialog.title", "Clone widget"),
                message: TranslationService.translate("customwidgets.list.clone.dialog.message", "This will clone the globally provisioned widget: <id> to be modified as part of the panel configuration. Enter an unique identifier below - it must be different from the widget being cloned, and should avoid spaces and special chars. If an user-defined widget with the same identifier already exists, it will be replaced!")
                                           .replace('<id>', originalId),
                input: true,
                value: originalId + '-clone'
            }).then(function (id) {
                $rootScope.customwidgets[id] = angular.copy($rootScope.configWidgets[originalId]);
                PersistenceService.saveDashboards();
            })
        }

        activate();

        ////////////////

        function activate() {

        }
    }
})();
