export default {
  methods: {
    getLastVariableKeyValue (variableValue, variableKey) {
      const valueArray = (this.getVariableKeyValues(variableValue, variableKey)).valueArray
      if (valueArray[valueArray.length - 1]) {
        return valueArray[valueArray.length - 1]
      } else {
        return undefined
      }
    },
    getVariableKeyValues (variableValue, variableKey) {
      let setValue = variableValue
      let valueArray = [setValue]
      let keyArray = variableKey.split('.')
      for (let i = 0; i <= keyArray.length - 1; i++) {
        setValue = this.getVariableKeyValue(setValue, keyArray[i])
        valueArray.push(setValue)
      }
      return { keyArray: keyArray, valueArray: valueArray }
    },
    getVariableKeyValue (obj, key) {
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
    },
    setVariableKeyValues (variableValue, variableKey, newValue) {
      let variableKeyValues = this.getVariableKeyValues(variableValue, variableKey)
      let keyArray = variableKeyValues.keyArray
      let valueArray = variableKeyValues.valueArray
      while (valueArray.length > 1) {
        let lastObject = valueArray[valueArray.length - 1]
        let currentIdx = valueArray.length - 2
        if (valueArray.length - 1 === keyArray.length) {
          lastObject = newValue
        }
        valueArray[currentIdx] = this.setVariableKeyValue(valueArray[currentIdx], keyArray[valueArray.length - 2], lastObject)
        valueArray.pop()
      }
      // JSON re-parsing is needed to build missing getter/setter so vue can render new objects
      return JSON.parse(JSON.stringify(valueArray[0]))
    },
    setVariableKeyValue (obj, key, value) {
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
    },
    /**
     * Get the oh-context variables scope for a given variable key.
     *
     * If no variable with the given key is found in the given scope, the parent context/scope is checked, and so on.
     * If the variable is not found in any scope, <code>null</code> is returned.
     *
     * oh-context variables are local in scope to the oh-context and it's children and take precedence over other variables
     * of the same name from higher contexts/scopes, including normal variables.
     * Changes to oh-context variables done by children are propagated to the parent, which is not the case with normal variables.
     *
     * @param {object} varObj the object containing the variables for each context/scope
     * @param {string} scopeObj the key of the given variable context/scope
     * @param {string} key the key of the variable
     * @returns {string|null} the key of the variable context/scope to be used
     */
    getVariableScope (varObj, scopeObj, key) {
      if (!scopeObj) return null
      const scopeIDs = scopeObj.split('-')
      for (let scope_idx = scopeIDs.length; scope_idx > 1; scope_idx--) {
        const scopeKey = scopeIDs.slice(0, scope_idx).join('-')
        if (Object.keys(varObj[scopeKey]).includes(key)) return scopeKey
      }
      return null
    }
  }
}
