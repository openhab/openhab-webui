export const accessories = {
  'AccessoryGroup': [],
  'AirQualitySensor': [
    { label: 'AirQuality', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'NitrogenDioxideDensity', mandatory: false },
    { label: 'OzoneDensity', mandatory: false },
    { label: 'PM25Density', mandatory: false },
    { label: 'PM10Density', mandatory: false },
    { label: 'SulphurDioxideDensity', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'VOCDensity', mandatory: false }
  ],
  'BasicFan': [
    { label: 'OnState', mandatory: true },
    { label: 'RotationDirection', mandatory: false },
    { label: 'RotationSpeed', mandatory: false }
  ],
  'Battery': [
    { label: 'BatteryLevel', mandatory: true },
    { label: 'BatteryLowStatus', mandatory: true },
    { label: 'BatteryChargingState', mandatory: false }
  ],
  'CarbonDioxideSensor': [
    { label: 'CarbonDioxideDetectedState', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'CarbonDioxideLevel', mandatory: false },
    { label: 'CarbonDioxidePeakLevel', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'CarbonMonoxideSensor': [
    { label: 'CarbonMonoxideDetectedState', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'CarbonMonoxideLevel', mandatory: false },
    { label: 'CarbonMonoxidePeakLevel', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'ContactSensor': [
    { label: 'ContactSensorState', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Door': [
    { label: 'CurrentPosition', mandatory: true },
    { label: 'PositionState', mandatory: true },
    { label: 'TargetPosition', mandatory: true },
    { label: 'HoldPosition', mandatory: false },
    { label: 'ObstructionStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Fan': [
    { label: 'ActiveStatus', mandatory: true },
    { label: 'CurrentFanState', mandatory: false },
    { label: 'LockControl', mandatory: false },
    { label: 'RotationDirection', mandatory: false },
    { label: 'RotationSpeed', mandatory: false },
    { label: 'SwingMode', mandatory: false },
    { label: 'TargetFanState', mandatory: false }
  ],
  'Faucet': [
    { label: 'Active', mandatory: true },
    { label: 'FaultStatus', mandatory: false }
  ],
  'Filter': [
    { label: 'FilterChangeIndication', mandatory: true },
    { label: 'FilterLifeLevel', mandatory: false },
    { label: 'FilterResetIndication', mandatory: false }
  ],
  'GarageDoorOpener': [
    { label: 'CurrentDoorState', mandatory: true },
    { label: 'TargetDoorState', mandatory: true },
    { label: 'LockCurrentState', mandatory: false },
    { label: 'LockTargetState', mandatory: false },
    { label: 'ObstructionStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'HeaterCooler': [
    { label: 'ActiveStatus', mandatory: true },
    { label: 'CurrentHeaterCoolerState', mandatory: true },
    { label: 'CurrentTemperature', mandatory: true },
    { label: 'TargetHeaterCoolerState', mandatory: true },
    { label: 'CoolingThresholdTemperature', mandatory: false },
    { label: 'HeatingThresholdTemperature', mandatory: false },
    { label: 'LockControl', mandatory: false },
    { label: 'RotationSpeed', mandatory: false },
    { label: 'SwingMode', mandatory: false }
  ],
  'HumiditySensor': [
    { label: 'RelativeHumidity', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'InputSource': [
    { label: 'ConfiguredName', mandatory: false },
    { label: 'Configured', mandatory: false },
    { label: 'CurrentVisibility', mandatory: false },
    { label: 'Identifier', mandatory: false },
    { label: 'InputDeviceType', mandatory: false },
    { label: 'InputSourceType', mandatory: false },
    { label: 'TargetVisibilityState', mandatory: false }
  ],
  'IrrigationSystem': [
    { label: 'Active', mandatory: true },
    { label: 'InUseStatus', mandatory: true },
    { label: 'ProgramMode', mandatory: true },
    { label: 'FaultStatus', mandatory: false },
    { label: 'RemainingDuration', mandatory: false }
  ],
  'LeakSensor': [
    { label: 'LeakDetectedState', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'LightSensor': [
    { label: 'LightLevel', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Lighting': [
    { label: 'OnState', mandatory: true },
    { label: 'Brightness', mandatory: false },
    { label: 'ColorTemperature', mandatory: false },
    { label: 'Hue', mandatory: false },
    { label: 'Saturation', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Lock': [
    { label: 'LockCurrentState', mandatory: true },
    { label: 'LockTargetState', mandatory: true },
    { label: 'Name', mandatory: false }
  ],
  'Microphone': [
    { label: 'Mute', mandatory: true },
    { label: 'Volume', mandatory: false }
  ],
  'MotionSensor': [
    { label: 'MotionDetectedState', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'OccupancySensor': [
    { label: 'OccupancyDetectedState', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Outlet': [
    { label: 'InUseStatus', mandatory: true },
    { label: 'OnState', mandatory: true },
    { label: 'Name', mandatory: false }
  ],
  'SecuritySystem': [
    { label: 'CurrentSecuritySystemState', mandatory: true },
    { label: 'TargetSecuritySystemState', mandatory: true },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Slat': [
    { label: 'CurrentSlatState', mandatory: true },
    { label: 'CurrentTiltAngle', mandatory: false },
    { label: 'SwingMode', mandatory: false },
    { label: 'TargetTiltAngle', mandatory: false }
  ],
  'SmartSpeaker': [
    { label: 'CurrentMediaState', mandatory: true },
    { label: 'TargetMediaState', mandatory: true },
    { label: 'ConfiguredName', mandatory: false },
    { label: 'Mute', mandatory: false },
    { label: 'Volume', mandatory: false }
  ],
  'SmokeSensor': [
    { label: 'SmokeDetectedState', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Speaker': [
    { label: 'Mute', mandatory: true },
    { label: 'Active', mandatory: false },
    { label: 'Volume', mandatory: false }
  ],
  'StatelessProgrammableSwitch': [
    { label: 'ProgrammableSwitchEvent', mandatory: true }
  ],
  'Switchable': [
    { label: 'OnState', mandatory: true },
    { label: 'Name', mandatory: false }
  ],
  'Television': [
    { label: 'Active', mandatory: true },
    { label: 'ActiveIdentifier', mandatory: false },
    { label: 'Brightness', mandatory: false },
    { label: 'ClosedCaptions', mandatory: false },
    { label: 'ConfiguredName', mandatory: false },
    { label: 'CurrentMediaState', mandatory: false },
    { label: 'PictureMode', mandatory: false },
    { label: 'PowerMode', mandatory: false },
    { label: 'RemoteKey', mandatory: false },
    { label: 'SleepDiscoveryMode', mandatory: false },
    { label: 'TargetMediaState', mandatory: false }
  ],
  'TelevisionSpeaker': [
    { label: 'Mute', mandatory: true },
    { label: 'Active', mandatory: false },
    { label: 'Volume', mandatory: false },
    { label: 'VolumeControlType', mandatory: false },
    { label: 'VolumeSelector', mandatory: false }
  ],
  'TemperatureSensor': [
    { label: 'CurrentTemperature', mandatory: true },
    { label: 'ActiveStatus', mandatory: false },
    { label: 'BatteryLowStatus', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'TamperedStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Thermostat': [
    { label: 'CurrentHeatingCoolingMode', mandatory: true },
    { label: 'CurrentTemperature', mandatory: true },
    { label: 'TargetHeatingCoolingMode', mandatory: true },
    { label: 'TargetTemperature', mandatory: false },
    { label: 'CoolingThresholdTemperature', mandatory: false },
    { label: 'HeatingThresholdTemperature', mandatory: false },
    { label: 'RelativeHumidity', mandatory: false }
  ],
  'Valve': [
    { label: 'ActiveStatus', mandatory: true },
    { label: 'InUseStatus', mandatory: true },
    { label: 'Duration', mandatory: false },
    { label: 'FaultStatus', mandatory: false },
    { label: 'RemainingDuration', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'Window': [
    { label: 'CurrentPosition', mandatory: true },
    { label: 'PositionState', mandatory: true },
    { label: 'TargetPosition', mandatory: true },
    { label: 'HoldPosition', mandatory: false },
    { label: 'ObstructionStatus', mandatory: false },
    { label: 'Name', mandatory: false }
  ],
  'WindowCovering': [
    { label: 'CurrentPosition', mandatory: true },
    { label: 'PositionState', mandatory: true },
    { label: 'TargetPosition', mandatory: true },
    { label: 'CurrentHorizontalTiltAngle', mandatory: false },
    { label: 'CurrentVerticalTiltAngle', mandatory: false },
    { label: 'HoldPosition', mandatory: false },
    { label: 'ObstructionStatus', mandatory: false },
    { label: 'TargetHorizontalTiltAngle', mandatory: false },
    { label: 'TargetVerticalTiltAngle', mandatory: false },
    { label: 'Name', mandatory: false }
  ]
}

export const accessoriesAndCharacteristics = []

for (const a in accessories) {
  accessoriesAndCharacteristics.push(a)
  for (const c of accessories[a]) {
    accessoriesAndCharacteristics.push(a + '.' + c.label)
  }
}

const activeIdentifierParameter = {
  name: 'ActiveIdentifier',
  label: 'Active Input',
  description: 'The input that is currently active (based on its identifier)',
  type: 'INTEGER'
}

const batteryLowThreshold = {
  name: 'lowThreshold',
  label: 'battery low threshold. applicable only for items of type Number',
  type: 'INTEGER'
}

const chargeableParameter = {
  name: 'chargeable',
  label: 'chargeable',
  type: 'TEXT',
  description: 'mark battery as chargeable battery',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'false' },
    { value: 'true', label: 'true' }
  ]
}

const closedCaptionsParameter = {
  name: 'ClosedCaptions',
  label: 'Closed Captions',
  type: 'TEXT',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'Disabled' },
    { value: 'true', label: 'Enabled' }
  ]
}

const configuredParameter = {
  name: 'Configured',
  label: 'Configured',
  type: 'TEXT',
  description: 'If the source is configured on the device. Non-configured inputs will not show up in the Home app.',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'Not Configured' },
    { value: 'true', label: 'Configured' }
  ]
}

const currentVisibilityParameter = {
  name: 'Visibility',
  label: 'Visibility',
  type: 'TEXT',
  description: 'If the source has been hidden by the user',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'Hidden' },
    { value: 'true', label: 'Visible' }
  ]
}

const dimmerFilterType = {
  name: 'dimmerMode',
  label: 'Dimmer Filter Type',
  type: 'TEXT',
  limitToOptions: true,
  options: [
    { value: 'normal', label: 'no filter, all events from iOS home app accepted' },
    { value: 'filterOn', label: 'Filter out "ON" event' },
    { value: 'filterBrightness100', label: 'Filter out "set brightness to 100%" event' },
    { value: 'filterOnExceptBrightness100', label: 'Filter out "ON" events except of combination with "set brightness to 100%"' }
  ]
}

const identifierParameter = {
  name: 'Identifier',
  label: 'Identifier',
  description: 'The identifier of the source, to be used with the ActiveIdentifier characteristic.',
  type: 'INTEGER'
}

const inputDeviceTypeParameter = {
  name: 'InputDeviceType',
  label: 'Device Type',
  type: 'TEXT',
  limitToOptions: true,
  options: [
    { value: 'OTHER', label: 'Other' },
    { value: 'TV', label: 'Television' },
    { value: 'RECORDING', label: 'Recording Device' },
    { value: 'PLAYBACK', label: 'Playback Device' },
    { value: 'AUDIO_SYSTEM', label: 'Audio System' }
  ]
}

const inputSourceTypeParameter = {
  name: 'InputSourceType',
  label: 'Source Type',
  type: 'TEXT',
  limitToOptions: true,
  options: [
    { value: 'OTHER', label: 'Other' },
    { value: 'HOME_SCREEN', label: 'Television\'s built in home screen' },
    { value: 'TUNER', label: 'Tuner' },
    { value: 'HDMI', label: 'HDMI connection' },
    { value: 'COMPOSITE_VIDEO', label: 'Composite video connection' },
    { value: 'S_VIDEO', label: 'S-Video connection' },
    { value: 'COMPONENT_VIDEO', label: 'Component video connection' },
    { value: 'DVI', label: 'DVI connection' },
    { value: 'AIRPLAY', label: 'AirPlay' },
    { value: 'USB', label: 'USB Device' },
    { value: 'APPLICATION', label: 'Application running on the television' }
  ]
}
const instanceParameter = {
  name: 'instance',
  label: 'Instance',
  description: 'HomeKit bridge instance number in case of multiple bridge instances. if unsure, leave empty',
  type: 'INTEGER'
}

const invertedParameter = {
  name: 'inverted',
  label: 'inverted',
  type: 'TEXT',
  description: 'invert the value for HomeKit (default is true)',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'false' },
    { value: 'true', label: 'true' }
  ]
}

const minValue = {
  name: 'minValue',
  label: 'Minimum value for this characteristic',
  type: 'INTEGER'
}

const maxValue = {
  name: 'maxValue',
  label: 'Maximum value for this characteristic',
  type: 'INTEGER'
}

const stepValue = {
  name: 'step',
  label: 'Step value for this characteristic',
  type: 'INTEGER'
}

const sendUpDownForExtentsParameter = {
  name: 'sendUpDownForExtents',
  label: 'Send UP/DOWN For Extents',
  type: 'TEXT',
  description: 'Send UP/DOWN to the item instead of 0/100% (default false)',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'false' },
    { value: 'true', label: 'true' }
  ]
}

const sleepDiscoveryModeParameter = {
  name: 'SleepDiscoveryMode',
  label: 'Discoverability',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'Not discoverable in standby' },
    { value: 'true', label: 'Always discoverable' }
  ]
}

const stopParameter = {
  name: 'stop',
  label: 'Emulate Position State',
  type: 'TEXT',
  description: 'Emulate opening/closing state (default false)',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'false' },
    { value: 'true', label: 'true' }
  ]
}

const stopSameDirectionParameter = {
  name: 'stopSameDirection',
  label: 'Emulate Stop Command',
  type: 'TEXT',
  description: 'Send a STOP command to the item if Home sends 100% or 0% while moving (default false)',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'false' },
    { value: 'true', label: 'true' }
  ]
}
const valveDefaultDuration = {
  name: 'homekitDefaultDuration',
  label: 'Default Duration',
  type: 'INTEGER'
}

const valveTimerParameter = {
  name: 'homekitTimer',
  label: 'Timer',
  type: 'TEXT',
  limitToOptions: true,
  options: [
    { value: 'false', label: 'false' },
    { value: 'true', label: 'true' }
  ]
}

const valveTypeParameter = {
  name: 'homekitValveType',
  label: 'Valve Type',
  type: 'TEXT',
  limitToOptions: true,
  options: [
    { value: 'Generic', label: 'Generic' },
    { value: 'Irrigation', label: 'Irrigation' },
    { value: 'Shower', label: 'Shower' },
    { value: 'Faucet', label: 'Faucet' }
  ]
}

const volumeControlTypeParameter = {
  name: 'VolumeControlType',
  label: 'Volume Control Type',
  type: 'TEXT',
  limitToOptions: true,
  options: [
    { value: 'NONE', label: 'Status only; no control' },
    { value: 'RELATIVE', label: 'INCREMENT/DECREMENT only; no status' },
    { value: 'RELATIVE_WITH_CURRENT', label: 'INCREMENT/DECREMENT only with status' },
    { value: 'ABSOLUTE', label: 'Direct status and control' }
  ]
}

const m = (name, type, label, description) => {
  return {
    name,
    type,
    label,
    description
  }
}

const activeEnum = [
  m('INACTIVE', 'TEXT', 'INACTIVE', 'Value for OFF'),
  m('ACTIVE', 'TEXT', 'ACTIVE', 'Value for ON')
]

const airQualityEnum = [
  m('UNKNOWN', 'TEXT', 'UNKNOWN', 'Value for air quality "unknown"'),
  m('EXCELLENT', 'TEXT', 'EXCELLENT', 'Value for air quality "excellent"'),
  m('GOOD', 'TEXT', 'GOOD', 'Value for air quality "good"'),
  m('FAIR', 'TEXT', 'FAIR', 'Value for air quality "fair"'),
  m('INFERIOR', 'TEXT', 'INFERIOR', 'Value for air quality "inferior"'),
  m('POOR', 'TEXT', 'POOR', 'Value for air quality "poor"')
]

const contactSensorStateEnum = [
  m('DETECTED', 'TEXT', 'DETECTED', 'Value for contact detected (closed)'),
  m('NOT_DETECTED', 'TEXT', 'NOT_DETECTED', 'Value for contact not detected (open)')
]

const currentDoorStateEnum = [
  m('OPEN', 'TEXT', 'OPEN', 'Value for the door is fully open'),
  m('CLOSED', 'TEXT', 'CLOSED', 'Value for the door is fully closed'),
  m('OPENING', 'TEXT', 'OPENING', 'Value for the door is opening'),
  m('CLOSING', 'TEXT', 'CLOSING', 'Value for the door is closing'),
  m('STOPPED', 'TEXT', 'STOPPED', 'Value for the door is partially open and stopped')
]

const currentFanStateEnum = [
  m('INACTIVE', 'TEXT', 'INACTIVE', 'Value for inactive (turned off)'),
  m('IDLE', 'TEXT', 'IDLE', 'Value for idle (turned on, but not blowing)'),
  m('BLOWING_AIR', 'TEXT', 'BLOWING_AIR', 'Value for actively blowing air')
]

const currentMediaStateEnum = [
  m('PLAY', 'TEXT', 'PLAY', 'Value for media playing'),
  m('PAUSE', 'TEXT', 'PAUSE', 'Value for media pause'),
  m('STOP', 'TEXT', 'STOP', 'Value for media stopped'),
  m('UNKOWN', 'TEXT', 'UNKOWN', 'Value for unknown media state')
]

const currentSlatStateEnum = [
  m('FIXED', 'TEXT', 'FIXED', 'Value for slats not moving'),
  m('JAMMED', 'TEXT', 'JAMMED', 'Value for slats jammed'),
  m('SWINGING', 'TEXT', 'SWINGING', 'Value for slats swinging')
]

const faultStatusEnum = [
  m('NO_FAULT', 'TEXT', 'NO_FAULT', 'Value for no fault'),
  m('GENERAL_FAULT', 'TEXT', 'GENERAL_FAULT', 'Value for fault present')
]

const filterChangeIndicationEnum = [
  m('NO_CHANGE_NEEDED', 'TEXT', 'NO_CHANGE_NEEDED', 'Value for filter is healthy'),
  m('CHANGE_NEEDED', 'TEXT', 'CHANGE_NEEDED', 'Value for filter needs replaced')
]

const leakDetectedEnum = [
  m('LEAK_NOT_DETECTED', 'TEXT', 'LEAK_NOT_DETECTED', 'Value for no leak detected'),
  m('LEAK_DETECTED', 'TEXT', 'LEAK_DETECTED', 'Value for leak detected')
]

const lockControlEnum = [
  m('CONTROL_LOCK_DISABLED', 'TEXT', 'CONTROL_LOCK_DISABLED', 'Value for controls unlocked'),
  m('CONTROL_LOCK_ENABLED', 'TEXT', 'CONTROL_LOCK_ENABLED', 'Value for controls locked')
]
const lockCurrentStateEnum = [
  m('UNSECURED', 'TEXT', 'UNSECURED', 'Value for unsecured (unlocked)'),
  m('SECURED', 'TEXT', 'SECURED', 'Value for secured (locked)'),
  m('JAMMED', 'TEXT', 'JAMMED', 'Value for jammed'),
  m('UNKNOWN', 'TEXT', 'UNKNOWN', 'Value for unknown state')
]

const lockTargetStateEnum = [
  m('UNSECURED', 'TEXT', 'UNSECURED', 'Value for unsecure (unlock)'),
  m('SECURED', 'TEXT', 'SECURED', 'Value for secure (lock)')
]

const occupancyDetectedEnum = [
  m('NOT_DETECTED', 'TEXT', 'NOT_DETECTED', 'Value for unoccupied'),
  m('DETECTED', 'TEXT', 'DETECTED', 'Value for occupied')
]

const pollutantDetectedEnum = [
  m('NORMAL', 'TEXT', 'NORMAL', 'Value for acceptable pollutant levels detected'),
  m('ABNORMAL', 'TEXT', 'ABNORMAL', 'Value for abnormal pollutant levels detected')
]

const positionStateEnum = [
  m('DECREASING', 'TEXT', 'DECREASING', 'Value for decreasing (closing) state'),
  m('INCREASING', 'TEXT', 'INCREASING', 'Value for increasing (opening) state'),
  m('STOPPED', 'TEXT', 'STOPPED', 'Value for stopped state')
]

const rotationDirectionEnum = [
  m('CLOCKWISE', 'TEXT', 'CLOCKWISE', 'Value for clockwise rotation'),
  m('COUNTER_CLOCKWISE', 'TEXT', 'COUNTER_CLOCKWISE', 'Value for counter-clockwise rotation')
]

const swingModeEnum = [
  m('SWING_DISABLED', 'TEXT', 'SWING_DISABLED', 'Value for swing disabled'),
  m('SWING_ENABLED', 'TEXT', 'SWING_ENABLED', 'Value for swing enabled')
]

const tamperedStatusEnum = [
  m('NOT_TAMPERED', 'TEXT', 'NOT_TAMPERED', 'Value for not tampered'),
  m('TAMPERED', 'TEXT', 'TAMPERED', 'Value for tampered')
]

const targetDoorStateEnum = [
  m('OPEN', 'TEXT', 'OPEN', 'Value to open the door'),
  m('CLOSED', 'TEXT', 'CLOSED', 'Value to close the door')
]

const targetMediaStateEnum = [
  m('PLAY', 'TEXT', 'PLAY', 'Value to play media'),
  m('PAUSE', 'TEXT', 'PAUSE', 'Value to pause media'),
  m('STOP', 'TEXT', 'STOP', 'Value to stop media')
]

export const homekitParameters = {
  'AccessoryGroup': [instanceParameter],
  'AirQualitySensor': [instanceParameter].concat(airQualityEnum),
  'AirQualitySensor.AirQuality': airQualityEnum,
  'AirQualitySensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'AirQualitySensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'AirQualitySensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'AirQualitySensor.VOCDensity': [minValue, maxValue, stepValue],
  'BasicFan': [instanceParameter, invertedParameter],
  'BasicFan.RotationDirection': rotationDirectionEnum,
  'Battery': [instanceParameter, chargeableParameter],
  'Battery.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'CarbonDioxideSensor': [instanceParameter, invertedParameter].concat(pollutantDetectedEnum),
  'CarbonDioxideSensor.CarbonDioxideDetectedState': [invertedParameter].concat(pollutantDetectedEnum),
  'CarbonDioxideSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'CarbonDioxideSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'CarbonDioxideSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'CarbonMonoxideSensor': [instanceParameter, invertedParameter].concat(pollutantDetectedEnum),
  'CarbonMonoxideSensor.CarbonMonoxideDetectedState': [invertedParameter].concat(pollutantDetectedEnum),
  'CarbonMonoxideSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'CarbonMonoxideSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'CarbonMonoxideSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'ContactSensor': [instanceParameter, invertedParameter].concat(contactSensorStateEnum),
  'ContactSensor.ContactSensorState': [invertedParameter].concat(contactSensorStateEnum),
  'ContactSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'ContactSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'ContactSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'Door': [instanceParameter, invertedParameter, stopParameter, stopSameDirectionParameter, sendUpDownForExtentsParameter],
  'Door.PositionState': positionStateEnum,
  'Fan': [instanceParameter],
  'Fan.CurrentFanState': currentFanStateEnum,
  'Fan.LockControl': [invertedParameter].concat(lockControlEnum),
  'Fan.RotationDirection': [invertedParameter].concat(rotationDirectionEnum),
  'Fan.SwingMode': [invertedParameter].concat(swingModeEnum),
  'Fan.TargetFanState': [invertedParameter,
    m('MANUAL', 'TEXT', 'MANUAL', 'Value for manual (continuously blowing) fan control'),
    m('AUTO', 'TEXT', 'AUTO', 'Value for automatic fan control')
  ],
  'Faucet': [instanceParameter, invertedParameter],
  'Faucet.Active': [invertedParameter],
  'Faucet.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'Filter': [instanceParameter, invertedParameter].concat(filterChangeIndicationEnum),
  'Filter.FilterCHangeIndication': [invertedParameter].concat(filterChangeIndicationEnum),
  'GarageDoorOpener': [instanceParameter, invertedParameter].concat(currentDoorStateEnum),
  'GarageDoorOpener.CurrentDoorState': [invertedParameter].concat(currentDoorStateEnum),
  'GarageDoorOpener.TargetDoorState': [invertedParameter].concat(targetDoorStateEnum),
  'HeaterCooler': [instanceParameter],
  'HeaterCooler.CurrentHeaterCoolerState': [
    m('INACTIVE', 'TEXT', 'INACTIVE', 'Value for the heater/cooler is disabled'),
    m('IDLE', 'TEXT', 'IDLE', 'Value for the heater/cooler is enabled, but idle'),
    m('HEATING', 'TEXT', 'HEATING', 'Value for actively heating'),
    m('COOLER', 'TEXT', 'COOLER', 'Value for actively cooling')
  ],
  'HeaterCooler.CurrentTemperature': [minValue, maxValue, stepValue],
  'HeaterCooler.TargetHeaterCoolerState': [
    m('AUTO', 'TEXT', 'AUTO', 'Value for requesting heating/cooling to maintain the target temperature'),
    m('HEAT', 'TEXT', 'HEAT', 'Value for requesting heating only'),
    m('COOL', 'TEXT', 'COOL', 'Value for requesting cooling only')
  ],
  'HeaterCooler.CoolingThresholdTemperature': [minValue, maxValue, stepValue],
  'HeaterCooler.HeatingThresholdTemperature': [minValue, maxValue, stepValue],
  'HeaterCooler.LockControl': [invertedParameter].concat(lockControlEnum),
  'HeaterCooler.SwingMode': [invertedParameter].concat(swingModeEnum),
  'HumiditySensor': [instanceParameter],
  'HumiditySensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'HumiditySensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'HumiditySensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'InputSource': [configuredParameter, currentVisibilityParameter, identifierParameter, inputDeviceTypeParameter, inputSourceTypeParameter],
  'InputSource.CurrentVisibility': [invertedParameter,
    m('SHOWN', 'TEXT', 'SHOWN', 'Value for input is visible/enabled'),
    m('HIDDEN', 'TEXT', 'HIDDEN', 'Value for input is hidden/disabled')
  ],
  'InputSource.InputDeviceType': [
    m('OTHER', 'TEXT', 'OTHER', 'Value for other device type'),
    m('TV', 'TEXT', 'TV', 'Value for television'),
    m('RECORDING', 'TEXT', 'RECORDING', 'Value for recording device'),
    m('PLAYBACK', 'TEXT', 'PLAYBACK', 'Value for playback device'),
    m('AUDIO_SYSTEM', 'TEXT', 'AUDIO_SYSTEM', 'Value for audio only device')
  ],
  'InputSource.InputSourceType': [
    m('OTHER', 'TEXT', 'OTHER', 'Value for other connection type'),
    m('HOME_SCREEN', 'TEXT', 'HOME_SCREEN', 'Value for television\'s built in home screen'),
    m('TUNER', 'TEXT', 'TUNER', 'Value for tuner'),
    m('HDMI', 'TEXT', 'HDMI', 'Value for HDMI connection'),
    m('COMPOSITE_VIDEO', 'TEXT', 'COMPOSITE_VIDEO', 'Value for composite video connection'),
    m('S_VIDEO', 'TEXT', 'S_VIDEO', 'Value for S-Video connection'),
    m('COMPONENT_VIDEO', 'TEXT', 'COMPONENT_VIDEO', 'Value for component video connection'),
    m('DVI', 'TEXT', 'DVI', 'Value for DVI connection'),
    m('AIRPLAY', 'TEXT', 'AIRPLAY', 'Value for AirPlay'),
    m('USB', 'TEXT', 'USB', 'Value for USB device'),
    m('APPLICATION', 'TEXT', 'APPLICATION', 'Value for application running on the television')
  ],
  'InputSource.TargetVisibilityState': [invertedParameter,
    m('SHOWN', 'TEXT', 'SHOWN', 'Value for requesting input shown'),
    m('HIDDEN', 'TEXT', 'HIDDEN', 'Value for requesting input hidden')
  ],
  'IrrigationSystem': [instanceParameter],
  'IrrigationSystem.Active': [invertedParameter,
    m('INACTIVE', 'TEXT', 'INACTIVE', 'Value for irrigation system disabled'),
    m('ACTIVE', 'TEXT', 'ACTIVE', 'Value for irrigation system enabled')
  ],
  'IrrigationSystem.InUseState': [invertedParameter,
    m('NOT_IN_USE', 'TEXT', 'NOT_IN_USE', 'Value for irrigation system is idle'),
    m('IN_USE', 'TEXT', 'IN_USE', 'Value for any part of irrigation system is running')
  ],
  'IrrigationSystem.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'LeakSensor': [instanceParameter, invertedParameter].concat(leakDetectedEnum),
  'LeakSensor.LeakDetectedState': [invertedParameter].concat(leakDetectedEnum),
  'LeakSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'LeakSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'LeakSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'Lighting': [instanceParameter],
  'Lighting.Brightness': [minValue, maxValue, dimmerFilterType],
  'Lighting.ColorTemperature': [minValue, maxValue, invertedParameter],
  'LightSensor': [instanceParameter, minValue, maxValue],
  'LightSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'LightSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'LightSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'Lock': [instanceParameter, invertedParameter].concat(lockCurrentStateEnum),
  'Lock.LockCurrentState': [invertedParameter].concat(lockCurrentStateEnum),
  'Lock.LockTargetState': [invertedParameter].concat(lockTargetStateEnum),
  'Microphone': [instanceParameter, invertedParameter],
  'Microphone.Mute': [invertedParameter],
  'MotionSensor': [instanceParameter, invertedParameter],
  'MotionSensor.MotionDetectedState': [invertedParameter],
  'MotionSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'MotionSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'MotionSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'OccupancySensor': [instanceParameter, invertedParameter].concat(occupancyDetectedEnum),
  'OccupancySensor.OccupancyDetectedState': [invertedParameter].concat(occupancyDetectedEnum),
  'OccupancySensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'OccupancySensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'OccupancySensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'Outlet': [instanceParameter],
  'Outlet.InUseState': [invertedParameter],
  'SecuritySystem': [instanceParameter],
  'SecuritySystem.CurrentSecuritySystemState': [
    m('STAY_ARM', 'TEXT', 'STAY_ARM', 'Value for security state "stay arm"'),
    m('AWAY_ARM', 'TEXT', 'AWAY_ARM', 'Value for security state "arm away"'),
    m('NIGHT_ARM', 'TEXT', 'NIGHT_ARM', 'Value for security state "night arm"'),
    m('DISARMED', 'TEXT', 'DISARMED', 'Value for security state "disarmed"'),
    m('TRIGGERED', 'TEXT', 'TRIGGERED', 'Value for security state "alarm triggered"')
  ],
  'SecuritySystem.TargetSecuritySystemState': [
    m('STAY_ARM', 'TEXT', 'STAY_ARM', 'Value for security state "stay arm"'),
    m('AWAY_ARM', 'TEXT', 'AWAY_ARM', 'Value for security state "arm away"'),
    m('NIGHT_ARM', 'TEXT', 'NIGHT_ARM', 'Value for security state "night arm"'),
    m('DISARM', 'TEXT', 'DISARM', 'Value for security state "disarm"')
  ],
  'SecuritySystem.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'SecuritySystem.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'Slat': [instanceParameter].concat(currentSlatStateEnum),
  'Slat.CurrentSlateState': currentSlatStateEnum,
  'Slat.SwingMode': [invertedParameter].concat(swingModeEnum),
  'SmartSpeaker': [instanceParameter].concat(currentMediaStateEnum),
  'SmartSpeaker.CurrentMediaState': currentMediaStateEnum,
  'SmartSpeaker.TargetMediaState': targetMediaStateEnum,
  'SmartSpeaker.Mute': [invertedParameter],
  'SmokeSensor': [instanceParameter, invertedParameter].concat(pollutantDetectedEnum),
  'SmokeSensor.SmokeDetectedState': [invertedParameter].concat(pollutantDetectedEnum),
  'SmokeSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'SmokeSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'SmokeSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'Speaker': [instanceParameter, invertedParameter],
  'Speaker.Mute': [invertedParameter],
  'Speaker/Active': [invertedParameter].concat(activeEnum),
  'StatelessProgrammableSwitch': [instanceParameter],
  'Television': [instanceParameter, invertedParameter, activeIdentifierParameter, closedCaptionsParameter, sleepDiscoveryModeParameter].concat(activeEnum),
  'Television.Active': [invertedParameter].concat(activeEnum),
  'Television.ClosedCaptions': [invertedParameter].concat(activeEnum),
  'Television.CurrentMediaState': currentMediaStateEnum,
  'Television.PictureMode': [
    m('OTHER', 'TEXT', 'OTHER', 'Value for other'),
    m('STANDARD', 'TEXT', 'STANDARD', 'Value for standard'),
    m('CALIBRATED', 'TEXT', 'CALIBRATED', 'Value for calibrated'),
    m('CALIBRATED_DARK', 'TEXT', 'CALIBRATED_DARK', 'Value for calibrated for a dark room'),
    m('VIVID', 'TEXT', 'VIVID', 'Value for vivid'),
    m('GAME', 'TEXT', 'GAME', 'Value for faming'),
    m('COMPUTER', 'TEXT', 'COMPUTER', 'Value for computer'),
    m('CUSTOM', 'TEXT', 'CUSTOM', 'Value for custom')
  ],
  'Television.PowerMode': [invertedParameter,
    m('SHOW', 'TEXT', 'SHOW', 'Show the television\'s menu'),
    m('HIDE', 'TEXT', 'HIDE', 'hide the television\'s menu')
  ],
  'Television.SleepDiscoveryMode': [invertedParameter,
    m('NOT_DISCOVERABLE', 'TEXT', 'NOT_DISCOVERABLE', 'Value to disable discovery while in standby'),
    m('ALWAYS_DISCOVERABLE', 'TEXT', 'ALWAYS_DISCOVERABLE', 'Value to enable discovery even if in standby')
  ],
  'Television.TargetMediaState': targetMediaStateEnum,
  'TelevisionSpeaker': [invertedParameter, volumeControlTypeParameter],
  'TelevisionSpeaker.Mute': [invertedParameter],
  'TelevisionSpeaker.Active': [invertedParameter].concat(activeEnum),
  'TelevisionSpeaker.VolumeControlType': [
    m('NONE', 'TEXT', 'NONE', 'Value for status only; no control'),
    m('RELATIVE', 'TEXT', 'RELATIVE', 'Value for INCREMENT/DECREMENT only; no status'),
    m('RELATIVE_WITH_CURRENT', 'TEXT', 'RELATIVE_WITH_CURRENT', 'Value for INCREMENT/DECREMENT only with status'),
    m('ABSOLUTE', 'TEXT', 'ABSOLUTE', 'Value for direct status and control')
  ],
  'TemperatureSensor': [instanceParameter, minValue, maxValue, stepValue],
  'TemperatureSensor.CurrentTemperature': [instanceParameter, minValue, maxValue, stepValue],
  'TemperatureSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'TemperatureSensor.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'TemperatureSensor.TamperedStatus': [invertedParameter].concat(tamperedStatusEnum),
  'Thermostat': [instanceParameter],
  'Thermostat.CurrentHeatingCoolingMode': [
    m('OFF', 'TEXT', 'OFF', 'Value for thermostate idle'),
    m('HEAT', 'TEXT', 'HEAT', 'Value for thermostat actively heating'),
    m('COOL', 'TEXT', 'COOL', 'Value for thermostat actively cooling')
  ],
  'Thermostat.CurrentTemperature': [minValue, maxValue, stepValue],
  'Thermostat.TargetTemperature': [minValue, maxValue, stepValue],
  'Thermostat.TargetHeatingCoolingMode': [
    m('OFF', 'TEXT', 'OFF', 'Value for disabling the thermostat'),
    m('HEAT', 'TEXT', 'HEAT', 'Value for requesting heating only'),
    m('COOL', 'TEXT', 'COOL', 'Value for requesting cooling only'),
    m('AUTO', 'TEXT', 'AUTO', 'Value for requesting thermostat to maintain the target temperature')
  ],
  'Thermostat.CoolingThresholdTemperature': [minValue, maxValue, stepValue],
  'Thermostat.HeatingThresholdTemperature': [minValue, maxValue, stepValue],
  'Valve': [instanceParameter, valveTypeParameter, valveTimerParameter, valveDefaultDuration],
  'Valve.ActiveStatus': activeEnum,
  'Valve.InUseStatus': [invertedParameter].concat(activeEnum),
  'Valve.FaultStatus': [invertedParameter].concat(faultStatusEnum),
  'Window': [instanceParameter, invertedParameter, stopParameter, stopSameDirectionParameter, sendUpDownForExtentsParameter],
  'Window.PositionState': positionStateEnum,
  'WindowCovering': [instanceParameter, invertedParameter, stopParameter, stopSameDirectionParameter, sendUpDownForExtentsParameter],
  'WindowCovering.PositionState': positionStateEnum
}
