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
const checkStateParameter = p('BOOLEAN', 'checkState', 'Check Current State', 'When this is enabled, the current state of the target item is queried and compared to the potential new state triggered by the command. If it is identical, a special error message is triggered and communicated to the user', null, true)
const tfaAckParameter = p('BOOLEAN', 'ackNeeded', 'Secondary User Verification - Acknowledgement needed', 'When this is set, Google will ask for acknowledgement (yes or no) before executing the action', null, true)
const tfaPinParameter = p('TEXT', 'pinNeeded', 'Secondary User Verification - PIN', 'When this is set, Google will require this PIN before executing the action', null, true)
const nameParameter = p('TEXT', 'name', 'Custom name', 'The name of the device used in Google (use synonyms instead if possible)', null, true)
const roomHintParameter = p('TEXT', 'roomHint', 'Room hint', 'Suggested name for the room where this device is installed', null, true)
const structureHintParameter = p('TEXT', 'structureHint', 'Structure hint', 'Suggested name for the structure where this device is installed', null, true)
const invertedParameter = p('BOOLEAN', 'inverted', 'Inverted', 'Inverts the values, e.g. ON becomes OFF for a switch or 0% becomes 100% for a curtain')
const langParameter = p('TEXT', 'lang', 'Language', 'Language used for parsing text in the other parameters, e.g. "en"')
// Camera
const protocolsParameter = p('TEXT', 'protocols', 'Protocols', 'List of supported protocols (comma separated), e.g. "hls,dash,smooth_stream,progressive_mp4"')
const tokenNeededParameter = p('BOOLEAN', 'token', 'Authentification token needed')
// Fans
const speedParameter = p('TEXT', 'speeds', 'Speeds', 'Mappings between items states and Google modes (comma separated), e.g. "0=away:zero,50=default:standard:one,100=high:two"')
const orderedParameter = p('BOOLEAN', 'ordered', 'Ordered')
// Lights
const colorTemperatureRangeParameter = p('TEXT', 'colorTemperatureRange', 'Color temperature range', '(Color lights only) Supported color temperature range in Kelvin (comma separated), e.g. "2000,9000"')
const colorUnitParameter = p('TEXT', 'colorUnit', 'Color Unit', '(Color lights only) Specify the unit to be used for the "lightColorTemperature" child in a grouped light, e.g. "kelvin", "mired" or "percent"')
// OpenCloseDevices
const discreteOnlyParameter = p('BOOLEAN', 'discreteOnly', 'Discrete values only', 'Device must either be fully open or fully closed (no states in between)')
const queryOnlyParameter = p('BOOLEAN', 'queryOnly', 'Read-only', 'Device is read-only (can not be controlled)')
// Scenes
const sceneReversibleParameter = p('BOOLEAN', 'sceneReversible', 'Reversible', 'Scene can be reversed ("turned off")')
// Sensors
const sensorNameParameter = p('TEXT', 'sensorName', 'Sensor name', 'Sensor name (type), see <a class="link external" target="_blank" external href="https://developers.google.com/assistant/smarthome/traits/sensorstate?hl=en#supported-sensors">the docs</a> for supported values')
const valueUnitParameter = p('TEXT', 'valueUnit', 'Value unit', 'Sensor value unit, see <a class="link external" target="_blank" external href="https://developers.google.com/assistant/smarthome/traits/sensorstate?hl=en#supported-sensors">the docs</a> for supported values')
const statesParameter = p('TEXT', 'states', 'states', 'Sensor states with mappings from Google values to openHAB item values (comma seperated), e.g. "no smoke detected=0,smoke detected=1". See <a class="link external" target="_blank" external href="https://developers.google.com/assistant/smarthome/traits/sensorstate?hl=en#supported-sensors">the docs</a> for supported values')
// Speakers
const volumeMaxLevelParameter = p('INTEGER', 'volumeMaxLevel', 'Maximum volume level', 'Depends on the device, e.g. "10"')
const volumeDefaultPercentageParameter = p('INTEGER', 'volumeDefaultPercentage', 'Default volume', 'Default volume in percent of the maximum volume (default is 40%)')
const levelStepSizeParameter = p('INTEGER', 'levelStepSize', 'Step size', 'Step size for relative volume queries like "volume up" (default is 1)')
// Thermostat
const thermostatModesParameter = p('TEXT', 'modes', 'Thermostat modes', 'Mappings from Google values to openHAB item values (comma separated), e.g. "off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto"')
const thermostatTemperatureRangeParameter = p('TEXT', 'thermostatTemperatureRange', 'Thermostat temperature range', 'The temperature range your thermostat supports (comma separated, in Celsius), e.g. "10,30"')
const useFahrenheitParameter = p('BOOLEAN', 'useFahrenheit', 'Use Fahrenheit')
// TV
const transportControlSupportedCommandsParameter = p('TEXT', 'transportControlSupportedCommands', 'Supported transport controls', 'List of supported controls, e.g. "NEXT,PREVIOUS,PAUSE,RESUME"')
const availableInputsParameter = p('TEXT', 'availableInputs', 'Available inputs', 'List of available inputs with mapping (comma separated), e.g. "inputKey=inputName:inputSynonym1:inputSynonym2:..."')
const availableChannelsParameter = p('TEXT', 'availableChannels', 'Available channels', 'List of available channels with mapping (comma separated), e.g. "channelNumber=channelId=channelName:channelSynonym1:channelSynonym2:..."')
const availableApplicationsParameter = p('TEXT', 'availableApplications', 'Available applications', 'List of available applications with mapping (comma separated), e.g. "applicationKey=applicationName:applicationSynonym:..."')
// SecuritySystem
const waitForStateChangeParameter = p('INTEGER', 'waitForStateChange', 'Waiting time for state verification', 'Defines the number of seconds to wait for the security system state to update before checking that the arm/disarm was successful, e.g. "5"')
const pinOnDisarmOnlyParameter = p('BOOLEAN', 'pinOnDisarmOnly', 'Require PIN only for Disarm', 'Will enforce the PIN on disarming only. Arming will be done without the PIN')
const armLevelsParameter = p('TEXT', 'armLevels', 'Arm Levels', 'List of supported arm levels as "Key=Label" (comma separated) where the label is used for the command and the key is sent to openHAB, e.g. "L1=Level 1,L2=Level 2"')
const blockingParameter = p('BOOLEAN', 'blocking', 'Blocking zone', 'If set Google will attempt to check for zones that are causing the arming to fail')
const zoneTypeParameter = p('TEXT', 'zoneType', 'Zone Type', 'Type of security zone sensor, e.g. "OpenClose" or "Motion"')
// Charger
const isRechargeableParameter = p('BOOLEAN', 'isRechargeable', 'Rechargeable', 'Set to true if this device is rechargeable and may report capacityUntilFull, isCharging, isPluggedIn state, and can accept the Charge command')
const unitParameter = p('TEXT', 'unit', 'Capacity Unit', 'Unit to be used for charger capacity, e.g. "PERCENTAGE", "SECONDS", "MILES", "KILOMETERS" or "KILOWATT_HOURS"')

const deviceTypes = {
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
  // Lights
  'Light': [colorTemperatureRangeParameter],
  'SpecialColorLight': [colorTemperatureRangeParameter, colorUnitParameter],
  // Other Devices
  'Charger': [isRechargeableParameter, unitParameter],
  'Camera': [protocolsParameter, tokenNeededParameter],
  'Lock': [invertedParameter],
  'Scene': [sceneReversibleParameter],
  'SecuritySystem': [armLevelsParameter, pinOnDisarmOnlyParameter, waitForStateChangeParameter, invertedParameter],
  'Sensor': [sensorNameParameter, valueUnitParameter, statesParameter],
  'Speaker': [volumeMaxLevelParameter, volumeDefaultPercentageParameter, levelStepSizeParameter],
  'HumiditySensor': [],
  'TemperatureSensor': [useFahrenheitParameter],
  'ClimateSensor': [useFahrenheitParameter],
  'Thermostat': [useFahrenheitParameter, thermostatModesParameter, thermostatTemperatureRangeParameter],
  'TV': [volumeMaxLevelParameter, volumeDefaultPercentageParameter, levelStepSizeParameter, langParameter, transportControlSupportedCommandsParameter, availableInputsParameter, availableChannelsParameter, availableApplicationsParameter],
  'Valve': [invertedParameter]
}

for (let c in deviceTypes) {
  deviceTypes[c] = [...deviceTypes[c], nameParameter, roomHintParameter, structureHintParameter, checkStateParameter, tfaAckParameter, tfaPinParameter]
}

const deviceAttributes = {
  'thermostatTemperatureAmbient': [],
  'thermostatHumidityAmbient': [],
  'thermostatTemperatureSetpoint': [],
  'thermostatTemperatureSetpointLow': [],
  'thermostatTemperatureSetpointHigh': [],
  'thermostatMode': [],
  'temperatureAmbient': [],
  'humidityAmbient': [],
  'tvPower': [],
  'tvMute': [],
  'tvVolume': [],
  'tvChannel': [],
  'tvInput': [],
  'tvApplication': [],
  'tvTransport': [],
  'lightPower': [],
  'lightBrightness': [],
  'lightColor': [],
  'lightColorTemperature': [],
  'chargerCharging': [],
  'chargerPluggedIn': [],
  'chargerCapacityRemaining': [],
  'chargerCapacityUntilFull': [],
  'securitySystemArmed': [],
  'securitySystemArmLevel': [],
  'securitySystemTrouble': [],
  'securitySystemTroubleCode': [],
  'securitySystemZone': [zoneTypeParameter, blockingParameter]
}

let classes = {}

for (let l in deviceTypes) {
  classes['type:' + l] = deviceTypes[l]
}

for (let l in deviceAttributes) {
  classes['attribute:' + l] = deviceAttributes[l]
}

export default classes
