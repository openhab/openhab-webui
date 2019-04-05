/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ZWaveLogViewer', [
    'ui.router',
    'ui.bootstrap',
    'angular-growl',
    'ngVis',
    'ngLocalize',
    'ResizePanel',
    'checklist-model',
    'rt.popup'
])

    .config(function config($stateProvider) {
        $stateProvider.state('tools/zwave/logreader', {
            url: '/tools/zwave/logreader',
            views: {
                "main": {
                    controller: 'ZWaveLogReaderCtrl',
                    templateUrl: 'tools/zwave/logReader.tpl.html'
                }
            },
            data: {pageTitle: 'ZWave Log Reader'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('common');
                }
            }
        });
    })

    .controller('ZWaveLogReaderCtrl',
    function ZWaveLogReaderCtrl($scope, locale, growl, VisDataSet, $interval, $timeout) {
        /**
         * Function called when a line is clicked so we can add data to the popup
         * @param selected
         */
        $scope.onPopupShown = function (selected) {
            $scope.selectedPkt = selected;
            $scope.selectedNode = $scope.nodes[selected.node];
            if ($scope.selectedNode != null) {
            }
        };

        $scope.changePanel = function (panel) {
            $scope.showOption = panel;
            $timeout(function () {
                $(window).trigger('resize');
            }, 0);

            if (panel == "NODES") {
            }
        };

        $scope.selectedNode = {};
        $scope.showOption = "LIST";
        $scope.processFilter = ['Info', 'Cmd', 'Start', 'RXPacket', 'TXPacket', 'Wakeup', 'Timeout', 'SendAbort'];
        $scope.processFilterOptions = [
            {
                ref: 'Info',
                name: 'Binding Information'
            },
            {
                ref: 'Cmd',
                name: 'Commands'
            },
            {
                ref: 'RXPacket',
                name: 'Packets Received'
            },
            {
                ref: 'TXPacket',
                name: 'Packets Sent'
            },
            {
                ref: 'Wakeup',
                name: 'Device Wakeup/Sleep'
            },
            {
                ref: 'Timeout',
                name: 'Timeouts and Retries'
            },
            {
                ref: 'SendAbort',
                name: 'Abort Messages'
            },
            {
                ref: 'NodeState',
                name: 'Node State Changes'
            },
            {
                ref: 'Heal',
                name: 'Node Heal'
            }
        ];
        $scope.nodeFilter = [];

        /**
         * Select a node in the node list
         * We do some analyses here rather than at the end of the load function.
         * @param node
         */
        $scope.selectNode = function (node) {
            if (node.computed === false) {

            }
            $scope.selectedNode = node;
        };

        /**
         * Marks all nodes as selected in the node filter
         * @param state
         */
        $scope.checkAllNodes = function (state) {
            $scope.nodeFilter = null;
            $scope.nodeFilter = [];
            if (state === false) {
                return;
            }
            for (var key in $scope.nodes) {
                $scope.nodeFilter.push(parseInt(key, 10));
            }
            $scope.nodeFilter.push(255);
        };

        $scope.fileChanged = function (element) {
            loadLog(element.files[0]);
        };

        $scope.filterFunction = function (element) {
            if ($scope.processFilter.indexOf(element.ref) === -1) {
                return false;
            }

            if (element.node === undefined) {
                return true;
            }
            return $scope.nodeFilter.indexOf(element.node) !== -1;
        };

        /**
         * Load the log - called when the user selects a file
         */
        function loadLog(file) {
            // Initialise variables for loading
            $scope.data = [];
            $scope.nodes = {};
            $scope.countLines = 0;
            $scope.countEntries = 0;
            $scope.logState = "loading";
            $scope.logName = file.name;
            $scope.selectedNode = {};
            $scope.showOption = "LIST";

            $scope.logReader.loadLogfile(file).then(function () {
                $scope.data = $scope.logReader.getData();
                $scope.countLines = $scope.logReader.getLinesProcessed();
                $scope.nodes = $scope.logReader.getNodes();
                $scope.countEntries = $scope.data.length;

                // Display all nodes to start
                $scope.checkAllNodes();

                $scope.logState = "loaded";
            });
        }

        $scope.logReader = new ZWaveLogReader();

        $scope.logName = $scope.logReader.getFileName();
        if ($scope.logName === "") {
            $scope.logState = "empty";
        }
        else {
            $scope.logState = "loaded";
        }
        $scope.data = $scope.logReader.getData();
        $scope.nodes = $scope.logReader.getNodes();
        $scope.countLines = $scope.logReader.getLinesProcessed();
        $scope.countEntries = $scope.data.length;
        $scope.checkAllNodes();
    })
;
