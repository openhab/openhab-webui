
const categories = [
  'ACTIVITY_TRIGGER',
  'CAMERA',
  'COMPUTER',
  'CONTACT_SENSOR',
  'DOOR',
  'DOORBELL',
  'EXTERIOR_BLIND',
  'FAN',
  'GAME_CONSOLE',
  'GARAGE_DOOR',
  'INTERIOR_BLIND',
  'LAPTOP',
  'LIGHT',
  'MICROWAVE',
  'MOBILE_PHONE',
  'MOTION_SENSOR',
  'MUSIC_SYSTEM',
  'NETWORK_HARDWARE',
  'OTHER',
  'OVEN',
  'PHONE',
  'SCENE_TRIGGER',
  'SCREEN',
  'SECURITY_PANEL',
  'SMARTLOCK',
  'SMARTPLUG',
  'SPEAKER',
  'STREAMING_DEVICE',
  'SWITCH',
  'TABLET',
  'TEMPERATURE_SENSOR',
  'THERMOSTAT',
  'TV',
  'WEARABLE'
]

// Group endpoints are generated from the display categories. Example from the docs: SECURITY_PANEL => Endpoint.SecurityPanel.
const groupEndpoints = categories
  .map(category => {
    const convertedChars = []
    let capitalizeNext = false
    for (var i = 0; i < category.length; i++) {
      const currentChar = category.charAt(i)
      if (i === 0) {
        convertedChars.push(currentChar.toUpperCase())
      } else if (currentChar === '_') {
        capitalizeNext = true
      } else if (capitalizeNext) {
        convertedChars.push(currentChar.toUpperCase())
        capitalizeNext = false
      } else {
        convertedChars.push(currentChar.toLocaleLowerCase())
      }
    }
    return 'Endpoint.' + convertedChars.join('')
  }).reduce((endpoints, endpointName) => {
    endpoints[endpointName] = []
    return endpoints
  }, {})

const labels = {
  'Switchable': [],
  'Lighting': [],
  'Blind': [],
  'Door': [],
  'Lock': [],
  'Outlet': [],
  'CurrentHumidity': [],
  'CurrentTemperature': [],
  'TargetTemperature': [],
  'LowerTemperature': [],
  'UpperTemperature': [],
  'HeatingCoolingMode': [],
  'ColorTemperature': [],
  'Activity': [],
  'Scene': [],
  'EntertainmentChannel': [],
  'EntertainmentInput': [],
  'EqualizerBass': [],
  'EqualizerMidrange': [],
  'EqualizerTreble': [],
  'EqualizerMode': [],
  'MediaPlayer': [],
  'SpeakerMute': [],
  'SpeakerVolume': [],
  'ContactSensor': [],
  'MotionSensor': [],
  'SecurityAlarmMode': [],
  'BurglaryAlarm': [],
  'FireAlarm': [],
  'CarbonMonoxideAlarm': [],
  'WaterAlarm': [],
  'ModeComponent': [],
  'RangeComponent': [],
  'ToggleComponent': []
}

const p = (type, name, label, description, options, advanced) => {
  return {
    name,
    type,
    label,
    description,
    advanced,
    limitToOptions: !!options,
    options: (!options) ? undefined : options.split(',').map((o) => {
      const parts = o.split('=')
      return { value: parts[0], label: parts[1] || parts[0] }
    })
  }
}

const categoryParameter = p('TEXT', 'category', 'Category', 'Override the default category for the class', categories.join(','), true)
const scaleParameter = p('TEXT', 'scale', 'Scale', 'Temperature Unit', 'Celsius,Fahrenheit')
const comfortRangeParameter = p('TEXT', 'comfortRange', 'Comfort Range', 'Number to define the comfort range, defaults: 2°F or 1°C')
const setpointRangeParameter = p('TEXT', 'setpointRange', 'Setpoint Range', 'Format: <code>minRange:maxRange</code>')
const rangeParameter = p('TEXT', 'range', 'Range', 'Format: <code>minRange:maxRange</code>')
const volumeIncrementParameter = p('INTEGER', 'increment', 'Increment')
const friendlyNamesParameter = p('TEXT', 'friendlyNames', 'Friendly Names', 'each name formatted as <code>@assetIdOrName</code>, defaults to item label name')
const nonControllableParameter = p('BOOLEAN', 'nonControllable', 'Non Controllable')
const languageParameter = p('TEXT', 'language', 'Language', 'defaults to your server regional settings, if defined, otherwise en', 'de,en,es,fr,hi,it,ja,pt')
const actionMappingsParameter = p('TEXT', 'actionMappings', 'Action Mappings')
const stateMappingsParameter = p('TEXT', 'stateMappings', 'State Mappings')

const capabilities = {
  'PowerController.powerState': [],
  'BrightnessController.brightness': [],
  'PowerLevelController.powerLevel': [],
  'PercentageController.percentage': [],
  'ThermostatController.targetSetpoint': [
    scaleParameter,
    setpointRangeParameter
  ],
  'ThermostatController.upperSetpoint': [
    scaleParameter,
    comfortRangeParameter,
    setpointRangeParameter
  ],
  'ThermostatController.lowerSetpoint': [
    scaleParameter,
    comfortRangeParameter,
    setpointRangeParameter
  ],
  'ThermostatController.thermostatMode': [
    p('TEXT', 'OFF', 'OFF State'),
    p('TEXT', 'HEAT', 'HEAT State'),
    p('TEXT', 'COOL', 'COOL State'),
    p('TEXT', 'ECO', 'ECO State'),
    p('TEXT', 'AUTO', 'AUTO State'),
    p('TEXT', 'binding', 'Binding', 'Auto-configure modes for binding', 'daikin,max,nest,zwave'),
    p('TEXT', 'supportedModes', 'Supported modes'),
    p('BOOLEAN', 'supportsSetpointMode', 'Supports Setpoint Mode', '', null, true)
  ],
  'TemperatureSensor.temperature': [scaleParameter],
  'LockController.lockState': [
    p('TEXT', 'LOCKED', 'Locked State'),
    p('TEXT', 'UNLOCKED', 'Unlocked State'),
    p('TEXT', 'JAMMED', 'Jammed State')
  ],
  'ColorController.color': [],
  'ColorTemperatureController.colorTemperatureInKelvin': [
    p('INTEGER', 'increment', 'Increment'),
    rangeParameter,
    p('TEXT', 'binding', 'Binding', 'Auto-configure range for binding', 'hue,lifx,milight,tradfri,yeelight')
  ],
  'SceneController.scene': [
    p('TEXT', 'supportsDeactivation', 'Supports deactivation')
  ],
  'ChannelController.channel': [
    // User should switch to YAML for this one
  ],
  'InputController.input': [
    p('TEXT', 'supportedInputs', 'required list of supported input values (e.g. "HMDI1,TV,XBOX")')
  ],
  'Speaker.volume': [
    volumeIncrementParameter
  ],
  'Speaker.muted': [],
  'StepSpeaker.volume': [
    volumeIncrementParameter
  ],
  'StepSpeaker.muted': [],
  'PlaybackController.playback': [],
  'EqualizerController.bands:bass': [
    rangeParameter
  ],
  'EqualizerController.bands:midrange': [
    rangeParameter
  ],
  'EqualizerController.bands:treble': [
    rangeParameter
  ],
  'EqualizerController.modes': [
    p('TEXT', 'MOVIE', 'MOVIE State'),
    p('TEXT', 'MUSIC', 'MUSIC State'),
    p('TEXT', 'NIGHT', 'NIGHT State'),
    p('TEXT', 'SPORT', 'SPORT State'),
    p('TEXT', 'TV', 'TV State'),
    p('TEXT', 'supportedModes', 'Supported modes')
  ],

  // TODO the rest
  'ContactSensor.detectionState': [],
  'MotionSensor.detectionState': [],
  'SecurityPanelController.armState': [
    p('TEXT', 'DISARMED', 'DISARMED State'),
    p('TEXT', 'ARMED_STAY', 'ARMED_STAY State'),
    p('TEXT', 'ARMED_AWAY', 'ARMED_AWAY State'),
    p('TEXT', 'ARMED_NIGHT', 'ARMED_NIGHT State'),
    p('TEXT', 'AUTHORIZATION_REQUIRED', 'AUTHORIZATION_REQUIRED State'),
    p('TEXT', 'UNAUTHORIZED', 'UNAUTHORIZED State'),
    p('TEXT', 'NOT_READY', 'NOT_READY State'),
    p('TEXT', 'UNCLEARED_ALARM', 'UNCLEARED_ALARM State'),
    p('TEXT', 'UNCLEARED_TROUBLE', 'UNCLEARED_TROUBLE State'),
    p('TEXT', 'BYPASS_NEEDED', 'BYPASS_NEEDED State'),
    p('TEXT', 'supportedArmStates', 'Supported arm states'),
    p('BOOLEAN', 'supportsPinCodes', 'Supports pin codes'),
    p('INTEGER', 'exitDelay', 'Exit Delay')
  ],
  'SecurityPanelController.burglaryAlarm': [],
  'SecurityPanelController.fireAlarm': [],
  'SecurityPanelController.carbonMonoxideAlarm': [],
  'SecurityPanelController.waterAlarm': [],
  'ModeController.mode': [
    friendlyNamesParameter,
    nonControllableParameter,
    p('TEXT', 'supportedModes', 'Supported Modes'),
    p('BOOLEAN', 'ordered', 'Ordered'),
    languageParameter,
    actionMappingsParameter,
    stateMappingsParameter
  ],
  'RangeController.rangeValue': [
    friendlyNamesParameter,
    nonControllableParameter,
    p('TEXT', 'supportedRange', 'Supported Range'),
    p('TEXT', 'presets', 'Presets'),
    p('TEXT', 'unitOfMeasure', 'Unit of Measure'),
    languageParameter,
    actionMappingsParameter,
    stateMappingsParameter
  ],
  'ToggleController.toggleState': [
    friendlyNamesParameter,
    nonControllableParameter,
    languageParameter,
    actionMappingsParameter,
    stateMappingsParameter
  ]
}

let classes = {}

for (let l in labels) {
  labels[l].unshift(categoryParameter)
  classes['label:' + l] = labels[l]
}

for (let l in groupEndpoints) {
  groupEndpoints[l].unshift(categoryParameter)
  classes['endpoint:' + l] = groupEndpoints[l]
}

for (let c in capabilities) {
  capabilities[c].unshift(categoryParameter)
  classes[c] = capabilities[c]
}

export default classes
