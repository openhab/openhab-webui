import {
  ARM_STATES,
  EQUALIZER_MODES,
  LANGUAGES,
  PLAYBACK_OPERATIONS,
  STATE_DESCRIPTION_OPTIONS_LIMIT,
  TEMPERATURE_SCALES,
  THERMOSTAT_MODES,
  UNITS_OF_MEASURE
} from './constants.js'
import {
  docLink,
  getOptions,
  getSemanticFormat,
  getTemperatureScale,
  getUnitOfMeasure,
  titleCase
} from './helpers.js'

export default {
  actionMappings: (format, placeholder, defaultValue) => ({
    name: 'actionMappings',
    label: 'Action Mappings',
    description: `Each mapping formatted as ${getSemanticFormat('action', format)} (${docLink('Semantic Extensions')})`,
    type: 'TEXT',
    default: defaultValue,
    placeholder: placeholder.replace(/,/g, '\n'),
    multiple: true,
    advanced: !!defaultValue,
    visible: (_, config) => !config.nonControllable
  }),
  basicAuthPassword: () => ({
    name: 'password',
    label: 'Basic Authentication Password',
    type: 'TEXT',
    context: 'password'
  }),
  basicAuthUsername: () => ({
    name: 'username',
    label: 'Basic Authentication Username',
    type: 'TEXT'
  }),
  capabilityNames: (defaultValue, placeholder) => ({
    name: 'capabilityNames',
    label: 'Capability Names',
    description: `Each name formatted as <code>@assetIdOrName</code> (${docLink('Asset Catalog')})`,
    type: 'TEXT',
    default: [defaultValue],
    placeholder: placeholder.replace(/,/g, '\n'),
    multiple: true,
    required: !defaultValue
  }),
  channelMappings: (required) => ({
    name: 'channelMappings',
    label: 'Channel Mappings',
    description: 'Each mapping formatted as <code>channelId=channelName<code>',
    type: 'TEXT',
    placeholder: '2=CBS\n4=NBC\n7=ABC\n13=PBS',
    multiple: true,
    required
  }),
  channelRange: () => ({
    name: 'range',
    label: 'Channel Range',
    description: 'Formatted as <code>minValue:maxValue</code>',
    type: 'TEXT',
    default: '1:9999',
    pattern: '[0-9]+:[0-9]+',
    advanced: true
  }),
  colorTemperatureBinding: () => ({
    name: 'binding',
    label: 'Binding/Device Type',
    description: 'Range binding presets',
    type: 'TEXT',
    options: getOptions({
      'lifx:color': 'LIFX (Color)',
      'lifx:white': 'LIFX (White)',
      'milight:color': 'Milight/Easybulb/Limitless (Color)',
      'milight:white': 'Milight/Easybulb/Limitless (White)',
      'hue:color': 'Philips Hue (Color)',
      'hue:white': 'Philips Hue (White)',
      'tplinksmarthome:color': 'TP-Link Smart Home (Color)',
      'tplinksmarthome:white': 'TP-Link Smart Home (White)',
      'tradfri:color': 'TRÅDFRI (Color)',
      'tradfri:white': 'TRÅDFRI (White)',
      'yeelight:color': 'Yeelight (Color)',
      'yeelight:white': 'Yeelight (White)'
    }),
    limitToOptions: true,
    visible: (_, config) => config.range === '1000:10000'
  }),
  colorTemperatureRange: () => ({
    name: 'range',
    label: 'Temperature Range in Kelvin',
    description: 'Formatted as <code>minValue:maxValue</code>',
    type: 'TEXT',
    default: '1000:10000',
    pattern: '[0-9]+:[0-9]+',
    visible: (_, config) => !config.binding
  }),
  comfortRange: (item) => ({
    name: 'comfortRange',
    label: 'Comfort Range',
    type: 'INTEGER',
    min: 1,
    default: (config) => (config.scale || getTemperatureScale(item)) === 'FAHRENHEIT' ? 2 : 1
  }),
  connectedTo: (value) => ({
    name: 'connectedTo',
    label: 'Connected To',
    type: 'TEXT',
    default: value,
    readOnly: true
  }),
  deviceDescription: (defaultValue) => ({
    name: 'description',
    label: 'Device Description',
    type: 'TEXT',
    default: defaultValue,
    advanced: true
  }),
  deviceName: (defaultValue) => ({
    name: 'name',
    label: 'Device Name',
    type: 'TEXT',
    default: defaultValue,
    advanced: !!defaultValue,
    required: !defaultValue
  }),
  equalizerDefaultLevel: (defaultValue) => ({
    name: 'defaultLevel',
    label: 'Default Level',
    description: 'Defaults to equalizer range midpoint',
    type: 'INTEGER',
    default: (config) => {
      if (!config.range) return defaultValue
      const range = config.range.split(':').map((n) => parseInt(n))
      if (range[0] < range[1]) return Math.round((range[0] + range[1]) / 2)
    }
  }),
  equalizerRange: (defaultValue) => ({
    name: 'range',
    label: 'Equalizer Range',
    description: 'Formatted as <code>minValue:maxValue</code>',
    type: 'TEXT',
    default: defaultValue,
    pattern: '[+-]?[0-9]+:[+-]?[0-9]+'
  }),
  exitDelay: () => ({
    name: 'exitDelay',
    label: 'Exit Delay in Seconds',
    type: 'INTEGER',
    min: 0,
    max: 255,
    advanced: true
  }),
  hostname: () => ({
    name: 'hostname',
    label: 'Hostname',
    type: 'TEXT',
    default: 'N/A',
    advanced: true
  }),
  increment: (defaultValue) => ({
    name: 'increment',
    label: 'Default Increment',
    ...(isNaN(defaultValue) && { description: `Defaults to ${defaultValue}` }),
    type: 'INTEGER',
    min: 1,
    ...(!isNaN(defaultValue) && { default: defaultValue })
  }),
  inverted: (defaultValue = false) => ({
    name: 'inverted',
    label: 'Inverted',
    type: 'BOOLEAN',
    default: defaultValue
  }),
  language: (defaultValue) => ({
    name: 'language',
    label: 'Language',
    description: 'Language for text-based names',
    type: 'TEXT',
    default: LANGUAGES[defaultValue] ? defaultValue : 'en',
    options: getOptions(LANGUAGES),
    limitToOptions: true,
    advanced: true
  }),
  macAddress: () => ({
    name: 'macAddress',
    label: 'MAC Address',
    description: 'Formatted as EUI-48 or EUI-64 address with colon or dash separators',
    type: 'TEXT',
    pattern: '([0-9a-fA-F]{2}(-|:)){7}[0-9a-fA-F]{2}$|^([0-9a-fA-F]{2}(-|:)){5}[0-9a-fA-F]{2}'
  }),
  nonControllable: (stateDescription) => ({
    name: 'nonControllable',
    label: 'Non-Controllable',
    type: 'BOOLEAN',
    default: (stateDescription && stateDescription.readOnly) === true,
    visible: (_, config) => !!config.retrievable
  }),
  ordered: () => ({
    name: 'ordered',
    label: 'Ordered',
    description: 'If modes can be adjusted incrementally',
    type: 'BOOLEAN',
    default: false
  }),
  pinCodes: () => ({
    name: 'pinCodes',
    label: 'Pin Codes',
    description: 'Each code formatted as 4-digit pin',
    type: 'TEXT',
    placeholder: '1234\n9876',
    multiple: true,
    advanced: true
  }),
  presets: (stateDescription, placeholder) => ({
    name: 'presets',
    label: 'Presets',
    description:
      'Each preset formatted as <code>presetValue=@assetIdOrName1:@assetIdOrName2:...</code>' +
      ` (${docLink('Asset Catalog')})`,
    type: 'TEXT',
    default:
      stateDescription &&
      stateDescription.options &&
      stateDescription.options
        .filter((option) => !isNaN(option.value))
        .map((option) => `${option.value}=${option.label}`)
        .slice(0, STATE_DESCRIPTION_OPTIONS_LIMIT),
    placeholder: placeholder.replace(/,/g, '\n'),
    multiple: true
  }),
  primaryControl: () => ({
    name: 'primaryControl',
    label: 'Primary Control',
    description: 'Primary control for open/close/stop utterances',
    type: 'TEXT',
    default: 'position',
    options: getOptions({ position: 'Position', tilt: 'Tilt' }),
    limitToOptions: true
  }),
  proxyBaseUrl: () => ({
    name: 'proxyBaseUrl',
    label: 'Proxy Base URL',
    type: 'TEXT',
    required: true,
    pattern: 'https://.+'
  }),
  requiresSetColorReset: () => ({
    name: 'requiresSetColorReset',
    label: 'Requires Reset on Set Color Requests',
    type: 'BOOLEAN',
    default: false,
    visible: (_, config) => !!config.retrievable
  }),
  requiresSetpointHold: () => ({
    name: 'requiresSetpointHold',
    label: 'Requires Hold on Setpoint Requests',
    type: 'BOOLEAN',
    default: false
  }),
  resolution: () => ({
    name: 'resolution',
    label: 'Resolution',
    type: 'TEXT',
    default: '1080p',
    options: getOptions(['480p', '720p', '1080p']),
    limitToOptions: true
  }),
  retrievable: () => ({
    name: 'retrievable',
    label: 'State Retrievable',
    type: 'BOOLEAN',
    default: true,
    advanced: true,
    visible: (_, config) => !config.nonControllable
  }),
  scale: (item, advanced = false) => ({
    name: 'scale',
    label: 'Scale',
    type: 'TEXT',
    default: getTemperatureScale(item) === 'FAHRENHEIT' ? 'FAHRENHEIT' : 'CELSIUS',
    options: getOptions(TEMPERATURE_SCALES),
    limitToOptions: true,
    advanced
  }),
  setpointRange: (item) => ({
    name: 'setpointRange',
    label: 'Setpoint Range',
    description: 'Formatted as <code>minValue:maxValue</code>',
    type: 'TEXT',
    default: (config) => (config.scale || getTemperatureScale(item)) === 'FAHRENHEIT' ? '40:90' : '4:32',
    pattern: '[+-]?[0-9]+:[+-]?[0-9]+'
  }),
  speedLevels: () => ({
    name: 'speedLevels',
    label: 'Speed Levels',
    type: 'INTEGER',
    min: 2,
    default: 3
  }),
  stateMappings: (format, placeholder) => ({
    name: 'stateMappings',
    label: 'State Mappings',
    description: `Each mapping formatted as ${getSemanticFormat('state', format)} (${docLink('Semantic Extensions')})`,
    type: 'TEXT',
    placeholder: placeholder.replace(/,/g, '\n'),
    multiple: true,
    visible: (_, config) => !!config.retrievable
  }),
  supportedArmStates: () => ({
    name: 'supportedArmStates',
    label: 'Supported Arm States',
    type: 'TEXT',
    default: (config) => ARM_STATES.filter((state) => !!config[state]),
    options: getOptions(ARM_STATES),
    limitToOptions: true,
    multiple: true,
    advanced: true
  }),
  supportedCommands: (commands, placeholder) => ({
    name: 'supportedCommands',
    label: 'Supported Commands',
    description:
      'Each command formatted as <code>command</code> or <code>command=@assetIdOrName1:...</code>' +
      ` (${docLink('Asset Catalog')})<br />Supported commands are ${commands.join(', ')}`,
    type: 'TEXT',
    placeholder: placeholder.replace(/,/g, '\n'),
    multiple: true
  }),
  supportedEqualizerModes: () => ({
    name: 'supportedModes',
    label: 'Supported Modes',
    type: 'TEXT',
    default: (config) => EQUALIZER_MODES.filter((mode) => !!config[mode]),
    options: getOptions(EQUALIZER_MODES),
    limitToOptions: true,
    multiple: true,
    advanced: true
  }),
  supportedInputs: (stateDescription, placeholder) => ({
    name: 'supportedInputs',
    label: 'Supported Inputs',
    description: 'Each input formatted as <code>inputValue=inputName1:inputName2:...</code>',
    type: 'TEXT',
    default:
      stateDescription &&
      stateDescription.options &&
      stateDescription.options
        .map((option) => `${option.value}=${option.label}`)
        .slice(0, STATE_DESCRIPTION_OPTIONS_LIMIT),
    placeholder: placeholder.replace(/,/g, '\n'),
    multiple: true,
    required: !stateDescription || !stateDescription.options || !stateDescription.options.length
  }),
  supportedModes: (stateDescription) => ({
    name: 'supportedModes',
    label: 'Supported Modes',
    description:
      `Each mode formatted as <code>mode=@assetIdOrName1:@assetIdOrName2:...</code> (${docLink('Asset Catalog')})`,
    type: 'TEXT',
    default:
      stateDescription &&
      stateDescription.options &&
      stateDescription.options
        .map((option) => `${option.value}=${option.label}`)
        .slice(0, STATE_DESCRIPTION_OPTIONS_LIMIT),
    placeholder: 'Normal=Normal:Cottons\nWhites=Whites',
    multiple: true,
    required: !stateDescription || !stateDescription.options || !stateDescription.options.length
  }),
  supportedOperations: () => ({
    name: 'supportedOperations',
    label: 'Supported Operations',
    type: 'TEXT',
    default: PLAYBACK_OPERATIONS,
    options: getOptions(PLAYBACK_OPERATIONS, true),
    limitToOptions: true,
    multiple: true,
    advanced: true
  }),
  supportedRange: (stateDescription, defaultValue) => ({
    name: 'supportedRange',
    label: 'Supported Range',
    description: 'Formatted as <code>minValue:maxValue:precision</code>',
    type: 'TEXT',
    default:
      stateDescription &&
      !isNaN(stateDescription.minimum) &&
      !isNaN(stateDescription.maximum) &&
      !isNaN(stateDescription.step)
        ? `${stateDescription.minimum}:${stateDescription.maximum}:${stateDescription.step}`
        : defaultValue,
    pattern: '[+-]?[0-9]+:[+-]?[0-9]+:[0-9]+'
  }),
  supportedThermostatModes: () => ({
    name: 'supportedModes',
    label: 'Supported Modes',
    type: 'TEXT',
    default: (config) => THERMOSTAT_MODES.filter((mode) => !!config[mode]),
    options: getOptions(THERMOSTAT_MODES),
    limitToOptions: true,
    multiple: true,
    advanced: true,
    visible: (_, config) => !config.binding
  }),
  supportsChannelNumber: () => ({
    name: 'supportsChannelNumber',
    label: 'Supports Channel Requests by Number',
    type: 'BOOLEAN',
    default: false,
    advanced: true
  }),
  supportsDeactivation: () => ({
    name: 'supportsDeactivation',
    label: 'Supports Deactivation',
    type: 'BOOLEAN',
    default: true
  }),
  supportsSetpointMode: () => ({
    name: 'supportsSetpointMode',
    label: 'Supports Setpoint Mode-aware Feature',
    description: 'In most cases, this feature should remain enabled',
    type: 'BOOLEAN',
    default: true,
    advanced: true
  }),
  thermostatModeBinding: () => ({
    name: 'binding',
    label: 'Thermostat Binding',
    type: 'TEXT',
    options: getOptions({
      broadlinkthermostat: 'Broadlink Thermostat',
      daikin: 'Daikin',
      ecobee: 'ecobee',
      insteon: 'Insteon',
      max: 'MAX!',
      nest: 'Nest',
      radiothermostat: 'RadioThermostat',
      venstarthermostat: 'Venstar Thermostat',
      zwave: 'Z-Wave'
    }),
    limitToOptions: true,
    visible: (_, config) => THERMOSTAT_MODES.every((mode) => !config[mode]) && !config.supportedModes.length
  }),
  thermostatModeMapping: (mode) => ({
    name: mode,
    label: `${titleCase(mode)} Mapping`,
    type: 'TEXT',
    visible: (_, config) => !config.binding
  }),
  valueMapping: (value, required = false) => ({
    name: value,
    label: `${titleCase(value)} Mapping`,
    type: 'TEXT',
    required
  }),
  unitOfMeasure: (item) => ({
    name: 'unitOfMeasure',
    label: 'Unit of Measure',
    type: 'TEXT',
    default: getUnitOfMeasure(item),
    options: getOptions(Object.keys(UNITS_OF_MEASURE), true),
    limitToOptions: true
  })
}
