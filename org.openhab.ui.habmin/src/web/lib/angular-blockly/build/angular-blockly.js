/**
 * blockly directive for AngularJS
 *
 * Author: Chris Jackson
 *
 * License: MIT
 */
angular.module("angular-blockly", [])
    .provider("ngBlockly", function () {
        this.options = {
            path: "assets/",
            trashcan: true,
            toolbox: []
        };

        this.$get = function () {
            var localOptions = this.options;
            return {
                getOptions: function () {
                    return localOptions;
                }
            };
        };

        this.setOptions = function (options) {
            this.options = options;
        };
    })

    .service('Blockly', function ($timeout) {
        'use strict';
        var me = this;
        this.holdoffChanges = false;
        this.setWorkspace = function (workspace) {
            if (Blockly.getMainWorkspace() != null && Blockly.getMainWorkspace().topBlocks_.length != 0) {
                Blockly.getMainWorkspace().clear();
            }
            Blockly.Json.setWorkspace(Blockly.getMainWorkspace(), workspace);

            // Blockly sends an immediate change - we want to filter this out
            me.holdoffChanges = true;
        };

        this.clearWorkspace = function () {
            if (Blockly.getMainWorkspace() != null && Blockly.getMainWorkspace().topBlocks_.length != 0) {
                Blockly.getMainWorkspace().clear();
            }

            // Blockly sends an immediate change - we want to filter this out
            me.holdoffChanges = true;
        };

        this.getWorkspace = function () {
            return Blockly.Json.getWorkspace(Blockly.getMainWorkspace());
        };

        this.setToolbox = function (toolbox) {
            return Blockly.Json.getWorkspace(Blockly.getMainWorkspace());
        };

        this.onChange = function (callback) {
            return $(Blockly.mainWorkspace.getCanvas()).bind("blocklyWorkspaceChange", function () {
                console.log("Change");
                if (me.holdoffChanges === false) {
                    console.log("Change - notified");
                    // Send a notification
                    callback();
                }
                else {
                    me.holdoffChanges = false;
                    console.log("Change - but on hold-off");
                }
            })
        };

        this.offChange = function (wrapper) {
            $(Blockly.mainWorkspace.getCanvas()).unbind(wrapper);
        }
    })

    .directive('ngBlockly', function ($window, $timeout, $rootScope, ngBlockly) {
        return {
            restrict: 'E',
            scope: { // Isolate scope
            },
            template: '<div style="height:100%" class="ng-blockly"></div>',
            link: function ($scope, element, attrs) {
                var options = ngBlockly.getOptions();
                Blockly.inject(element.children()[0], options);
            }
        };
    });
