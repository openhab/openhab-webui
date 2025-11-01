
export function getLastVariableKeyValue (variableValue: any, variableKey: string) {
  const valueArray = (getVariableKeyValues(variableValue, variableKey)).valueArray
  if (valueArray[valueArray.length - 1]) {
    return valueArray[valueArray.length - 1]
  } else {
    return undefined
  }
}

export function getVariableKeyValues (variableValue: any, variableKey: string) {
  let setValue = variableValue
  let valueArray = [setValue]
  let keyArray = variableKey.split('.')
  for (let i = 0; i <= keyArray.length - 1; i++) {
    setValue = getVariableKeyValue(setValue, keyArray[i])
    valueArray.push(setValue)
  }
  return { keyArray, valueArray }
}

export function getVariableKeyValue (obj: any, key: string) {
  if (obj === undefined) return undefined
  if (key.includes('[') && key.includes(']')) {
    let arrayIndex = key.split('[')[1].split(']')[0]
    let destKey = key.split('[')[0]
    if (key.startsWith('[')) {
      return obj[arrayIndex]
    } else {
      if (obj[destKey]) {
        return obj[destKey][arrayIndex]
      } else {
        return undefined
      }
    }
  } else {
    return obj[key]
  }
}

export function setVariableKeyValues (variableValue: any, variableKey: string, newValue: any) {
  let variableKeyValues = getVariableKeyValues(variableValue, variableKey)
  let keyArray = variableKeyValues.keyArray
  let valueArray = variableKeyValues.valueArray
  while (valueArray.length > 1) {
    let lastObject = valueArray[valueArray.length - 1]
    let currentIdx = valueArray.length - 2
    if (valueArray.length - 1 === keyArray.length) {
      lastObject = newValue
    }
    valueArray[currentIdx] = setVariableKeyValue(valueArray[currentIdx], keyArray[valueArray.length - 2], lastObject)
    valueArray.pop()
  }
  // JSON re-parsing is needed to build missing getter/setter so vue can render new objects
  return JSON.parse(JSON.stringify(valueArray[0]))
}

export function setVariableKeyValue (obj: any, key: string, value: any) {
  let objectHasContent = true
  if (obj === undefined) {
    obj = {}
    objectHasContent = false
  }
  if (key.includes('[') && key.includes(']')) {
    let arrayIndex = key.split('[')[1].split(']')[0]
    let destKey = key.split('[')[0]
    if (key.startsWith('[')) {
      if (!objectHasContent) {
        obj = []
      }
      if (value === undefined || value === 'undefined') {
        if (objectHasContent) {
          obj.splice(arrayIndex, 1)
        }
      } else {
        obj[arrayIndex] = value
      }
    } else {
      if (obj[destKey] === undefined) {
        obj[destKey] = []
      }
      if (value === undefined || value === 'undefined') {
        obj[destKey].splice(arrayIndex, 1)
      } else {
        obj[destKey][arrayIndex] = value
      }
    }
  } else {
    if (value === undefined || value === 'undefined') {
      delete obj[key]
    } else {
      obj[key] = value
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
 * @param scopeObj the key of the given variable context/scope
 * @param key the key of the variable
 * @returns the key of the variable context/scope to be used
 */
export function getVariableScope (varObj: Record<string, any>, scopeObj: string | null | undefined, key: string): string | null {
  if (!scopeObj) return null
  const scopeIDs = scopeObj.split('-')
  for (let scope_idx = scopeIDs.length; scope_idx > 1; scope_idx--) {
    const scopeKey = scopeIDs.slice(0, scope_idx).join('-')
    if (Object.keys(varObj[scopeKey]).includes(key)) return scopeKey
  }
  return null
}

export default {
  getVariableScope,
  setVariableKeyValues,
  setVariableKeyValue,
  getLastVariableKeyValue,
  getVariableKeyValues,
  getVariableKeyValue
}