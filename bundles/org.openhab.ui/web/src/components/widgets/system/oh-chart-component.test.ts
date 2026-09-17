import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'

const mockDispose = vi.fn()

vi.mock('vue-echarts', () => ({
  default: defineComponent({
    name: 'VChart',
    setup(_props, { expose }) {
      expose({
        dispose: mockDispose
      })
      return () => null
    }
  })
}))

vi.mock('framework7-vue', () => ({
  f7: {
    on: vi.fn(),
    off: vi.fn(),
    instance: {
      off: vi.fn()
    },
    calendar: {
      create: vi.fn()
    }
  },
  f7ready: (cb: () => void) => cb()
}))

vi.mock('@/js/stores/useUIOptionsStore', () => ({
  useUIOptionsStore: () => ({
    darkMode: 'light'
  })
}))

vi.mock('@/js/stores/useRuntimeStore', () => ({
  useRuntimeStore: () => ({
    locale: 'en-US'
  })
}))

vi.mock('@/components/widgets/useWidgetContext', () => ({
  useWidgetContext: () => ({
    config: ref({}),
    slots: ref({}),
    evaluateExpression: (key: string, val: unknown) => val
  })
}))

vi.mock('@/components/widgets/useWidgetAction', () => ({
  useWidgetAction: () => ({
    performAction: vi.fn()
  })
}))

vi.mock('../chart/useChart', () => ({
  useChart: () => ({
    startTime: ref(null),
    endTime: ref(null),
    options: ref({}),
    period: ref('D'),
    earlierPeriod: vi.fn(),
    laterPeriod: vi.fn(),
    setDate: vi.fn(),
    setPeriod: vi.fn()
  })
}))

import OhChartComponent from './oh-chart-component.vue'

describe('oh-chart-component.vue', () => {
  it('disposes the VChart instance when unmounted', async () => {
    mockDispose.mockClear()
    const wrapper = mount(OhChartComponent, {
      global: {
        stubs: {
          'f7-menu': true,
          'f7-menu-item': true,
          'f7-menu-dropdown': true,
          'f7-menu-dropdown-item': true
        }
      },
      props: {
        context: {
          component: {
            component: 'oh-chart',
            config: {}
          }
        } as any
      }
    })

    await nextTick()
    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
    expect(mockDispose).toHaveBeenCalledTimes(1)
  })

  it('disposes the VChart instance on forceRerender', async () => {
    mockDispose.mockClear()
    const wrapper = mount(OhChartComponent, {
      global: {
        stubs: {
          'f7-menu': true,
          'f7-menu-item': true,
          'f7-menu-dropdown': true,
          'f7-menu-dropdown-item': true
        }
      },
      props: {
        context: {
          component: {
            component: 'oh-chart',
            config: {}
          }
        } as any
      }
    })

    await nextTick()
    const vm = wrapper.vm as any
    vm.forceRerender()
    expect(mockDispose).toHaveBeenCalledTimes(1)
  })
})
