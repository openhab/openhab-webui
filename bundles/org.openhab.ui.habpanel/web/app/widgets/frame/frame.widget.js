(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetFrame', widgetFrame)
        .controller('WidgetSettingsCtrl-frame', WidgetSettingsCtrlFrame)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'frame',
                displayName: 'Frame',
                icon: 'globe',
                description: 'Embedded website from predefined URL or openHAB item.'
            });
        });

    widgetFrame.$inject = ['$rootScope', '$interval', 'OHService', '$sce'];
    function widgetFrame($rootScope, $interval, OHService, $sce) {
        // Usage: <widget-label ng-model="widget" />
        //
        // Creates: A label widget
        //
        var directive = {
            bindToController: true,
            controller: FrameController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/frame/frame.tpl.html',
            scope: {
                ngModel: '='
            }
        };

        return directive;
        
        function link(scope, element, attrs) {
        }
    }

    FrameController.$inject = ['$rootScope', '$scope', '$interval', 'OHService', '$sce'];
    function FrameController ($rootScope, $scope, $interval, OHService, $sce) {
        var vm = this;
        vm.widget = this.ngModel;

        function updateValue() {
            if (vm.widget.url_source === 'static') {
                vm.value = vm.widget.frameUrl;
            } else {
                var item = OHService.getItem(vm.widget.item);
                if (!item || vm.widget.url_source !== 'item') {
                    vm.value = "";
                    return;
                }
                vm.value = item.state;
            }

            if (!vm.value) return;

            if (vm.widget.refresh && !vm.widget.nosuffix) {
                vm.value += (vm.value.match(/\?/) ? '&' : '?') + '_t='+ (new Date()).getTime();
            }

            vm.detailFrame = $sce.trustAsResourceUrl(vm.value);
        }

        OHService.onUpdate($scope, vm.widget.item, function ($event, item) {
            if (!item || (vm.widget.url_source !== 'static' && vm.widget.item === item.name)) {
                updateValue();
            }
        });

        if (vm.widget.refresh) {
            vm.refreshInterval = $interval(updateValue, vm.widget.refresh * 1000);

            $scope.$on('$destroy', function () {
                $interval.cancel(vm.refreshInterval);
            });
        }
        //updateValue();
    };


    // settings dialog
    WidgetSettingsCtrlFrame.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService', '$sce'];

    function WidgetSettingsCtrlFrame($scope, $timeout, $rootScope, $modalInstance, widget, OHService, $sce) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name      : widget.name,
            sizeX     : widget.sizeX,
            sizeY     : widget.sizeY,
            col       : widget.col,
            row       : widget.row,
            url_source: widget.url_source || 'static',
            item      : widget.item,
            frameUrl  : widget.frameUrl,
            frameless : widget.frameless,
            hidelabel : widget.hidelabel,
            background: widget.background,
            refresh   : widget.refresh,
            nosuffix  : widget.nosuffix
        };    

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);
            switch (widget.url_source) {
                case "item":
                    delete widget.frameUrl;
                    break;
                default:
                    delete widget.item;
                    delete widget.action_type;
                    break;
            }
            if (!widget.refresh) {
                delete widget.nosuffix;
            }

            $modalInstance.close(widget);
        };
    }
})();
