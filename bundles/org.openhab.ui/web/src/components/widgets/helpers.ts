import * as api from '@/api'

/**
 * Transforms the default value (string) of a parameter to the correct type according to the parameter's type and return the default value.
 * @param parameter
 */
export function transformParameterDefault(parameter: api.ConfigDescriptionParameter) {
  if (parameter.default === undefined) return undefined
  switch (parameter.type) {
    case 'BOOLEAN':
      return Boolean(parameter.default)
    case 'INTEGER':
    case 'DECIMAL':
      return Number(parameter.default)
    case 'TEXT':
      return parameter.default
    default:
      const exhaustiveCheck: never = parameter.type
      return parameter.default
  }
}

/**
 * Transforms the default value properties of all parameters to the correct type according to the parameters' types and return the parameters..
 * @param parameters
 */
export function transformParameterDefaults(parameters: api.ConfigDescriptionParameter[]) {
  return parameters.map((p) => ({ ...p, default: transformParameterDefault(p) }))
}
