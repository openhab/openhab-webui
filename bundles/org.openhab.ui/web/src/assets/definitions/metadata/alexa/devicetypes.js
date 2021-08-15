import attributes from './deviceattributes.js'
import p from './parameters.js'

const genericAttributes = ['Mode', 'RangeValue', 'ToggleState']
const genericDeviceAttributes = ['PowerState', ...genericAttributes]
const mobileDeviceAttributes = ['BatteryLevel', ...genericDeviceAttributes]
const sensorAttributes = ['BatteryLevel', ...genericAttributes]

const cameraAttributes = ['CameraStream', ...mobileDeviceAttributes]
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
  const metadata = item.members.map((mbr) => mbr.metadata && mbr.metadata.alexa && mbr.metadata.alexa.value).join(',')
  return ['PositionState', 'TiltAngle'].every((attr) => metadata.includes(attr)) ? [p.primaryControl()] : []
}

export const defaultParameters = (item) => !item.groups.length
  ? [p.deviceName(item.label), p.deviceDescription(`${item.groupType || item.type} ${item.name}`)]
  : []

export default {
  Activity: {
    defaultAttributes: ['Scene'],
    supportsGroup: false
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
    supportedAttributes: genericDeviceAttributes
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
  Door: {
    defaultAttributes: ['OpenState'],
    supportedAttributes: doorAttributes
  },
  Doorbell: {
    defaultAttributes: ['CameraStream'],
    supportedAttributes: cameraAttributes
  },
  Fan: {
    defaultAttributes: ['FanSpeed'],
    supportedAttributes: fanAttributes
  },
  GameConsole: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  GarageDoor: {
    defaultAttributes: ['OpenState'],
    supportedAttributes: ['ObstacleAlert', 'SafetyBeamAlert', ...doorAttributes]
  },
  Headphones: {
    defaultAttributes: ['VolumeLevel'],
    supportedAttributes: ['VolumeLevel', 'MuteState', 'Playback', 'PlaybackStop', ...mobileDeviceAttributes]
  },
  Hub: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: genericDeviceAttributes
  },
  Laptop: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: mobileDeviceAttributes
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
    supportedAttributes: mobileDeviceAttributes
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
    supportedAttributes: mobileDeviceAttributes
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
    supportedAttributes: ['VacuumMode', 'FanSpeed', ...mobileDeviceAttributes]
  },
  WaterHeater: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: ['TargetTemperature', 'CurrentTemperature', ...genericDeviceAttributes]
  },
  Wearable: {
    defaultAttributes: ['PowerState'],
    supportedAttributes: mobileDeviceAttributes
  },
  Other: {
    supportedAttributes: Object.keys(attributes).filter((attr) => attr !== 'Scene')
  }
}
