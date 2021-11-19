import p from './parameters.js'
import {
  ARM_STATES,
  EQUALIZER_MODES,
  FAN_DIRECTIONS,
  FAN_SPEEDS,
  LOCK_STATES,
  OPEN_STATES,
  THERMOSTAT_MODES,
  THERMOSTAT_FAN_MODES,
  VACUUM_MODES
} from './constants.js'

export default {
  // Camera Attributes
  CameraStream: {
    itemTypes: ['String'],
    parameters: () => [p.proxyBaseUrl(), p.resolution()]
  },

  // Cover Attributes
  OpenState: {
    itemTypes: ['Switch'],
    parameters: () => [p.inverted()]
  },
  TargetOpenState: {
    itemTypes: ['Switch'],
    requires: ['CurrentOpenState'],
    parameters: () => [p.inverted()]
  },
  CurrentOpenState: {
    itemTypes: ['Contact', 'Number', 'String', 'Switch'],
    requires: ['TargetOpenState'],
    parameters: (item) =>
      item.type === 'Contact' || item.type === 'Switch'
        ? [p.inverted()]
        : OPEN_STATES.map((state) => p.valueMapping(state))
  },
  ObstacleAlert: {
    itemTypes: ['Contact ', 'Switch'],
    requires: ['OpenState'],
    parameters: () => [p.inverted()]
  },
  PositionState: {
    itemTypes: ['Dimmer', 'Rollershutter'],
    parameters: (item) => [
      p.inverted(item.type === 'Rollershutter'),
      p.presets(item.stateDescription, '20=Morning,60=Afternoon,80=Evening:@Setting.Night', true),
      p.language(item.settings && item.settings.regional.language)
    ]
  },
  TiltAngle: {
    itemTypes: ['Dimmer', 'Number', 'Number:Angle', 'Rollershutter'],
    parameters: (item) => [
      p.inverted(item.type === 'Rollershutter'),
      p.presets(item.stateDescription, '20=Morning,60=Afternoon,80=Evening:@Setting.Night', true),
      p.language(item.settings && item.settings.regional.language)
    ]
  },

  // Entertainment Attributes
  Channel: {
    itemTypes: ['Number', 'String'],
    parameters: () => [p.channelMappings(), p.retrievable()]
  },
  Input: {
    itemTypes: ['Number', 'String'],
    parameters: (item) => [
      p.supportedInputs(item.stateDescription, item.type === 'String' ? 'HDMI1=Cable,HDMI2=Kodi' : '1=Cable,2=Kodi'),
      p.language(item.settings && item.settings.regional.language),
      p.retrievable()
    ]
  },
  VolumeLevel: {
    itemTypes: ['Dimmer', 'Number'],
    parameters: (item) => [p.increment(10), ...(item.type === 'Number' ? [p.stepSpeaker()] : [])]
  },
  MuteState: {
    itemTypes: ['Switch'],
    parameters: () => [p.inverted(), p.stepSpeaker()]
  },
  EqualizerBass: {
    itemTypes: ['Dimmer', 'Number'],
    parameters: (item) => [
      p.equalizerRange(item.type === 'Dimmer' ? '0:100' : '-10:10'),
      p.equalizerDefaultLevel(item.type === 'Dimmer' ? 50 : 0),
      p.increment(item.type === 'Dimmer' ? 'INCREASE/DECREASE' : 1),
      p.retrievable()
    ]
  },
  EqualizerMidrange: {
    itemTypes: ['Dimmer', 'Number'],
    parameters: (item) => [
      p.equalizerRange(item.type === 'Dimmer' ? '0:100' : '-10:10'),
      p.equalizerDefaultLevel(item.type === 'Dimmer' ? 50 : 0),
      p.increment(item.type === 'Dimmer' ? 'INCREASE/DECREASE' : 1),
      p.retrievable()
    ]
  },
  EqualizerTreble: {
    itemTypes: ['Dimmer', 'Number'],
    parameters: (item) => [
      p.equalizerRange(item.type === 'Dimmer' ? '0:100' : '-10:10'),
      p.equalizerDefaultLevel(item.type === 'Dimmer' ? 50 : 0),
      p.increment(item.type === 'Dimmer' ? 'INCREASE/DECREASE' : 1),
      p.retrievable()
    ]
  },
  EqualizerMode: {
    itemTypes: ['Number', 'String'],
    parameters: () => [
      ...EQUALIZER_MODES.map((mode) => p.valueMapping(mode)),
      p.supportedEqualizerModes(),
      p.retrievable()
    ]
  },
  Playback: {
    itemTypes: ['Player'],
    parameters: () => [p.supportedOperations()]
  },
  PlaybackStop: {
    itemTypes: ['Switch'],
    requires: ['Playback'],
    parameters: () => [p.inverted()]
  },

  // Fan Attributes
  FanDirection: {
    itemTypes: ['String', 'Switch'],
    parameters: (item) => [
      ...(item.type === 'Switch' ? [p.inverted()] : FAN_DIRECTIONS.map((direction) => p.valueMapping(direction))),
      p.retrievable()
    ]
  },
  FanOscillate: {
    itemTypes: ['Switch'],
    parameters: () => [p.inverted(), p.retrievable()]
  },
  FanSpeed: {
    itemTypes: ['Dimmer', 'Number', 'String'],
    parameters: (item) => [
      ...(item.type === 'Dimmer'
        ? [p.inverted()]
        : item.type === 'Number'
          ? [p.speedLevels()]
          : FAN_SPEEDS.map((speed) => p.valueMapping(speed))),
      p.retrievable()
    ]
  },

  // Light Attributes
  Brightness: {
    itemTypes: ['Color', 'Dimmer'],
    parameters: () => [p.retrievable()]
  },
  Color: {
    itemTypes: ['Color'],
    parameters: () => [p.retrievable()]
  },
  ColorTemperature: {
    itemTypes: ['Dimmer', 'Number'],
    parameters: (item) => [
      ...(item.type === 'Dimmer' ? [p.colorTemperatureBinding()] : []),
      p.colorTemperatureRange(),
      p.increment(item.type === 'Dimmer' ? 'INCREASE/DECREASE' : 500),
      p.retrievable()
    ]
  },

  // Networking Attributes
  NetworkAccess: {
    itemTypes: ['Switch'],
    parameters: () => [p.inverted(), p.retrievable()],
    visible: (item) => item.groups
      .map((group) => group.metadata.alexa.config || {})
      .some((config) => !!config.macAddress)
  },

  // Scene Attributes
  Scene: {
    itemTypes: ['Switch'],
    parameters: () => [p.supportsDeactivation()]
  },

  // Security Attributes
  LockState: {
    itemTypes: ['Switch'],
    parameters: () => [p.inverted(), p.retrievable()]
  },
  TargetLockState: {
    itemTypes: ['Switch'],
    requires: ['CurrentLockState'],
    parameters: () => [p.inverted()]
  },
  CurrentLockState: {
    itemTypes: ['Contact', 'Number', 'String', 'Switch'],
    requires: ['TargetLockState'],
    parameters: (item) =>
      item.type === 'Contact' || item.type === 'Switch'
        ? [p.inverted()]
        : LOCK_STATES.map((state) => p.valueMapping(state))
  },
  ArmState: {
    itemTypes: ['Number', 'String', 'Switch'],
    parameters: () => [
      ...ARM_STATES.map((state) => p.valueMapping(state)),
      p.supportedArmStates(),
      p.pinCodes(),
      p.exitDelay(),
      p.retrievable()
    ]
  },
  BurglaryAlarm: {
    itemTypes: ['Contact', 'Switch'],
    parameters: () => [p.inverted()]
  },
  CarbonMonoxideAlarm: {
    itemTypes: ['Contact', 'Switch'],
    parameters: () => [p.inverted()]
  },
  FireAlarm: {
    itemTypes: ['Contact', 'Switch'],
    parameters: () => [p.inverted()]
  },
  WaterAlarm: {
    itemTypes: ['Contact', 'Switch'],
    parameters: () => [p.inverted()]
  },
  AlarmAlert: {
    itemTypes: ['Contact', 'Switch'],
    requires: ['ArmState'],
    parameters: () => [p.inverted()]
  },
  ReadyAlert: {
    itemTypes: ['Contact', 'Switch'],
    requires: ['ArmState'],
    parameters: () => [p.inverted()]
  },
  TroubleAlert: {
    itemTypes: ['Contact', 'Switch'],
    requires: ['ArmState'],
    parameters: () => [p.inverted()]
  },
  ZonesAlert: {
    itemTypes: ['Contact', 'Switch'],
    requires: ['ArmState'],
    parameters: () => [p.inverted()]
  },

  // Sensor Attributes
  BatteryLevel: {
    itemTypes: ['Dimmer', 'Number', 'Number:Dimensionless']
  },
  CurrentHumidity: {
    itemTypes: ['Dimmer', 'Number', 'Number:Dimensionless']
  },
  CurrentTemperature: {
    itemTypes: ['Number', 'Number:Temperature'],
    parameters: (item) => [p.scale(item)]
  },
  ContactDetectionState: {
    itemTypes: ['Contact', 'Switch'],
    parameters: () => [p.inverted()]
  },
  MotionDetectionState: {
    itemTypes: ['Contact', 'Switch'],
    parameters: () => [p.inverted()]
  },

  // Switchable Attributes
  PowerState: {
    itemTypes: ['Color', 'Dimmer', 'Number', 'String', 'Switch'],
    parameters: (item) => [
      ...(item.type === 'Number' || item.type === 'String'
        ? [p.valueMapping('OFF', true), p.valueMapping('ON', true)]
        : []),
      p.retrievable()
    ]
  },
  PowerLevel: {
    itemTypes: ['Dimmer'],
    parameters: () => [p.retrievable()]
  },
  Percentage: {
    itemTypes: ['Dimmer', 'Rollershutter'],
    parameters: (item) => [p.inverted(item.type === 'Rollershutter'), p.retrievable()]
  },

  // Thermostat Attributes
  TargetTemperature: {
    itemTypes: ['Number', 'Number:Temperature'],
    parameters: (item) => [p.scale(item), p.setpointRange(item), p.retrievable()]
  },
  CoolingSetpoint: {
    itemTypes: ['Number', 'Number:Temperature'],
    requires: ['HeatingSetpoint'],
    parameters: (item) => [p.scale(item), p.comfortRange(item), p.setpointRange(item), p.retrievable()]
  },
  HeatingSetpoint: {
    itemTypes: ['Number', 'Number:Temperature'],
    requires: ['CoolingSetpoint'],
    parameters: (item) => [p.scale(item), p.comfortRange(item), p.setpointRange(item), p.retrievable()]
  },
  EcoCoolingSetpoint: {
    itemTypes: ['Number', 'Number:Temperature'],
    requires: ['EcoHeatingSetpoint'],
    parameters: (item) => [p.scale(item), p.comfortRange(item), p.setpointRange(item), p.retrievable()]
  },
  EcoHeatingSetpoint: {
    itemTypes: ['Number', 'Number:Temperature'],
    requires: ['EcoCoolingSetpoint'],
    parameters: (item) => [p.scale(item), p.comfortRange(item), p.setpointRange(item), p.retrievable()]
  },
  HeatingCoolingMode: {
    itemTypes: ['Number', 'String', 'Switch'],
    parameters: () => [
      ...THERMOSTAT_MODES.map((mode) => p.thermostatModeMapping(mode)),
      p.thermostatModeBinding(),
      p.supportedThermostatModes(),
      p.supportsSetpointMode(),
      p.retrievable()
    ]
  },
  ThermostatHold: {
    itemTypes: ['Number', 'String', 'Switch'],
    requires: ['HeatingCoolingMode'],
    parameters: (item) => [p.valueMapping('RESUME')]
  },
  ThermostatFan: {
    itemTypes: ['String', 'Switch'],
    parameters: (item) => [
      ...(item.type === 'Switch' ? [p.inverted()] : THERMOSTAT_FAN_MODES.map((mode) => p.valueMapping(mode))),
      p.retrievable()
    ]
  },

  // Vacuum Attributes
  VacuumMode: {
    itemTypes: ['Number', 'String'],
    parameters: () => [...VACUUM_MODES.map((mode) => p.valueMapping(mode)), p.retrievable()]
  },

  // Generic Attributes
  Mode: {
    itemTypes: ['Number', 'String', 'Switch'],
    supports: ['multiInstance'],
    parameters: (item, config) => [
      p.capabilityNames(
        item.groups.length ? item.label : '@Setting.Mode',
        'Wash Temperature,@Setting.WaterTemperature'
      ),
      p.nonControllable(item.stateDescription),
      p.retrievable(),
      p.supportedModes(item.stateDescription),
      p.ordered(),
      p.language(item.settings && item.settings.regional.language),
      p.actionMappings(
        { set: 'mode', ...(config.ordered && { adjust: '(±deltaValue)' }) },
        'Close=Down,Open=Up,Lower=Down,Raise=Up'
      ),
      p.stateMappings(['mode'], 'Closed=Down,Open=Up')
    ]
  },
  RangeValue: {
    itemTypes: [
      'Dimmer',
      'Number',
      'Number:Angle',
      'Number:Dimensionless',
      'Number:Length',
      'Number:Mass',
      'Number:Temperature',
      'Number:Volume',
      'Rollershutter'
    ],
    supports: ['multiInstance'],
    parameters: (item) => [
      p.capabilityNames(item.groups.length ? item.label : '@Setting.RangeValue', '@Setting.FanSpeed,Speed'),
      p.nonControllable(item.stateDescription),
      p.retrievable(),
      p.inverted(item.type === 'Rollershutter'),
      ...(item.type === 'Dimmer'
        ? [p.supportedCommands(['ON', 'OFF', 'INCREASE', 'DECREASE'], 'INCREASE=@Value.Up,DECREASE=@Value.Down')]
        : item.type === 'Rollershutter'
          ? [p.supportedCommands(['UP', 'DOWN', 'MOVE', 'STOP'], 'UP=@Value.Open,DOWN=@Value.Close,STOP=@Value.Stop')]
          : []),
      p.supportedRange(
        item.stateDescription,
        item.type === 'Dimmer' || item.type === 'Rollershutter' ? '0:100:1' : '0:10:1'
      ),
      p.presets(item.stateDescription, '1=@Value.Low:Lowest,10=@Value.High:Highest'),
      p.unitOfMeasure(item),
      p.language(item.settings && item.settings.regional.language),
      p.actionMappings({ set: 'value', adjust: '(±deltaValue)' }, 'Close=0,Open=100,Lower=(-10),Raise=(+10)'),
      p.stateMappings({ default: 'value', range: 'minValue:maxValue' }, 'Closed=0,Open=1:100')
    ]
  },
  ToggleState: {
    itemTypes: ['Switch'],
    supports: ['multiInstance'],
    parameters: (item) => [
      p.capabilityNames(item.groups.length ? item.label : '@Setting.ToggleState', '@Setting.Oscillate,Rotate'),
      p.nonControllable(item.stateDescription),
      p.retrievable(),
      p.inverted(),
      p.language(item.settings && item.settings.regional.language),
      p.actionMappings(['ON', 'OFF'], 'Close=OFF,Open=ON'),
      p.stateMappings(['ON', 'OFF'], 'Closed=OFF,Open=ON')
    ]
  }
}
