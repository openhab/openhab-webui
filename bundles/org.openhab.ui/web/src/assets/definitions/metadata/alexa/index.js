import deviceAttributes from './deviceattributes.js'
import deviceTypes, { defaultParameters } from './devicetypes.js'

const classes = {}

for (const type of Object.keys(deviceTypes)) {
  const {
    defaultAttributes = [],
    supportedAttributes = [],
    supportsGroup = true
  } = deviceTypes[type]
  classes[type] = {}

  if (supportsGroup) {
    const { groupParameters = [] } = deviceTypes[type]
    classes[type]['Group'] = { parameters: [defaultParameters].concat(groupParameters) }
  }

  for (const attribute of defaultAttributes) {
    const { itemTypes = [], parameters } = deviceAttributes[attribute]
    for (const itemType of itemTypes) {
      if (!classes[type][itemType]) classes[type][itemType] = { parameters: [defaultParameters] }
      if (parameters) classes[type][itemType].parameters.push(parameters)
    }
  }

  for (const attribute of supportedAttributes) {
    const {
      itemTypes = [],
      customTypes = [],
      parameters = [],
      ...properties
    } = deviceAttributes[attribute]
    classes[`${type}.${attribute}`] = {}
    for (const itemType of [...itemTypes, ...customTypes]) {
      classes[`${type}.${attribute}`][itemType] = {
        parameters: [defaultParameters].concat(parameters),
        ...properties
      }
    }
  }
}

export default classes
