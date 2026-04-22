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

  it('does not infer a unit from formatted Number:Time display states', () => {
    const context = {
      type: 'number',
      config: { useDisplayState: true, item: 'Timer' },
      item: { unitSymbol: 's', stateDescription: { pattern: `%1$tM %1$tS'%1$tL"` } },
      context: { store: { Timer: { state: '60 s' } } },
      extractUnit: (ohInput as any).methods.extractUnit
    }

    const unit = (ohInput as any).computed.unit.call(context)
    expect(unit).toBeNull()
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
