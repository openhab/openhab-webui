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

const tfaAckParameter = p('BOOLEAN', 'tfaAck', 'TFA Ack Needed')
const tfaPinParameter = p('TEXT', 'tfaPin', 'TFA Pin')
const nameParameter = p('TEXT', 'name', 'Name', 'Custom name (use of the synonyms is preferred)', null, true)
const roomHintParameter = p('TEXT', 'roomHint', 'Room Hint', null, null, true)
const invertedParameter = p('BOOLEAN', 'inverted', 'Inverted')
const speedParameter = p('TEXT', 'speed', 'Speed', 'Mappings between items states and Google modes')
const orderedParameter = p('BOOLEAN', 'ordered', 'Ordered')
const useFahrenheitParameter = p('BOOLEAN', 'useFahrenheit', 'Use Fahrenheit')
const thermostatModesParameter = p('TEXT', 'modes', 'Thermostat Modes', 'Mappings between items states and Google modes')

const classes = {
  'Light': [],
  'Switch': [],
  'Outlet': [],
  'CoffeeMaker': [],
  'WaterHeater': [],
  'Fireplace': [],
  'Valve': [],
  'Sprinkler': [],
  'Vacuum': [],
  'Scene': [],
  'Lock': [],
  'SecuritySystem': [],
  'Speaker': [],
  'Fan': [ speedParameter, orderedParameter ],
  'Hood': [ speedParameter, orderedParameter ],
  'AirPurifier': [ speedParameter, orderedParameter ],
  'Awning': [ invertedParameter ],
  'Blinds': [ invertedParameter ],
  'Curtain': [ invertedParameter ],
  'Door': [ invertedParameter ],
  'Garage': [ invertedParameter ],
  'Gate': [ invertedParameter ],
  'Pergola': [ invertedParameter ],
  'Shutter': [ invertedParameter ],
  'Window': [ invertedParameter ],
  'Thermostat': [ useFahrenheitParameter, thermostatModesParameter ],
  'thermostatTemperatureAmbient': [],
  'thermostatHumidityAmbient': [],
  'thermostatTemperatureSetpoint': [],
  'thermostatMode': [],
  'Camera': []
}

for (let c in classes) {
  classes[c] = [...classes[c], tfaAckParameter, tfaPinParameter, nameParameter, roomHintParameter]
}

export default classes
