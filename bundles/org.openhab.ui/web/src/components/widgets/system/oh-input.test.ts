import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendCommand = vi.fn()

vi.mock('@/js/stores/useStatesStore', () => ({
  useStatesStore: () => ({ sendCommand })
}))

import ohInput from './oh-input.vue'

describe('oh-input.vue', () => {
  beforeEach(() => {
    sendCommand.mockClear()
  })

  it('does not extract a unit when the pattern ends with a value token', () => {
    const unit = (ohInput as any).methods.extractUnit(`%1$tM %1$tS'%1$tL"`)
    expect(unit).toBeNull()
  })

  it('does extract a unit when the pattern ends with a unit token', () => {
    const unit = (ohInput as any).methods.extractUnit(`%.1f °C`)
    expect(unit).toBe('°C')
  })

  it('does extract the %unit% pattern', () => {
    const unit = (ohInput as any).methods.extractUnit(`%.1f %unit%`)
    expect(unit).toBe('%unit%')
  })

  it('does strip of the unit from the value', () => {
    let context = {
      unit: '°C'
    }
    let value = (ohInput as any).methods.extractValue.call(context, '20 °C')
    expect(value).toBe('20')

    context = {
      unit: 'complicated unit'
    }
    value = (ohInput as any).methods.extractValue.call(context, '20 complicated unit')
    expect(value).toBe('20')
  })

  it('does not infer a unit from Number:Time state description with value tokens', () => {
    const context = {
      type: 'number',
      config: { useDisplayState: true, item: 'Timer' },
      item: { unitSymbol: 's', stateDescription: { pattern: `%1$tM %1$tS'%1$tL"` } },
      context: { store: { Timer: { state: '60 s' } } },
      extractUnit: (ohInput as any).methods.extractUnit
    }

    const unit = (ohInput as any).computed.unit.call(context)
    expect(unit).toBe('s')
  })

  it("does use the item's display unit if available", () => {
    const context = {
      type: 'number',
      config: { useDisplayState: true, item: 'Power' },
      item: { unitSymbol: 'W', stateDescription: { pattern: '%.3f kW' } },
      context: { store: { Power: { state: '6000 W' } } },
      extractUnit: (ohInput as any).methods.extractUnit
    }

    const unit = (ohInput as any).computed.unit.call(context)
    expect(unit).toBe('kW')
  })

  it("does use the item's unit if display unit is %unit%", () => {
    const context = {
      type: 'number',
      systemUnit: 'W',
      config: { useDisplayState: true, item: 'Power' },
      item: { unitSymbol: 'W', stateDescription: { pattern: '%.3f %unit%' } },
      context: { store: { Power: { state: '6000 W' } } },
      extractUnit: (ohInput as any).methods.extractUnit
    }

    const unit = (ohInput as any).computed.unit.call(context)
    expect(unit).toBe('W')
  })

  it('sends the pending value unchanged when no unit is available', () => {
    const context = {
      config: { item: 'Timer' },
      pendingUpdate: '60',
      unit: null
    }

    ;(ohInput as any).methods.sendButtonClicked.call(context)

    expect(sendCommand).toHaveBeenCalledWith('Timer', '60')
    expect(context.pendingUpdate).toBeNull()
  })

  it('appends unit when available', () => {
    const context = {
      config: { item: 'Temperature' },
      pendingUpdate: '60',
      unit: '°C'
    }

    ;(ohInput as any).methods.sendButtonClicked.call(context)

    expect(sendCommand).toHaveBeenCalledWith('Temperature', '60 °C')
    expect(context.pendingUpdate).toBeNull()
  })
})
