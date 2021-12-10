const accessories = {
  'AirQualitySensor': [
    'AirQuality',
    'OzoneDensity',
    'NitrogenDioxideDensity',
    'SulphurDioxideDensity',
    'PM25Density',
    'PM10Density',
    'VOCDensity',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'LeakSensor': [
    'LeakDetectedState',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'MotionSensor': [
    'MotionDetectedState',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'OccupancySensor': [
    'OccupancyDetectedState',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'ContactSensor': [
    'ContactSensorState',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'SmokeSensor': [
    'SmokeDetectedState',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'LightSensor': [
    'LightLevel',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'HumiditySensor': [
    'RelativeHumidity',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'TemperatureSensor': [
    'CurrentTemperature',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'CarbonDioxideSensor': [
    'CarbonDioxideDetectedState',
    'CarbonDioxideLevel',
    'CarbonDioxidePeakLevel',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'CarbonMonoxideSensor': [
    'CarbonMonoxideDetectedState',
    'CarbonMonoxideLevel',
    'CarbonMonoxidePeakLevel',
    'Name',
    'ActiveStatus',
    'FaultStatus',
    'TamperedStatus',
    'BatteryLowStatus'
  ],
  'Door': [
    'CurrentPosition',
    'TargetPosition',
    'PositionState',
    'Name',
    'HoldPosition',
    'ObstructionStatus'
  ],
  'Window': [
    'CurrentPosition',
    'TargetPosition',
    'PositionState',
    'Name',
    'HoldPosition',
    'ObstructionStatus'
  ],
  'WindowCovering': [
    'CurrentPosition',
    'TargetPosition',
    'PositionState',
    'Name',
    'HoldPosition',
    'ObstructionStatus',
    'CurrentHorizontalTiltAngle',
    'TargetHorizontalTiltAngle',
    'CurrentVerticalTiltAngle',
    'TargetVerticalTiltAngle'
  ],
  'Switchable': [
    'OnState',
    'Name'
  ],
  'Outlet': [
    'OnState',
    'InUseStatus',
    'Name'
  ],
  'Lighting': [
    'OnState',
    'Name',
    'Hue',
    'Saturation',
    'Brightness',
    'ColorTemperature'
  ],
  'Fan': [
    'ActiveStatus',
    'CurrentFanState',
    'TargetFanState',
    'RotationDirection',
    'RotationSpeed',
    'SwingMode',
    'LockControl'
  ],
  'Thermostat': [
    'CurrentTemperature',
    'TargetTemperature',
    'CurrentHeatingCoolingMode',
    'TargetHeatingCoolingMode',
    'CoolingThresholdTemperature',
    'HeatingThresholdTemperature'
  ],
  'HeaterCooler': [
    'ActiveStatus',
    'CurrentTemperature',
    'CurrentHeaterCoolerState',
    'TargetHeaterCoolerState',
    'CoolingThresholdTemperature',
    'HeatingThresholdTemperature',
    'RotationSpeed',
    'SwingMode',
    'LockControl'
  ],
  'Lock': [
    'LockCurrentState',
    'LockTargetState',
    'Name'
  ],
  'Valve': [
    'ActiveStatus',
    'InUseStatus',
    'Duration',
    'RemainingDuration',
    'Name',
    'FaultStatus'
  ],
  'SecuritySystem': [
    'CurrentSecuritySystemState',
    'TargetSecuritySystemState',
    'Name',
    'FaultStatus',
    'TamperedStatus'
  ],
  'GarageDoorOpener': [
    'ObstructionStatus',
    'CurrentDoorState',
    'TargetDoorState',
    'Name',
    'LockCurrentState',
    'LockTargetState'
  ]
}

export const accessoriesAndCharacteristics = []
for (const a in accessories) {
  accessoriesAndCharacteristics.push(a)
  for (const c of accessories[a]) {
    accessoriesAndCharacteristics.push(a + '.' + c)
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
  type: 'BOOLEAN',
  description: 'invert the value for HomeKit'
}

const valveTimerParameter = {
  name: 'homekitTimer',
  label: 'Timer',
  type: 'BOOLEAN'
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
    { value: "normal", label: "no filter, all events from iOS home app accepted"},
    { value: "filterOn",label: "Filter out 'ON' event" },
    { value: "filterBrightness100", label: "Filter out 'set brightness to 100%' event"},
    { value: "filterOnExceptBrightness100", label: "Filter out 'ON' events except of combination with 'set brightness to 100%'" }
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
  'Thermostat.TargetTemperature': [minValue, maxValue,stepValue],
  'Thermostat.CoolingThresholdTemperature': [minValue, maxValue, stepValue],
  'Thermostat.HeatingThresholdTemperature': [minValue, maxValue, stepValue],
  'Thermostat.CurrentHeatingCoolingMode': [
    m('OFF','TEXT','OFF', "Value for thermostat mode 'off'"),
    m('HEAT','TEXT','HEAT', "Value for thermostat mode 'heat'"),
    m('COOL','TEXT','COOL', "Value for thermostat mode 'cool'"),
  ],
  'Thermostat.TargetHeatingCoolingMode': [
    m('OFF','TEXT','OFF', "Value for thermostat mode 'off'"),
    m('HEAT','TEXT','HEAT', "Value for thermostat mode 'heat'"),
    m('COOL','TEXT','COOL', "Value for thermostat mode 'cool'"),
    m('AUTO','TEXT','AUTO', "Value for thermostat mode 'auto'"),
  ],
  'AirQualitySensor.AirQuality': [
    m('UNKNOWN','TEXT','UNKNOWN', "Value for air quality 'unknown'"),
    m('EXCELLENT','TEXT','EXCELLENT', "Value for air quality 'excellent'"),
    m('GOOD','TEXT','GOOD', "Value for air quality 'good'"),
    m('FAIR','TEXT','FAIR', "Value for air quality 'fair'"),
    m('INFERIOR','TEXT','INFERIOR', "Value for air quality 'inferior'"),
    m('POOR','TEXT','POOR', "Value for air quality 'poor'")
  ],
  'SecuritySystem.CurrentSecuritySystemState': [
    m('STAY_ARM','TEXT','STAY_ARM', "Value for security state 'stay arm'"),
    m('AWAY_ARM','TEXT','AWAY_ARM', "Value for security state 'arm away'"),
    m('NIGHT_ARM','TEXT','NIGHT_ARM', "Value for security state 'night arm'"),
    m('DISARMED','TEXT','DISARMED', "Value for security state 'disarmed'"),
    m('TRIGGERED','TEXT','TRIGGERED', "Value for security state 'alarm triggered'"),
  ],
  'SecuritySystem.TargetSecuritySystemState': [
    m('STAY_ARM','TEXT','STAY_ARM', "Value for security state 'stay arm'"),
    m('AWAY_ARM','TEXT','AWAY_ARM', "Value for security state 'arm away'"),
    m('NIGHT_ARM','TEXT','NIGHT_ARM', "Value for security state 'night arm'"),
    m('DISARM','TEXT','DISARM', "Value for security state 'disarm'"),
  ]
}
