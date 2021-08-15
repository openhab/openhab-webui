import deviceAttributes from './deviceattributes.js'
import deviceTypes, { defaultParameters } from './devicetypes.js'

const classes = {}

for (const type of Object.keys(deviceTypes)) {
  const { defaultAttributes = [], supportedAttributes = [], supportsGroup = true, groupParameters } = deviceTypes[type]

  classes[type] = {
    itemTypes: supportsGroup ? ['Group'] : [],
    parameters: [defaultParameters],
    ...(supportsGroup && { groupParameters: [defaultParameters].concat(groupParameters || []) })
  }

  for (const attribute of defaultAttributes) {
    const { itemTypes = [], parameters } = deviceAttributes[attribute]
    itemTypes.forEach((it) => classes[type].itemTypes.includes(it) || classes[type].itemTypes.push(it))
    if (parameters) classes[type].parameters.push(parameters)
  }

  for (const attribute of supportedAttributes) {
    const { parameters, ...properties } = deviceAttributes[attribute]
    classes[`${type}.${attribute}`] = { ...properties, parameters: [defaultParameters].concat(parameters || []) }
  }
}

export default classes
