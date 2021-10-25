import attributes from './deviceattributes.js'
import p from './parameters.js'

const genericAttributes = ['Mode', 'RangeValue', 'ToggleState']
const genericDeviceAttributes = ['PowerState', ...genericAttributes]
const networkDeviceAttributes = ['NetworkAccess', ...genericDeviceAttributes]
const mobileDeviceAttributes = ['BatteryLevel', ...networkDeviceAttributes]
const sensorAttributes = ['BatteryLevel', ...genericAttributes]

const cameraAttributes = ['CameraStream', 'BatteryLevel', ...genericDeviceAttributes]
const doorAttributes = ['OpenState', 'TargetOpenState', 'CurrentOpenState', ...genericAttributes]
const blindAttributes = ['PositionState', 'TiltAngle', ...doorAttributes]
const fanAttributes = ['FanDirection', 'FanOscillate', 'FanSpeed', ...genericDeviceAttributes]
const lightAttributes = ['Brightness', 'Color', 'ColorTemperature', ...genericDeviceAttributes]
const switchAttributes = ['PowerLevel', 'Percentage', ...genericDeviceAttributes]

const entertainmentAttributes = [
  'VolumeLevel',
  'MuteState',
  'Channel',
  'Input',
  'Playback',
  'PlaybackStop',
  'Navigation',
  'EqualizerBass',
  'EqualizerMidrange',
  'EqualizerTreble',
  'EqualizerMode',
  ...genericDeviceAttributes
]
const securityAttributes = [
  'ArmState',
  'BurglaryAlarm',
  'CarbonMonoxideAlarm',
  'FireAlarm',
  'WaterAlarm',
  'AlarmAlert',
  'ReadyAlert',
  'TroubleAlert',
  'ZonesAlert',
  ...genericAttributes
]
const thermostatAttributes = [
  'TargetTemperature',
  'CoolingSetpoint',
  'HeatingSetpoint',
  'EcoCoolingSetpoint',
  'EcoHeatingSetpoint',
  'HeatingCoolingMode',
  'ThermostatHold',
  'ThermostatFan',
  'CurrentTemperature',
  'CurrentHumidity',
  'BatteryLevel',
  ...genericAttributes
]

const blindParameters = (item) => {
  const attributes = ['PositionState', 'TiltAngle']
  const metadata = item.members.map((mbr) => mbr.metadata && mbr.metadata.alexa && mbr.metadata.alexa.value).join(',')
  return attributes.every((attr) => metadata.includes(attr)) ? [p.primaryControl()] : []
}

const networkParameters = (item, config, endpoints) => {
  const deviceTypes = ['NetworkHardware', 'Router']
  const connections = endpoints
    .filter((i) => deviceTypes.includes(i.metadata.alexa.value) && i.type === 'Group' && !i.groupType)
    .reduce((cxns, g) => ({ ...cxns, [g.name]: g.label || g.name }), undefined)
  return connections ? [p.connectedTo(connections), p.hostname(), p.macAddress()] : []
}

export const defaultParameters = (item) => !item.groups.length
  ? [p.deviceName(item.label), p.deviceDescription(`${item.groupType || item.type} ${item.name}`)]
  : []

export default {
  Activity: {
    defaultAttributes: ['Scene'],
    supportsGroup: false
  },
  AirConditioner: {
    defaultAttributes: ['HeatingCoolingMode'],
    supportedAttributes: ['HeatingCoolingMode', 'TargetTemperature', 'CurrentTemperature', ...fanAttributes]
  },
  AirFreshener: {
    defaultAttributes: ['FanSpeed'],
    supportedAttributes: fanAttributes
  },
  AirPurifier: {
    defaultAttributes: ['FanSpeed'],
    supportedAttributes: fanAttributes
  },
  Automobile: {
    supportedAttributes: [
      'BatteryLevel',
      'FanSpeed',
      'LockState',
      'PowerState',
      'CurrentTemperature',
      ...genericAttributes
    ]
  },
  AutomobileAccessory: {
    supportedAttributes: ['BatteryLevel', 'CameraStream', 'FanSpeed', 'PowerState', ...genericAttributes]
  },
  Awning: {
    defaultAttributes: ['PositionState', 'OpenState'],
    supportedAttributes: blindAttributes,
    groupParameters: blindParameters
  },
  Blind: {
    defaultAttributes: ['PositionState', 'OpenState'],
    supportedAttributes: blindAttributes,
    groupParameters: blindParameters
  },
  BluetoothSpeaker: {
    defaultAttributes: ['VolumeLevel'],
    supportedAttributes: ['BatteryLevel', ...entertainmentAttributes]
  },
  Camera: {
    defaultAttributes: ['CameraStream'],
    supportedAttributes: cameraAttributes
  },
  ChristmasTree: {
    defaultAttributes: ['PowerState', 'Brightness', 'Color'],
    supportedAttributes: lightAttributes
  },
  CoffeeMaker: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Computer: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: networkDeviceAttributes,
    groupParameters: networkParameters
  },
  ContactSensor: {
    defaultAttributes: ['ContactDetectionState'],
    supportedAttributes: ['ContactDetectionState', ...sensorAttributes]
  },
  Curtain: {
    defaultAttributes: ['PositionState', 'OpenState'],
    supportedAttributes: blindAttributes,
    groupParameters: blindParameters
  },
  Dishwasher: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Door: {
    defaultAttributes: ['OpenState'],
    supportedAttributes: doorAttributes
  },
  Doorbell: {
    defaultAttributes: ['CameraStream'],
    supportedAttributes: cameraAttributes
  },
  Dryer: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Fan: {
    defaultAttributes: ['FanSpeed'],
    supportedAttributes: fanAttributes
  },
  GameConsole: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: networkDeviceAttributes,
    groupParameters: networkParameters
  },
  GarageDoor: {
    defaultAttributes: ['OpenState'],
    supportedAttributes: ['ObstacleAlert', 'SafetyBeamAlert', ...doorAttributes]
  },
  Headphones: {
    defaultAttributes: ['VolumeLevel'],
    supportedAttributes: ['BatteryLevel', ...entertainmentAttributes]
  },
  Hub: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Laptop: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: mobileDeviceAttributes,
    groupParameters: networkParameters
  },
  Light: {
    defaultAttributes: ['PowerState', 'Brightness', 'Color'],
    supportedAttributes: lightAttributes
  },
  Lock: {
    defaultAttributes: ['LockState'],
    supportedAttributes: ['LockState', 'TargetLockState', 'CurrentLockState', 'BatteryLevel', ...genericAttributes]
  },
  Microwave: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  MobilePhone: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: mobileDeviceAttributes,
    groupParameters: networkParameters
  },
  MotionSensor: {
    defaultAttributes: ['MotionDetectionState'],
    supportedAttributes: ['MotionDetectionState', ...sensorAttributes]
  },
  MusicSystem: {
    defaultAttributes: ['Playback'],
    supportedAttributes: entertainmentAttributes
  },
  NetworkHardware: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Outlet: {
    defaultAttributes: ['PowerState', 'PowerLevel', 'Percentage'],
    supportedAttributes: switchAttributes
  },
  Oven: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Phone: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Printer: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Router: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Scene: {
    defaultAttributes: ['Scene'],
    supportsGroup: false
  },
  Screen: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: entertainmentAttributes
  },
  SecurityPanel: {
    defaultAttributes: ['ArmState'],
    supportedAttributes: securityAttributes
  },
  SecuritySystem: {
    defaultAttributes: ['ArmState'],
    supportedAttributes: securityAttributes
  },
  Shade: {
    defaultAttributes: ['PositionState', 'OpenState'],
    supportedAttributes: blindAttributes,
    groupParameters: blindParameters
  },
  Shutter: {
    defaultAttributes: ['PositionState', 'OpenState'],
    supportedAttributes: blindAttributes,
    groupParameters: blindParameters
  },
  SlowCooker: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Speaker: {
    defaultAttributes: ['VolumeLevel'],
    supportedAttributes: entertainmentAttributes
  },
  StreamingDevice: {
    defaultAttributes: ['Playback'],
    supportedAttributes: entertainmentAttributes
  },
  Switch: {
    defaultAttributes: ['PowerState', 'PowerLevel', 'Percentage'],
    supportedAttributes: switchAttributes
  },
  Tablet: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: mobileDeviceAttributes,
    groupParameters: networkParameters
  },
  Television: {
    defaultAttributes: ['Channel'],
    supportedAttributes: entertainmentAttributes
  },
  TemperatureSensor: {
    defaultAttributes: ['CurrentTemperature'],
    supportedAttributes: ['CurrentTemperature', ...sensorAttributes]
  },
  Thermostat: {
    defaultAttributes: ['HeatingCoolingMode'],
    supportedAttributes: thermostatAttributes,
    groupParameters: (item) => [p.scale(item, true)]
  },
  VacuumCleaner: {
    defaultAttributes: ['VacuumMode'],
    supportedAttributes: ['VacuumMode', 'FanSpeed', 'BatteryLevel', ...genericDeviceAttributes]
  },
  Washer: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  WaterHeater: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: ['TargetTemperature', 'CurrentTemperature', ...genericDeviceAttributes]
  },
  Wearable: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: mobileDeviceAttributes,
    groupParameters: networkParameters
  },
  Other: {
    supportedAttributes: Object.keys(attributes).filter((attr) => attr !== 'NetworkAccess' && attr !== 'Scene')
  }
}
