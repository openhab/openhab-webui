import { UNITS_OF_MEASURE } from './constants.js'

export const camelCase = (string, pascalCase = false) =>
  string
    .toLowerCase()
    .split(/[ _-]/)
    .map((word, index) => (!index && !pascalCase ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('')

export const titleCase = (string) =>
  string
    .toLowerCase()
    .split(/[ _-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const docLink = (title, anchor) => {
  const link = `%DOC_URL%#${anchor || title.replace(/[. ]/g, '-').toLowerCase()}`
  return `<a class="external text-color-blue" target="_blank" href="${link}">${title}</a>`
}

export const getGroupParameter = (parameter, groups = []) => {
  for (const group of groups) {
    const config = group.metadata.alexa.config || {}
    if (parameter in config) return config[parameter]
  }
}

export const getOptions = (options, preserve = false) =>
  Array.isArray(options)
    ? options.map((value) => ({ value, label: preserve ? value : titleCase(value) }))
    : Object.keys(options).map((value) => ({ value, label: options[value] }))

export const getSemanticFormat = (type, format) =>
  Object.keys(format).reduce(
    (value, key, index, array) =>
      `${value}${index ? (index === array.length - 1 ? ' or ' : ', ') : ''}` +
      `<code>${Array.isArray(format) || key === 'default' ? type : camelCase(`${key}_${type}`)}=${format[key]}</code>`,
    ''
  )

export const getSupportedRange = (item, config, defaultValue) => {
  const { minimum, maximum, step, pattern } = item.stateDescription || {}
  if (!isNaN(minimum) && !isNaN(maximum) && !isNaN(step)) return `${minimum}:${maximum}:${step}`
  const itemType = item.groupType || item.type
  if (itemType.startsWith('Number') && config.nonControllable) {
    const { precision, specifier } = pattern?.match(/%\d*(?:\.(?<precision>\d+))?(?<specifier>[df])/)?.groups || {}
    const [minimum, maximum] = defaultValue.split(':', 2)
    if (specifier === 'd') return `${minimum}:${maximum}:1`
    if (precision <= 16) return `${minimum}:${maximum}:${1 / 10 ** precision}`
  }
  return defaultValue
}

export const getTemperatureScale = (item) => {
  const itemType = item.groupType || item.type
  const format = (itemType === 'Number:Temperature' && item.unitSymbol) || item.stateDescription?.pattern
  if (format?.endsWith('°C')) return 'CELSIUS'
  if (format?.endsWith('°F')) return 'FAHRENHEIT'
  const measurementSystem = item.settings?.regional?.measurementSystem
  if (measurementSystem === 'SI') return 'CELSIUS'
  if (measurementSystem === 'US') return 'FAHRENHEIT'
}

export const getUnitOfMeasure = (item) => {
  const itemType = item.groupType || item.type
  const format =
    ((itemType === 'Dimmer' || itemType === 'Rollershutter') && '%') ||
    (itemType.startsWith('Number:') && item.unitSymbol) ||
    item.stateDescription?.pattern
  return Object.keys(UNITS_OF_MEASURE).find((id) => format?.endsWith(UNITS_OF_MEASURE[id]))
}
