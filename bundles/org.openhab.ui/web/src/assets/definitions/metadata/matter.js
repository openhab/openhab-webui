export const deviceTypes = {
  'OnOffLight': [
    { label: 'OnOff', mandatory: true }
  ],
  'DimmableLight': [
    { label: 'OnOff', mandatory: true },
    { label: 'Brightness', mandatory: true }
  ],
  'ColorLight': [
    { label: 'OnOff', mandatory: true },
    { label: 'Brightness', mandatory: true },
    { label: 'Color', mandatory: true }
  ],
  'PlugInUnit': [
    { label: 'OnOff', mandatory: true }
  ],
  'Thermostat': [
    { label: 'LocalTemperature', mandatory: true },
    { label: 'OutdoorTemperature', mandatory: false },
    { label: 'OccupiedHeatingSetpoint', mandatory: false },
    { label: 'OccupiedCoolingSetpoint', mandatory: false },
    { label: 'SystemMode', mandatory: true },
    { label: 'RunningMode', mandatory: false }
  ],
  'WindowCovering': [
    { label: 'Position', mandatory: true }
  ],
  'TemperatureSensor': [
    { label: 'Temperature', mandatory: true }
  ],
  'HumiditySensor': [
    { label: 'Humidity', mandatory: true }
  ],
  'OccupancySensor': [
    { label: 'Occupancy', mandatory: true }
  ],
  'ContactSensor': [
    { label: 'Contact', mandatory: true }
  ],
  'DoorLock': [
    { label: 'LockState', mandatory: true }
  ],
  'Fan': [
    { label: 'OnOff', mandatory: false },
    { label: 'FanMode', mandatory: false },
    { label: 'PercentSetting', mandatory: false }
  ]
}

export const deviceTypesAndClusters = []

for (const dt in deviceTypes) {
  deviceTypesAndClusters.push(dt)
  for (const cluster of deviceTypes[dt]) {
    deviceTypesAndClusters.push(dt + '.' + cluster.label)
  }
}

// Common parameters that can be used across different devices
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

// Thermostat specific parameters
const thermostatLimitsParameters = [
  { name: 'thermostat-minHeatSetpointLimit', label: 'Min Heat Setpoint', type: 'INTEGER', description: 'Minimum allowable heat setpoint (in 0.01°C)' },
  { name: 'thermostat-maxHeatSetpointLimit', label: 'Max Heat Setpoint', type: 'INTEGER', description: 'Maximum allowable heat setpoint (in 0.01°C)' },
  { name: 'thermostat-minCoolSetpointLimit', label: 'Min Cool Setpoint', type: 'INTEGER', description: 'Minimum allowable cool setpoint (in 0.01°C)' },
  { name: 'thermostat-maxCoolSetpointLimit', label: 'Max Cool Setpoint', type: 'INTEGER', description: 'Maximum allowable cool setpoint (in 0.01°C)' },
  { name: 'thermostat-minSetpointDeadBand', label: 'Min Setpoint Deadband', type: 'INTEGER', description: 'Minimum temperature gap between heating and cooling setpoints (in 0.01°C)' }
]

// Fan specific parameters
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

// System mode options for thermostat
const systemModeOptions = [
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

// Fan mode options
const fanModeOptions = [
  { value: '0', label: 'OFF' },
  { value: '1', label: 'LOW' },
  { value: '2', label: 'MEDIUM' },
  { value: '3', label: 'HIGH' },
  { value: '4', label: 'ON' },
  { value: '5', label: 'AUTO' },
  { value: '6', label: 'SMART' }
]

export const matterParameters = {
  // Global parameters available for all device types
  'global': [labelParameter, fixedLabelsParameter],

  // Device type specific parameters
  'OnOffLight': [labelParameter, fixedLabelsParameter],
  'DimmableLight': [labelParameter, fixedLabelsParameter],
  'ColorLight': [labelParameter, fixedLabelsParameter],
  'PlugInUnit': [labelParameter, fixedLabelsParameter],
  'Thermostat': [labelParameter, fixedLabelsParameter].concat(thermostatLimitsParameters),
  'WindowCovering': [
    labelParameter,
    fixedLabelsParameter,
    {
      name: 'invert',
      label: 'Invert Control',
      type: 'TEXT',
      limitToOptions: true,
      options: [
        { value: 'false', label: 'false' },
        { value: 'true', label: 'true' }
      ]
    }
  ],
  'Fan': [labelParameter, fixedLabelsParameter, fanModeSequenceParameter],

  // Cluster specific parameters
  'Thermostat.SystemMode': [
    {
      name: 'systemMode',
      label: 'System Mode Mappings',
      type: 'TEXT',
      limitToOptions: true,
      options: systemModeOptions
    }
  ],
  'Fan.FanMode': [
    {
      name: 'fanMode',
      label: 'Fan Mode Mappings',
      type: 'TEXT',
      limitToOptions: true,
      options: fanModeOptions
    }
  ]
}
