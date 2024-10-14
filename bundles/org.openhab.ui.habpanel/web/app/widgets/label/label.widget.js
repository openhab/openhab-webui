(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetLabel', widgetLabel)
        .controller('WidgetSettingsCtrl-label', WidgetSettingsCtrlLabel)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'label',
                displayName: 'Label',
                icon: 'font',
                description: 'A fixed label used for headers etc. (no openHAB item binding)'
            });
        });

    widgetLabel.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetLabel($rootScope, $modal, OHService) {
        // Usage: <widget-label ng-model="widget" />
        //
        // Creates: A label widget
        //
        var directive = {
            bindToController: true,
            controller: LabelController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/label/label.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    LabelController.$inject = ['$rootScope', '$scope', 'OHService'];
    function LabelController ($rootScope, $scope, OHService) {
        var vm = this;
        this.widget = this.ngModel;

    }


    // settings dialog
    WidgetSettingsCtrlLabel.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlLabel($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            background: widget.background,
            foreground: widget.foreground,
            font_size: widget.font_size
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

            $modalInstance.close(widget);
        };

    }


})();