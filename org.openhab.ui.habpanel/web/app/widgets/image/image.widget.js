(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetImage', widgetImage)
        .controller('WidgetSettingsCtrl-image', WidgetSettingsCtrlImage)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'image',
                displayName: 'Image',
                icon: 'picture',
                description: 'Displays an image (not necessarily from openHAB)'
            });
        });

    widgetImage.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetImage($rootScope, $modal, OHService) {
        // Usage: <widget-image ng-model="widget" />
        //
        // Creates: A image widget
        //
        var directive = {
            bindToController: true,
            controller: ImageController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/image/image.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    ImageController.$inject = ['$rootScope', '$scope', 'OHService', '$interval', '$sce'];
    function ImageController ($rootScope, $scope, OHService, $interval, $sce) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item || vm.widget.image_source.indexOf('item') || (item.type !== "String" && item.type !== "Image")) {
                vm.value = "";
                return;
            }
            vm.url = $sce.trustAsResourceUrl(item.state);
        }

        OHService.onUpdate($scope, vm.widget.item, function ($event, item) {
            if (!item || (vm.widget.image_source !== 'static' && vm.widget.item === item.name))
            updateValue();
        });

        if (!this.widget.image_source || this.widget.image_source === 'static') {
            vm.original_url = vm.url = this.widget.url;
        }

        var intervaltype = vm.intervaltype = this.widget.intervaltype || 'seconds';
        
        if (vm.widget.refresh) {
            var _interval = intervaltype === 'seconds' ? this.widget.refresh * 1000 : this.widget.refresh;
            var imgRefresh = $interval(function () {
                if (!vm.widget.nosuffix) {
                    var timestamp = (new Date()).toISOString();

                    vm.url = (vm.original_url.indexOf('?') === -1) ?
                        vm.original_url + "?_t=" + timestamp : vm.original_url + "&_t=" + timestamp;
                } else {
                    vm.url = vm.original_url;
                }
            }, _interval, 0, true);

            $scope.$on('$destroy', function (event) {
                $interval.cancel(imgRefresh);
            });
        }

        vm.background = this.widget.background || 'rgb(0, 0, 0)';
    }


    // settings dialog
    WidgetSettingsCtrlImage.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlImage($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name        : widget.name,
            sizeX       : widget.sizeX,
            sizeY       : widget.sizeY,
            col         : widget.col,
            row         : widget.row,
            image_source: widget.image_source || 'static',
            url         : widget.url,
            refresh     : widget.refresh,
            intervaltype: widget.intervaltype || 'seconds',
            nosuffix    : widget.nosuffix,
            background  : widget.background || 'rgb(0, 0, 0)'
        };
        if (widget.image_source === 'item-string') $scope.form.item_string = widget.item;
        if (widget.image_source === 'item-image') $scope.form.item_image = widget.item;

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);
            switch (widget.image_source) {
                case "item-string":
                    widget.item = widget.item_string;
                    break;
                case "item-image":
                    widget.item = widget.item_image;
                    break;
                default:
                    delete widget.item;
                    break;
            }

            delete widget.item_string;
            delete widget.item_image;

            if (!widget.refresh) {
                delete widget.nosuffix;
            }

            $modalInstance.close(widget);
        };

    }


})();
