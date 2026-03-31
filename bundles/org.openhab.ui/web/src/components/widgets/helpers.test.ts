import { describe, it, expect } from 'vitest'
import { transformParameterDefault, transformParameterDefaults, applyParameterDefaults } from './helpers'

describe('Parameter Utilities', () => {
  describe('transformParameterDefault', () => {
    it('should return undefined if default is undefined', () => {
      const param = { type: 'TEXT', default: undefined } as any
      expect(transformParameterDefault(param)).toBeUndefined()
    })

    it('should transform BOOLEAN strings/values to boolean', () => {
      const param = { type: 'BOOLEAN', default: 'true' } as any
      expect(transformParameterDefault(param)).toBe(true)

      const paramFalse = { type: 'BOOLEAN', default: 'false' } as any
      expect(transformParameterDefault(paramFalse)).toBe(false)
    })

    it('should pass-through BOOLEAN booleans', () => {
      const param = { type: 'BOOLEAN', default: true } as any
      expect(transformParameterDefault(param)).toBe(true)

      const paramFalse = { type: 'BOOLEAN', default: false } as any
      expect(transformParameterDefault(paramFalse)).toBe(false)
    })

    it('should transform INTEGER and DECIMAL to numbers', () => {
      const intParam = { type: 'INTEGER', default: '42' } as any
      const decimalParam = { type: 'DECIMAL', default: '12.34' } as any

      expect(transformParameterDefault(intParam)).toBe(42)
      expect(transformParameterDefault(decimalParam)).toBe(12.34)
    })

    it('should return TEXT values as-is', () => {
      const param = { type: 'TEXT', default: 'hello' } as any
      expect(transformParameterDefault(param)).toBe('hello')
    })
  })

  describe('transformParameterDefaults', () => {
    it('should map over an array and return new objects with transformed defaults', () => {
      const parameters = [
        { name: 'p1', type: 'INTEGER', default: '10' },
        { name: 'p2', type: 'BOOLEAN', default: 'true' }
      ] as any[]

      const result = transformParameterDefaults(parameters)

      expect(result[0].default).toBe(10)
      expect(result[1].default).toBe(true)
      // Ensure immutability of the original objects (though the function uses spread)
      expect(result[0]).not.toBe(parameters[0])
    })
  })

  describe('applyParameterDefaults', () => {
    it('should apply defaults to configuration if key is missing', () => {
      const parameters = [
        { name: 'port', type: 'INTEGER', default: '8080' },
        { name: 'enabled', type: 'BOOLEAN', default: 'true' }
      ] as any[]
      const config: Record<string, unknown> = { enabled: false }

      applyParameterDefaults(parameters, config)

      // Should fill in the missing one
      expect(config.port).toBe(8080)
      // Should NOT overwrite the existing one
      expect(config.enabled).toBe(false)
    })

    it('should not add anything if default is undefined', () => {
      const parameters = [{ name: 'optional', type: 'TEXT', default: undefined }] as any[]
      const config: Record<string, unknown> = {}

      applyParameterDefaults(parameters, config)

      expect(config).not.toHaveProperty('optional')
    })
  })
})
