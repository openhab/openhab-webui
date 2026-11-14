import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

const { mockF7On, mockF7Off } = vi.hoisted(() => ({
  mockF7On: vi.fn(),
  mockF7Off: vi.fn()
}))

vi.mock('framework7-vue', () => ({
  f7: {
    on: mockF7On,
    off: mockF7Off
  }
}))

import foregroundService from './widget-foreground-service.js'

function createTestComponent(startSpy = vi.fn(), stopSpy = vi.fn()) {
  const Component = defineComponent({
    name: 'ForegroundTestWidget',
    mixins: [foregroundService],
    methods: {
      startForegroundActivity: startSpy,
      stopForegroundActivity: stopSpy
    },
    render() {
      return h('div', { class: 'test-widget' })
    }
  })
  return { Component, startSpy, stopSpy }
}

describe('widget-foreground-service', () => {
  let hostEl: HTMLElement

  beforeEach(() => {
    mockF7On.mockClear()
    mockF7Off.mockClear()
    hostEl = document.createElement('div')
    document.body.appendChild(hostEl)
  })

  afterEach(() => {
    hostEl.remove()
  })

  it('starts immediately when mounted inside an open popup (.popup.modal-in) and stops on popup:close', () => {
    const popupEl = document.createElement('div')
    popupEl.className = 'popup modal-in'
    const mountTarget = document.createElement('div')
    popupEl.appendChild(mountTarget)
    hostEl.appendChild(popupEl)

    const { Component, startSpy, stopSpy } = createTestComponent()
    const wrapper = mount(Component, { attachTo: mountTarget })
    const vm = wrapper.vm as any

    expect(vm.inForeground).toBe(true)
    expect(startSpy).toHaveBeenCalledTimes(1)
    expect(stopSpy).not.toHaveBeenCalled()

    popupEl.dispatchEvent(new Event('popup:close'))
    expect(vm.inForeground).toBe(false)
    expect(stopSpy).toHaveBeenCalledTimes(1)

    // Visibility change while popup is closed must not restart activity
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(startSpy).toHaveBeenCalledTimes(1)

    popupEl.dispatchEvent(new Event('popup:opened'))
    expect(vm.inForeground).toBe(true)
    expect(startSpy).toHaveBeenCalledTimes(2)

    wrapper.unmount()
    expect(vm.inForeground).toBe(false)
    expect(stopSpy).toHaveBeenCalledTimes(2)
  })

  it('waits for popup:opened when mounted inside a closed inline popup', () => {
    const popupEl = document.createElement('div')
    popupEl.className = 'popup'
    const mountTarget = document.createElement('div')
    popupEl.appendChild(mountTarget)
    hostEl.appendChild(popupEl)

    const { Component, startSpy, stopSpy } = createTestComponent()
    const wrapper = mount(Component, { attachTo: mountTarget })
    const vm = wrapper.vm as any

    expect(vm.inForeground).toBe(false)
    expect(startSpy).not.toHaveBeenCalled()

    popupEl.dispatchEvent(new Event('popup:opened'))
    expect(vm.inForeground).toBe(true)
    expect(startSpy).toHaveBeenCalledTimes(1)

    popupEl.dispatchEvent(new Event('popup:close'))
    expect(vm.inForeground).toBe(false)
    expect(stopSpy).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('starts and stops on pageAfterIn and pageBeforeOut when mounted in a page', () => {
    const pageEl = document.createElement('div')
    pageEl.className = 'page page-current'
    const mountTarget = document.createElement('div')
    pageEl.appendChild(mountTarget)
    hostEl.appendChild(pageEl)

    const { Component, startSpy, stopSpy } = createTestComponent()
    const wrapper = mount(Component, { attachTo: mountTarget })
    const vm = wrapper.vm as any

    expect(vm.inForeground).toBe(true)
    expect(startSpy).toHaveBeenCalledTimes(1)
    expect(mockF7On).toHaveBeenCalledWith('pageAfterIn', vm.onPageAfterIn)
    expect(mockF7On).toHaveBeenCalledWith('pageBeforeOut', vm.onPageBeforeOut)

    vm.onPageBeforeOut({ el: pageEl })
    expect(vm.inForeground).toBe(false)
    expect(stopSpy).toHaveBeenCalledTimes(1)

    vm.onPageAfterIn({ el: pageEl })
    expect(vm.inForeground).toBe(true)
    expect(startSpy).toHaveBeenCalledTimes(2)

    wrapper.unmount()
    expect(mockF7Off).toHaveBeenCalledWith('pageAfterIn', vm.onPageAfterIn)
    expect(mockF7Off).toHaveBeenCalledWith('pageBeforeOut', vm.onPageBeforeOut)
  })
})
