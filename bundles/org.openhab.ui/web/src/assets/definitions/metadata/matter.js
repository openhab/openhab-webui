const thermostatSystemModeOptions = [
  { value: '0', label: 'OFF' },
  { value: '1', label: 'AUTO' },
  { value: '3', label: 'COOL' },
  { value: '4', label: 'HEAT' },
  { value: '5', label: 'EMERGENCY_HEAT' },
  { value: '6', label: 'PRECOOLING' },
  { value: '7', label: 'FAN_ONLY' },
  { value: '8', label: 'DRY' },
  { value: '9', label: 'SLEEP' }
]

const fanModeOptions = [
  { value: '0', label: 'OFF' },
  { value: '1', label: 'LOW' },
  { value: '2', label: 'MEDIUM' },
  { value: '3', label: 'HIGH' },
  { value: '4', label: 'ON' },
  { value: '5', label: 'AUTO' },
  { value: '6', label: 'SMART' }
]

export const deviceTypes = {
  OnOffLight: {
    attributes: []
  },
  DimmableLight: {
    attributes: []
  },
  ColorLight: {
    attributes: []
  },
  OnOffPlugInUnit: {
    attributes: []
  },
  WindowCovering: {
    attributes: []
  },
  TemperatureSensor: {
    attributes: []
  },
  HumiditySensor: {
    attributes: []
  },
  OccupancySensor: {
    attributes: []
  },
  ContactSensor: {
    attributes: []
  },
  DoorLock: {
    attributes: []
  },
  Thermostat: {
    attributes: [
      { label: 'Local Temperature', name: 'thermostat.localTemperature', mandatory: true },
      { label: 'Outdoor Temperature', name: 'thermostat.outdoorTemperature', mandatory: false },
      { label: 'Occupied Heating Setpoint', name: 'thermostat.occupiedHeatingSetpoint', mandatory: false },
      { label: 'Occupied Cooling Setpoint', name: 'thermostat.occupiedCoolingSetpoint', mandatory: false },
      {
        label: 'System Mode',
        name: 'thermostat.systemMode',
        mandatory: true,
        mapping: {
          name: 'systemMode',
          label: 'System Mode Mappings',
          type: 'TEXT',
          limitToOptions: true,
          options: thermostatSystemModeOptions
        }
      },
      { label: 'Running Mode', name: 'thermostat.runningMode', mandatory: false }
    ]
  },
  Fan: {
    attributes: [
      { label: 'On Off', name: 'onOff.onOff', mandatory: false },
      {
        label: 'Fan Mode',
        name: 'fanControl.fanMode',
        mandatory: false,
        mapping: {
          name: 'fanMode',
          label: 'Fan Mode Mappings',
          type: 'TEXT',
          limitToOptions: true,
          options: fanModeOptions
        }
      },
      { label: 'Percent Setting', name: 'fanControl.percentSetting', mandatory: false }
    ],
    supportsSimpleMapping: true
  }
}

export const deviceTypesAndAttributes = Object.entries(deviceTypes).flatMap(([type, attributes]) => [
  type,
  ...(attributes.length > 0 ? attributes.map((cluster) => `${type}.${cluster.label}`) : [])
])

export const isComplexDeviceType = (deviceType) => {
  return deviceTypes[deviceType]?.length > 0
}

const labelParameter = {
  name: 'label',
  label: 'Custom Label',
  type: 'TEXT',
  description: 'Override the default item label in Matter'
}

const fixedLabelsParameter = {
  name: 'fixedLabels',
  label: 'Fixed Labels',
  type: 'TEXT',
  description: 'Comma-separated list of key=value pairs for fixed labels (e.g. room=Office, floor=1)'
}

const thermostatLimitsParameters = [
  { name: 'thermostat-minHeatSetpointLimit', label: 'Min Heat Setpoint', type: 'DECIMAL', description: 'Minimum allowable heat setpoint (in 0.01°C)' },
  { name: 'thermostat-maxHeatSetpointLimit', label: 'Max Heat Setpoint', type: 'DECIMAL', description: 'Maximum allowable heat setpoint (in 0.01°C)' },
  { name: 'thermostat-minCoolSetpointLimit', label: 'Min Cool Setpoint', type: 'DECIMAL', description: 'Minimum allowable cool setpoint (in 0.01°C)' },
  { name: 'thermostat-maxCoolSetpointLimit', label: 'Max Cool Setpoint', type: 'DECIMAL', description: 'Maximum allowable cool setpoint (in 0.01°C)' },
  { name: 'thermostat-minSetpointDeadBand', label: 'Min Setpoint Deadband', type: 'DECIMAL', description: 'Minimum temperature gap between heating and cooling setpoints (in 0.01°C)' }
]

const fanModeSequenceParameter = {
  name: 'fanControl-fanModeSequence',
  label: 'Fan Mode Sequence',
  type: 'INTEGER',
  description: 'The sequence of fan modes to cycle through',
  limitToOptions: true,
  options: [
    { value: '0', label: 'Off-Low-Med-High' },
    { value: '1', label: 'Off-Low-High' },
    { value: '2', label: 'Off-Low-Med-High-Auto' },
    { value: '3', label: 'Off-Low-High-Auto' },
    { value: '4', label: 'Off-High-Auto' },
    { value: '5', label: 'Off-High' }
  ]
}
const windowCoveringInvertParameter = {
  name: 'windowCovering-invert',
  label: 'Invert Control',
  type: 'BOOLEAN'
}

export const matterParameters = {
  global: [labelParameter, fixedLabelsParameter],
  OnOffLight: [labelParameter, fixedLabelsParameter],
  DimmableLight: [labelParameter, fixedLabelsParameter],
  ColorLight: [labelParameter, fixedLabelsParameter],
  PlugInUnit: [labelParameter, fixedLabelsParameter],
  Thermostat: [labelParameter, fixedLabelsParameter].concat(thermostatLimitsParameters),
  WindowCovering: [labelParameter, fixedLabelsParameter].concat(windowCoveringInvertParameter),
  Fan: [labelParameter, fixedLabelsParameter, fanModeSequenceParameter]
}
