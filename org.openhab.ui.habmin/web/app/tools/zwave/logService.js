/**
 * HABmin - Home Automation User and Administration Interface Designed for openHAB (www.openhab.com)
 * 
 * This software is copyright of Chris Jackson under the GPL license. Note that this licence may be changed at a later
 * date.
 * 
 * (c) 2014-2016 Chris Jackson (chris@cd-jackson.com)
 */
function ZWaveLogReader() {
    // Constant definitions
    var REQUEST = "REQ";
    var RESPONSE = "RES";
    var ERROR = "danger";
    var WARNING = "warning";
    var INFO = "info";
    var SUCCESS = "";
    var fileName = "";

    // Some globals used by the processor
    var logTime = 0;
    var lastNode = 0;
    var lastCmd = {};
    var lastSendData = {};
    var lastPacketRx = null;
    var lastPacketTx = null;
    var txQueueLen = 0;

    var packetsSent = 0;
    var packetsRecv = 0;
    var timeStart;

    var countLines = 0;
    var countEntries = 0;
    var loadProgress = 0;
    var nodeInfoProcessed = false;
    var data = [];

    this.getData = function() {
        return data;
    };

    this.getLinesProcessed = function() {
        return countLines;
    };

    this.getFileName = function() {
        return fileName;
    };

    this.getNodes = function() {
        return nodes;
    };

    /**
     * Process the node information looking for errors etc
     */
    function processDeviceInformation() {
        // Calculate some overall statistics
        addNodeInfo(255, "Frames Sent", packetsSent);
        addNodeInfo(255, "Frames Received", packetsRecv);
        addNodeInfo(255, "Frame Period", Math.floor((logTime - timeStart) / (packetsRecv + packetsSent)));

        nodes.forEach(function(node) {
            if (node.responseTimeMin < 0) {
                node.responseTimeMin = 0;
            }
            if (node.responseTimeAvg < 0) {
                node.responseTimeAvg = 0;
            }
            if (node.responseTimeMax < 0) {
                node.responseTimeMax = 0;
            }
            if (node.responseTimeCnt === 0) {
                node.responseTimeMin = "-";
                node.responseTimeAvg = "-";
                node.responseTimeMax = "-";
            } else {
                node.responseTimeAvg = Math.round(node.responseTimeAvg / node.responseTimeCnt);
            }

            if (node.messagesSent == null || node.messagesSent === 0) {
                node.retryPercent = 0;
            } else {
                node.retryPercent = Math.ceil(node.responseTimeouts * 100 / node.messagesSent);
            }

            // Process any errors/warnings for battery devices
            if (node.isListening === false) {
                if (node.wakeupCnt == null || node.wakeupCnt === 0) {
                    node.warnings.push("Device appears to be battery operated, but has not woken up");
                }
                if (node.wakeupNode != null && nodes[255] != null && node.wakeupNode != nodes[255].controllerID) {
                    node.errors.push("Wakeup node is not set to the controller");
                }
                if (node.wakeupInterval != null && node.wakeupInterval === 0) {
                    node.errors.push("Wakeup interval is set to 0");
                }
            }

            if (nodes[255] != null && node.id == nodes[255].controllerID) {
                if (node.isListening === false) {
                    node.errors.push("Device is the controller, but it's not listening");
                }
            }

            if (node.neighboursList != null) {
                node.neighboursUnknown = 0;
                node.neighboursListening = 0;
                node.neighboursList.forEach(function(neighbour) {
                    if (nodes[neighbour] != null) {
                        if (nodes[neighbour].isListening == null) {
                            node.neighboursUnknown++;
                        } else if (nodes[neighbour].isListening === true) {
                            node.neighboursListening++;
                        }
                    }
                });
            }

            if (node.neighboursTotal != null) {
                if (node.neighboursTotal === 0) {
                    node.errors.push("Node has no neighbours");
                } else if (node.neighboursTotal < 4) {
                    node.warnings.push("Node only has " + node.neighboursTotal + " neighbours");
                }

                if (node.neighboursListening != node.neighboursTotal) {
                    if (node.neighboursListening === 0) {
                        node.errors.push("Node has no listening neighbours");
                    } else if (node.neighboursListening < 4) {
                        node.warnings.push("Node only has " + node.neighboursListening + " listening neighbours");
                    }
                }
            }

            if (node.responseTimeAvg > 1000) {
                node.errors.push("Average response time is very high (" + node.responseTimeAvg + "mS)");
            } else if (node.responseTimeAvg > 500) {
                node.warnings.push("Average response time is high (" + node.responseTimeAvg + "mS)");
            }

            if (node.messagesSent > 40 && node.retryPercent > 15) {
                node.errors.push("Node has a very high timeout ratio (" + node.retryPercent + "%)");
            } else if (node.messagesSent > 20 && node.retryPercent > 5) {
                node.warnings.push("Node has a high timeout ratio (" + node.retryPercent + "%)");
            }
        });

        nodeInfoProcessed = true;
    }

    var deviceClassBasic = {
        1 : {
            name : "CONTROLLER"
        },
        2 : {
            name : "STATIC_CONTROLLER"
        },
        3 : {
            name : "SLAVE"
        },
        4 : {
            name : "ROUTING_SLAVE"
        }
    };

    var deviceClass = {
        0x00 : {
            name : "NOT_KNOWN"
        },
        0x01 : {
            name : "REMOTE_CONTROLLER",
            specific : {
                1 : "PORTABLE_REMOTE_CONTROLLER",
                2 : "PORTABLE_SCENE_CONTROLLER",
                3 : "PORTABLE_INSTALLER_TOOL"
            }
        },
        0x02 : {
            name : "STATIC_CONTOLLER",
            specific : {
                1 : "PC_CONTROLLER",
                2 : "SCENE_CONTROLLER",
                3 : "INSTALLER_TOOL"
            }
        },
        0x03 : {
            name : "AV_CONTROL_POINT",
            specific : {
                4 : "SATELLITE_RECEIVER",
                17 : "SATELLITE_RECEIVER_V2",
                18 : "DOORBELL"
            }
        },
        0x06 : {
            name : "DISPLAY",
            specific : {
                1 : "SIMPLE_DISPLAY"
            }
        },
        0x07 : {
            name : "SENSOR_NOTIFICATION",
            specific : {
                1 : "NOTIFICATION_SENSOR"
            }
        },
        0x08 : {
            name : "THERMOSTAT",
            specific : {
                1 : "THERMOSTAT_HEATING",
                2 : "THERMOSTAT_GENERAL",
                3 : "SETBACK_SCHEDULE_THERMOSTAT",
                4 : "SETPOINT_THERMOSTAT",
                5 : "SETBACK_THERMOSTAT",
                6 : "THERMOSTAT_GENERAL_V2"
            }
        },
        0x09 : {
            name : "WINDOW_COVERING",
            specific : {
                1 : "SIMPLE_WINDOW_COVERING"
            }
        },
        0x0f : {
            name : "REPEATER_SLAVE",
            specific : {
                1 : "BASIC_REPEATER_SLAVE"
            }
        },
        0x10 : {
            name : "BINARY_SWITCH",
            specific : {
                1 : "POWER_SWITCH_BINARY",
                2 : "SCENE_SWITCH_BINARY_DISCONTINUED",
                3 : "SCENE_SWITCH_BINARY",
                5 : "SIREN_SWITCH_BINARY"
            },
            class : "SWITCH_BINARY"
        },
        0x11 : {
            name : "MULTILEVEL_SWITCH",
            specific : {
                1 : "POWER_SWITCH_MULTILEVEL",
                2 : "SCENE_SWITCH_MULTILEVEL_DISCONTINUED",
                3 : "MOTOR_MULTIPOSITION",
                4 : "SCENE_SWITCH_MULTILEVEL",
                5 : "MOTOR_CONTROL_CLASS_A",
                6 : "MOTOR_CONTROL_CLASS_B",
                7 : "MOTOR_CONTROL_CLASS_C"
            },
            class : "SWITCH_MULTILEVEL"
        },
        0x12 : {
            name : "REMOTE_SWITCH",
            specific : {
                1 : "SWITCH_REMOTE_BINARY",
                2 : "SWITCH_REMOTE_MULTILEVEL",
                3 : "SWITCH_REMOTE_TOGGLE_BINARY",
                4 : "SWITCH_REMOTE_TOGGLE_MULTILEVEL"
            }
        },
        0x13 : {
            name : "TOGGLE_SWITCH",
            specific : {
                1 : "SWITCH_TOGGLE_BINARY",
                2 : "SWITCH_TOGGLE_MULTILEVEL"
            }
        },
        0x14 : {
            name : "Z_IP_GATEWAY"
        },
        0x15 : {
            name : "Z_IP_NODE"
        },
        0x16 : {
            name : "VENTILATION",
            specific : {
                1 : "RESIDENTIAL_HEAT_RECOVERY_VENTILATION"
            }
        },
        0x18 : {
            name : "REMOTE_SWITCH_2",
            specific : {
                1 : "SWITCH_REMOTE2_MULTILEVEL"
            },
            class : "SWITCH_MULTILEVEL"
        },
        0x20 : {
            name : "BINARY_SENSOR",
            specific : {
                1 : "ROUTING_SENSOR_BINARY"
            },
            class : "SENSOR_BINARY"
        },
        0x21 : {
            name : "MULTILEVEL_SENSOR",
            specific : {
                1 : "ROUTING_SENSOR_MULTILEVEL"
            },
            class : "SENSOR_MULTILEVEL"
        },
        0x22 : {
            name : "WATER_CONTROL"
        },
        0x30 : {
            name : "PULSE_METER",
            class : "METER_PULSE"
        },
        0x31 : {
            name : "METER",
            specific : {
                1 : "SIMPLE_METER"
            },
            class : "METER"
        },
        0x40 : {
            name : "ENTRY_CONTROL",
            specific : {
                1 : "DOOR_LOCK",
                2 : "ADVANCED_DOOR_LOCK",
                3 : "SECURE_KEYPAD_DOOR_LOCK"
            },
            class : "LOCK"
        },
        0x50 : {
            name : "SEMI_INTEROPERABLE"
        },
        0xa1 : {
            name : "ALARM_SENSOR",
            specific : {
                1 : "ALARM_SENSOR_ROUTING_BASIC",
                2 : "ALARM_SENSOR_ROUTING",
                3 : "ALARM_SENSOR_ZENSOR_BASIC",
                4 : "ALARM_SENSOR_ZENSOR",
                5 : "ALARM_SENSOR_ZENSOR_ADVANCED",
                6 : "SMOKE_SENSOR_ROUTING_BASIC",
                7 : "SMOKE_SENSOR_ROUTING",
                8 : "SMOKE_SENSOR_ZENSOR_BASIC",
                9 : "SMOKE_SENSOR_ZENSOR",
                10 : "SMOKE_SENSOR_ZENSOR_ADVANCED"
            },
            class : "BASIC"
        },
        0xff : {
            name : "NON_INTEROPERABLE"
        }
    };

    function getDeviceClass(basic, generic, specific) {
        var devClass;
        if (deviceClassBasic[basic] != null) {
            devClass = "<span class='label'>" + deviceClassBasic[basic].name + "</span>";
        } else {
            devClass = "<span class='label'>" + basic + "</span>";
        }
        if (deviceClass[generic] != null) {
            if (deviceClass[generic].specific != null && deviceClass[generic].specific[specific] != null) {
                devClass += " <span class='label'>" + deviceClass[generic].specific[specific] + "</span>";
            } else {
                devClass += " <span class='label'>" + deviceClass[generic].name + "</span>";
                devClass += " <span class='label'>" + specific + "</span>";
            }
        } else {
            devClass += " <span class='label'>" + generic + "</span>";
            devClass += " <span class='label'>" + specific + "</span>";
        }
        return devClass;
    }

    function getDeviceCommand(generic) {
        if (deviceClass[generic] != null) {
            return deviceClass[generic].class;
        }

        return null;
    }

    // Packet type definitions
    var packetTypes = {
        2 : {
            name : "SerialApiGetInitData",
            processor : processInitData
        },
        4 : {
            name : "ApplicationCommandHandler",
            processor : processApplicationCommand
        },
        5 : {
            name : "GetControllerCapabilities",
            processor : null
        },
        6 : {
            name : "SerialApiSetTimeouts",
            processor : processSerialApiTimeouts
        },
        7 : {
            name : "SerialApiGetCapabilities",
            processor : processControllerInfo
        },
        8 : {
            name : "SerialApiSoftReset",
            processor : null
        },
        19 : {
            name : "SendData",
            processor : processSendData
        },
        21 : {
            name : "GetVersion",
            processor : processGetVersion
        },
        22 : {
            name : "SendDataAbort",
            status : WARNING
        },
        32 : {
            name : "MemoryGetId",
            processor : processMemoryGetId
        },
        64 : {
            name : "SetLearnNodeState",
            processor : null
        },
        65 : {
            name : "IdentifyNode",
            processor : processIdentifyNode
        },
        66 : {
            name : "SetDefault",
            processor : null
        },
        70 : {
            name : "AssignReturnRoute",
            processor : processAssignReturnRoute
        },
        71 : {
            name : "DeleteReturnRoute",
            processor : processDeleteReturnRoute
        },
        72 : {
            name : "RequestNodeNeighborUpdate",
            processor : processNodeNeighborUpdate
        },
        73 : {
            name : "ApplicationUpdate",
            processor : processAppUpdate
        },
        74 : {
            name : "AddNodeToNetwork",
            processor : processAddNode
        },
        75 : {
            name : "RemoveNodeFromNetwork",
            processor : processRemoveNode
        },
        80 : {
            name : "SetLearnMode",
            processor : null
        },
        81 : {
            name : "AssignSucReturnRoute",
            processor : null
        },
        82 : {
            name : "EnableSuc",
            processor : null
        },
        84 : {
            name : "SetSucNodeID",
            processor : null
        },
        85 : {
            name : "DeleteSUCReturnRoute",
            processor : null
        },
        86 : {
            name : "GetSucNodeId",
            processor : processSucNodeId
        },
        87 : {
            name : "SendSucId",
            processor : null
        },
        96 : {
            name : "RequestNodeInfo",
            processor : processRequestNodeInfo
        },
        97 : {
            name : "RemoveFailedNodeID",
            processor : null
        },
        98 : {
            name : "IsFailedNodeID",
            processor : processFailedNode
        },
        128 : {
            name : "GetRoutingInfo",
            processor : processRoutingInfo
        }
    };

    // Command class definitions
    var commandClasses = {
        0 : {
            name : "NO_OPERATION",
            commands : {
                1 : {
                    name : "NO_OPERATION_PING"
                }
            }
        },
        32 : {
            name : "BASIC",
            commands : {
                1 : {
                    name : "BASIC_SET"
                },
                2 : {
                    name : "BASIC_GET"
                },
                3 : {
                    name : "BASIC_REPORT"
                }
            }
        },
        34 : {
            name : "APPLICATION_STATUS",
            processor : null
        },
        37 : {
            name : "SWITCH_BINARY",
            commands : {
                1 : {
                    name : "SWITCH_BINARY_SET"
                },
                2 : {
                    name : "SWITCH_BINARY_GET"
                },
                3 : {
                    name : "SWITCH_BINARY_REPORT"
                }
            },
            processor : processSwitchBinary
        },
        38 : {
            name : "SWITCH_MULTILEVEL",
            commands : {
                1 : {
                    name : "SWITCH_MULTILEVEL_SET"
                },
                2 : {
                    name : "SWITCH_MULTILEVEL_GET"
                },
                3 : {
                    name : "SWITCH_MULTILEVEL_REPORT"
                },
                4 : {
                    name : "SWITCH_MULTILEVEL_START_LEVEL_CHANGE"
                },
                5 : {
                    name : "SWITCH_MULTILEVEL_STOP_LEVEL_CHANGE"
                },
                6 : {
                    name : "SWITCH_MULTILEVEL_SUPPORTED_GET"
                },
                7 : {
                    name : "SWITCH_MULTILEVEL_SUPPORTED_REPORT"
                }
            }
        },
        39 : {
            name : "SWITCH_ALL",
            processor : null,
            commands : {
                1 : {
                    name : "SWITCH_ALL_SET"
                },
                2 : {
                    name : "SWITCH_ALL_GET"
                },
                3 : {
                    name : "SWITCH_ALL_REPORT"
                },
                4 : {
                    name : "SWITCH_ALL_ON"
                },
                5 : {
                    name : "SWITCH_ALL_OFF"
                }
            }
        },
        40 : {
            name : "SWITCH_TOGGLE_BINARY",
            commands : {
                1 : {
                    name : "SWITCH_TOGGLE_BINARY_SET"
                },
                2 : {
                    name : "SWITCH_TOGGLE_BINARY_GET"
                },
                3 : {
                    name : "SWITCH_TOGGLE_BINARY_REPORT"
                }
            }
        },
        43 : {
            name : "SCENE_ACTIVATION",
            processor : null
        },
        44 : {
            name : "SCENE_ACTUATOR_CONF",
            processor : null
        },
        45 : {
            name : "SCENE_CONTROLLER_CONF",
            processor : null
        },
        48 : {
            name : "SENSOR_BINARY",
            commands : {
                2 : {
                    name : "SENSOR_BINARY_GET"
                },
                3 : {
                    name : "SENSOR_BINARY_REPORT"
                }
            },
            processor : processSensorBinary
        },
        49 : {
            name : "SENSOR_MULTILEVEL",
            commands : {
                1 : {
                    name : "SENSOR_MULTI_LEVEL_SUPPORTED_GET"
                },
                2 : {
                    name : "SENSOR_MULTI_LEVEL_SUPPORTED_REPORT"
                },
                4 : {
                    name : "SENSOR_MULTI_LEVEL_GET"
                },
                5 : {
                    name : "SENSOR_MULTI_LEVEL_REPORT"
                }
            },
            processor : processMultilevelSensor
        },
        50 : {
            name : "METER",
            commands : {
                1 : {
                    name : "METER_GET"
                },
                2 : {
                    name : "METER_REPORT"
                },
                3 : {
                    name : "METER_SUPPORTED_GET"
                },
                4 : {
                    name : "METER_SUPPORTED_REPORT"
                },
                5 : {
                    name : "METER_RESET"
                }
            },
            processor : processMeter
        },
        51 : {
            name : "COMMAND_CLASS_SWITCH_COLOR",
            commands : {
                1 : {
                    name : "SWITCH_COLOR_SUPPORTED_GET"
                },
                2 : {
                    name : "SWITCH_COLOR_SUPPORTED_REPORT"
                },
                3 : {
                    name : "SWITCH_COLOR_GET"
                },
                4 : {
                    name : "SWITCH_COLOR_REPORT"
                },
                5 : {
                    name : "SWITCH_COLOR_SET"
                },
                6 : {
                    name : "SWITCH_COLOR_START_LEVEL_CHANGE"
                },
                7 : {
                    name : "SWITCH_COLOR_STOP_LEVEL_CHANGE"
                }
            },
            processor : processColorSwitch
        },
        61 : {
            name : "METER_TBL",
            commands : {
                1 : {
                    name : "METER_TBL_TABLE_ID_GET"
                },
                2 : {
                    name : "METER_TBL_TABLE_ID_REPORT"
                },
                3 : {
                    name : "METER_TBL_TABLE_CAPABILITY_GET"
                },
                4 : {
                    name : "METER_TBL_REPORT"
                },
                5 : {
                    name : "METER_TBL_CURRENT_DATA_GET"
                },
                6 : {
                    name : "METER_TBL_CURRENT_DATA_REPORT"
                }
            }
        },
        64 : {
            name : "THERMOSTAT_MODE",
            processor : null,
            commands : {
                1 : {
                    name : "THERMOSTAT_MODE_SET"
                },
                2 : {
                    name : "THERMOSTAT_MODE_GET"
                },
                3 : {
                    name : "THERMOSTAT_MODE_REPORT"
                },
                4 : {
                    name : "THERMOSTAT_MODE_SUPPORTED_GET"
                },
                5 : {
                    name : "THERMOSTAT_MODE_SUPPORTED_REPORT"
                }
            }
        },
        66 : {
            name : "THERMOSTAT_OPERATING_STATE",
            processor : null,
            commands : {
                2 : {
                    name : "THERMOSTAT_OPERATING_STATE_GET"
                },
                3 : {
                    name : "THERMOSTAT_OPERATING_STATE_REPORT"
                }
            }
        },
        67 : {
            name : "THERMOSTAT_SETPOINT",
            processor : null,
            commands : {
                1 : {
                    name : "THERMOSTAT_SETPOINT_SET"
                },
                2 : {
                    name : "THERMOSTAT_SETPOINT_GET"
                },
                3 : {
                    name : "THERMOSTAT_SETPOINT_REPORT"
                },
                4 : {
                    name : "THERMOSTAT_SETPOINT_SUPPORTED_GET"
                },
                5 : {
                    name : "THERMOSTAT_SETPOINT_SUPPORTED_REPORT"
                }
            }
        },
        68 : {
            name : "THERMOSTAT_FAN_MODE",
            commands : {
                1 : {
                    name : "THERMOSTAT_FAN_MODE_SET"
                },
                2 : {
                    name : "THERMOSTAT_FAN_MODE_GET"
                },
                3 : {
                    name : "THERMOSTAT_FAN_MODE_REPORT"
                },
                4 : {
                    name : "THERMOSTAT_FAN_MODE_SUPPORTED_GET"
                },
                5 : {
                    name : "THERMOSTAT_FAN_MODE_SUPPORTED_REPORT"
                }
            }
        },
        69 : {
            name : "THERMOSTAT_FAN_STATE",
            commands : {
                2 : {
                    name : "THERMOSTAT_FAN_STATE_GET"
                },
                3 : {
                    name : "THERMOSTAT_FAN_STATE_REPORT"
                }
            }
        },
        70 : {
            name : "CLIMATE_CONTROL_SCHEDULE",
            processor : null
        },
        76 : {
            name : "DOOR_LOCK_LOGGING"
        },
        82 : {
            name : "COMMAND_CLASS_NETWORK_MANAGEMENT_PROXY",
            commands : {
                1 : {
                    name : "NODE_LIST_GET"
                },
                2 : {
                    name : "NODE_LIST_REPORT"
                },
                3 : {
                    name : "NODE_INFO_CACHED_GET"
                },
                4 : {
                    name : "NODE_INFO_CACHED_REPORT"
                }
            }
        },
        83 : {
            name : "SCHEDULE"
        },
        86 : {
            name : "CRC_16_ENCAP"
        },
        89 : {
            name : "ASSOCIATION_GROUP_INFO",
            commands : {
                1 : {
                    name : "ASSOCIATION_GROUP_INFO_NAME_GET"
                },
                2 : {
                    name : "ASSOCIATION_GROUP_INFO_NAME_REPORT"
                },
                3 : {
                    name : "ASSOCIATION_GROUP_INFO_GET"
                },
                4 : {
                    name : "ASSOCIATION_GROUP_INFO_REPORT"
                },
                5 : {
                    name : "ASSOCIATION_GROUP_INFO_COMMAND_GET"
                },
                6 : {
                    name : "ASSOCIATION_GROUP_INFO_COMMAND_REPORT"
                }
            },
            processor : processAssociationInfo
        },
        90 : {
            name : "DEVICE_RESET_LOCALLY"
        },
        91 : {
            name : "CENTRAL_SCENE",
            commands : {
                1 : {
                    name : "CENTRAL_SCENE_SUPPORTED_GET"
                },
                2 : {
                    name : "CENTRAL_SCENE_SUPPORTED_REPORT"
                },
                3 : {
                    name : "CENTRAL_SCENE_NOTIFICATION"
                }
            },
            processor : processCentralScene
        },
        94 : {
            name : "ZWAVE_PLUS_INFO",
            commands : {
                1 : {
                    name : "ZWAVE_PLUS_INFO_GET"
                },
                2 : {
                    name : "ZWAVE_PLUS_INFO_REPORT"
                }
            }
        },
        96 : {
            name : "MULTI_INSTANCE",
            commands : {
                4 : {
                    name : "MULTI_INSTANCE_GET"
                },
                5 : {
                    name : "MULTI_INSTANCE_REPORT"
                },
                6 : {
                    name : "MULTI_INSTANCE_CMD_ENCAP",
                    processor : processMultiChannelEncapV1
                },
                7 : {
                    name : "MULTI_CHANNEL_END_POINT_GET"
                },
                8 : {
                    name : "MULTI_CHANNEL_END_POINT_REPORT",
                    processor : processMultiChannelReport
                },
                9 : {
                    name : "MULTI_CHANNEL_CAPABILITY_GET"
                },
                10 : {
                    name : "MULTI_CHANNEL_CAPABILITY_REPORT",
                    processor : processMultiChannelReport
                },
                11 : {
                    name : "MULTI_CHANNEL_END_POINT_FIND"
                },
                12 : {
                    name : "MULTI_CHANNEL_END_POINT_FIND_REPORT"
                },
                13 : {
                    name : "MULTI_CHANNEL_CMD_ENCAP",
                    processor : processMultiChannelEncapV2
                }
            }
        },
        98 : {
            name : "DOOR_LOCK",
            processor : null,
            commands : {
                1 : {
                    name : "DOOR_LOCK_SET"
                },
                2 : {
                    name : "DOOR_LOCK_GET"
                },
                3 : {
                    name : "DOOR_LOCK_REPORT"
                },
                4 : {
                    name : "DOOR_LOCK_CONFIG_SET"
                },
                5 : {
                    name : "DOOR_LOCK_CONFIG_GET"
                },
                6 : {
                    name : "DOOR_LOCK_CONFIG_REPORT"
                }
            }
        },
        99 : {
            name : "USER_CODE",
            commands : {
                1 : {
                    name : "USER_CODE_SET"
                },
                2 : {
                    name : "USER_CODE_GET"
                },
                3 : {
                    name : "USER_CODE_REPORT"
                },
                4 : {
                    name : "USER_CODE_NUMBER_GET"
                },
                5 : {
                    name : "USER_CODE_NUMBER_REPORT"
                }
            }
        },
        102 : {
            name : "BARRIER_OPERATOR",
            commands : {
                1 : {
                    name : "BARRIER_OPERATOR_SET"
                },
                2 : {
                    name : "BARRIER_OPERATOR_GET"
                },
                3 : {
                    name : "BARRIER_OPERATOR_REPORT"
                },
                4 : {
                    name : "BARRIER_OPERATOR_SIGNAL_SUPPORTED_GET"
                },
                5 : {
                    name : "BARRIER_OPERATOR_SIGNAL_SUPPORTED_REPORT"
                },
                6 : {
                    name : "BARRIER_OPERATOR_SIGNAL_SET"
                },
                7 : {
                    name : "BARRIER_OPERATOR_SIGNAL_GET"
                },
                8 : {
                    name : "BARRIER_OPERATOR_SIGNAL_REPORT"
                }
            },
            processor : processBarrier
        },
        112 : {
            name : "CONFIGURATION",
            commands : {
                4 : {
                    name : "CONFIGURATION_SET"
                },
                5 : {
                    name : "CONFIGURATION_GET"
                },
                6 : {
                    name : "CONFIGURATION_REPORT"
                }
            },
            processor : processConfiguration
        },
        113 : {
            name : "ALARM",
            processor : null,
            commands : {
                1 : {
                    name : "ALARM_EVENTSUPPORTED_GET"
                },
                2 : {
                    name : "ALARM_EVENTSUPPORTED_REPORT"
                },
                4 : {
                    name : "ALARM_GET"
                },
                5 : {
                    name : "ALARM_REPORT"
                },
                7 : {
                    name : "ALARM_SUPPORTED_GET"
                },
                8 : {
                    name : "ALARM_SUPPORTED_REPORT"
                }
            },
            processor : processAlarm
        },
        114 : {
            name : "MANUFACTURER_SPECIFIC",
            commands : {
                4 : {
                    name : "MANUFACTURER_SPECIFIC_GET"
                },
                5 : {
                    name : "MANUFACTURER_SPECIFIC_REPORT",
                    processor : processManufacturer
                },
                6 : {
                    name : "MANUFACTURER_SPECIFIC_DEVICE_GET"
                },
                7 : {
                    name : "MANUFACTURER_SPECIFIC_DEVICE_REPORT"
                }
            }
        },
        115 : {
            name : "POWERLEVEL",
            commands : {
                1 : {
                    name : "POWERLEVEL_SET"
                },
                2 : {
                    name : "POWERLEVEL_GET"
                },
                3 : {
                    name : "POWERLEVEL_REPORT"
                },
                4 : {
                    name : "POWERLEVEL_TEST_SET"
                },
                5 : {
                    name : "POWERLEVEL_TEST_GET"
                },
                6 : {
                    name : "POWERLEVEL_TEST_REPORT"
                }
            }
        },
        117 : {
            name : "PROTECTION",
            commands : {
                1 : {
                    name : "PROTECTION_SET"
                },
                2 : {
                    name : "PROTECTION_GET"
                },
                3 : {
                    name : "PROTECTION_REPORT"
                },
                4 : {
                    name : "PROTECTION_SUPPORTED_GET"
                },
                5 : {
                    name : "PROTECTION_SUPPORTED_REPORT"
                },
                6 : {
                    name : "PROTECTION_EXCLUSIVECONTROL_SET"
                },
                7 : {
                    name : "PROTECTION_EXCLUSIVECONTROL_GET"
                },
                8 : {
                    name : "PROTECTION_EXCLUSIVECONTROL_REPORT"
                },
                9 : {
                    name : "PROTECTION_TIMEOUT_SET"
                },
                10 : {
                    name : "PROTECTION_TIMEOUT_GET"
                },
                11 : {
                    name : "PROTECTION_TIMEOUT_REPORT"
                }
            }
        },
        118 : {
            name : "LOCK",
            commands : {}
        },
        119 : {
            name : "NODE_NAMING",
            commands : {
                1 : {
                    name : "NODE_NAMING_NAME_SET"
                },
                2 : {
                    name : "NODE_NAMING_NAME_GET"
                },
                3 : {
                    name : "NODE_NAMING_NAME_REPORT"
                },
                4 : {
                    name : "NODE_NAMING_LOCATION_SET"
                },
                5 : {
                    name : "NODE_NAMING_LOCATION_GET"
                },
                6 : {
                    name : "NODE_NAMING_LOCATION_REPORT"
                }
            }
        },
        122 : {
            name : "FIRMWARE_UPDATE_MD"
        },
        128 : {
            name : "BATTERY",
            commands : {
                2 : {
                    name : "BATTERY_GET"
                },
                3 : {
                    name : "BATTERY_REPORT"
                }
            },
            processor : processBattery
        },
        129 : {
            name : "CLOCK",
            commands : {
                4 : {
                    name : "CLOCK_SET"
                },
                5 : {
                    name : "CLOCK_GET"
                },
                6 : {
                    name : "CLOCK_REPORT"
                }
            },
            processor : processClock
        },
        130 : {
            name : "HAIL",
            processor : null,
            commands : {
                1 : {
                    name : "HAIL"
                }
            }
        },
        132 : {
            name : "WAKE_UP",
            commands : {
                4 : {
                    name : "WAKE_UP_INTERVAL_SET"
                },
                5 : {
                    name : "WAKE_UP_INTERVAL_GET"
                },
                6 : {
                    name : "WAKE_UP_INTERVAL_REPORT"
                },
                7 : {
                    name : "WAKE_UP_NOTIFICATION"
                },
                8 : {
                    name : "WAKE_UP_NO_MORE_INFORMATION"
                },
                9 : {
                    name : "WAKE_UP_INTERVAL_CAPABILITIES_GET"
                },
                10 : {
                    name : "WAKE_UP_INTERVAL_CAPABILITIES_REPORT"
                }
            },
            processor : processWakeup
        },
        133 : {
            name : "COMMAND_CLASS_ASSOCIATION",
            commands : {
                1 : {
                    name : "ASSOCIATION_SET"
                },
                2 : {
                    name : "ASSOCIATION_GET"
                },
                3 : {
                    name : "ASSOCIATION_REPORT"
                },
                4 : {
                    name : "ASSOCIATION_REMOVE"
                },
                5 : {
                    name : "ASSOCIATION_GROUPINGS_GET"
                },
                6 : {
                    name : "ASSOCIATION_GROUPINGS_REPORT"
                },
                11 : {
                    name : "ASSOCIATION_SPECIFIC_GROUP_GET"
                },
                12 : {
                    name : "ASSOCIATION_SPECIFIC_GROUP_REPORT"
                }
            },
            processor : processAssociation
        },
        134 : {
            name : "VERSION",
            commands : {
                17 : {
                    name : "VERSION_GET"
                },
                18 : {
                    name : "VERSION_REPORT"
                },
                19 : {
                    name : "VERSION_COMMAND_CLASS_GET"
                },
                20 : {
                    name : "VERSION_COMMAND_CLASS_REPORT"
                }
            },
            processor : processVersion
        },
        135 : {
            name : "INDICATOR",
            processor : null,
            commands : {
                1 : {
                    name : "INDICATOR_SET"
                },
                2 : {
                    name : "INDICATOR_GET"
                },
                3 : {
                    name : "INDICATOR_REPORT"
                }
            }
        },
        138 : {
            name : "TIME"
        },
        139 : {
            name : "TIME_PARAMETERS",
            commands : {
                1 : {
                    name : "TIME_PARAMETERS_SET"
                },
                2 : {
                    name : "TIME_PARAMETERS_GET"
                },
                3 : {
                    name : "TIME_PARAMETERS_REPORT"
                }
            },
            processor : processTimeParameters
        },
        142 : {
            name : "MULTI_INSTANCE_ASSOCIATION",
            commands : {
                1 : {
                    name : "MULTI_INSTANCE_ASSOCIATION_SET"
                },
                2 : {
                    name : "MULTI_INSTANCE_ASSOCIATION_GET"
                },
                3 : {
                    name : "MULTI_INSTANCE_ASSOCIATION_REPORT"
                },
                4 : {
                    name : "MULTI_INSTANCE_ASSOCIATION_REMOVE"
                },
                5 : {
                    name : "MULTI_INSTANCE_ASSOCIATION_GROUPINGS_GET"
                },
                6 : {
                    name : "MULTI_INSTANCE_ASSOCIATION_GROUPINGS_REPORT"
                }
            },
            processor : processMultiAssociation
        },
        143 : {
            name : "MULTI_CMD",
            commands : {
                1 : {
                    name : "MULTI_CMD_ENCAP"
                }
            }
        },
        144 : {
            name : "ENERGY_PRODUCTION"
        },
        145 : {
            name : "MANUFACTURER_PROPRIETARY"
        },
        152 : {
            name : "SECURITY",
            commands : {
                2 : {
                    name : "SECURITY_SUPPORTED_GET"
                },
                3 : {
                    name : "SECURITY_SUPPORTED_REPORT"
                },
                4 : {
                    name : "SECURITY_SCHEME_GET"
                },
                5 : {
                    name : "SECURITY_SCHEME_REPORT"
                },
                6 : {
                    name : "SECURITY_KEY_SET"
                },
                7 : {
                    name : "SECURITY_KEY_VERIFY"
                },
                8 : {
                    name : "SECURITY_SCHEME_INHERIT"
                },
                64 : {
                    name : "SECURITY_NONCE_GET"
                },
                128 : {
                    name : "SECURITY_NONCE_REPORT"
                },
                129 : {
                    name : "SECURITY_ENCAP"
                },
                193 : {
                    name : "SECURITY_ENCAP_NONCE_GET"
                }
            },
            processor : processSecurity
        },
        156 : {
            name : "SENSOR_ALARM",
            commands : {
                1 : {
                    name : "SENSOR_ALARM_GET"
                },
                2 : {
                    name : "SENSOR_ALARM_REPORT"
                },
                3 : {
                    name : "SENSOR_ALARM_SUPPORTED_GET"
                },
                4 : {
                    name : "SENSOR_ALARM_SUPPORTED_REPORT"
                }
            },
            processor : processAlarmSensor
        }
    };

    // Definition of strings to search for in the log
    var processList = [ {
        string : "Z-Wave binding",
        ref : "Info",
        status : INFO,
        processor : processBindingStart
    }, {
        string : "Starting Z-Wave receive thread",
        ref : "Info",
        content : "Receive thread started",
        status : INFO
    }, {
        string : "Deserializing from file",
        ref : "Info",
        content : "Restoring node from file",
        processor : processDeserialiser
    }, {
        string : "internalReceiveCommand",
        ref : "Cmd",
        processor : processCommand
    }, {
        string : " Command received ",
        ref : "CMD",
        processor : processCommand
    }, {
        string : " Updating channel state ",
        ref : "STATE",
        processor : processState

    }, {
        string : "Receive Message = ",
        ref : "RXPacket",
        processor : processPacketRX
    }, {
        string : "Sending REQUEST Message = ",
        ref : "TXPacket",
        processor : processPacketTX
    }, {
        string : "Sending ABORT Message = ",
        ref : "SendAbort",
        content : "Sending data abort",
        status : WARNING
    }, {
        string : "Response processed after ",
        ref : "PktStat",
        processor : processResponseTime
    }, {
        string : "Update config, ",
        ref : "Config",
        processor : processConfig
    }, {
        string : "Node advancer - advancing to ",
        ref : "NodeState",
        processor : processStage
    }, {
        string : "Stage set to",
        ref : "NodeState",
        processor : processAlive
    // TODO: Rationalise this!
    }, {
        string : "Is awake with",
        ref : "Wakeup",
        content : "Node is <span class='label label-success'>AWAKE</span>",
        status : INFO
    }, {
        string : "Went to sleep",
        ref : "Wakeup",
        content : "Node is <span class='label label-important'>ASLEEP</span>",
        status : INFO
    }, {
        string : "Timeout while sending message. Requeueing",
        ref : "Timeout",
        processor : processRetry
    }, {
        string : "Retry count exceeded",
        ref : "Timeout",
        processor : processTimeout
    }, {
        string : "transaction complete!",
        processor : processTransactionComplete
    }, {
        string : "NETWORK HEAL - ",
        ref : "Heal",
        processor : processHealState
    }, {
        string : "Took message from queue for sending",
        processor : processTxQueueLength
    }, {
        string : "(CAN)",
        error : "Message cancelled by controller",
        processor : processTxMessageError,
        status : ERROR
    }, {
        string : "(NAK)",
        error : "Message rejected by controller",
        processor : processTxMessageError,
        status : ERROR
    }, {
        string : "Message is not valid, discarding",
        error : "Message is invalid",
        processor : processTxMessageError,
        status : ERROR
    }, {
        string : "SECURITY_INC",
        processor : processSecureInclusion,
        ref : "Security"
    }, {
        string : "SECURITY_ERR",
        processor : processSecureError,
        ref : "Security"
    }, {
        string : "SECURITY_TXD",
        processor : processSecureDataTx,
        ref : "Security"
    }, {
        string : "SECURITY_RXD",
        processor : processSecureDataRx,
        ref : "Security"
    } ];

    function getCommandClassName(cmdCls, cmdCmd) {
        var name = "";
        if (commandClasses[cmdCls].commands[cmdCmd] == null) {
            name = commandClasses[cmdCls].name + "[" + cmdCmd + "]";
        } else {
            name = commandClasses[cmdCls].commands[cmdCmd].name;
        }
        return "<span class='badge badge-success'>" + name + "</span>";
    }

    // Array of node information
    var nodes = {};

    // Binding configuration parameters
    var config = {};

    function createNode(id) {
        if (nodes[id] == null) {
            nodes[id] = {
                id : id,
                warnings : [],
                errors : [],
                computed : false,
                responseTime : [],
                responseTimeouts : 0,
                items : [],
                classes : {},
                control : {},
                endpoints : {},
                responseTimeMin : 9999,
                responseTimeAvg : 0,
                responseTimeMax : 0,
                responseTimeCnt : 0,
                txErrorCan : 0,
                txErrorNak : 0,
                neighboursTotal : 0,
                neighboursListening : 0,
                neighboursUnknown : 0,
                messagesSent : 0,
                responseTimeouts : 0
            };
            for (var cnt = 0; cnt < 100; cnt++) {
                nodes[id].responseTime[cnt] = 0;
            }
        }
    }

    function addNodeInfo(id, type, value) {
        if (id === 0) {
            console.log("Trying to save data for node 0", type, value);
            return;
        }
        createNode(id);
        nodes[id][type] = value;
    }

    function addNodeEndpointInfo(id, endpoint, type, value) {
        if (id === 0) {
            console.log("Trying to save data for node 0", type, value);
            return;
        }
        createNode(id);
        if (nodes[id].endpoints[endpoint] == null) {
            nodes[id].endpoints[endpoint] = {};
        }
        nodes[id].endpoints[endpoint][type] = value;
    }

    function incNodeInfo(id, type) {
        if (id === 0) {
            console.log("Trying to save data for node 0", type, value);
            return;
        }
        createNode(id);
        if (nodes[id][type] == null) {
            nodes[id][type] = 1;
        } else {
            nodes[id][type]++;
        }
    }

    function addNodeWarning(id, msg) {
        createNode(id);
        nodes[id].warnings.push(msg);
    }

    function addNodeError(id, msg) {
        createNode(id);
        nodes[id].errors.push(msg);
    }

    function addNodeItem(id, endpoint, name, cmd, item) {
        createNode(id);
        var msg = name + " = " + id + ":";
        if (endpoint !== 0) {
            msg += endpoint + ":";
        }
        if (cmd !== "") {
            msg += "command=" + cmd;
        }
        if (item != null) {
            msg += "," + item;
        }
        // Check if the item exists
        if (nodes[id].items.indexOf(msg) != -1) {
            return;
        }
        nodes[id].items.push(msg);
    }

    function getNodeInfo(id, type) {
        if (nodes[id] == null) {
            return null;
        }
        return nodes[id][type];
    }

    function updateNodeResponse(id, time) {
        createNode(id);
        if (time == -1) {
            // Timeout
            nodes[id].responseTimeouts++;
        } else {
            nodes[id].responseTime[Math.floor(time / 50)]++;
        }

        if (time < nodes[id].responseTimeMin) {
            nodes[id].responseTimeMin = time;
        }
        if (time > nodes[id].responseTimeMax) {
            nodes[id].responseTimeMax = time;
        }

        nodes[id].responseTimeAvg += time;
        nodes[id].responseTimeCnt++;
    }

    function HEX2DEC(number) {
        // Return error if number is not hexadecimal or contains more than ten characters (10 digits)
        if (!/^[0-9A-Fa-f]{1,10}$/.test(number)) {
            return '#NUM!';
        }

        // Convert hexadecimal number to decimal
        var decimal = parseInt(number, 16);

        // Return decimal number
        return (decimal >= 549755813888) ? decimal - 1099511627776 : decimal;
    }

    function setStatus(cfg, status) {
        if (cfg.result == ERROR) {
            return;
        }
        if (status == ERROR) {
            cfg.result = ERROR;
            return;
        }

        if (cfg.result == WARNING) {
            return;
        }
        if (status == WARNING) {
            cfg.result = WARNING;
            return;
        }

        if (cfg.result == INFO) {
            return;
        }
        if (status == INFO) {
            cfg.result = INFO;
            return;
        }

        cfg.result = SUCCESS;
    }

    function processTransactionComplete(node, process, message) {
        if (lastPacketRx != null) {
            lastPacketRx.successFlag = true;
            lastPacketRx = null;
        }
    }

    function processCommand(node, process, message) {
        var data = {
        };
        data.content = "<span class='label label-info'>COMMAND RECEIVED</span> <span class='badge badge-warning'>" + message.slice(message.indexOf("Command received ") + 17, message.indexOf(' -->')) + "</span> <span class='label'>" + message.slice(message.indexOf("--> ") + 4) + "</span>";
        return data;
    }

    function processState(node, process, message) {
        var data = {
        };
        data.content = "<span class='label label-info'>STATE UPDATE</span> <span class='badge badge-warning'>" + message.slice(message.indexOf("Updating channel state ") + 23, message.indexOf(' to ')) + "</span> <span class='label'>" + message.slice(message.indexOf(" to ") + 4) + "</span>";
        return data;
    }

    function processBindingStart(node, process, message) {
        var data = {
            result : INFO
        };

        if (message.indexOf("started") != -1) {
            data.content = "Binding started. Version <span class='label'>" + message.substr(message.indexOf("Version") + 8) + "</span>";
        } else if (message.indexOf("stopped") != -1) {
            data.content = "Binding stopped.";
        }

        return data;
    }

    var lastRestore = null;

    function processDeserialiser(node, process, message) {
        var data = {
            result : SUCCESS,
            node : node,
            content : process.content
        };

        lastRestore = data;
        return data;
    }

    function processDeserialiserError(node, process, message) {
        if (lastRestore != null) {
            lastRestore.warnFlag = true;
            lastRestore.warnMessage = "Failed to restore state";
            lastRestore = null;
        }
    }

    function processRxMessageError(node, process, message) {
        if (lastPacketRx != null) {
            lastPacketRx.errorFlag = true;
            lastPacketRx.errorMessage = process.error;
            setStatus(lastPacketRx, process.status);
            lastPacketRx = null;
        }
    }

    function processTxQueueLength(node, process, message) {
        txQueueLen = parseInt(message.substr(message.indexOf("Queue length = ") + 15), 10);
    }

    function processTxMessageError(node, process, message) {
        if (lastPacketTx != null) {
            lastPacketTx.errorFlag = true;
            lastPacketTx.errorMessage = process.error;
            setStatus(lastPacketTx, process.status);
            lastPacketTx = null;

            if (message.indexOf("(CAN)")) {
                incNodeInfo(255, "txErrorCan");
            } else if (message.indexOf("(NAK)")) {
                incNodeInfo(255, "txErrorNak");
            }
        }
    }

    function processSecureInclusionFailed(node, process, message) {
        var content = "<span class='badge badge-info'><span class='text-error icon-lock'></span>SECURE INCLUSION</span> ";

        content += message.substring(message.search(process.string) + process.string.length);
        return {
            node : node,
            content : content
        };
    }

    function processSecureError(node, process, message) {
        var content = "<span class='badge badge-info'><span class='text-error icon-lock'></span>SECURE ERROR</span> ";

        content += message.substring(message.search(process.string) + process.string.length);
        return {
            node : node,
            content : content
        };
    }

    function processSecureDataRx(node, process, message) {
        var data = {
            node : node
        };

        var content = "<span class='badge badge-info'><span class='text-error icon-lock'></span>SECURE RXD</span> ";
        data.packetData = message.substring(message.search(process.string) + process.string.length).trim();
        var bytes = data.packetData.split(' ');

        // First byte is sequence field
        // HEX2DEC(bytes[0]);

        data.endClassPacket = processCommandClass(node, 0, bytes);

        data.content = content + data.endClassPacket.content;
        if (lastSecurePkt != null) {
            lastSecurePkt.content += data.content;
        }
        return data
    }

    function processSecureDataTx(node, process, message) {
        var data = {
            node : node
        };

        var content = "<span class='badge badge-info'><span class='text-error icon-lock'></span>SECURE TXD</span> ";
        data.packetData = message.substring(message.search(process.string) + process.string.length).trim();
        var bytes = data.packetData.split(' ');

        // First byte is sequence field
        // HEX2DEC(bytes[0]);

        data.endClassPacket = processCommandClass(node, 0, bytes);
        data.content = content + data.endClassPacket.content;
        if (lastSecurePkt != null) {
            lastSecurePkt.content += data.content;
        }
        return data
    }

    function processSecureInclusion(node, process, message) {
        var pos;

        var content = "<span class='badge badge-info'><span class='text-error icon-lock'></span>SECURE INCLUSION</span> ";
        message += " ";
        pos = message.search("State=");
        if (pos != -1) {
            content += "<span class='label'>" + message.substr(pos + 6, message.substring(pos + 6).indexOf(" ")) + "</span>";
        }

        pos = message.search("Inclusion=");
        if (pos != -1) {
            content += "<span class='label";
            if (message[pos + 10] == 't') {
                content += " label-success";
            }
            content += "'>INCLUSION IN PROGRESS</span> ";
        }

        pos = message.search("Paired=");
        if (pos != -1) {
            content += "<span class='label";
            if (message[pos + 7] == 't') {
                content += " label-success";
            }
            content += "'>PAIRED</span> ";
        }

        pos = message.search("lastRxMsg=");
        if (pos != -1) {
            var lastRx = parseInt(message.substring(pos + 10));
            content += "<span class='label";
            if (lastRx > 10000) {
                content += " label-error";
            }
            if (lastRx > 20000) {
                lastRx = "----";
            }
            content += "'>LAST RX " + lastRx + "ms</span> ";
        }

        pos = message.search("lastTxMsg=");
        if (pos != -1) {
            var lastTx = parseInt(message.substring(pos + 10));
            content += "<span class='label";
            if (lastTx > 10000) {
                content += " label-error";
            }
            if (lastTx > 20000) {
                lastTx = "----";
            }
            content += "'>LAST TX " + lastTx + "ms</span> ";
        }

        return {
            node : node,
            content : content
        };
    }

    function processHealState(node, process, message) {
        var stage = message.substr(message.indexOf(" HEAL - ") + 8);
        return {
            node : node,
            healstage : stage,
            content : "Heal stage advanced to " + stage
        };
    }

    function processStage(node, process, message) {
        var stage = message.substr(message.indexOf(" to ") + 4);
        var point = stage.indexOf(".");
        if (point !== -1) {
            stage = stage.substr(0, point);
        }
        addNodeInfo(node, "Stage", stage);
        return {
            node : node,
            stage : stage,
            content : "Stage advanced to <span class='label'>" + stage + "</span>"
        };
    }

    function processAlive(node, process, message) {
        var stage = message.substr(message.indexOf(" Stage set to ") + 14);
        var point = stage.indexOf(".");
        if (point !== -1) {
            stage = stage.substr(0, point);
        }
        addNodeInfo(node, "Stage", stage);
        return {
            stage : stage,
            content : "Stage set to " + stage
        };
    }

    function processRetry(node, process, message) {
        var count = parseInt(message.substr(message.indexOf("Requeueing - ") + 13), 10);
        return {
            retry : count,
            result : WARNING,
            content : "Message retry (" + count + " attempts remaining)"
        };
    }

    function processTimeout(node, process, message) {
        addNodeInfo(node, "Stage", "DEAD");
        return {
            result : ERROR,
            content : "Message timeout!"
        };
    }

    function processResponseTime(node, process, message) {
        var response = parseInt(message.substr(message.indexOf("after ") + 6), 10);
        return null;
    }

    function processConfig(node, process, message) {
        var cfg = message.substr(message.indexOf("Update config, ") + 15).split("=");
        if (cfg == null || cfg.length != 2) {
            return null;
        }
        config[cfg[0].trim()] = cfg[1].trim();
        return null;
    }

    /**
     * Command Class Processors
     */

    var zwaveSceneKeys = {
        0 : "Key Pressed",
        1 : "Key Released",
        2 : "Key Held Down",
        3 : "Key Pressed 2 times",
        4 : "Key Pressed 3 times",
        5 : "Key Pressed 4 times",
        6 : "Key Pressed 5 times",
        7 : "INVALID"
    }

    function processCentralScene(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);

        switch (cmdCmd) {
            case 3: // CENTRAL_SCENE_NOTIFICATION
                data.content += " <span class='label'>SEQ=" + HEX2DEC(bytes[2]) + "</span>";
                data.content += " <span class='label'>SCENE=" + HEX2DEC(bytes[4]) + "</span>";
                data.content += " <span class='label'>ATTR=" + zwaveSceneKeys[HEX2DEC(bytes[3]) & 0x7] + "</span>";
                break;
        }

        return data;
    }
    function processWakeup(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);

        switch (cmdCmd) {
            case 4: // WAKE_UP_INTERVAL_SET
            case 6: // WAKE_UP_INTERVAL_REPORT
                var interval = HEX2DEC(bytes[2]) * 65536 + HEX2DEC(bytes[3]) * 256 + HEX2DEC(bytes[4]);
                addNodeInfo(node, "wakeupInterval", interval);
                addNodeInfo(node, "wakeupNode", HEX2DEC(bytes[5]));
                data.content += " <span class='label'>Period=" + interval + "</span>";
                data.content += " Reporting to <span class='label label-warning'>";
                if (HEX2DEC(bytes[5]) == 0) {
                    data.content += "NOT SET";
                } else if (HEX2DEC(bytes[5]) == 255) {
                    data.content += "BROADCAST";
                } else {
                    data.content += "NODE " + HEX2DEC(bytes[5]);
                }
                data.content += "</span>";
                if (interval === 0) {
                    data.errorMessage = "Wakeup interval is not set";
                }
                break;
            case 7:
                incNodeInfo(node, "wakeupCnt");
                break;
            case 10: // WAKE_UP_INTERVAL_CAPABILITIES_REPORT
                var intervalMin = HEX2DEC(bytes[2]) * 65536 + HEX2DEC(bytes[3]) * 256 + HEX2DEC(bytes[4]);
                var intervalMax = HEX2DEC(bytes[5]) * 65536 + HEX2DEC(bytes[6]) * 256 + HEX2DEC(bytes[7]);
                var intervalDef = HEX2DEC(bytes[8]) * 65536 + HEX2DEC(bytes[9]) * 256 + HEX2DEC(bytes[10]);
                var intervalStp = HEX2DEC(bytes[11]) * 65536 + HEX2DEC(bytes[12]) * 256 + HEX2DEC(bytes[13]);

                data.content += " <span class='label'>Min=" + intervalMin + "</span>";
                data.content += " <span class='label'>Max=" + intervalMax + "</span>";
                data.content += " <span class='label'>Default=" + intervalDef + "</span>";
                data.content += " <span class='label'>Step=" + intervalStp + "</span>";
                break;
        }

        return data;
    }

    function processBattery(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 3: // BATTERY_REPORT
                var level = HEX2DEC(bytes[2]);
                data.content += " <span class='label ";
                if (level > 75) {
                    data.content += "label-success";
                } else if (level > 40) {
                    data.content += "label-warning";
                } else {
                    data.content += "label-error";
                }
                data.content += "'>" + level + "%</span>";
                break;
        }

        return data;
    }

    var zwaveColors = {
        0 : {
            name : "WARM WHITE",
            abrev : "WW"
        },
        1 : {
            name : "COLD WHITE",
            abrev : "CW"
        },
        2 : {
            name : "RED",
            abrev : "R"
        },
        3 : {
            name : "GREEN",
            abrev : "G"
        },
        4 : {
            name : "BLUE",
            abrev : "B"
        },
        5 : {
            name : "AMBER",
            abrev : "A"
        },
        6 : {
            name : "CYAN",
            abrev : "C"
        },
        7 : {
            name : "PURPLE",
            abrev : "P"
        }
    }

    function processColorSwitch(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 3: // GET
                var color = HEX2DEC(bytes[2]);
                data.content += " <span class='label'>";
                if (zwaveColors[color] != null) {
                    data.content += zwaveColors[color].name;
                } else {
                    data.content += color;
                }
                data.content += "</span>";
                break;
            case 4: // REPORT
                var color = HEX2DEC(bytes[2]);
                var level = HEX2DEC(bytes[3]);
                data.content += " <span class='label'>";
                if (zwaveColors[color] != null) {
                    data.content += zwaveColors[color].name;
                } else {
                    data.content += color;
                }

                data.content += "=" + level + "</span>";
                break;
            case 5: // SET
                var colors = HEX2DEC(bytes[2]);
                for (var cnt = 0; cnt < colors; cnt++) {
                    var color = HEX2DEC(bytes[3 + (cnt * 2)]);
                    var level = HEX2DEC(bytes[4 + (cnt * 2)]);
                    data.content += " <span class='label'>";
                    if (zwaveColors[color] != null) {
                        data.content += zwaveColors[color].abrev;
                    } else {
                        data.content += color;
                    }

                    data.content += "=" + level + "</span>";
                }
                break;
        }

        return data;
    }

    function processBarrier(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 3: // BARRIER_REPORT
                var state = HEX2DEC(bytes[2]);
                data.content += " <span class='label'>";
                switch (state) {
                    case 0:
                        data.content += "CLOSED";
                        break;
                    case 252:
                        data.content += "CLOSING";
                        break;
                    case 253:
                        data.content += "STOPPED";
                        break;
                    case 254:
                        data.content += "OPENING";
                        break;
                    case 255:
                        data.content += "OPEN";
                        break;
                }
                data.content += "</span>";
                break;
        }

        return data;
    }

    var events = {
        1 : {
            name : "SMOKE"
        },
        2 : {
            name : "CO"
        },
        3 : {
            name : "CO2"
        },
        4 : {
            name : "HEAT"
        },
        5 : {
            name : "WATER"
        },
        6 : {
            name : "ACCESS_CONTROL"
        },
        7 : {
            name : "HOME_SECURITY"
        },
        8 : {
            name : "POWER_MANAGEMENT"
        },
        9 : {
            name : "SYSTEM"
        },
        10 : {
            name : "EMERGENCY"
        },
        11 : {
            name : "CLOCK"
        },
        12 : {
            name : "APPLIANCE"
        },
        13 : {
            name : "HOME_HEALTH"
        },
        14 : {
            name : "SIREN"
        },
        15 : {
            name : "WATER_VALVE"
        },
        16 : {
            name : "WEATHER"
        },
        17 : {
            name : "IRRIGATION"
        },
        18 : {
            name : "GAS"
        }
    };

    function processAlarm(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 5: // ALARM_REPORT
                if (bytes.length >= 6) {
                    data.content += " <span class='label'>";
                    if (events[HEX2DEC(bytes[6])] == null) {
                        data.content += "UNKNOWN[" + bytes[6] + "]";
                    } else {
                        data.content += events[HEX2DEC(bytes[6])].name;
                    }
                    data.content += "<span>";
                }
                break;
        }

        return data;
    }

    function processClock(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 4: // CLOCK_SET
            case 6: // CLOCK_REPORT
                var day = HEX2DEC(bytes[2]) >> 5;
                var hour = HEX2DEC(bytes[2]) & 0x1f;
                var min = HEX2DEC(bytes[3]);
                data.content += " <span class='label ";
                data.content += "'>";
                if (hour < 10) {
                    data.content += "0";
                }
                data.content += hour;
                data.content += ":";
                if (min < 10) {
                    data.content += "0";
                }
                data.content += min;
                data.content += "</span>";
                break;
        }

        return data;
    }

    function processMultiAssociation(node, endpoint, bytes) {
        var data = {
            result : SUCCESS,
            node : node
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 1: // SET
            case 2: // GET
            case 3: // REPORT
            case 4: // REMOVE
                var groupGet = HEX2DEC(bytes[2]);
                data.content += " <span class='label'>GROUP_" + groupGet + "</span>";
                break;
            case 6: // ASSOCIATION_GROUPINGSREPORT
                var groupCnt = HEX2DEC(bytes[2]);
                addNodeInfo(node, "associationGroups", groupCnt);
                data.content += " <span class='label'>Supports " + groupCnt + " groups</span>";
                break;
        }

        return data;
    }

    function processAssociation(node, endpoint, bytes) {
        var data = {
            result : SUCCESS,
            node : node
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 1: // SET
            case 2: // ASSOCIATION_GET
                var groupGet = HEX2DEC(bytes[2]);
                data.content += " <span class='label'>GROUP_" + groupGet + "</span>";
                break;
            case 3: // ASSOCIATION_REPORT
                var groupReport = HEX2DEC(bytes[2]);
                var maxNodes = HEX2DEC(bytes[3]);
                var following = HEX2DEC(bytes[4]);
                data.content += " <span class='label'>GROUP_" + groupReport + "</span>" + " <span class='label'>MAX_NODES " + maxNodes + "</span>";
                for (var a = 5; a < bytes.length; a++) {
                    data.content += " <span class='label label-warning'>NODE " + HEX2DEC(bytes[a]) + "</span>";
                }
                if (bytes.length == 5) {
                    data.content += " <span class='label label-inverse'>empty</span>";
                }
                break;
            case 6: // ASSOCIATION_GROUPINGSREPORT
                var groupCnt = HEX2DEC(bytes[2]);
                addNodeInfo(node, "associationGroups", groupCnt);
                data.content += " <span class='label'>Supports " + groupCnt + " groups</span>";
                break;
        }

        return data;
    }

    function processAssociationInfo(node, endpoint, bytes) {
        var data = {
            result : SUCCESS,
            node : node
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        var groupGet = HEX2DEC(bytes[2]);

        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 1: // ASSOCIATION_GROUP_INFO_NAME_GET
            case 4: // ASSOCIATION_GROUP_INFO_REPORT
            case 6: // ASSOCIATION_GROUP_INFO_LIST_REPORT
                data.content += " <span class='label'>GROUP_" + groupGet + "</span>";
                break;
            case 3: // ASSOCIATION_GROUP_INFO_GET
            case 5: // ASSOCIATION_GROUP_INFO_LIST_GET
                groupGet = HEX2DEC(bytes[3]);
                data.content += " <span class='label'>GROUP_" + groupGet + "</span>";
                break;
            case 2: // ASSOCIATION_GROUP_INFO_NAME_REPORT
                var groupNameGroup = HEX2DEC(bytes[2]);
                var groupNameLen = HEX2DEC(bytes[3]);
                var groupName = "";
                for (var nameLenCnt = 0; nameLenCnt < groupNameLen; nameLenCnt++) {
                    groupName += String.fromCharCode(HEX2DEC(bytes[4 + nameLenCnt]));
                }
                data.content += " <span class='label'>GROUP_" + groupNameGroup + "</span>";
                data.content += " <span class='label'><span class='icon-quotes-left'></span> " + groupName + " <span class='icon-quotes-right'></span></span>";
                break;
        }

        return data;
    }

    function zeroPad(num, size) {
        var s = num + "";
        while (s.length < size)
            s = "0" + s;
        return s;
    }

    function processTimeParameters(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 1: // SET
            case 3: // REPORT
                var year = HEX2DEC(bytes[2]) << 8 | HEX2DEC(bytes[3]);
                var month = HEX2DEC(bytes[4]);
                var day = HEX2DEC(bytes[5]);
                var hour = HEX2DEC(bytes[6]);
                var minute = HEX2DEC(bytes[7]);
                var second = HEX2DEC(bytes[8]);

                if (year == 0 && month == 0 && day == 0 && hour == 0 && minute == 0 && second == 0) {
                    data.content += " <span class='label label-warning'>TIME NOT SET</span>"
                } else {
                    data.content += " <span class='label'>" + zeroPad(hour, 2) + ":" + zeroPad(minute, 2) + ":" + zeroPad(second, 2) + " " + day + "/" + month + "/" + year + "</span>";
                }
                break;
        }

        return data;
    }

    var alarmSensors = {
        0 : "GENERAL",
        1 : "SMOKE",
        2 : "Carbon Monoxide",
        3 : "Carbon Dioxide",
        4 : "HEAT",
        5 : "FLOOD",
        6 : "ACCESS CONTROL",
        7 : "BURGLAR",
        8 : "Power Management",
        9 : "System",
        10 : "Emergency",
        11 : "Count"
    };

    function processAlarmSensor(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 1: // GET
                if (bytes.length >= 3) {
                    var getType = HEX2DEC(bytes[2]);
                    if (alarmSensors[getType] == null) {
                        data.content += "::" + getType;
                    } else {
                        data.content += " <span class='label'>" + alarmSensors[getType] + "</span>";
                    }
                }
                break;
            case 2: // REPORT
                var repSource = HEX2DEC(bytes[2]);
                var repType = HEX2DEC(bytes[3]);
                var repValue = HEX2DEC(bytes[4]);
                if (alarmSensors[repType] == null) {
                    data.content += "::" + repType + "=" + repValue;
                } else {
                    data.content += " <span class='label'>" + alarmSensors[repType] + "=" + repValue + "</span>";
                }
                break;
            case 4: // SENSOR_ALARM_SUPPORTED_REPORT
                for (var i = 0; i < bytes.length - 3; ++i) {
                    var a = HEX2DEC(bytes[i + 3]);
                    for (var bit = 0; bit < 8; ++bit) {
                        if ((a & (1 << bit)) === 0) {
                            continue;
                        }
                        var index = (i * 8) + bit;

                        var name = "UNKNOWN!";
                        if (alarmSensors[index] != null) {
                            name = alarmSensors[index];
                        }

                        // Add to list of supported sensors
                        addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "alarm_type=" + index);
                    }
                }
                break;
        }

        return data;
    }

    function processSwitchBinary(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 1: // SWITCH_BINARY_SET
            case 3: // SWITCH_BINARY_REPORT
                if (HEX2DEC(bytes[2]) == 0) {
                    data.content += " <span class='label'>OFF</span>";
                } else if (HEX2DEC(bytes[2]) == 255) {
                    data.content += " <span class='label'>ON</span>";
                } else {
                    data.content += " <span class='label label-error'>UNKNOWN</span>";
                }
                break;
        }

        return data;
    }

    var binarySensors = {
        0 : "UNKNOWN",
        1 : "GENERAL",
        2 : "SMOKE",
        3 : "Carbon Monoxide",
        4 : "Carbon Dioxide",
        5 : "HEAT",
        6 : "WATER",
        7 : "FREEZE",
        8 : "TAMPER",
        9 : "Aux",
        10 : "Door/Window",
        11 : "TILT",
        12 : "MOTION",
        13 : "Glass Break"
    };

    function processSensorBinary(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 2: // SENSOR_BINARY_GET
                if (bytes.length >= 3) {
                    var typeGet = HEX2DEC(bytes[2]);
                    if (binarySensors[typeGet] == null) {
                        data.content += "::" + typeGet;
                    } else {
                        data.content += " <span class='label'>" + binarySensors[typeGet] + "</span>";
                    }
                }
                break;
            case 3: // SENSOR_BINARY_REPORT
                if (bytes.length > 3) {
                    var typeReport = HEX2DEC(bytes[2]);
                    var scale = HEX2DEC(bytes[3]);
                    var val1 = HEX2DEC(bytes[4]);
                    var name = "";
                    if (binarySensors[typeReport] == null) {
                        data.content += "::" + typeReport + "(" + scale + ") = " + val1;
                        name = commandClasses[cmdCls].name + " " + typeReport;
                    } else {
                        data.content += "::" + binarySensors[typeReport] + "(" + scale + ") = " + val1;
                        name = commandClasses[cmdCls].name + " " + binarySensors[typeReport];
                    }
                    addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "sensor_type=" + typeReport);
                } else {
                    var val2 = HEX2DEC(bytes[2]);
                    data.content += "=" + val2;
                    addNodeItem(node, endpoint, "??", commandClasses[cmdCls].name);
                }
                break;
        }

        return data;
    }

    var meterSensors = {
        0 : {
            name : "UNKNOWN",
            scales : {}
        },
        1 : {
            name : "ELECTRIC",
            scales : {
                0 : {
                    name : "KWH"
                },
                1 : {
                    name : "KVAH"
                },
                2 : {
                    name : "W"
                },
                3 : {
                    name : "PULSE"
                },
                4 : {
                    name : "V"
                },
                5 : {
                    name : "A"
                },
                6 : {
                    name : "PF"
                }
            }
        },
        2 : {
            name : "GAS"
        },
        3 : {
            name : "WATER"
        }
    };

    function processMeter(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 4: // METER_SUPPORTED_REPORT
                for (var i = 0; i < bytes.length - 3; ++i) {
                    var a = HEX2DEC(bytes[i + 2]);
                    for (var bit = 0; bit < 8; ++bit) {
                        if ((a & (1 << bit)) === 0) {
                            continue;
                        }
                        var index = (i * 8) + bit + 1;

                        var name = "UNKNOWN!";
                        if (meterSensors[index] != null) {
                            name = meterSensors[index];
                        }

                        // Add to list of supported sensors
                        addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "meter_type=" + index);
                    }
                }
                break;
            case 1: // METER_GET
                if (bytes.length >= 3) {
                    // TODO: BODGE: We've assumed it's electric here....
                    var meterType = 1;
                    var typeGet = HEX2DEC(bytes[2]) >> 3;
                    if (meterSensors[meterType].scales[typeGet] == null) {
                        data.content += " <span class='label'>UNKNOWN SCALE " + typeGet + "</span>";
                    } else {
                        data.content += " <span class='label'>" + meterSensors[meterType].name + "_" + meterSensors[meterType].scales[typeGet].name + "</span>";
                    }
                }
                break;
            case 2: // METER_REPORT
                var typeReport = HEX2DEC(bytes[2]) & 0x1f;
                var scale = (HEX2DEC(bytes[3]) & 0x18) >> 3;
                data.content += " <span class='label'>";
                if (meterSensors[typeReport] == null) {
                    data.content += " " + typeReport + "_" + scale;
                } else {
                    data.content += " " + meterSensors[typeReport].name + "_";

                    if (meterSensors[typeReport].scales[scale] == null) {
                        data.content += scale;
                    } else {
                        data.content += meterSensors[typeReport].scales[scale].name;
                    }
                }
                data.content += "</span>"
                addNodeItem(node, endpoint, "??", commandClasses[cmdCls].name, "sensor_type=" + typeReport);
                break;
        }

        return data;
    }

    var multilevelSensors = {
        1 : "TEMPERATURE",
        2 : "GENERAL",
        3 : "LUMINANCE",
        4 : "POWER",
        5 : "RELATIVE_HUMIDITY",
        6 : "VELOCITY",
        7 : "DIRECTION",
        8 : "ATMOSPHERIC_PRESSURE",
        9 : "BAROMETRIC_PRESSURE",
        10 : "SolarRadiation",
        11 : "DewPoint",
        12 : "RainRate",
        13 : "TideLevel",
        14 : "WEIGHT",
        15 : "VOLTAGE",
        16 : "CURRENT",
        17 : "CO2",
        18 : "AirFlow",
        19 : "TankCapacity",
        20 : "Distance",
        21 : "AnglePosition",
        22 : "Rotation",
        23 : "WaterTemperature",
        24 : "SoilTemperature",
        25 : "SeismicIntensity",
        26 : "SeismicMagnitude",
        27 : "ULTRAVIOLET",
        28 : "ElectricalResistivity",
        29 : "ElectricalConductivity",
        30 : "Loudness",
        31 : "MOISTURE",
        32 : "MaxType"
    };

    function processMultilevelSensor(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 2: // SENSOR_MULTI_LEVEL_SUPPORTED_REPORT
                for (var i = 0; i < bytes.length - 3; ++i) {
                    var a = HEX2DEC(bytes[i + 2]);
                    for (var bit = 0; bit < 8; ++bit) {
                        if ((a & (1 << bit)) === 0) {
                            continue;
                        }
                        var index = (i * 8) + bit + 1;

                        var name = "UNKNOWN!";
                        if (multilevelSensors[index] != null) {
                            name = multilevelSensors[index];
                        }

                        // Add to list of supported sensors
                        addNodeItem(node, endpoint, name, commandClasses[cmdCls].name, "sensor_type=" + index);
                    }
                }
                break;
            case 4: // SENSOR_MULTI_LEVEL_GET
                if (bytes.length >= 3) {
                    var typeGet = HEX2DEC(bytes[2]);
                    if (multilevelSensors[typeGet] == null) {
                        data.content += " <span class='label'>" + typeGet + "</span>";
                    } else {
                        data.content += " <span class='label'>" + multilevelSensors[typeGet] + "</span>";
                    }
                }
                break;
            case 5: // SENSOR_MULTI_LEVEL_REPORT
                var typeReport = HEX2DEC(bytes[2]);
                var scale = HEX2DEC(bytes[3]);
                if (multilevelSensors[typeReport] == null) {
                    data.content += " <span class='label'>" + typeReport + "=" + scale + "</span>";
                } else {
                    data.content += " <span class='label'>" + multilevelSensors[typeReport] + "=" + scale + "</span>";
                }
                addNodeItem(node, endpoint, "??", commandClasses[cmdCls].name, "sensor_type=" + typeReport);
                break;
        }

        return data;
    }

    function processVersion(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        var cmdPrm = HEX2DEC(bytes[2]);
        var cmdClass = "";

        data.content = getCommandClassName(cmdCls, cmdCmd);

        switch (cmdCmd) {
            case 18:
                data.content += " <span class='label'>APPLICATION_VERSION</span>";
                data.content += " <span class='label'>VERSION " + HEX2DEC(bytes[5]) + "." + HEX2DEC(bytes[6]) + "</span>";
                break;
            case 19:
                if (commandClasses[cmdPrm] == undefined) {
                    cmdClass = "UNKNOWN(" + cmdPrm + ")";
                } else {
                    cmdClass = commandClasses[cmdPrm].name;
                }
                data.content += " <span class='label'>" + cmdClass + "</span>";
                break;
            case 20:
                if (commandClasses[cmdPrm] == undefined) {
                    cmdClass = "UNKNOWN(" + cmdPrm + ")";
                } else {
                    cmdClass = commandClasses[cmdPrm].name;
                }
                var version = HEX2DEC(bytes[3]);
                data.content += " <span class='label'>" + cmdClass + "</span> <span class='label'>VERSION " + version + "</span>";
                break;
        }

        return data;
    }

    var lastSecurePkt;
    function processSecurity(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        var cmdPrm = HEX2DEC(bytes[2]);

        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 5: // SECURITY_SCHEME_REPORT
                data.content += " <span class='label'>SCHEME_" + cmdPrm + "</span>";
                break;
            case 3: // SUPPORTED_REPORT
                data.expandedContent = "<table class='table table-borderless'>";
                var lineHeader = "command classes:";
                var cntrl = false;
                for (var c = 3; c < bytes.length; c++) {
                    var id = HEX2DEC(bytes[c]);
                    if (id == 0xEF) {
                        cntrl = true;
                        continue;
                    }

                    // If we know the command class name, use it
                    if (commandClasses[id] != null) {
                        id = commandClasses[id].name;
                    }
                    data.expandedContent += "<tr><td>" + lineHeader + "</td><td><span class='label'>" + id + "</span></td></tr>";
                    lineHeader = "";
                }
                data.expandedContent += "</table>";
                break;
            case 128: // SECURITY_NONCE_REPORT
                data.content += " <span class='label'>NONCE ID " + cmdPrm + "</span>";
                break;
            case 129: // ENCAP
            case 193: // ENCAP_NONCE_GET
                cmdPrm = HEX2DEC(bytes[bytes.length - 9]);
                data.content += " <span class='label'>NONCE ID " + cmdPrm + "</span>";
                lastSecurePkt = data;
                break;
        }

        return data;
    }

    function processConfiguration(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);

        data.param_id = HEX2DEC(bytes[2]);

        data.content = getCommandClassName(cmdCls, cmdCmd);
        data.content += " <span class='label'>PARAM_" + data.param_id + "</span>";

        if (cmdCmd == 4) { // SET
        } else if (cmdCmd == 5) { // GET
        } else if (cmdCmd == 6) { // REPORT
            data.param_size = HEX2DEC(bytes[3]);
            data.content += " <span class='label'>size=" + data.param_size + "</span>";
        }

        return data;
    }

    function processManufacturer(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };
        addNodeInfo(node, "manufacturer", bytes[2] + bytes[3]);
        addNodeInfo(node, "deviceType", bytes[4] + bytes[5]);
        addNodeInfo(node, "deviceID", bytes[6] + bytes[7]);
        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        data.content += " <span class='label'>" + getNodeInfo(node, "manufacturer") + ":" + getNodeInfo(node, "deviceType") + ":" + getNodeInfo(node, "deviceID") + "</span>";

        return data;
    }

    function processMultiChannelReport(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);
        switch (cmdCmd) {
            case 8:
                data.content += " <span class='label'>" + HEX2DEC(bytes[3]) + " ENDPOINTS</span>";
                if ((HEX2DEC(bytes[2]) & 0x40) != 0) {
                    data.content += " <span class='label label-warning'>SAME CLASS</span>";
                }
                if ((HEX2DEC(bytes[2]) & 0x80) != 0) {
                    data.content += " <span class='label label-warning'>COUNT CHANGING</span>";
                }
                break;
            case 10:
                data.endPoint = HEX2DEC(bytes[2]) & 0x7f;
                var generic = HEX2DEC(bytes[3]);
                var specific = HEX2DEC(bytes[4]);

                data.content += " <span class='label label-info'>ENDPOINT-" + data.endPoint + "</span>";

                var devClass = getDeviceClass(getNodeInfo(node, "basicClass"), generic, specific);
                addNodeEndpointInfo(node, data.endPoint, "deviceClass", devClass);
                var cmdClass = getDeviceCommand(generic);

                data.content += " " + devClass;

                addNodeItem(node, data.endPoint, data.endPoint, cmdClass);
                break;
        }
        return data;
    }

    function processMultiChannelEncapV1(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);

        data.endPoint = HEX2DEC(bytes[2]);
        data.endClassCode = HEX2DEC(bytes[3]);
        data.endClassPacket = processCommandClass(node, data.endPoint, bytes.slice(3));

        data.content += " <span class='label label-info'>EP-" + data.endPoint + "</span>";
        if (data.endClassPacket != null) {
            data.content += " " + data.endClassPacket.content;
        }
        return data;
    }

    function processMultiChannelEncapV2(node, endpoint, bytes) {
        var data = {
            result : SUCCESS
        };

        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = HEX2DEC(bytes[1]);
        data.content = getCommandClassName(cmdCls, cmdCmd);

        data.endPoint = HEX2DEC(bytes[2]);
        data.endPointDest = HEX2DEC(bytes[3]);
        data.endClassCode = HEX2DEC(bytes[4]);
        data.endClassPacket = processCommandClass(node, data.endPoint, bytes.slice(4));

        data.content += " <span class='label label-info'>EP-" + data.endPoint + " -> EP-" + data.endPointDest + "</span>";
        if (data.endClassPacket != null) {
            data.content += " " + data.endClassPacket.content;
        }
        return data;
    }

    function processCommandClass(node, endpoint, bytes) {
        var cmdClass = {
            result : SUCCESS
        };
        if (bytes == null || bytes.length === 0) {
            cmdClass.content = "Zero length frame in command class";
            setStatus(cmdClass, ERROR);
            return cmdClass;
        }

        // Handle our requests
        var cmdCls = HEX2DEC(bytes[0]);
        var cmdCmd = null;

        cmdClass.id = cmdCls;

        if (bytes.length > 1) {
            cmdCmd = HEX2DEC(bytes[1]);
        }

        // Process the command class
        if (commandClasses[cmdCls] === undefined) {
            cmdClass.content = "Unknown command class " + bytes[0];
            setStatus(cmdClass, WARNING);
        } else {
            // If we've defined a command/function within the class, then process this
            if (commandClasses[cmdCls].commands != null && commandClasses[cmdCls].commands[cmdCmd] != null) {
                if (commandClasses[cmdCls].commands[cmdCmd].processor != null) {
                    cmdClass = commandClasses[cmdCls].commands[cmdCmd].processor(node, endpoint, bytes);
                } else if (commandClasses[cmdCls].processor) {
                    cmdClass = commandClasses[cmdCls].processor(node, endpoint, bytes);
                }
                cmdClass.funct = commandClasses[cmdCls].commands[cmdCmd].name;
            } else if (commandClasses[cmdCls].processor) {
                cmdClass = commandClasses[cmdCls].processor(node, endpoint, bytes);
            } else {
                if (cmdCmd != null) {
                    cmdClass.funct = bytes[1];
                }
            }
            cmdClass.class = commandClasses[cmdCls].name;
            cmdClass.name = commandClasses[cmdCls].name;

            if (cmdClass.content == null) {
                // Check if the function contains the class name
                if (cmdClass.funct != null && cmdClass.funct.indexOf(cmdClass.name) == -1) {
                    // No - we need to have both
                    cmdClass.content = "<span class='badge badge-success'>" + cmdClass.class + "</span> " + cmdClass.funct;
                } else if (cmdClass.funct != null) {
                    cmdClass.content = "<span class='badge badge-success'>" + cmdClass.funct + "</span>";
                } else {
                    cmdClass.content = "<span class='badge badge-success'>" + cmdClass.class + "</span>";
                }
            }
        }

        cmdClass.node = node;
        return cmdClass;
    }

    function processSucNodeId(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
        } else {
            if (type == REQUEST) {
            } else {
                data.node = 255;
                addNodeInfo(data.node, "sucID", HEX2DEC(bytes[0]));
                if (HEX2DEC(bytes[0]) == 0) {
                    data.content = "SUC ID: <span class='label label-inverse'>NOT SET</span>";
                } else {
                    data.content = "SUC ID: <span class='label label-warning'>NODE " + getNodeInfo(255, "sucID") + "</span>";
                }
            }
        }

        return data;
    }

    function processMemoryGetId(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
        } else {
            if (type == REQUEST) {
                setStatus(data, ERROR);
            } else {
                data.node = 255;
                addNodeInfo(data.node, "homeID", bytes[0] + bytes[1] + bytes[2] + bytes[3]);
                addNodeInfo(data.node, "controllerID", HEX2DEC(bytes[4]));
                data.content = "MemoryGetId: HomeID <span class='label'>" + getNodeInfo(data.node, "homeID") + "</span> ControllerID <span class='label label-warning'>NODE " + getNodeInfo(data.node, "controllerID") + "</span>";
            }
        }

        return data;
    }

    function processIdentifyNode(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                setStatus(data, ERROR);
            } else {
                data.node = lastCmd.node;

                var basic = HEX2DEC(bytes[3]);
                var generic = HEX2DEC(bytes[4]);
                var specific = HEX2DEC(bytes[5]);

                var a = HEX2DEC(bytes[0]);
                addNodeInfo(data.node, "isListening", (a & 0x80) !== 0 ? true : false);
                addNodeInfo(data.node, "isRouting", (a & 0x40) !== 0 ? true : false);
                addNodeInfo(data.node, "version", (a & 0x07) + 1);
                a = HEX2DEC(bytes[1]);
                addNodeInfo(data.node, "isFLiRS250", (a & 0x20) ? true : false);
                addNodeInfo(data.node, "isFLiRS1000", (a & 0x40) ? true : false);
                addNodeInfo(data.node, "isBeaming", (a & 0x10) ? true : false);
                addNodeInfo(data.node, "basicClass", basic);
                addNodeInfo(data.node, "genericClass", generic);
                addNodeInfo(data.node, "specificClass", specific);

                var cmdClass = getDeviceCommand(generic);
                addNodeItem(data.node, 0, 0, cmdClass);

                var devClass = getDeviceClass(basic, generic, specific);
                addNodeInfo(data.node, "deviceClass", devClass);
                data.content = devClass;

                data.content += " <span class='label";
                if (getNodeInfo(data.node, "isListening")) {
                    data.content += " label-success";
                }
                data.content += "'>LISTENING</span>";

                data.content += " <span class='label";
                if (getNodeInfo(data.node, "isFLiRS250")) {
                    data.content += " label-success";
                }
                data.content += "'>FLIRS250</span>";

                data.content += " <span class='label";
                if (getNodeInfo(data.node, "isFLiRS1000")) {
                    data.content += " label-success";
                }
                data.content += "'>FLIRS1000</span>";

                data.content += " <span class='label";
                if (getNodeInfo(data.node, "isRouting")) {
                    data.content += " label-success";
                }
                data.content += "'>ROUTING</span>";

                data.content += " <span class='label";
                if (getNodeInfo(data.node, "isBeaming")) {
                    data.content += " label-success";
                }
                data.content += "'>BEAMING</span>";
            }
        }

        return data;
    }

    function processNodeNeighborUpdate(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                data.node = lastCmd.node;

                data.content = "Neighbor update ";
                switch (HEX2DEC(bytes[1])) {
                    case 33:
                        data.content += "STARTED";
                        break;
                    case 34:
                        data.content += "DONE";
                        break;
                    case 35:
                        data.content += "FAILED";
                        setStatus(data, WARNING);
                        break;
                    default:
                        data.content += "UNKNOWN (" + bytes[1] + ")";
                        setStatus(data, WARNING);
                        break;
                }
            } else {
                data.node = lastCmd.node;
            }
        }

        return data;
    }

    var appUpdateState = {
        0x84 : "UPDATE_STATE_NODE_INFO_RECEIVED",
        0x82 : "UPDATE_STATE_NODE_INFO_REQ_DONE",
        0x81 : "UPDATE_STATE_NODE_INFO_REQ_FAILED",
        0x80 : "UPDATE_STATE_ROUTING_PENDING",
        0x40 : "UPDATE_STATE_NEW_ID_ASSIGNED",
        0x20 : "UPDATE_STATE_DELETE_DONE",
        0x10 : "UPDATE_STATE_SUC_ID"
    };

    function processAppUpdate(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
        } else {
            if (type == REQUEST) {
                var state = HEX2DEC(bytes[0]);
                if (HEX2DEC(bytes[1]) != 0) {
                    data.node = HEX2DEC(bytes[1]);
                }
                data.content = "";
                if (appUpdateState[state] != null) {
                    data.content += "<span class='label ";
                    if (state == 129) {
                        data.content += "label-important";
                    } else {
                        data.content += "label-success";
                    }
                    data.content += "'>" + appUpdateState[state] + "</span>";
                } else {
                    data.content += bytes[0];
                }
                switch (state) {
                    case 0x84:
                        createNode(data.node);
                        data.expandedContent = "<table class='table table-borderless'>";
                        var lineHeader = "command classes:";
                        var cntrl = false;
                        for (var c = 6; c < bytes.length; c++) {
                            var id = HEX2DEC(bytes[c]);
                            if (id == 0xEF) {
                                cntrl = true;
                                continue;
                            }

                            // If we know the command class name, use it
                            if (commandClasses[id] != null) {
                                id = commandClasses[id].name;
                            }
                            data.expandedContent += "<tr><td>" + lineHeader + "</td><td><span class='label'>" + id + "</span></td></tr>";

                            if (cntrl === false) {
                                if (nodes[data.node].classes[id] == null) {
                                    nodes[data.node].classes[id] = 0;
                                }
                            } else {
                                if (nodes[data.node].control[id] == null) {
                                    nodes[data.node].control[id] = 0;
                                }
                            }

                            lineHeader = "";
                        }
                        data.expandedContent += "</table>";
                        break;
                }
            } else {
            }
        }

        return data;
    }

    function processGetVersion(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "RX" && type == RESPONSE) {
            data.node = 255;
            data.zwaveVersion = "";
            for (var i = 0; i < 11; i++) {
                data.zwaveVersion += String.fromCharCode(HEX2DEC(bytes[i]));
            }
            addNodeInfo(data.node, "zwaveVersion", data.zwaveVersion);
        }

        return data;
    }

    function processAddNode(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };

        data.content = "<span class='label'>";
        if (direction == "TX") {
            if (type == REQUEST) {
                switch (HEX2DEC(bytes[0]) & 0x0f) {
                    case 1:
                        data.content += "ADD_NODE_ANY";
                        break;
                    case 2:
                        data.content += "ADD_NODE_CONTROLLER";
                        break;
                    case 3:
                        data.content += "ADD_NODE_SLAVE";
                        break;
                    case 4:
                        data.content += "ADD_NODE_EXISTING";
                        break;
                    case 5:
                        data.content += "ADD_NODE_STOP";
                        break;
                    case 6:
                        data.content += "ADD_NODE_STOP_FAILED";
                        break;
                    default:
                        data.content += "UNKNOWN (" + bytes[0] + ")";
                        setStatus(data, WARNING);
                        break;
                }
                data.content += "</span>";
                if (HEX2DEC(bytes[0]) & 0x80) {
                    data.content += " <span class='label label-important'>HIGH POWER</span>";
                }
                if (HEX2DEC(bytes[0]) & 0x40) {
                    data.content += " <span class='label label-important'>NWI</span>";
                }
            }
        } else {
            if (type == REQUEST) {
                switch (HEX2DEC(bytes[1]) & 0x0f) {
                    case 1:
                        data.content += "ADD_NODE_STATUS_LEARN_READY";
                        break;
                    case 2:
                        data.content += "ADD_NODE_STATUS_NODE_FOUND";
                        break;
                    case 3:
                        data.content += "ADD_NODE_STATUS_ADDING_SLAVE";
                        break;
                    case 4:
                        data.content += "ADD_NODE_STATUS_ADDING_CONTROLLER";
                        break;
                    case 5:
                        data.content += "ADD_NODE_STATUS_PROTOCOL_DONE";
                        break;
                    case 6:
                        data.content += "ADD_NODE_STATUS_DONE";
                        break;
                    case 7:
                        data.content += "ADD_NODE_STATUS_FAILED";
                        break;
                    default:
                        data.content += "UNKNOWN (" + bytes[0] + ")";
                        setStatus(data, WARNING);
                        break;
                }
                data.content += "</span>";

                switch (HEX2DEC(bytes[1]) & 0x0f) {
                    case 3:
                    case 4:
                    case 6:
                        if (HEX2DEC(bytes[2]) != 0) {
                            data.node = HEX2DEC(bytes[2]);
                            data.content += " <span class='label label-warning'>NODE " + HEX2DEC(bytes[2]) + "</span>";

                            data.expandedContent = "<table class='table table-borderless'>";
                            var lineHeader = "command classes:";
                            var cntrl = false;
                            for (var c = 7; c < bytes.length; c++) {
                                var id = HEX2DEC(bytes[c]);
                                if (id == 0xEF) {
                                    cntrl = true;
                                    continue;
                                }

                                // If we know the command class name, use it
                                if (commandClasses[id] != null) {
                                    id = commandClasses[id].name;
                                }
                                data.expandedContent += "<tr><td>" + lineHeader + "</td><td><span class='label'>" + id + "</span></td></tr>";
                                lineHeader = "";
                            }
                            data.expandedContent += "</table>";
                        }
                        break;
                }
            }
        }

        return data;
    }

    function processRemoveNode(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };

        data.content = "<span class='label'>";
        if (direction == "TX") {
            if (type == REQUEST) {
                switch (HEX2DEC(bytes[0]) & 0x0f) {
                    case 1:
                        data.content += "REMOVE_NODE_ANY";
                        break;
                    case 2:
                        data.content += "REMOVE_NODE_CONTROLLER";
                        break;
                    case 3:
                        data.content += "REMOVE_NODE_SLAVE";
                        break;
                    case 5:
                        data.content += "REMOVE_NODE_STOP";
                        break;
                    case 6:
                        data.content += "REMOVE_NODE_STOP_FAILED";
                        break;
                    default:
                        data.content += "UNKNOWN (" + bytes[0] + ")";
                        setStatus(data, WARNING);
                        break;
                }
                data.content += "</span>";
                // TODO: CHeck if these flags are relevant for exclude
                if (HEX2DEC(bytes[0]) & 0x80) {
                    // data.content += " <span class='label label-important'>HIGH POWER</span>";
                }
                if (HEX2DEC(bytes[0]) & 0x40) {
                    // data.content += " <span class='label label-important'>NWI</span>";
                }
            }
        } else {
            if (type == REQUEST) {
                switch (HEX2DEC(bytes[1]) & 0x0f) {
                    case 1:
                        data.content += "REMOVE_NODE_STATUS_LEARN_READY";
                        break;
                    case 2:
                        data.content += "REMOVE_NODE_STATUS_NODE_FOUND";
                        break;
                    case 3:
                        data.content += "REMOVE_NODE_STATUS_REMOVING_SLAVE";
                        break;
                    case 4:
                        data.content += "REMOVE_NODE_STATUS_REMOVING_CONTROLLER";
                        break;
                    case 6:
                        data.content += "REMOVE_NODE_STATUS_DONE";
                        break;
                    case 7:
                        data.content += "REMOVE_NODE_STATUS_FAILED";
                        break;
                    default:
                        data.content += "UNKNOWN (" + bytes[0] + ")";
                        setStatus(data, WARNING);
                        break;
                }
                data.content += "</span>";

                switch (HEX2DEC(bytes[1]) & 0x7f) {
                    case 3:
                    case 6:
                        if (HEX2DEC(bytes[2]) != 0) {
                            data.node = HEX2DEC(bytes[2]);
                            data.content += " <span class='label label-warning'>NODE " + HEX2DEC(bytes[2]) + "</span>";
                        }
                        break;
                }
            }
        }

        return data;
    }

    function processRoutingInfo(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                data.node = lastCmd.node;
            } else {
                data.node = lastCmd.node;

                var cntTotal = 0;
                var cntListening = 0;
                var nodeLoop = 0;
                var neighbours = [];
                data.expandedContent = "";
                for (var i = 0; i < 29; i++) {
                    var incomingByte = HEX2DEC(bytes[i]);
                    // loop bits in byte
                    for (var j = 0; j < 8; j++) {
                        nodeLoop++;
                        var b1 = incomingByte & Math.pow(2, j);
                        var b2 = Math.pow(2, j);
                        if (b1 == b2) {
                            cntTotal++;
                            neighbours.push(nodeLoop);

                            data.expandedContent += " <span class='label label-warning'>NODE " + nodeLoop + "</span>";
                        }
                    }
                }

                addNodeInfo(data.node, "neighboursList", neighbours);
                addNodeInfo(data.node, "neighboursTotal", cntTotal);

                data.content = "Found " + getNodeInfo(data.node, "neighboursTotal") + " neighbours";
            }
        }

        return data;
    }

    function processControllerCmd(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                data.node = lastCmd.node;
            } else {
                if (HEX2DEC(bytes[0]) == 0) {
                    // ERROR
                } else {
                    // SUCCESS
                }
                data.node = lastCmd.node;
            }
        }

        return data;
    }

    function processRequestNodeInfo(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS,
            content : ""
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                data.node = lastCmd.node;
            } else {
                if (HEX2DEC(bytes[0]) == 0) {
                    data.content += "<span class='label label-important'>FAILED</span>";
                } else {
                    data.content += "<span class='label label-success'>OK</span>";
                }
                data.node = lastCmd.node;
            }
        }

        return data;
    }

    function processAssignReturnRoute(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            data.content += " <span class='label label-warning'>NODE " + HEX2DEC(bytes[1]) + "</span>";

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                data.node = lastCmd.node;
                if (HEX2DEC(bytes[1]) == 0) {
                    data.content = " <span class='label label-success'>SUCCESS</span>";
                } else {
                    data.content = " <span class='label label-important'>FAILURE</span>";
                }
            } else {
                data.node = lastCmd.node;
            }
        }

        return data;
    }

    function processDeleteReturnRoute(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            data.content = " <span class='label label-warning'>NODE " + HEX2DEC(bytes[0]) + "</span>";

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                data.node = lastCmd.node;
                if (HEX2DEC(bytes[1]) == 0) {
                    data.content = " <span class='label label-success'>SUCCESS</span>";
                } else {
                    data.content = " <span class='label label-important'>FAILURE</span>";
                }
            } else {
                data.node = lastCmd.node;
                if (HEX2DEC(bytes[1]) == 0) {
                    data.content = " <span class='label label-success'>SUCCESS</span>";
                } else {
                    data.content = " <span class='label label-important'>FAILURE</span>";
                }
            }
        }

        return data;
    }

    function processControllerCallbackCmd(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            createNode(data.node);

            lastCmd = {
                node : data.node
            };
        } else {
            if (type == REQUEST) {
                data.node = lastCmd.node;
            } else {
                data.node = lastCmd.node;
            }
        }

        return data;
    }

    function processInitData(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
        } else {
            if (type == REQUEST) {
                setStatus(data, ERROR);
            } else {
                data.node = 255;
                var cnt = 0;
                data.expandedContent = "";
                var nodeLoop = 0;
                for (var i = 3; i < 3 + 29; i++) {
                    var incomingByte = HEX2DEC(bytes[i]);
                    // loop bits in byte
                    for (var j = 0; j < 8; j++) {
                        nodeLoop++;
                        var b1 = incomingByte & Math.pow(2, j);
                        var b2 = Math.pow(2, j);
                        if (b1 == b2) {
                            cnt++;
                            data.expandedContent += " <span class='label label-warning'>NODE " + nodeLoop + "</span>";
                        }
                    }
                }

                data.content = "Found " + cnt + " nodes";
            }
        }

        return data;
    }

    function processControllerInfo(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "RX" && type == RESPONSE) {
            data.node = 255;
            addNodeInfo(data.node, "serialApiVersion", bytes[0] + '.' + bytes[1]);
            addNodeInfo(data.node, "manufacturer", bytes[2] + bytes[3]);
            addNodeInfo(data.node, "deviceType", bytes[4] + bytes[5]);
            addNodeInfo(data.node, "deviceID", bytes[6] + bytes[7]);
            data.content = "Controller Info <span class='label'>" + getNodeInfo(data.node, "manufacturer") + ":" + getNodeInfo(data.node, "deviceType") + ":" + getNodeInfo(data.node, "deviceID") + "</span>";
        }

        return data;
    }

    function processSerialApiTimeouts(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX" && type == REQUEST) {
            data.content = "<span class='label'>FRAME=" + (HEX2DEC(bytes[0]) * 10) + "s</span> <span class='label'>BYTE=" + (HEX2DEC(bytes[1]) * 10) + "ms</span>";
        } else if (direction == "RX" && type == RESPONSE) {
            data.content = "<span class='label'>FRAME=" + (HEX2DEC(bytes[0]) * 10) + "s</span> <span class='label'>BYTE=" + (HEX2DEC(bytes[1]) * 10) + "ms</span>";
        }

        return data;
    }

    function processApplicationCommand(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };
        if (direction == "TX") {
            setStatus(data, ERROR);
        } else {
            if (type == REQUEST) {
                data.cmdClass = processCommandClass(HEX2DEC(bytes[1]), 0, bytes.slice(3));

                createNode(data.cmdClass.node);
                if (nodes[data.cmdClass.node].classes[data.cmdClass.class] == null) {
                    nodes[data.cmdClass.node].classes[data.cmdClass.class] = 0;
                }
                nodes[data.cmdClass.node].classes[data.cmdClass.class]++;
                data.content = data.cmdClass.content;
                data.node = data.cmdClass.node;
            } else {
                setStatus(data, ERROR);
            }
        }

        return data;
    }

    function processFailedNode(node, direction, type, bytes, len) {
        var data = {
            result : SUCCESS
        };

        if (direction == "TX") {
            data.node = HEX2DEC(bytes[0]);
            data.content = "Check if <span class='label label-warning'>NODE " + data.node + "</span> is failed";

            lastCmd = {
                node : data.node
            };
        } else {
            data.node = lastCmd.node;
            if (type == RESPONSE) {
                data.content = "<span class='label label-warning'>NODE " + data.node + "</span> is marked as ";
                if (HEX2DEC(bytes[0]) === 0) {
                    data.content += "<span class='label label-success'>HEALTHY</span>";
                } else {
                    data.content += "<span class='label label-important'>FAILED</span>";
                }
                data.content += " by controller.";
            } else {
                setStatus(data, ERROR);
            }
        }

        return data;
    }

    var callbackCache = {};

    function processSendData(node, direction, type, bytes, len) {
        var sendData = {
            result : SUCCESS
        };

        if (direction == "TX") {
            node = HEX2DEC(bytes[0]);
            // Remove the transmit options and callback id
            var cmdClass = processCommandClass(node, 0, bytes.slice(2, -2));
            // Get the callback ID
            var callbackTx = HEX2DEC(bytes[bytes.length - 1]);
            var txOptions = HEX2DEC(bytes[bytes.length - 2]);

            // Save information on this transaction
            callbackCache[callbackTx] = {
                time : logTime,
                cmd : cmdClass,
                node : node
            };

            setStatus(sendData, cmdClass.result);
            sendData.node = node;
            sendData.callback = callbackTx;
            sendData.cmdClass = cmdClass;
            sendData.content = "<span class='badge badge-info'>" + callbackTx + "</span> " + cmdClass.content;

            sendData.txoptions = "";
            if (txOptions == 0) {
                sendData.txoptions += "<span class='badge badge-warning'>NO TX OPTIONS</span>";
            } else {
                if (txOptions & 0x01) {
                    sendData.txoptions += "&nbsp;<span class='badge'>ACK</span>";
                }
                if (txOptions & 0x04) {
                    sendData.txoptions += "&nbsp;<span class='badge'>AUTO_ROUTE</span>";
                }
                if (txOptions & 0x20) {
                    sendData.txoptions += "&nbsp;<span class='badge'>EXPLORE</span>";
                }
            }

            lastSendData.node = node;
            lastSendData.callback = callbackTx;

            incNodeInfo(node, 'messagesSent');
        } else {
            // Handle response from network
            if (type == REQUEST) {
                var callbackRx = HEX2DEC(bytes[0]);
                var status = HEX2DEC(bytes[1]);

                sendData.callback = callbackRx;

                // Recover the data on the original message
                var callbackData = {};
                if (callbackCache[callbackRx] == null) {
                    sendData.content = "No callback ID found (" + bytes[0] + ")";
                    // TODO: Add error
                    sendData.responseTime = "Unknown";
                    setStatus(sendData, ERROR);
                } else {
                    callbackData = callbackCache[callbackRx];
                    node = callbackData.node;
                    sendData.node = callbackData.node;
                    sendData.responseTime = logTime - callbackData.time;
                }

                sendData.content = "<span class='badge badge-success'>" + callbackRx + "</span> ";

                switch (status) {
                    case 0: // COMPLETE_OK
                        // If we know the response, update stats
                        if (sendData.responseTime != "Unknown") {
                            updateNodeResponse(node, sendData.responseTime);
                        }
                        sendData.content += "<span class='badge badge-success'>ACK RECEIVED</span> from device in " + sendData.responseTime + "ms";
                        break;
                    case 1: // COMPLETE_NO_ACK
                        updateNodeResponse(node, -1);
                        setStatus(sendData, WARNING);
                        sendData.content += "<span class='badge badge-warning'>NO ACK</span> after " + sendData.responseTime + "ms";
                        sendData.warnFlag = true;
                        sendData.warnMessage = "No ack received from device";
                        break;
                    case 2: // COMPLETE_FAIL
                        updateNodeResponse(node, -1);
                        setStatus(sendData, ERROR);
                        sendData.content += "<span class='badge badge-important'>FAILED</span> after " + sendData.responseTime + "ms";
                        break;
                    case 3: // COMPLETE_NOT_IDLE
                        updateNodeResponse(node, -1);
                        break;
                    case 4: // COMPLETE_NOROUTE
                        break;
                }
            } else {
                // There's no node ID, so use the last node
                sendData.node = lastSendData.node;
                // This is just the response to say it was sent
                if (HEX2DEC(bytes[0]) > 0) {
                    // Success
                    sendData.content = "<span class='badge badge-success'>" + lastSendData.callback + "</span> " + "<span class='badge'>ACCEPTED BY CONTROLLER</span>";
                    setStatus(sendData, SUCCESS);
                } else {
                    // Error
                    sendData.content = "<span class='badge badge-important'>" + lastSendData.callback + "</span> " + "<span class='badge badge-important'>REJECTED BY CONTROLLER</span>";
                    setStatus(sendData, ERROR);
                }
            }
        }

        return sendData;
    }

    function processPacketTX(node, process, message) {
        packetsSent++;
        lastPacketTx = processPacket("TX", node, process, message);
        if (lastPacketTx != null) {
            lastPacketTx.queueLen = txQueueLen;
        }
        return lastPacketTx;
    }

    function processPacketRX(node, process, message) {
        packetsRecv++;
        var data = processPacket("RX", node, process, message);
        // Check for duplicates
        if (lastPacketRx != null) {
            // If we receive the same packet then mark it as a duplicate
            // Maybe this should check time, but it's not currently available here
            if (lastPacketRx.packetData == data.packetData) {
                data.duplicate = true;
            }
        }
        lastPacketRx = data;

        return data;
    }

    function processPacket(direction, node, process, message) {
        var packet = {
            direction : direction
        };
        packet.packetData = message.substr(message.indexOf(" = ") + 3).trim();
        var bytes = packet.packetData.split(' ');

        var frameType = HEX2DEC(bytes[0]);
        if (frameType == 6) {
            // NAK
            packet.content = "<span class='label " + (process.ref == "RXPacket" ? "label-success'>RX" : "label-important'>TX") + "</span> <span class='label label-success'>ACK</span>";
            return packet;
        } else if (frameType == 21) {
            // NAK
            packet.content = "<span class='label " + (process.ref == "RXPacket" ? "label-success'>RX" : "label-important'>TX") + "</span> <span class='label label-important'>NAK</span>";
            return packet;
        } else if (frameType == 24) {
            // CAN
            packet.content = "<span class='label " + (process.ref == "RXPacket" ? "label-success'>RX" : "label-important'>TX") + "</span> <span class='label label-important'>CAN</span>";
            return packet;
        }

        // Frame starts with 01
        if (HEX2DEC(bytes[0]) != 1) {
            return;
        }

        packet.length = HEX2DEC(bytes[1]);
        packet.reqType = HEX2DEC(bytes[2]) === 0 ? REQUEST : RESPONSE;
        packet.pktType = HEX2DEC(bytes[3]);
        if (packetTypes[packet.pktType] === undefined) {
            packet.class = "Unknown " + bytes[3] + " (" + packet.pktType + ")";
            setStatus(packet, WARNING);
        } else {
            packet.class = packetTypes[packet.pktType].name;

            if (packetTypes[packet.pktType].processor != null) {
                // Process the frame if we have a processor function
                packet.packet = packetTypes[packet.pktType].processor(node, direction, packet.reqType, bytes.slice(4, -1), packet.length - 4);

                packet.node = packet.packet.node;
                setStatus(packet, packet.packet.result); // Bubble status
                packet.warnFlag = packet.packet.warnFlag;
                packet.warnMessage = packet.packet.warnMessage;
                packet.errorFlag = packet.packet.errorFlag;
                packet.errorMessage = packet.packet.errorMessage;
                packet.txoptions = packet.packet.txoptions;
            }

            // Set the minimum status if we defined it in the packet definition
            if (packetTypes[packet.pktType].result != null) {
                setStatus(packet, packetTypes[packet.pktType].result);
            }
        }

        packet.content = "<span class='label ";
        packet.content += process.ref == "RXPacket" ? "label-success'>RX" : "label-important'>TX";
        packet.content += "</span>";
        packet.content += " <span class='label";
        packet.content += packet.reqType == REQUEST ? " label-warning" : "";
        packet.content += "'>" + packet.reqType + "</span> ";
        packet.content += "<span class='label label-info'>" + packet.class + "</span> ";
        if (packet.packet != null && packet.packet.content != null) {
            packet.content += packet.packet.content;
            packet.expandedContent = packet.packet.expandedContent;
        } else {
            // packet.content += packet.class;
        }

        return packet;
    }

    function logProcessLine(line) {
        if (line == null || line.length === 0) {
            return;
        }

        // Parse the time
        var time = moment(line.substr(0, 23), "YYYY-MM-DD HH:mm:ss.SSS");
        if (time.isValid() === false) {
            time = moment(line.substr(0, 12), "HH:mm:ss.SSS");
        }
        var node = 0;

        logTime = time.valueOf();

        if (timeStart === 0) {
            timeStart = logTime;
        }

        // See if this line includes a node ID
        var nodeOffset = line.indexOf("- NODE ");
        if (nodeOffset !== -1) {
            node = parseInt(line.slice(nodeOffset + 7), 10);
            lastNode = node;
        }

        var log = null;

        processList.forEach(function(process) {
            if (line.indexOf(process.string) != -1) {
                log = {};
                if (process.processor != null) {
                    log = process.processor(node, process, line);
                }
                if (log != null) {
                    log.ref = process.ref;

                    // If the packet provides a node, use it!
                    // if(log.node !== undefined) {
                    // node = log.node;
                    // }

                    if (process.content !== undefined) {
                        log.content = process.content;
                    }
                    if (log.endClassPacket !== undefined && log.endClassPacket.expandedContent !== undefined) {
                        log.expandedContent = log.endClassPacket.expandedContent;
                    }
                    if (process.status !== undefined) {
                        setStatus(log, process.status);
                    }
                }
            }
        });

        if (log != null) {
            // Add node information
            if (log.packet != null && log.packet.node != null) {
                // Use the node from the processed data if there is one
                log.node = log.packet.node;
            } else if (node === 0) {
                // If node is 0, then assume this is the controller
                log.node = 255;
            } else {
                log.node = node;
            }
            if (log.node !== undefined && log.node !== 0 && log.node != 255) {
                log.stage = getNodeInfo(log.node, "Stage");
            }

            log.time = time.format("HH:mm:ss.SSS");
            log.start = time.valueOf();

            return log;
        }

        return null;
    }

    this.loadLogfile = function(file) {
        fileName = file.name;
        var deferred = $q.defer();

        lastPacketRx = null;
        nodeInfoProcessed = false;
        countLines = 0;
        countEntries = 0;
        txQueueLen = 0;
        packetsSent = 0;
        packetsRecv = 0;
        timeStart = 0;

        data = [];
        nodes = [];

        // Check for the various File API support.
        if (window.FileReader) {
            // FileReader are supported.
            getAsText(file);
        } else {
            alert('FileReader is not supported in this browser.');
        }

        return deferred.promise;

        function getAsText(fileToRead) {
            var reader = new FileReader();
            // Read file into memory as UTF-8
            reader.readAsText(fileToRead);
            // Handle errors load
            reader.onload = loadHandler;
            reader.onerror = errorHandler;
        }

        function loadHandler(event) {
            var csv = event.target.result;
            processData(csv);
        }

        function processData(csv) {
            var allTextLines = csv.split(/\r\n|\n/);
            for (var i = 0; i < allTextLines.length; i++) {
                countLines++;
                var d = logProcessLine(allTextLines[i]);
                if (d != null && d.ref != null) {
                    d.id = countEntries++;
                    data.push(d);
                }
            }

            processDeviceInformation();
            deferred.resolve();
        }

        function errorHandler(evt) {
            if (evt.target.error.name == "NotReadableError") {
                alert("Cannot read file !");
            }
        }
    };
}
