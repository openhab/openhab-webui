import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reactive, isReactive } from 'vue'
import {
  getLastVariableKeyValue,
  setVariableKeyValues,
  setVariableKeyValue,
  getVariableScope
} from '../variable'

// Mock Vue reactivity for testing
vi.mock('vue', () => ({
  reactive: vi.fn((obj) => obj),
  isReactive: vi.fn(() => false)
}))

describe('variable.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLastVariableKeyValue', () => {
    it('should get value from simple property', () => {
      const obj = { name: 'test', value: 42 }
      expect(getLastVariableKeyValue(obj, 'name')).toBe('test')
      expect(getLastVariableKeyValue(obj, 'value')).toBe(42)
    })

    it('should get value from nested property', () => {
      const obj = { user: { profile: { name: 'John' } } }
      expect(getLastVariableKeyValue(obj, 'user.profile.name')).toBe('John')
    })

    it('should get value from array index', () => {
      const obj = { items: ['a', 'b', 'c'] }
      expect(getLastVariableKeyValue(obj, 'items[1]')).toBe('b')
    })

    it('should get value from direct array access', () => {
      const arr = ['x', 'y', 'z']
      expect(getLastVariableKeyValue(arr, '[2]')).toBe('z')
    })

    it('should return undefined for non-existent property', () => {
      const obj = { name: 'test' }
      expect(getLastVariableKeyValue(obj, 'nonexistent')).toBeUndefined()
    })

    it('should return undefined for invalid path', () => {
      const obj = { name: 'test' }
      expect(getLastVariableKeyValue(obj, 'name.invalid')).toBeUndefined()
    })

    it('should handle falsy values correctly', () => {
      const obj = { zero: 0, empty: '', falsy: false, nullish: null }
      expect(getLastVariableKeyValue(obj, 'zero')).toBe(0)
      expect(getLastVariableKeyValue(obj, 'empty')).toBe('')
      expect(getLastVariableKeyValue(obj, 'falsy')).toBe(false)
      expect(getLastVariableKeyValue(obj, 'nullish')).toBe(null)
    })
  })

  describe('setVariableKeyValues', () => {
    it('should set simple property value', () => {
      const obj = { name: 'old' }
      const result = setVariableKeyValues(obj, 'name', 'new')
      expect((result as any).name).toBe('new')
    })

    it('should set nested property value', () => {
      const obj = { user: { name: 'old' } }
      const result = setVariableKeyValues(obj, 'user.name', 'new')
      expect((result as any).user.name).toBe('new')
    })

    it('should set array element', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = setVariableKeyValues(obj, 'items[1]', 'modified')
      expect((result as any).items[1]).toBe('modified')
      expect((result as any).items).toEqual(['a', 'modified', 'c'])
    })

    it('should set direct array element', () => {
      const arr = [1, 2, 3]
      const result = setVariableKeyValues(arr, '[0]', 999)
      expect(result[0]).toBe(999)
      expect(result).toEqual([999, 2, 3])
    })

    it('should create nested structure if needed', () => {
      const obj = {}
      const result = setVariableKeyValues(obj, 'user.profile.name', 'John')
      expect((result as any).user.profile.name).toBe('John')
    })

    it('should call reactive for objects', () => {
      const obj = { name: 'test' }
      const mockReactive = vi.mocked(reactive)
      const mockIsReactive = vi.mocked(isReactive)

      mockIsReactive.mockReturnValue(false)
      mockReactive.mockReturnValue(obj)

      setVariableKeyValues(obj, 'name', 'new')

      expect(mockReactive).toHaveBeenCalledWith(obj)
    })

    it('should not call reactive if already reactive', () => {
      const obj = { name: 'test' }
      const mockReactive = vi.mocked(reactive)
      const mockIsReactive = vi.mocked(isReactive)

      mockIsReactive.mockReturnValue(true)

      setVariableKeyValues(obj, 'name', 'new')

      expect(mockReactive).not.toHaveBeenCalled()
    })

    it('should not call reactive for primitives', () => {
      const mockReactive = vi.mocked(reactive)

      setVariableKeyValues(null, 'test', 'value')

      expect(mockReactive).not.toHaveBeenCalled()
    })

    it('should throw error for empty key', () => {
      const obj = { name: 'test' }
      expect(() => setVariableKeyValues(obj, '', 'value')).toThrow()
      expect(() => setVariableKeyValues(obj, '  ', 'value')).toThrow()
    })

    it('should throw error for non-string key', () => {
      const obj = { name: 'test' }
      expect(() => setVariableKeyValues(obj, null as any, 'value')).toThrow()
      expect(() => setVariableKeyValues(obj, undefined as any, 'value')).toThrow()
    })
  })

  describe('setVariableKeyValue', () => {
    it('should set simple property', () => {
      const obj = { name: 'old' }
      const result = setVariableKeyValue(obj, 'name', 'new')
      expect((result as any).name).toBe('new')
    })

    it('should delete property when value is undefined', () => {
      const obj = { name: 'test', keep: 'this' }
      const result = setVariableKeyValue(obj, 'name', undefined)
      expect(result).toEqual({ keep: 'this' })
      expect('name' in (result as any)).toBe(false)
    })

    it('should set array element', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = setVariableKeyValue(obj, 'items[1]', 'modified')
      expect((result as any).items[1]).toBe('modified')
    })

    it('should remove array element when value is undefined', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = setVariableKeyValue(obj, 'items[1]', undefined)
      expect((result as any).items).toEqual(['a', 'c'])
    })

    it('should set direct array element', () => {
      const arr = [1, 2, 3]
      const result = setVariableKeyValue(arr, '[1]', 999)
      expect(result[1]).toBe(999)
    })

    it('should remove direct array element when undefined', () => {
      const arr = [1, 2, 3]
      const result = setVariableKeyValue(arr, '[1]', undefined)
      expect(result).toEqual([1, 3])
    })

    it('should initialize object when undefined', () => {
      const result = setVariableKeyValue(undefined, 'name', 'value')
      expect(result).toEqual({ name: 'value' })
    })

    it('should initialize array when undefined and key is array access', () => {
      const result = setVariableKeyValue(undefined, '[0]', 'value')
      expect(result).toEqual(['value'])
    })

    it('should create array property if it does not exist', () => {
      const obj = {}
      const result = setVariableKeyValue(obj, 'items[0]', 'first')
      expect((result as any).items).toEqual(['first'])
    })

    it('should throw error when trying to set property on array', () => {
      const arr = [1, 2, 3]
      expect(() => setVariableKeyValue(arr, 'name', 'value')).toThrow()
    })

    it('should throw error when trying to set array index on non-array', () => {
      const obj = { items: 'not an array' }
      expect(() => setVariableKeyValue(obj, 'items[0]', 'value')).toThrow()
    })

    it('should throw error for invalid array syntax', () => {
      const obj = {}
      expect(() => setVariableKeyValue(obj, 'invalid[', 'value')).toThrow()
    })

    it('should delete property when value is string "undefined"', () => {
      const obj = { name: 'test', keep: 'this' }
      const result = setVariableKeyValue(obj, 'name', 'undefined')
      expect(result).toEqual({ keep: 'this' })
      expect('name' in (result as any)).toBe(false)
    })

    it('should remove array element when value is string "undefined"', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = setVariableKeyValue(obj, 'items[1]', 'undefined')
      expect((result as any).items).toEqual(['a', 'c'])
    })

    it('should remove direct array element when value is string "undefined"', () => {
      const arr = [1, 2, 3]
      const result = setVariableKeyValue(arr, '[1]', 'undefined')
      expect(result).toEqual([1, 3])
    })

    it('should treat string "undefined" same as actual undefined for deletion', () => {
      const obj1 = { prop: 'value', other: 'keep' }
      const obj2 = { prop: 'value', other: 'keep' }

      const result1 = setVariableKeyValue(obj1, 'prop', undefined)
      const result2 = setVariableKeyValue(obj2, 'prop', 'undefined')

      expect(result1).toEqual(result2)
      expect(result1).toEqual({ other: 'keep' })
    })

    it('should treat string "undefined" same as actual undefined for array deletion', () => {
      const arr1 = ['a', 'b', 'c']
      const arr2 = ['a', 'b', 'c']

      const result1 = setVariableKeyValue(arr1, '[1]', undefined)
      const result2 = setVariableKeyValue(arr2, '[1]', 'undefined')

      expect(result1).toEqual(result2)
      expect(result1).toEqual(['a', 'c'])
    })

    it('should handle string "undefined" in nested array property', () => {
      const obj = { items: ['first', 'second', 'third'] }
      const result = setVariableKeyValue(obj, 'items[0]', 'undefined')
      expect((result as any).items).toEqual(['second', 'third'])
    })

    it('should distinguish between string "undefined" and other strings', () => {
      const obj = { test: 'original' }

      // String 'undefined' should delete
      const result1 = setVariableKeyValue(obj, 'test', 'undefined')
      expect('test' in (result1 as any)).toBe(false)

      // Other strings should set normally
      const obj2 = { test: 'original' }
      const result2 = setVariableKeyValue(obj2, 'test', 'somevalue')
      expect((result2 as any).test).toBe('somevalue')

      // String 'UNDEFINED' (uppercase) should NOT delete - case sensitive
      const obj3 = { test: 'original' }
      const result3 = setVariableKeyValue(obj3, 'test', 'UNDEFINED')
      expect((result3 as any).test).toBe('UNDEFINED')
    })

    it('should handle empty string vs string "undefined"', () => {
      const obj1 = { prop: 'value' }
      const obj2 = { prop: 'value' }

      // Empty string should set the value
      const result1 = setVariableKeyValue(obj1, 'prop', '')
      expect((result1 as any).prop).toBe('')

      // String 'undefined' should delete
      const result2 = setVariableKeyValue(obj2, 'prop', 'undefined')
      expect('prop' in (result2 as any)).toBe(false)
    })

    it('should handle multiple deletions with string "undefined"', () => {
      const obj = { a: 1, b: 2, c: 3 }

      let result = setVariableKeyValue(obj, 'a', 'undefined')
      result = setVariableKeyValue(result, 'c', 'undefined')

      expect(result).toEqual({ b: 2 })
      expect('a' in (result as any)).toBe(false)
      expect('c' in (result as any)).toBe(false)
    })
  })

  describe('getVariableScope', () => {
    const varObj = {
      'varScope-1': { var1: 'value1', common: 'scope1' },
      'varScope-1-2': { var2: 'value2', common: 'scope2' },
      'varScope-1-2-3': { var3: 'value3' }
    }

    it('should find variable in current scope', () => {
      expect(getVariableScope(varObj, 'varScope-1-2-3', 'var3')).toBe('varScope-1-2-3')
    })

    it('should find variable in parent scope', () => {
      expect(getVariableScope(varObj, 'varScope-1-2-3', 'var2')).toBe('varScope-1-2')
      expect(getVariableScope(varObj, 'varScope-1-2-3', 'var1')).toBe('varScope-1')
    })

    it('should return closest scope for common variables', () => {
      expect(getVariableScope(varObj, 'varScope-1-2-3', 'common')).toBe('varScope-1-2')
    })

    it('should return null for non-existent variable', () => {
      expect(getVariableScope(varObj, 'varScope-1-2-3', 'nonexistent')).toBeNull()
    })

    it('should return null for null scope name', () => {
      expect(getVariableScope(varObj, null, 'var1')).toBeNull()
    })

    it('should return null for undefined scope name', () => {
      expect(getVariableScope(varObj, undefined, 'var1')).toBeNull()
    })

    it('should handle missing scope objects', () => {
      const incompleteVarObj = {
        'varScope-1': { var1: 'value1' }
        // Missing varScope-1-2
      }
      expect(getVariableScope(incompleteVarObj, 'varScope-1-2-3', 'var1')).toBe('varScope-1')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null and undefined values', () => {
      expect(getLastVariableKeyValue(null, 'key')).toBeUndefined()
      expect(getLastVariableKeyValue(undefined, 'key')).toBeUndefined()
    })

    it('should handle empty objects and arrays', () => {
      expect(getLastVariableKeyValue({}, 'key')).toBeUndefined()
      expect(getLastVariableKeyValue([], '[0]')).toBeUndefined()
    })

    it('should handle invalid array indices', () => {
      const obj = { items: ['a', 'b'] }
      expect(getLastVariableKeyValue(obj, 'items[10]')).toBeUndefined()
      expect(() => getLastVariableKeyValue(obj, 'items[-1]')).toThrow()
    })

    it('should handle malformed array syntax', () => {
      const obj = { items: ['a', 'b'] }
      expect(() => getLastVariableKeyValue(obj, 'items[')).toThrow()
      expect(() => getLastVariableKeyValue(obj, 'items]')).toThrow()
      expect(() => getLastVariableKeyValue(obj, 'items[abc]')).toThrow()
    })

    it('should preserve object references when possible', () => {
      const original = { nested: { value: 1 } }
      const result = setVariableKeyValues(original, 'nested.value', 2)
      expect((result as any).nested).toBe(original.nested) // Should be same reference after modification
    })

    it('should handle invalid keys in setVariableKeyValues', () => {
      expect(() => setVariableKeyValues('string', 'prop', 1)).toThrow()
      expect(() => setVariableKeyValues([1, 2, 3], 'prop', 1)).toThrow()
      expect(() => setVariableKeyValues({}, '', 1)).toThrow()
    })
  })
})
