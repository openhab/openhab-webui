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

// Common
const tfaAckParameter = p('BOOLEAN', 'tfaAck', 'Two-Factor-Authentication Ack Needed')
const tfaPinParameter = p('TEXT', 'tfaPin', 'Two-Factor-Authentication Pin')
const nameParameter = p('TEXT', 'name', 'Name', 'Custom name (use of the synonyms is preferred)', null, true)
const roomHintParameter = p('TEXT', 'roomHint', 'Room hint', 'Suggested name for the room where this device is installed', null, true)
const structureHintParameter = p('TEXT', 'structureHint', 'Structure hint', 'Suggested name for the structure where this device is installed', null, true)
const invertedParameter = p('BOOLEAN', 'inverted', 'Inverted')
const langParameter = p('TEXT', 'lang', 'Language', 'Language used for parsing text in the other parameters, e.g. "en"')
// Camera
const protocolsParameter = p('TEXT', 'protocols', 'Protocols', 'List of supported protocols (comma separated), e.g. "hls,dash,smooth_stream,progressive_mp4"')
const tokenNeededParameter = p('BOOLEAN', 'token', 'Authentification token needed')
// Fans
const speedParameter = p('TEXT', 'speeds', 'Speeds', 'Mappings between items states and Google modes (comma separated), e.g. "0=away:zero,50=default:standard:one,100=high:two"')
const orderedParameter = p('BOOLEAN', 'ordered', 'Ordered')
// Lights
const colorTemperatureRangeParameter = p('TEXT', 'colorTemperatureRange', 'Color temperature range', '(Color lights only) Supported color temperature range in Kelvin (comma separated), e.g. "2000,9000"')
const useKelvinParameter = p('BOOLEAN', 'useKelvin', '(Color lights only) Use Kelvin instead of percentage for a the "lightColorTemperature" child in a grouped light')
// OpenCloseDevices
const discreteOnlyParameter = p('BOOLEAN', 'discreteOnlyOpenClose', 'Device must either be fully open or fully closed (no states in between)')
const queryOnlyParameter = p('BOOLEAN', 'queryOnlyOpenClose', 'Device is read-only (can not be controlled)')
// Scenes
const sceneReversibleParameter = p('BOOLEAN', 'sceneReversible', 'Scene can be reversed ("turned off")')
// Sensors
const sensorNameParameter = p('TEXT', 'sensorName', 'Sensor name', 'Supported sensor type, see https://developers.google.com/assistant/smarthome/traits/sensorstate?hl=en#supported-sensors for supported values')
const valueUnitParameter = p('TEXT', 'valueUnit', 'Value unit', 'Supported value unit, see https://developers.google.com/assistant/smarthome/traits/sensorstate?hl=en#supported-sensors for supported values')
const statesParameter = p('TEXT', 'states', 'States', 'Supported states with mapping from Google values to openHAB values (comma seperated), e.g. "no smoke detected=0,smoke detected=1". See https://developers.google.com/assistant/smarthome/traits/sensorstate?hl=en#supported-sensors for supported values')
// Speakers
const volumeMaxLevelParameter = p('INTEGER', 'volumeMaxLevel', 'Maximum volume level')
const volumeDefaultPercentageParameter = p('INTEGER', 'volumeDefaultPercentage', 'Default volume in percent of the maximum volume')
const levelStepSizeParameter = p('INTEGER', 'levelStepSize', 'Step size for relative volume queries like "volume up"')
// Thermostat
const thermostatModesParameter = p('TEXT', 'modes', 'Thermostat modes', 'Mappings between items states and Google modes (comma separated), e.g. "off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto"')
const thermostatTemperatureRangeParameter = p('TEXT', 'thermostatTemperatureRange', 'Temperature range', 'The temperature range your thermostat supports (comma separated), e.g. "10,30"')
const useFahrenheitParameter = p('BOOLEAN', 'useFahrenheit', 'Use Fahrenheit')
// TV
const transportControlSupportedCommandsParameter = p('TEXT', 'transportControlSupportedCommands', 'Supported transport controls', 'List of supported controls, e.g. "NEXT,PREVIOUS,PAUSE,RESUME"')
const availableInputsParameter = p('TEXT', 'availableInputs', 'Available inputs', 'List of available inputs with mapping (comma separated), e.g. "inputKey=inputName:inputSynonym1:inputSynonym2:..."')
const availableChannelsParameter = p('TEXT', 'availableChannels', 'Available channels', 'List of available channels with mapping (comma separated), e.g. "channelNumber=channelId=channelName:channelSynonym1:channelSynonym2:..."')

let classes = {
  // Switches
  'Switch': [invertedParameter],
  'Coffee_Maker': [invertedParameter],
  'Fireplace': [invertedParameter],
  'Outlet': [invertedParameter],
  'WaterHeater': [invertedParameter],
  // StartStopSwitches
  'Sprinkler': [invertedParameter],
  'Vacuum': [invertedParameter],
  // OpenCloseDevices
  'Awning': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Blinds': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Curtain': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Door': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Gate': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Garage': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Pergola': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Shutter': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  'Window': [invertedParameter, discreteOnlyParameter, queryOnlyParameter],
  // Fans
  'Fan': [speedParameter, langParameter, orderedParameter],
  'AirPurifier': [speedParameter, langParameter, orderedParameter],
  'Hood': [speedParameter, langParameter, orderedParameter],
  // Other Devices
  'Camera': [protocolsParameter, tokenNeededParameter],
  'Light': [colorTemperatureRangeParameter, useKelvinParameter],
  'Lock': [invertedParameter],
  'Scene': [sceneReversibleParameter],
  'SecuritySystem': [invertedParameter],
  'Sensor': [sensorNameParameter, valueUnitParameter, statesParameter],
  'Speaker': [volumeMaxLevelParameter, volumeDefaultPercentageParameter, levelStepSizeParameter],
  'TemperatureSensor': [useFahrenheitParameter],
  'Thermostat': [useFahrenheitParameter, thermostatModesParameter, thermostatTemperatureRangeParameter],
  'TV': [volumeMaxLevelParameter, volumeDefaultPercentageParameter, levelStepSizeParameter, langParameter, transportControlSupportedCommandsParameter, availableInputsParameter, availableChannelsParameter],
  'Valve': [invertedParameter]
}

for (let c in classes) {
  classes[c] = [...classes[c], tfaAckParameter, tfaPinParameter, nameParameter, roomHintParameter, structureHintParameter]
}

classes = {
  ...classes,
  'thermostatTemperatureAmbient': [],
  'thermostatHumidityAmbient': [],
  'thermostatTemperatureSetpoint': [],
  'thermostatTemperatureSetpointLow': [],
  'thermostatTemperatureSetpointHigh': [],
  'thermostatMode': [],
  'lightBrightness': [],
  'lightColorTemperature': [],
  'tvPower': [],
  'tvMute': [],
  'tvVolume': [],
  'tvChannel': [],
  'tvInput': [],
  'tvTransport': []
}

export default classes
