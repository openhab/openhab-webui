import { reactive, isReactive } from 'vue'

type VariableScopeId = string
type VariableScopeName = `varScope-${VariableScopeId}`
type VariableName = string
type VariableValue = number | string | boolean | VariableArray | VariableObject | null
interface VariableArray extends Array<VariableValue> {}
interface VariableObject extends Record<VariableName, VariableValue> {}

type ContextVarObj = Record<VariableScopeName, VariableObject>

export function getLastVariableKeyValue (variableValue: VariableValue, variableKey: VariableName) : VariableValue | undefined  {
  const result = (getVariableKeyValues(variableValue, variableKey))
  if (!result || result.valueArray.length === 0) {
    return undefined
  }

  return result.valueArray[result.valueArray.length - 1]
}

function getVariableKeyValues (variableValue: VariableValue, variableKey: string) : { keyArray: VariableName[], valueArray: (VariableValue | undefined)[] } | undefined {
  let setValue : VariableValue | undefined = variableValue
  let valueArray : (VariableValue | undefined)[] = [setValue]
  let keyArray = variableKey.split('.').filter((key) => key.trim() !== '') as VariableName[]

  if (keyArray.length === 0) {
    throw new Error('Variable key must be a non-empty string')
  }

  for (let i = 0; i <= keyArray.length - 1; i++) {
    setValue = getVariableKeyValue(setValue, keyArray[i])
    valueArray.push(setValue)
  }
  return { keyArray, valueArray }
}

function parseArrayIndex (key: string): { propertyName: string, index: number } | null {
  const match = key.match(/^(.*?)\[(\d+)\]$/)
  if (!match) return null

  const propertyName = match[1]
  const index = parseInt(match[2], 10)

  if (isNaN(index) || index < 0) return null

  return { propertyName, index }
}

function getVariableKeyValue (obj: VariableValue | undefined, key: string) : VariableValue | undefined {
  if (obj === undefined || obj === null) return undefined

  const parsed = parseArrayIndex(key)
  if (parsed) {
    const { propertyName, index } = parsed

    if (propertyName === '') {  // Direct array access [0]
      if (!Array.isArray(obj)) return undefined
      return obj[index]
    } else {                    // Property array access propName[0]
      if (typeof obj !== 'object' || Array.isArray(obj)) return undefined

      const objAsObject = obj as VariableObject
      const targetArray = objAsObject[propertyName]
      if (!Array.isArray(targetArray)) return undefined
      return targetArray[index]
    }
  } else if (key.includes('[') || key.includes(']')) {
    throw new Error(`Invalid array index syntax in key ${key}`)
  } else {                      // simple property access
    if (typeof obj !== 'object' || Array.isArray(obj)) return undefined
    const objAsObject = obj as VariableObject
    return objAsObject[key]
  }
}

export function setVariableKeyValues (variableValue: VariableValue, variableKey: VariableName, newValue: VariableValue | undefined | null) : VariableValue {
  if (!variableKey || typeof variableKey !== 'string' || variableKey.trim() === '') {
    throw new Error('Variable key must be a non-empty string')
  }

  let variableKeyValues = getVariableKeyValues(variableValue, variableKey)

  if (!variableKeyValues) {
    throw new Error(`Could not set variable key values for key ${variableKey}`)
  }

  let keyArray = variableKeyValues.keyArray
  let valueArray = variableKeyValues.valueArray
  while (valueArray.length > 1) {
    let lastObject = valueArray[valueArray.length - 1]
    let currentIdx = valueArray.length - 2
    if (valueArray.length - 1 === keyArray.length) {
      lastObject = newValue
    }
    valueArray[currentIdx] = setVariableKeyValue(valueArray[currentIdx] as VariableArray | VariableObject | undefined | null, keyArray[valueArray.length - 2], lastObject)
    valueArray.pop()
  }

  const result = (valueArray[0] === undefined) ? null : valueArray[0]
  // only make objects/arrays reactive if they aren't already
  if ((typeof result === 'object' && result !== null) && !isReactive(result)) {
    return reactive(result)
  }

  return result
}

export function setVariableKeyValue (obj: VariableObject | VariableArray | undefined | null, key: VariableName, value: VariableValue | undefined | null) : VariableValue {
  const parsed = parseArrayIndex(key)
  if (parsed) {
    const { propertyName, index } = parsed

    if (obj === undefined || obj === null) {
      obj = propertyName === '' ? [] : {}
    }

    if (propertyName === '') {        // Direct array access [0]
      if (!Array.isArray(obj)) {
        throw new Error(`Expected array for key ${key}, but got ${typeof obj}`)
      }

      if (value === undefined || value === 'undefined') {
        obj.splice(index, 1)
      } else {
        obj[index] = value
      }
    } else {                         // Property array access propName[0]
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        throw new Error(`Expected object for key ${key}, but got ${typeof obj}`)
      }

      const objAsObject = obj as VariableObject
      if (!objAsObject[propertyName]) {
        objAsObject[propertyName] = []
      }

      const targetArray = objAsObject[propertyName]
      if (!Array.isArray(targetArray)) {
        throw new Error(`Property ${propertyName} is not an array`)
      }

      if (value === undefined || value === 'undefined' || value === null) {
        targetArray.splice(index, 1)
      } else {
        targetArray[index] = value
      }
    }
  } else if (key.includes('[') || key.includes(']')) {
    throw new Error(`Invalid array index syntax in key ${key}`)
  } else {                          // simple property access
    if (obj) {
      if (typeof obj !== 'object' || Array.isArray(obj)) {
        throw new Error(`Expected object for key ${key}, but got ${typeof obj}`)
      }
    } else {
      obj = {}
    }

    const objAsObject = obj as VariableObject
    if (value === undefined || value === 'undefined' || value === null) {
      delete objAsObject[key]
    } else {
      objAsObject[key] = value
    }
  }

  return obj
}

/**
 * Get the oh-context variables scope for a given variable key.
 *
 * If no variable with the given key is found in the given scope, the parent context/scope is checked, and so on.
 * If the variable is not found in any scope, <code>null</code> is returned.
 *
 * oh-context variables are local in scope to the oh-context and it's children and take precedence over other variables
 * of the same name from higher contexts/scopes, including normal variables.
 * Changes to oh-context variables done by children are always propagated to the parent, which is not the case with normal variables used inside widgets.
 *
 * @param varObj the object containing the variables for each context/scope
 * @param scopeName the key of the given variable context/scope
 * @param key the key (name) of the variable
 * @returns the key of the variable context/scope to be used
 */
export function getVariableScope (varObj: ContextVarObj, scopeName: VariableScopeName | null | undefined, key: VariableName): VariableScopeName | null {
  if (!scopeName) return null
  const scopeIDs = scopeName.split('-')
  for (let scope_idx = scopeIDs.length; scope_idx > 1; scope_idx--) {
    const scopeKey = scopeIDs.slice(0, scope_idx).join('-') as VariableScopeName
    const scopeObj = varObj[scopeKey]

    if (scopeObj && Object.prototype.hasOwnProperty.call(scopeObj, key)) {
      return scopeKey
    }
  }
  return null
}

export default {
  getVariableScope,
  setVariableKeyValues,
  setVariableKeyValue,
  getLastVariableKeyValue
}
