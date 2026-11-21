import { describe, it, expect } from 'vitest'
import { firstGrapheme } from './utils'

describe('firstGrapheme', () => {
  it('should return the whole emoji including its variation selector', () => {
    expect(firstGrapheme('Lamp')).toBe('L')
    expect(firstGrapheme('🌞 Sun')).toBe('🌞')
    expect(firstGrapheme('↩️ Back')).toBe('↩️')
    expect(firstGrapheme('🕐︎ Clock')).toBe('🕐︎')
    expect(firstGrapheme('')).toBe('')
  })
})
