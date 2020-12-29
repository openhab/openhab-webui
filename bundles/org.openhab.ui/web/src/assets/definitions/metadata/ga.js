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

const tfaAckParameter = p('BOOLEAN', 'tfaAck', 'Two-Factor-Authentication Ack Needed')
const tfaPinParameter = p('TEXT', 'tfaPin', 'Two-Factor-Authentication Pin')
const nameParameter = p('TEXT', 'name', 'Name', 'Custom name (use of the synonyms is preferred)', null, true)
const roomHintParameter = p('TEXT', 'roomHint', 'Room Hint', 'Suggested name for the room where this device is installed', null, true)
const structureHintParameter = p('TEXT', 'structureHint', 'Structure Hint', 'Suggested name for the structure where this device is installed', null, true)
const invertedParameter = p('BOOLEAN', 'inverted', 'Inverted')
const speedParameter = p('TEXT', 'speeds', 'Speeds', 'Mappings between items states and Google modes (comma separated), e.g. "0=away:zero,50=default:standard:one,100=high:two"')
const langParameter = p('TEXT', 'lang', 'Language', 'Language used for parsing text in the other parameters, e.g. "en"')
const orderedParameter = p('BOOLEAN', 'ordered', 'Ordered')
const useFahrenheitParameter = p('BOOLEAN', 'useFahrenheit', 'Use Fahrenheit')
const thermostatModesParameter = p('TEXT', 'modes', 'Thermostat Modes', 'Mappings between items states and Google modes (comma separated), e.g. "off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto"')
const thermostatTemperatureRangeParameter = p('TEXT', 'thermostatTemperatureRange', 'Temperature Range', 'The temperature range your thermostat supports (comma separated), e.g. "10,30"')
const protocolsParameter = p('TEXT', 'protocols', 'Protocols', 'List of supported protocols (comma separated), e.g. "hls,dash,smooth_stream,progressive_mp4"')
const tokenNeededParameter = p('BOOLEAN', 'token', 'Authentification Token Needed')

const classes = {
  'Light': [],
  'Switch': [ invertedParameter ],
  'Outlet': [ invertedParameter ],
  'Coffee_Maker': [ invertedParameter ],
  'WaterHeater': [ invertedParameter ],
  'Fireplace': [ invertedParameter ],
  'Valve': [ invertedParameter ],
  'Sprinkler': [ invertedParameter ],
  'Vacuum': [ invertedParameter ],
  'Scene': [],
  'Lock': [ invertedParameter ],
  'SecuritySystem': [ invertedParameter ],
  'Speaker': [],
  'Fan': [ speedParameter, langParameter, orderedParameter ],
  'Hood': [ speedParameter, langParameter, orderedParameter ],
  'AirPurifier': [ speedParameter, langParameter, orderedParameter ],
  'Awning': [ invertedParameter ],
  'Blinds': [ invertedParameter ],
  'Curtain': [ invertedParameter ],
  'Door': [ invertedParameter ],
  'Garage': [ invertedParameter ],
  'Gate': [ invertedParameter ],
  'Pergola': [ invertedParameter ],
  'Shutter': [ invertedParameter ],
  'Window': [ invertedParameter ],
  'Thermostat': [ useFahrenheitParameter, thermostatModesParameter, thermostatTemperatureRangeParameter ],
  'thermostatTemperatureAmbient': [],
  'thermostatHumidityAmbient': [],
  'thermostatTemperatureSetpoint': [],
  'thermostatTemperatureSetpointHigh': [],
  'thermostatTemperatureSetpointLow': [],
  'thermostatMode': [],
  'Camera': [ protocolsParameter, tokenNeededParameter ]
}

for (let c in classes) {
  classes[c] = [...classes[c], tfaAckParameter, tfaPinParameter, nameParameter, roomHintParameter, structureHintParameter]
}

export default classes
