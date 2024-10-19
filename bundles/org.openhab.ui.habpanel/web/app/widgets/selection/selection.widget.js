(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetSelection', widgetSelection)
        .controller('SelectionChoicesController', SelectionChoicesController)
        .controller('WidgetSettingsCtrl-selection', WidgetSettingsCtrlSelection)
        .config(function (WidgetsProvider) {
            WidgetsProvider.$get().registerType({
                type: 'selection',
                displayName: 'Selection',
                icon: 'th',
                description: 'A widget allowing a selection between multiple choices'
            });
        });

    widgetSelection.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetSelection($rootScope, $modal, OHService) {
        // Usage: <widget-selection ng-model="widget" />
        //
        // Creates: A Selection widget
        //
        var directive = {
            bindToController: true,
            controller: SelectionController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/selection/selection.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {
            element[0].parentElement.parentElement.className += " activefeedback";
        }
    }
    SelectionController.$inject = ['$rootScope', '$scope', '$filter', '$uibModal', 'OHService'];
    function SelectionController ($rootScope, $scope, $filter, $uibModal, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            vm.item = OHService.getItem(vm.widget.item);
            if (!vm.item || vm.item.state === vm.value) return;
            vm.value = vm.item.transformedState || vm.item.state;
            vm.state = vm.item.state;

            if (!vm.choices) {
                switch (vm.widget.choices_source) {
                    case 'server':
                        vm.choices = vm.item.commandDescription.commandOptions.map(function (option) {
                            return { cmd: option.command, label: option.label };
                        });
                        break;
                    case 'csv':
                        vm.choices = vm.widget.choices.split(',').map(function (choice) {
                            choice = choice.split('=');
                            if (choice.length === 2) {
                                return { cmd: choice[0], label: choice[1] };
                            } else {
                                return { cmd: choice[0], label: choice[0] };
                            }
                        });
                        break;
                    default:
                        vm.choices = vm.widget.choices;
                }
            }

            function filterChoice(choice, i, choices) {
                if (choice.cmd === vm.state) return true;
                return false;
            }
            if ($filter('filter')(vm.choices, filterChoice, true).length > 0) {
                vm.currentChoice = $filter('filter')(vm.choices, filterChoice, true)[0];
                if (vm.currentChoice.label)
                    vm.value = vm.currentChoice.label;
            }
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

        vm.openChoices = function () {
            vm.modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'selectionChoiceWindow.html',
                controller: 'SelectionChoicesController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    choices: function () { return vm.choices; },
                    widget: function () { return vm.widget; },
                    item: function () { return vm.item; }
                }
            });
        };

        $scope.$on('$destroy', function () {
            if (vm.modalInstance) {
                vm.modalInstance.dismiss();
            }
        });


    }

    SelectionChoicesController.$inject = ['$scope', '$uibModalInstance', 'choices', 'widget', 'item', 'OHService'];
    function SelectionChoicesController($scope, $uibModalInstance, choices, widget, item, OHService) {
        var vm = this;
        vm.choices = choices;
        vm.item = item;
        vm.no_highlight = widget.no_highlight;
        vm.columns = widget.choices_columns;
        vm.mobile_mode = !widget.disable_mobile;
        vm.square = vm.columns > 1 && !widget.no_squares;

        vm.gridClassMode = (vm.mobile_mode) ? 'sm' : 'xs';
        vm.gridClass = 'col-' + vm.gridClassMode + '-' + (vm.columns == 5 ? '5ths' : (12 / vm.columns).toString());

        vm.selectChoice = function (choice) {
            OHService.sendCmd(widget.item, choice.cmd);
            if (!widget.keep_open) {
                $uibModalInstance.close(choice);
            }
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    // settings dialog
    WidgetSettingsCtrlSelection.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlSelection($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name            : widget.name,
            sizeX           : widget.sizeX,
            sizeY           : widget.sizeY,
            col             : widget.col,
            row             : widget.row,
            item            : widget.item,
            hidelabel       : widget.hidelabel,
            hideicon        : widget.hideicon,
            hidestate       : widget.hidestate,
            nolinebreak     : widget.nolinebreak,
            font_size       : widget.font_size,
            backdrop_iconset: widget.backdrop_iconset,
            backdrop_icon   : widget.backdrop_icon,
            backdrop_center : widget.backdrop_center,
            iconset         : widget.iconset,
            icon            : widget.icon,
            icon_size       : widget.icon_size,
            icon_nolinebreak: widget.icon_nolinebreak,
            disable_mobile  : widget.disable_mobile,
            no_squares      : widget.no_squares,
            choices_columns : widget.choices_columns || 3,
            choices_source  : widget.choices_source,
            choices         : widget.choices,
            keep_open       : widget.keep_open,
            no_highlight    : widget.no_highlight
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
