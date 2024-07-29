export const accessories = {
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
    { label: 'ObstructionStatus', mandatory: true },
    { label: 'TargetDoorState', mandatory: true },
    { label: 'LockCurrentState', mandatory: false },
    { label: 'LockTargetState', mandatory: false },
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
  'Switchable': [
    { label: 'OnState', mandatory: true },
    { label: 'Name', mandatory: false }
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
    { label: 'TargetTemperature', mandatory: true },
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

const instanceParameter = {
  name: 'Instance',
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

const m = (name, type, label, description) => {
  return {
    name,
    type,
    label,
    description
  }
}

export const homekitParameters = {
  'AirQualitySensor': [instanceParameter],
  'AirQualitySensor.AirQuality': [
    m('UNKNOWN', 'TEXT', 'UNKNOWN', 'Value for air quality "unknown"'),
    m('EXCELLENT', 'TEXT', 'EXCELLENT', 'Value for air quality "excellent"'),
    m('GOOD', 'TEXT', 'GOOD', 'Value for air quality "good"'),
    m('FAIR', 'TEXT', 'FAIR', 'Value for air quality "fair"'),
    m('INFERIOR', 'TEXT', 'INFERIOR', 'Value for air quality "inferior"'),
    m('POOR', 'TEXT', 'POOR', 'Value for air quality "poor"')
  ],
  'AirQualitySensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'AirQualitySensor.VOCDensity': [minValue, maxValue, stepValue],
  'Battery': [instanceParameter, chargeableParameter],
  'Battery.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'CarbonDioxideSensor': [instanceParameter, invertedParameter],
  'CarbonDioxideSensor.CarbonDioxideDetectedState': [invertedParameter],
  'CarbonDioxideSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'CarbonMonoxideSensor': [instanceParameter, invertedParameter],
  'CarbonMonoxideSensor.CarbonMonoxideDetectedState': [invertedParameter],
  'CarbonMonoxideSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'ContactSensor': [instanceParameter, invertedParameter],
  'ContactSensor.ContactSensorState': [invertedParameter],
  'ContactSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'Door': [instanceParameter, invertedParameter],
  'Fan': [instanceParameter],
  'Fan.LockControl': [invertedParameter],
  'Fan.RotationDirection': [invertedParameter],
  'Fan.SwingMode': [invertedParameter],
  'Fan.TargetFanState': [invertedParameter],
  'HumiditySensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'LeakSensor': [instanceParameter, invertedParameter],
  'LeakSensor.LeakDetectedState': [invertedParameter],
  'LeakSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'Lighting.Brightness': [instanceParameter, minValue, maxValue, dimmerFilterType],
  'LightSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'MotionSensor': [instanceParameter, invertedParameter],
  'MotionSensor.MotionDetectedState': [invertedParameter],
  'MotionSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'OccupancySensor': [instanceParameter, invertedParameter],
  'OccupancySensor.OccupancyDetectedState': [invertedParameter],
  'OccupancySensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
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
  'SmokeSensor': [instanceParameter, invertedParameter],
  'SmokeSensor.SmokeDetectedState': [invertedParameter],
  'SmokeSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'TemperatureSensor.CurrentTemperature': [instanceParameter, minValue, maxValue],
  'TemperatureSensor.BatteryLowStatus': [batteryLowThreshold, invertedParameter],
  'Thermostat': [instanceParameter],
  'Thermostat.CurrentHeatingCoolingMode': [
    m('OFF', 'TEXT', 'OFF', 'Value for thermostat mode "off"'),
    m('HEAT', 'TEXT', 'HEAT', 'Value for thermostat mode "heat"'),
    m('COOL', 'TEXT', 'COOL', 'Value for thermostat mode "cool"')
  ],
  'Thermostat.CurrentTemperature': [minValue, maxValue, stepValue],
  'Thermostat.TargetTemperature': [minValue, maxValue, stepValue],
  'Thermostat.TargetHeatingCoolingMode': [
    m('OFF', 'TEXT', 'OFF', 'Value for thermostat mode "off"'),
    m('HEAT', 'TEXT', 'HEAT', 'Value for thermostat mode "heat"'),
    m('COOL', 'TEXT', 'COOL', 'Value for thermostat mode "cool"'),
    m('AUTO', 'TEXT', 'AUTO', 'Value for thermostat mode "auto"')
  ],
  'Thermostat.CoolingThresholdTemperature': [minValue, maxValue, stepValue],
  'Thermostat.HeatingThresholdTemperature': [minValue, maxValue, stepValue],
  'Valve': [instanceParameter, valveTypeParameter, valveTimerParameter, valveDefaultDuration],
  'Window': [instanceParameter, invertedParameter],
  'WindowCovering': [instanceParameter, invertedParameter]
}
