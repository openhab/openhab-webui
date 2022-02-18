export const accessories = {
  'AirQualitySensor': [
    { label: 'AirQuality', mandatory: true},
    { label: 'OzoneDensity', mandatory: false},
    { label: 'NitrogenDioxideDensity', mandatory: false},
    { label: 'SulphurDioxideDensity', mandatory: false},
    { label: 'PM25Density', mandatory: false},
    { label: 'PM10Density', mandatory: false},
    { label: 'VOCDensity', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'LeakSensor': [
    { label: 'LeakDetectedState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'MotionSensor': [
    { label: 'MotionDetectedState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'OccupancySensor': [
    { label: 'OccupancyDetectedState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'ContactSensor': [
    { label: 'ContactSensorState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'SmokeSensor': [
    { label: 'SmokeDetectedState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'LightSensor': [
    { label: 'LightLevel', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'HumiditySensor': [
    { label: 'RelativeHumidity', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'TemperatureSensor': [
    { label: 'CurrentTemperature', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'CarbonDioxideSensor': [
    { label: 'CarbonDioxideDetectedState', mandatory: true},
    { label: 'CarbonDioxideLevel', mandatory: false},
    { label: 'CarbonDioxidePeakLevel', mandatory: false},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'CarbonMonoxideSensor': [
    { label: 'CarbonMonoxideDetectedState', mandatory: true},
    { label: 'CarbonMonoxideLevel', mandatory: false},
    { label: 'CarbonMonoxidePeakLevel', mandatory: false},
    { label: 'Name', mandatory: false},
    { label: 'ActiveStatus', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false},
    { label: 'BatteryLowStatus', mandatory: false}
  ],
  'Door': [
    { label: 'CurrentPosition', mandatory: true},
    { label: 'TargetPosition', mandatory: true},
    { label: 'PositionState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'HoldPosition', mandatory: false},
    { label: 'ObstructionStatus', mandatory: false}
  ],
  'Window': [
    { label: 'CurrentPosition', mandatory: true},
    { label: 'TargetPosition', mandatory: true},
    { label: 'PositionState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'HoldPosition', mandatory: false},
    { label: 'ObstructionStatus', mandatory: false}
  ],
  'WindowCovering': [
    { label: 'CurrentPosition', mandatory: true},
    { label: 'TargetPosition', mandatory: true},
    { label: 'PositionState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'HoldPosition', mandatory: false},
    { label: 'ObstructionStatus', mandatory: false},
    { label: 'CurrentHorizontalTiltAngle', mandatory: false},
    { label: 'TargetHorizontalTiltAngle', mandatory: false},
    { label: 'CurrentVerticalTiltAngle', mandatory: false},
    { label: 'TargetVerticalTiltAngle', mandatory: false}
  ],
  'Switchable': [
    { label: 'OnState', mandatory: true},
    { label: 'Name', mandatory: false}
  ],
  'Outlet': [
    { label: 'OnState', mandatory: true},
    { label: 'InUseStatus', mandatory: true},
    { label: 'Name', mandatory: false}
  ],
  'Lighting': [
    { label: 'OnState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'Hue', mandatory: false},
    { label: 'Saturation', mandatory: false},
    { label: 'Brightness', mandatory: false},
    { label: 'ColorTemperature', mandatory: false}
  ],
  'Fan': [
    { label: 'ActiveStatus', mandatory: true},
    { label: 'CurrentFanState', mandatory: false},
    { label: 'TargetFanState', mandatory: false},
    { label: 'RotationDirection', mandatory: false},
    { label: 'RotationSpeed', mandatory: false},
    { label: 'SwingMode', mandatory: false},
    { label: 'LockControl', mandatory: false}
  ],
  'Thermostat': [
    { label: 'CurrentTemperature', mandatory: true},
    { label: 'TargetTemperature', mandatory: true},
    { label: 'CurrentHeatingCoolingMode', mandatory: true},
    { label: 'TargetHeatingCoolingMode', mandatory: true},
    { label: 'CoolingThresholdTemperature', mandatory: false},
    { label: 'HeatingThresholdTemperature', mandatory: false}
  ],
  'HeaterCooler': [
    { label: 'ActiveStatus', mandatory: true},
    { label: 'CurrentTemperature', mandatory: true},
    { label: 'CurrentHeaterCoolerState', mandatory: true},
    { label: 'TargetHeaterCoolerState', mandatory: true},
    { label: 'CoolingThresholdTemperature', mandatory: false},
    { label: 'HeatingThresholdTemperature', mandatory: false},
    { label: 'RotationSpeed', mandatory: false},
    { label: 'SwingMode', mandatory: false},
    { label: 'LockControl', mandatory: false}
  ],
  'Lock': [
    { label: 'LockCurrentState', mandatory: true},
    { label: 'LockTargetState', mandatory: true},
    { label: 'Name', mandatory: false}
  ],
  'Valve': [
    { label: 'ActiveStatus', mandatory: true},
    { label: 'InUseStatus', mandatory: true},
    { label: 'Duration', mandatory: false},
    { label: 'RemainingDuration', mandatory: false},
    { label: 'Name', mandatory: false},
    { label: 'FaultStatus', mandatory: false}
  ],
  'SecuritySystem': [
    { label: 'CurrentSecuritySystemState', mandatory: true},
    { label: 'TargetSecuritySystemState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'FaultStatus', mandatory: false},
    { label: 'TamperedStatus', mandatory: false}
  ],
  'GarageDoorOpener': [
    { label: 'ObstructionStatus', mandatory: true},
    { label: 'CurrentDoorState', mandatory: true},
    { label: 'TargetDoorState', mandatory: true},
    { label: 'Name', mandatory: false},
    { label: 'LockCurrentState', mandatory: false},
    { label: 'LockTargetState', mandatory: false}
  ]
}

export const accessoriesAndCharacteristics = []

for (const a in accessories) {
  accessoriesAndCharacteristics.push(a)
  for (const c of accessories[a]) {
    accessoriesAndCharacteristics.push(a + '.' + c.label)
  }
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

const valveDefaultDuration = {
  name: 'homekitDefaultDuration',
  label: 'Default Duration',
  type: 'INTEGER'
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

const m = (name, type, label, description) => {
  return {
    name,
    type,
    label,
    description
  }
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

export const homekitParameters = {
  'Valve': [valveTypeParameter, valveTimerParameter, valveDefaultDuration],
  'Lighting.Brightness': [minValue, maxValue, dimmerFilterType],
  'TemperatureSensor.CurrentTemperature': [minValue, maxValue],
  'LeakSensor': [invertedParameter],
  'LeakSensor.LeakDetectedState': [invertedParameter],
  'MotionSensor': [invertedParameter],
  'MotionSensor.MotionDetectedState': [invertedParameter],
  'OccupancySensor': [invertedParameter],
  'OccupancySensor.OccupancyDetectedState': [invertedParameter],
  'ContactSensor': [invertedParameter],
  'ContactSensor.ContactSensorState': [invertedParameter],
  'SmokeSensor': [invertedParameter],
  'SmokeSensor.SmokeDetectedState': [invertedParameter],
  'CarbonDioxideSensor': [invertedParameter],
  'CarbonDioxideSensor.CarbonDioxideDetectedState': [invertedParameter],
  'CarbonMonoxideSensor': [invertedParameter],
  'CarbonMonoxideSensor.CarbonMonoxideDetectedState': [invertedParameter],
  'Window': [invertedParameter],
  'Door': [invertedParameter],
  'WindowCovering': [invertedParameter],
  'Thermostat.CurrentTemperature': [minValue, maxValue, stepValue],
  'Thermostat.TargetTemperature': [minValue, maxValue, stepValue],
  'Thermostat.CoolingThresholdTemperature': [minValue, maxValue, stepValue],
  'Thermostat.HeatingThresholdTemperature': [minValue, maxValue, stepValue],
  'Thermostat.CurrentHeatingCoolingMode': [
    m('OFF', 'TEXT', 'OFF', 'Value for thermostat mode "off"'),
    m('HEAT', 'TEXT', 'HEAT', 'Value for thermostat mode "heat"'),
    m('COOL', 'TEXT', 'COOL', 'Value for thermostat mode "cool"')
  ],
  'Thermostat.TargetHeatingCoolingMode': [
    m('OFF', 'TEXT', 'OFF', 'Value for thermostat mode "off"'),
    m('HEAT', 'TEXT', 'HEAT', 'Value for thermostat mode "heat"'),
    m('COOL', 'TEXT', 'COOL', 'Value for thermostat mode "cool"'),
    m('AUTO', 'TEXT', 'AUTO', 'Value for thermostat mode "auto"')
  ],
  'AirQualitySensor.AirQuality': [
    m('UNKNOWN', 'TEXT', 'UNKNOWN', 'Value for air quality "unknown"'),
    m('EXCELLENT', 'TEXT', 'EXCELLENT', 'Value for air quality "excellent"'),
    m('GOOD', 'TEXT', 'GOOD', 'Value for air quality "good"'),
    m('FAIR', 'TEXT', 'FAIR', 'Value for air quality "fair"'),
    m('INFERIOR', 'TEXT', 'INFERIOR', 'Value for air quality "inferior"'),
    m('POOR', 'TEXT', 'POOR', 'Value for air quality "poor"')
  ],
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
  ]
}
