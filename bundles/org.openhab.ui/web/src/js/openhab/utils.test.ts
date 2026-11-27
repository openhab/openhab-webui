import { describe, it, expect, vi, afterEach } from 'vitest'
import { firstGrapheme } from './utils'

const OriginalSegmenter = Intl.Segmenter

describe('firstGrapheme', () => {
  afterEach(() => {
    ;(Intl as any).Segmenter = OriginalSegmenter
    vi.resetModules()
  })

  it('should return the whole emoji including its variation selector', () => {
    expect(firstGrapheme('Lamp')).toBe('L')
    expect(firstGrapheme('🌞 Sun')).toBe('🌞')
    expect(firstGrapheme('↩️ Back')).toBe('↩️')
    expect(firstGrapheme('🕐︎ Clock')).toBe('🕐︎')
    expect(firstGrapheme('')).toBe('')
  })

  it('should reuse a single Intl.Segmenter instance', async () => {
    let created = 0
    ;(Intl as any).Segmenter = class extends OriginalSegmenter {
      constructor(...args: ConstructorParameters<typeof Intl.Segmenter>) {
        super(...args)
        created++
      }
    }
    vi.resetModules()
    const utils = await import('./utils')

    expect(utils.firstGrapheme('🌞 Sun')).toBe('🌞')
    expect(utils.firstGrapheme('Lamp')).toBe('L')
    expect(utils.firstGrapheme('↩️ Back')).toBe('↩️')
    expect(created).toBe(1)
  })

  it('should fall back to the first code point when Intl.Segmenter is unavailable', async () => {
    // e.g. Firefox < 125
    delete (Intl as any).Segmenter
    vi.resetModules()
    const utils = await import('./utils')

    expect(utils.firstGrapheme('Lamp')).toBe('L')
    expect(utils.firstGrapheme('🌞 Sun')).toBe('🌞')
    expect(utils.firstGrapheme('↩️ Back')).toBe('↩')
    expect(utils.firstGrapheme('')).toBe('')
  })
})
