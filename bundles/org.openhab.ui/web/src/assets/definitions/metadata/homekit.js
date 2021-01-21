const accessories = {
  'AirQualitySensor': [
    'AirQuality',
    'OzoneDensity',
    'NitrogenDioxideDensity',
    'SulphurDioxideDensity',
    'PM25Density',
    'PM10Density',
    'VOCDensity',
    'Name',
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
    'Name',
    'CoolingThresholdTemperature',
    'HeatingThresholdTemperature'
  ],
  'HeaterCooler': [
    'ActiveStatus',
    'CurrentTemperature',
    'CurrentHeaterCoolerState',
    'TargetHeaterCoolerState',
    'Name',
    'RotationSpeed',
    'SwingMode',
    'LockControl',
    'CoolingThresholdTemperature',
    'HeatingThresholdTemperature'
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

export const homekitParameters = [valveTypeParameter, valveTimerParameter, valveDefaultDuration]
