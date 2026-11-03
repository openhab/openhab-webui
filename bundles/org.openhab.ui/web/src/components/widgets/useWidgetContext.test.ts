import { describe, it, expect } from 'vitest'
import { mergeWidgetSlots } from './useWidgetContext'
import type * as api from '@/api'

function makeSlotComponent(component: string): api.UiComponent {
  return { component, config: {} }
}

describe('mergeWidgetSlots', () => {
  it('keeps the widget default slot when the wrapper has an empty default slot', () => {
    // Regression test for the listWidget/Slot bug (5.2.0): a card wrapping a widget always
    // provides a `default` slot, empty when the card itself has no children. A shallow merge
    // used to let that empty slot overwrite the widget's own non-empty default slot.
    const widgetSlots = { default: [makeSlotComponent('oh-label-item')] }
    const contextSlots = { default: [] }

    const result = mergeWidgetSlots(widgetSlots, contextSlots)

    expect(result.default).toEqual(widgetSlots.default)
  })

  it('lets a non-empty wrapper slot take precedence over the widget slot', () => {
    const widgetSlots = { default: [makeSlotComponent('oh-label-item')] }
    const contextSlots = { default: [makeSlotComponent('oh-toggle-item')] }

    const result = mergeWidgetSlots(widgetSlots, contextSlots)

    expect(result.default).toEqual(contextSlots.default)
  })

  it('merges slot keys that only exist on one side', () => {
    const widgetSlots = { default: [makeSlotComponent('oh-label-item')] }
    const contextSlots = { footer: [makeSlotComponent('oh-button-item')] }

    const result = mergeWidgetSlots(widgetSlots, contextSlots)

    expect(result.default).toEqual(widgetSlots.default)
    expect(result.footer).toEqual(contextSlots.footer)
  })

  it('handles missing widget or context slots', () => {
    expect(mergeWidgetSlots(undefined, undefined)).toEqual({})
    expect(mergeWidgetSlots({ default: [] }, undefined)).toEqual({ default: [] })
    expect(mergeWidgetSlots(undefined, { default: [makeSlotComponent('oh-label-item')] })).toEqual({
      default: [makeSlotComponent('oh-label-item')]
    })
  })
})
