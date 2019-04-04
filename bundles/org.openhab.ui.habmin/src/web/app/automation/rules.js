/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.rules', [
    'ui.router',
    'ui.bootstrap',
    'ui.ace',
    'ngLocalize',
    'angular-growl',
    'angular-blockly',
    'HABmin.ruleModel',
    'HABmin.designerModel',
    'HABmin.userModel',
    'ResizePanel',
    'HABmin.restModel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('rules', {
            url: '/rules',
            views: {
                "main": {
                    controller: 'AutomationRuleCtrl',
                    templateUrl: 'automation/rules.tpl.html'
                }
            },
            data: {pageTitle: 'Rules'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function ($q, locale) {
                    return $q.all([
                        locale.ready('habmin'),
                        locale.ready('rule')
                    ]);
                }
            }
        });
    })

    .controller('AutomationRuleCtrl',
    function AutomationRuleCtrl($scope, locale, growl, RuleModel, DesignerModel, UserService, Blockly, $timeout) {
        var newDesign = [
            {
                type: 'openhab_rule',
                deletable: false,
                movable: false,
                fields: [
                    {name: "NAME", value: locale.getString('rule.NewRuleTitle')}
                ]
            }
        ];

        $scope.blockRules = [];
        $scope.codeRules = [];
        $scope.rulesTotal = -1;
        $scope.editSource = false;
        $scope.isDirty = false;
        $scope.selectedRule = null;
        $scope.aceOptions = {
            useWrapMode: true,
            showGutter: true,
            theme: 'tomorrow',
            mode: 'openhabrules',
            onLoad: function (editor) {
                $scope.aceEditor = editor;
            },
            onChange: function (e) {

            }
        };

        // Align the Ace Editor theme with the Bootstrap theme
        function setTheme(theme) {
            console.log("Set Ace theme");
            switch (UserService.getTheme()) {
                case 'slate':
                    $scope.aceOptions.theme = 'tomorrow_night_bright';
                    break;
                default:
                    $scope.aceOptions.theme = 'tomorrow';
                    break;
            }
        }

        $scope.$on('habminTheme', function (event, theme) {
            console.log("habminTheme event", theme);
            setTheme(theme);
        });

        setTheme(UserService.getTheme());

        var restoreRule = null;

        // ------------------------------------------------
        // Load model data

        // Load the list of rules
        RuleModel.getList().then(
            function (rules) {
                if (rules != null) {
                    $scope.codeRules = rules;
                }
                $scope.rulesTotal = $scope.blockRules.length + $scope.codeRules.length;
            },
            function (reason) {
                // handle failure
                growl.warning(locale.getString('rule.ErrorLoadingRuleList'));
                $scope.rulesTotal = $scope.blockRules.length + $scope.codeRules.length;
            }
        );

        // Load the list of designs
        DesignerModel.getList().then(
            function (rules) {
                if (rules != null) {
                    $scope.blockRules = rules;
                }
                $scope.rulesTotal = $scope.blockRules.length + $scope.codeRules.length;
            },
            function (reason) {
                // handle failure
                growl.warning(locale.getString('rule.ErrorLoadingRuleList'));
                $scope.rulesTotal = $scope.blockRules.length + $scope.codeRules.length;
            }
        );

        // ------------------------------------------------
        // Event Handlers

        var onChangeWrapper = null;
        $scope.$on('$destroy', function () {
            // Make sure that the callback is destroyed too
//            Blockly.offChange(onChangeWrapper);
//            onChangeWrapper = null;
        });

        function handleDirtyNotification() {
            if (onChangeWrapper == null) {
                onChangeWrapper = true;
                Blockly.onChange(function () {
                    $scope.isDirty = true;
                    $scope.$apply();
                });
            }
        }

        $scope.selectRule = function (rule) {
            $scope.editSource = false;
            $scope.selectedRule = rule;
            $scope.selectedRule = rule;

            handleDirtyNotification();

            $scope.editSource = true;
            RuleModel.getRule(rule.name).then(
                function (rule) {
                    restoreRule = rule;
                    if (rule.block === undefined || rule.block === null) {
                    }
                    $scope.codeEditor = rule.source;
                    $scope.isDirty = false;
                },
                function (reason) {
                    // handle failure
                    growl.warning(locale.getString('rule.ErrorLoadingRule', [rule.name, reason]));
                }
            );
        };

        $scope.selectBlock = function (rule) {
            $scope.editSource = false;
            $scope.selectedRule = rule;

            handleDirtyNotification();

            DesignerModel.getRule(rule.id).then(
                function (rule) {
                    restoreRule = rule;
                    if (rule.block === undefined || rule.block === null) {
                        rule.block = newDesign;
                    }
                    $scope.codeEditor = rule.source;
                    Blockly.setWorkspace({block: rule.block});
                    $scope.isDirty = false;
                },
                function (reason) {
                    // handle failure
                    growl.warning(locale.getString('rule.ErrorLoadingRule', [rule.name, reason]));
                }
            );
        };

        $scope.newRule = function () {
            handleDirtyNotification();
            $scope.codeEditor = "";
            Blockly.setWorkspace({block: newDesign});
            $scope.isDirty = false;
            $scope.selectedRule = null;
            restoreRule = {block: newDesign};
        };

        $scope.saveRule = function () {
            var rule = {};
            // Read the blocks. If it's not defined, then set to a new rule
            if (Blockly.getWorkspace() != null) {
                rule.block = Blockly.getWorkspace().block[0];
            }
            else {
                rule.block = newDesign;
            }
            if ($scope.selectedRule !== null) {
                rule.id = $scope.selectedRule.id;
            }

            rule.name = "";
            if (rule.block.type === "openhab_rule") {
                rule.name = rule.block.fields[0].value;
            }

            DesignerModel.putRule(rule).then(function (result) {
                $scope.selectedRule = result;
                $scope.isDirty = false;
            });
        };

        $scope.cancelRule = function () {
            if (restoreRule == null) {
                return;
            }
            $scope.codeEditor = restoreRule.source;
            Blockly.setWorkspace(restoreRule);
            $scope.isDirty = false;
        };

        $scope.deleteRule = function () {
            DesignerModel.deleteRule($scope.selectedRule.id).then(function () {
                Blockly.clearWorkspace();
                $scope.codeEditor = "";
                $scope.selectedRule = null;
                restoreRule = null;
                $scope.isDirty = false;
            });
        };

        $scope.showSource = function () {
            // When switching from blocks to source, compile through the server
            if ($scope.editSource === false) {
            }

            $scope.editSource = true;
        };

        $scope.showRule = function () {
            $scope.editSource = false;
        };


        // ------------------------------------------------
        // Private functions


    })

;


/*

 renameVariableCallback = function (prompt, value, callback) {
 $scope.dlg = {};
 $scope.dlg.title = prompt;
 $scope.dlg.value = value;

 var controller = function ($uibModalInstance) {
 $scope.dlg.ok = function () {
 callback($scope.dlg.value);
 $uibModalInstance.close();
 };
 $scope.dlg.cancel = function () {
 $uibModalInstance.dismiss();
 };
 };

 $modal.open({
 backdrop: 'static',
 keyboard: true,
 scope: $scope,
 modalFade: true,
 template: '<div class="modal-header">' +
 '<h3 class="modal-title">{{dlg.title}}</h3>' +
 '</div>' +
 '<div class="modal-body">' +
 '<form class="form-horizontal" role="form">' +
 '<div class="form-group">' +
 '<label for="inputOption" class="col-sm-3 control-label" i18n="rule.Value"></label>' +
 '<div class="col-sm-9">' +
 '<input type="text" class="form-control" ng-model="dlg.value">' +
 '</div>' +
 '</div>' +
 '</div>' +
 '</form>' +
 '</div>' +
 '<div class="modal-footer">' +
 '<button class="btn btn-primary" ng-click="dlg.ok()" i18n="common.save"></button>' +
 '<button class="btn btn-warning" ng-click="dlg.cancel()" i18n="common.cancel"></button>' +
 '</div>',
 controller: controller
 });
 };
 */