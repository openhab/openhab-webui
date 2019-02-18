/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('ZWaveNetwork', [
    'ui.router',
    'ui.bootstrap',
    'ngLocalize',
    'HABmin.iconModel',
    'HABmin.thingModel',
    'angular-growl',
    'ngVis',
    'ResizePanel'
])

    .config(function config($stateProvider) {
        $stateProvider.state('tools/zwave/network', {
            url: '/tools/zwave/network',
            views: {
                "main": {
                    controller: 'ZwaveNetworkCtrl',
                    templateUrl: 'tools/zwave/zwaveNetwork.tpl.html'
                }
            },
            data: {pageTitle: 'ZWave Network'},
            resolve: {
                // Make sure the localisation files are resolved before the controller runs
                localisations: function (locale) {
                    return locale.ready('zwave');
                }
            }
        });
    })

    .controller('ZwaveNetworkCtrl',
    function ZwaveNetworkCtrl($scope, locale, growl, $timeout, $window, $http, $interval, ThingModel, ImgFactory) {
        var deviceClassIcons = {
            "PC_CONTROLLER": "desktop-computer",
            "PORTABLE_REMOTE_CONTROLLER": "remote-control",
            "POWER_SWITCH_BINARY": "switch",
            "POWER_SWITCH_MULTILEVEL": "light-control",
            "ROUTING_SENSOR_BINARY": "door-open",
            "SWITCH_REMOTE_MULTILEVEL": "temperature",

            "BINARY_SWITCH": "Switch",
            "MULTILEVEL_SWITCH": "DimmableLight"
        };

        $scope.networkOptions = {
            layout: {
                hierarchical: {
                    enabled: true,
                    sortMethod: "directed",
                    direction: "UD"
                }
            },
            width: '100%',
            height: '100%',
            edges: {
                color: '#ffffff',
                width: 5
            },
            interaction: {
                dragNodes: true
            }
        };

        $scope.devices = [];

        ThingModel.getList().then(
            function (list) {
                var bridge;

                // Get all the Z-Wave devices
                angular.forEach(list, function (thing) {
                    // Check if there are properties, and if so, if this is a z-wave node
                    if (thing.properties == null) {
                        return;
                    }
                    if (thing.properties["zwave_nodeid"] == null) {
                        return;
                    }

                    // Is this our controller?
                    if (thing.bridgeUID == null) {
                        bridge = thing;
                    }

                    // Add it...
                    $scope.devices.push(thing);
                });

                if (bridge != null) {
                    createNetworkMap(bridge);
                }
            }
        );

        $scope.showPanel = function (panel) {
            if ($scope.panelDisplayed == panel) {
                $scope.panelDisplayed = "";
            }
            else {
                $scope.panelDisplayed = panel;
            }
        };

        function createNetworkMap(root) {
            // We use 'doneNodes' to keep track of what nodes we've added
            var doneNodes = [root.properties["zwave_nodeid"]];

            // First, add all the routes
            var edges = [];
            angular.forEach($scope.devices, function (device) {
                if (device.properties["zwave_neighbours"] !== undefined && doneNodes.indexOf(device.UID) == -1) {
                    doneNodes.push(device.properties["zwave_nodeid"]);
                }

                // Add all the neighbour routes
                var neighbours = [];
                if (device.properties["zwave_neighbours"] != null) {
                    neighbours = device.properties["zwave_neighbours"].split(",");
                }
                angular.forEach(neighbours, function (neighbour) {
                    // Check if the route exists and mark it as bidirectional
                    var found = false;
                    angular.forEach(edges, function (edge) {
                        if (edge.from == neighbour && edge.to == device.properties["zwave_nodeid"]) {
                            edge.color = "green";
                            edge.style = "line";
                            edge.arrows = {
                                to: {
                                    enabled: false,
                                    scaleFactor: 0.5
                                },
                                from: {
                                    enabled: false,
                                    scaleFactor: 0.5
                                }
                            };
                            edge.width = 3;

                            found = true;
                        }
                    });

                    if (found === false) {
                        var newEdge = {};
                        newEdge.from = device.properties["zwave_nodeid"];
                        newEdge.to = neighbour;
                        newEdge.color = "red";
                        newEdge.style = "arrow";
                        newEdge.arrows = {
                            to: {
                                enabled: true,
                                scaleFactor: 0.5
                            },
                            from: {
                                enabled: false,
                                scaleFactor: 0.5
                            }
                        };
                        newEdge.width = 1;
                        edges.push(newEdge);

                        // Remember this node!
                        if (doneNodes.indexOf(neighbour) == -1) {
                            doneNodes.push(neighbour);
                        }
                    }
                });
            });

            // Now, add all the nodes that have routes
            var nodes = [];
            angular.forEach($scope.devices, function (device) {
                // Only add nodes that have routes
                if (doneNodes.indexOf(device.properties["zwave_nodeid"]) == -1) {
                    return;
                }

                console.log("Processing", device.properties["zwave_nodeid"]);
                if (device.properties["zwave_neighbours"] === undefined) {
                    console.log("No neighbors for node ", device.properties["zwave_nodeid"]);
                }

                // Add the node
                var newNode = {
                    label: "",
                    title: device.label
                };
                newNode.id = device.properties["zwave_nodeid"];
//                if (device.properties["zwave_class_generic"] != null &&
//                    deviceClassIcons[device.properties["zwave_class_generic"]] != null) {
                newNode.title = "<table>" +
                "<tr>" +
                "<td>" + locale.getString("zwave.Node") + "</td><td>" + device.properties["zwave_nodeid"] +
                "</td>" +
                "</tr>" +
                "<td>" + locale.getString("zwave.ThingName") + "</td><td>" + device.label + "</td></tr>";
                if (deviceClassIcons[device.properties["zwave_class_generic"]] != null) {
                    newNode.title += "<tr><td>" + locale.getString("zwave.GenericClass") + "</td><td><span class='" +
                    ImgFactory.lookupCategory(deviceClassIcons[device.properties["zwave_class_generic"]]) +
                    "'></span> " + device.properties["zwave_class_generic"] + "</td></tr>";
                }
                "<tr><td>" + locale.getString("zwave.Neighbours") + "</td>" +
                "<td>" + device.properties["zwave_neighbours"] + "</td></tr>";
                newNode.title += "</table>";
//                }
                newNode.label += device.properties["zwave_nodeid"];
                if (root === device.properties["zwave_nodeid"]) {
                    newNode.level = 0;
                }
                else {
                    newNode.level = -1;
                }

                newNode.borderWidth = 2;    // TODO: put this in general options?
                newNode.color = {};

                if (device.properties["zwave_listening"] === "false") {
                    newNode.color.border = "rgb(204, 102, 153)";
                }
                switch (device.statusInfo.status) {
                    case "ONLINE":
                        newNode.color.background = "rgb(204, 255, 204)";
                        break;
                    case "OFFLINE":
                        newNode.color.background = "rgb(255, 51, 0)";
                        break;
                    default:
                        newNode.color.border = "grey";
                        break;
                }

                nodes.push(newNode);
            });

            // Add all the neighbors from the root
//            var rootDevice = $scope.devices[root];
//            if (rootDevice === undefined) {
//                return;
//            }

            // Check the root devices neighbors
            doneNodes = [root.properties["zwave_nodeid"]];
            var neighbours = [];
            if (root.properties["zwave_neighbours"] != null) {
                neighbours = root.properties["zwave_neighbours"].split(",");
            }
            angular.forEach(neighbours, function (neighbour) {
                setNodeLevel(neighbour, 1);
            });

            for (var level = 1; level < 5; level++) {
                checkNodeLevel(level);
            }

            // Calculate the max level, and also set the root position
            var maxLevel = 0;
            angular.forEach(nodes, function (node) {
                if (node.id == root.properties["zwave_nodeid"]) {
                    node.level = 0;
                }

                if (node.level > maxLevel) {
                    maxLevel = node.level;
                }
            });

            // Move all unconnected nodes up to the last level
            maxLevel += 1;
            angular.forEach(nodes, function (node) {
                if (node.level == -1) {
                    node.level = maxLevel;
                }
            });

            console.log("Setting network options");
            $timeout(function () {
                $scope.networkNodes = {nodes: nodes, edges: edges};
            });
            console.log("Setting network options DONE");

            function setNodeLevel(nodeId, level) {
                angular.forEach(nodes, function (node) {
                    if (node.id == nodeId) {
                        node.level = level;
                        doneNodes.push(nodeId);
                    }
                });
            }

            function checkNodeLevel(level) {
                angular.forEach(nodes, function (node) {
                    if (node.level !== level) {
                        return;
                    }

                    // Get this device
                    var device = $scope.devices[node.id];
                    if (device === undefined) {
                        return;
                    }
                    // Check this devices neighbours
                    var neighbours = [];
                    if (device.properties["zwave_neighbours"] != null) {
                        neighbours = device.properties["zwave_neighbours"].split(",");
                    }
                    angular.forEach(neighbours, function (neighbour) {
                        // Is this node already set?
                        if (doneNodes.indexOf(neighbour) != -1) {
                            return;
                        }

                        setNodeLevel(neighbour.name, level + 1);
                    });
                });
            }
        }
    })

;



