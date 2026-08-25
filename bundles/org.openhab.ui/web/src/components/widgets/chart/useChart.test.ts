import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref, type Ref } from 'vue'
import dayjs from 'dayjs'
import { useChart } from './useChart'
import { startOf } from './util/time.ts'
import { AggregationFunction, ChartType } from '@/types/components/widgets'
import type { WidgetContext } from '../types'
import type * as api from '@/api'

vi.mock('framework7-vue', () => ({
  f7: {
    utils: {
      id: () => 'mock-id'
    }
  }
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

const getItemByName = vi.fn()
const getItemDataFromPersistenceService = vi.fn()

vi.mock('@/api', () => ({
  getItemByName: (...args: unknown[]) => getItemByName(...args),
  getItemDataFromPersistenceService: (...args: unknown[]) => getItemDataFromPersistenceService(...args)
}))

// evaluateExpression is only used to resolve widget expressions, which aren't exercised here
const evaluateExpression = (_key: string, value: unknown) => value as any

describe('useChart', () => {
  beforeEach(() => {
    getItemByName.mockReset()
    getItemDataFromPersistenceService.mockReset()
  })

  it('requests and renders the data of a series with an offset (regression for #4438)', async () => {
    // useChart shifts the query and the series period for offset series into the past, so that
    // e.g. "yesterday" can be compared with "today". The persistence data below therefore lies in
    // the *offset* (shifted) period, not in the period the chart itself displays.
    const endTime = startOf(ChartType.day, dayjs('2026-01-15')).add(1, 'day')
    const startTime = endTime.subtract(1, 'day')
    const offsetStartTime = startTime.subtract(1, 'day')
    const offsetEndTime = endTime.subtract(1, 'day')

    getItemByName.mockResolvedValue({ type: 'Number', name: 'TestItem', state: '0' })
    getItemDataFromPersistenceService.mockResolvedValue({
      name: 'TestItem',
      datapoints: '2',
      unit: '',
      data: [
        { time: offsetStartTime.valueOf(), state: '10' }, // Hour 0 of the offset period
        { time: offsetStartTime.add(1, 'hour').valueOf(), state: '20' } // Hour 1 of the offset period
      ]
    })

    const context = ref({
      component: { component: 'oh-chart', config: {} },
      props: {}
    }) as unknown as Ref<WidgetContext>

    const config = ref({
      chartType: ChartType.day
    }) as any

    const slots = ref({
      series: [
        {
          component: 'oh-aggregate-series',
          config: {
            item: 'TestItem',
            aggregationFunction: AggregationFunction.average,
            offsetAmount: 1,
            offsetUnit: 'day'
          }
        }
      ]
    }) as Ref<Record<string, api.UiComponent[]>>

    const { options, setDate } = useChart(context, config, slots, evaluateExpression)
    setDate('2026-01-15')

    await flushPromises()
    await flushPromises()

    expect(getItemDataFromPersistenceService).toHaveBeenCalledWith(
      expect.objectContaining({
        itemName: 'TestItem',
        starttime: offsetStartTime.toISOString(),
        endtime: offsetEndTime.subtract(1, 'millisecond').toISOString()
      })
    )

    const series = options.value.series as any[]
    expect(series).toHaveLength(1)
    // Before the fix, the series component received the unshifted (displayed) period as its
    // startTime, so every group of the offset series was filtered out as "before startTime".
    expect(series[0].data).toEqual([
      [0, '10'],
      [1, '20']
    ])
  })
})
