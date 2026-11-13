import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResizableTable from './resizable-table.vue'
import { useLogScroll } from './scroll-position'

function scroll(container: HTMLElement, top: number, height = 2000) {
  Object.defineProperties(container, {
    scrollTop: { configurable: true, value: top },
    clientHeight: { configurable: true, value: 400 },
    scrollHeight: { configurable: true, value: height }
  })
  const event = new Event('scroll')
  Object.defineProperty(event, 'target', { value: container })
  return event
}

describe('log viewer auto-scroll', () => {
  afterEach(() => vi.useRealTimers())

  it('ignores scrolls without user input, including a delayed programmatic scroll', () => {
    const state = useLogScroll()
    const container = document.createElement('div')
    state.onScroll(scroll(container, 1600))
    state.onScroll(scroll(container, 1000))
    expect(state.autoScroll.value).toBe(true)

    state.onWheel(new WheelEvent('wheel', { deltaY: -10 }))
    state.noteProgrammaticScroll(container)
    state.onScroll(scroll(container, 1000))
    expect(state.autoScroll.value).toBe(true)
  })

  it('pauses only after a user scrolls past the guard band', () => {
    const state = useLogScroll()
    const container = document.createElement('div')
    state.onScroll(scroll(container, 1600))
    state.onWheel(new WheelEvent('wheel', { deltaY: -10 }))
    state.onScroll(scroll(container, 1500))
    expect(state.autoScroll.value).toBe(true)
    state.onScroll(scroll(container, 1499))
    expect(state.autoScroll.value).toBe(false)
    state.followLatest()
    expect(state.autoScroll.value).toBe(true)
  })

  it('records the viewport when input starts before any scroll event', () => {
    const state = useLogScroll()
    const container = document.createElement('div')
    container.classList.add('container')
    scroll(container, 1600)
    container.addEventListener('wheel', state.onWheel)
    container.dispatchEvent(new WheelEvent('wheel', { deltaY: -10 }))
    state.onScroll(scroll(container, 1499))
    expect(state.autoScroll.value).toBe(false)
  })

  it('tracks a held scrollbar and releases the input after the gesture', () => {
    vi.useFakeTimers()
    const state = useLogScroll()
    const container = document.createElement('div')
    container.classList.add('container')
    state.onScroll(scroll(container, 1600))
    container.addEventListener('pointerdown', state.onPointerDown)
    container.dispatchEvent(Object.assign(new MouseEvent('pointerdown', { button: 0 }), { pointerType: 'mouse', pointerId: 1 }))
    vi.advanceTimersByTime(1000)
    expect(state.isUserScrolling()).toBe(true)
    container.addEventListener('pointerup', state.onPointerEnd)
    container.dispatchEvent(Object.assign(new MouseEvent('pointerup'), { pointerId: 1 }))
    vi.advanceTimersByTime(501)
    state.onScroll(scroll(container, 1000))
    expect(state.autoScroll.value).toBe(true)
  })

  it('does not execute a queued automatic scroll once user input begins', () => {
    vi.useFakeTimers()
    const state = useLogScroll()
    const wrapper = mount(ResizableTable, {
      props: {
        columns: [],
        columnResizeEnabled: false,
        storageKey: 'test-scroll',
        defaultColumnWidths: [],
        list: [],
        getItemKey: () => 0,
        lineHeight: 20
      },
      attrs: {
        onWheel: state.onWheel,
        onScroll: state.onScroll,
        onScrollToBottom: state.noteProgrammaticScroll
      }
    })
    const container = wrapper.get('.container').element as HTMLElement
    Object.defineProperty(container, 'scrollHeight', { configurable: true, value: 2000 })

    wrapper.vm.scrollToBottom(() => state.autoScroll.value && !state.isUserScrolling())
    container.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: -10 }))
    vi.advanceTimersByTime(100)
    expect(container.scrollTop).toBe(0)
    expect(wrapper.emitted('scroll-to-bottom')).toBeUndefined()

    vi.advanceTimersByTime(500)
    wrapper.vm.scrollToBottom(() => state.autoScroll.value && !state.isUserScrolling())
    vi.advanceTimersByTime(100)
    expect(container.scrollTop).toBe(2000)
    expect(wrapper.emitted('scroll-to-bottom')).toHaveLength(1)
    wrapper.unmount()
  })

  it('recognizes keyboard scrolling and touch momentum', () => {
    vi.useFakeTimers()
    const state = useLogScroll()
    const container = document.createElement('div')
    container.classList.add('container')
    container.addEventListener('keydown', state.onKeydown)
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }))
    expect(state.isUserScrolling()).toBe(true)
    vi.advanceTimersByTime(501)
    expect(state.isUserScrolling()).toBe(false)

    state.onScroll(scroll(container, 1600))
    container.addEventListener('pointerdown', state.onPointerDown)
    container.addEventListener('pointerup', state.onPointerEnd)
    container.dispatchEvent(Object.assign(new MouseEvent('pointerdown'), { pointerType: 'touch', pointerId: 2 }))
    container.dispatchEvent(Object.assign(new MouseEvent('pointerup'), { pointerId: 2 }))
    vi.advanceTimersByTime(400)
    state.onScroll(scroll(container, 1550))
    vi.advanceTimersByTime(400)
    state.onScroll(scroll(container, 1499))
    expect(state.autoScroll.value).toBe(false)
  })

  it('ignores stale scroll heights after content shrinks', () => {
    const state = useLogScroll()
    const container = document.createElement('div')
    state.onScroll(scroll(container, 1600))
    state.onWheel(new WheelEvent('wheel', { deltaY: -10 }))
    state.onScroll(scroll(container, 600, 1000))
    expect(state.autoScroll.value).toBe(true)
    state.onScroll(scroll(container, 499, 1000))
    expect(state.autoScroll.value).toBe(false)
  })
})
