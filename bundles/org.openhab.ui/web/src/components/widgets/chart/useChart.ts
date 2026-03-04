import { ref, computed, watch, shallowRef, type ComputedRef, readonly } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import DayDuration from 'dayjs/plugin/duration'

dayjs.extend(IsoWeek)
dayjs.extend(DayDuration)

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { startOf, addOrSubtractPeriod as addOrSubtractPeriodUtil } from '@/components/widgets/chart/util/time.ts'
import openhab from '@/js/openhab/index'

// Axis components
import OhTimeAxis from './axis/oh-time-axis'
import OhValueAxis from './axis/oh-value-axis'
import OhCalendarAxis from './axis/oh-calendar-axis'
import OhCategoryAxis from './axis/oh-category-axis'

// Series components
import OhDataSeries from './series/oh-data-series'
import OhTimeSeries from './series/oh-time-series'
import OhAggregateSeries from './series/oh-aggregate-series'
import OhCalendarSeries from './series/oh-calendar-series'
import OhStateSeries from './series/oh-state-series'

// Other components
import OhChartTooltip from './misc/oh-chart-tooltip'
import OhChartVisualMap from './misc/oh-chart-visualmap'
import OhChartDataZoom from './misc/oh-chart-datazoom'
import OhChartLegend from './misc/oh-chart-legend'
import OhChartTitle from './misc/oh-chart-title'
import OhChartToolbox from './misc/oh-chart-toolbox'

// Types
import type { EChartsOption } from 'echarts'
import * as api from '@/api'
import { ChartType, Period, type OhChart } from '@/types/components/widgets'
import type { WidgetContext } from '../types'
import type { ChartContext, SeriesOption, AxisComponent, SeriesComponent, EvaluateExpressionFunction } from './types'
import type { ComponentOption } from 'echarts/types/dist/shared'

const DEFAULT_PERIOD = Period.D

const axisComponents: Record<string, AxisComponent> = {
  'oh-time-axis': OhTimeAxis,
  'oh-value-axis': OhValueAxis,
  'oh-calendar-axis': OhCalendarAxis,
  'oh-category-axis': OhCategoryAxis
}

const seriesComponents: Record<string, SeriesComponent> = {
  'oh-data-series': OhDataSeries,
  'oh-time-series': OhTimeSeries,
  'oh-aggregate-series': OhAggregateSeries,
  'oh-calendar-series': OhCalendarSeries,
  'oh-state-series': OhStateSeries
}

export function useChart(
  context: WidgetContext,
  widgetContext: {
    config: ComputedRef<OhChart.Config>
    evaluateExpression: EvaluateExpressionFunction
    slots: ComputedRef<Record<string, api.UiComponent[]>>
  }
) {
  const { config, evaluateExpression, slots } = widgetContext
  const uiOptionsStore = useUIOptionsStore()
  const runtimeStore = useRuntimeStore()

  const speriod = ref<string>((config.value.period as string) || DEFAULT_PERIOD)
  // future as boolean allows for backwards compatibility
  const future = ref<number>((config.value.future as unknown as boolean) === true ? 1 : ((config.value.future as number) ?? 0))
  const orient = ref<string | null>(null)

  const addOrSubtractPeriod = (day: Dayjs, direction: number): Dayjs => {
    if (!config.value) return day
    const chartType = config.value.chartType || ChartType.dynamic
    const p = (evaluateExpression('.period', speriod.value) as Period) || (config.value.period as Period) || DEFAULT_PERIOD
    return addOrSubtractPeriodUtil(chartType, p, day, direction)
  }

  const initialEndTime = (): Dayjs => {
    const chartType = config.value.chartType
    if (chartType) {
      return addOrSubtractPeriod(startOf(chartType), 1 + future.value)
    } else {
      return addOrSubtractPeriod(dayjs(), future.value)
    }
  }

  const endTime = ref<Dayjs>(initialEndTime())

  // computed
  const numberFormatter = computed(() => new Intl.NumberFormat(runtimeStore.locale))

  const startTime = computed(() => addOrSubtractPeriod(endTime.value, -1))

  const period = computed(() => evaluateExpression('.period', speriod.value))

  const chartContext = computed<ChartContext>(() => ({
    chart: {
      ...(context.component as api.UiComponent),
      config: config.value
    },
    evaluateExpression,
    numberFormatter: numberFormatter.value
  }))

  const grid = computed(() => {
    if (!slots.value?.grid) return []
    return slots.value.grid.map((g) => g.config)
  })

  const xAxis = computed(() => {
    if (!slots.value?.xAxis) return []
    return slots.value.xAxis.map((a) => axisComponents[a.component]!.get(chartContext.value, a, startTime.value, endTime.value))
  })

  const yAxis = computed(() => {
    if (!slots.value || !slots.value.yAxis) return []
    return slots.value.yAxis.map((a) => axisComponents[a.component]!.get(chartContext.value, a, startTime.value, endTime.value, true))
  })

  const calendar = computed(() => {
    if (!slots.value?.calendar) return []
    return slots.value.calendar.map((a) =>
      axisComponents[a.component]!.get(chartContext.value, a, startTime.value, endTime.value, orient.value === 'vertical')
    )
  })

  const singleAxis = computed(() => {
    if (!slots.value?.singleAxis) return []
    return slots.value.singleAxis.map((a) => axisComponents[a.component]!.get(chartContext.value, a, startTime.value, endTime.value))
  })

  const tooltip = computed<ComponentOption[]>(() => {
    if (!slots.value?.tooltip) return []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return slots.value.tooltip.map((c) => OhChartTooltip.get(chartContext.value, c, startTime.value, endTime.value))
  })

  const visualMap = computed<ComponentOption[]>(() => {
    if (!slots.value) return []
    const visualMapContext = {
      ...chartContext.value,
      series: series.value
    }
    if (slots.value.visualMap) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return slots.value.visualMap.map((c) => OhChartVisualMap.get(visualMapContext, c, startTime.value, endTime.value))
    } else if (JSON.stringify(slots.value.series)?.includes('heatmap')) {
      const heatmapConfig = {
        calculable: true,
        presetPalette: 'bluered',
        show: false,
        type: 'continuous'
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return [
        OhChartVisualMap.get(
          visualMapContext,
          { component: 'oh-chart-visualmap', config: heatmapConfig } satisfies api.UiComponent,
          startTime.value,
          endTime.value
        )
      ]
    }
    return []
  })

  const dataZoom = computed(() => {
    if (!slots.value?.dataZoom) return []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return slots.value.dataZoom.map((c) => OhChartDataZoom.get(chartContext.value, c, startTime.value, endTime.value))
  })

  const legend = computed(() => {
    if (!slots.value?.legend) return []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return slots.value.legend.map((c) => OhChartLegend.get(chartContext.value, c, startTime.value, endTime.value))
  })

  const title = computed(() => {
    if (!slots.value?.title) return []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return slots.value.title.map((c) => OhChartTitle.get(chartContext.value, c, startTime.value, endTime.value))
  })

  const toolbox = computed(() => {
    if (!slots.value?.toolbox) return []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return slots.value.toolbox.map((c) => OhChartToolbox.get(chartContext.value, c, startTime.value, endTime.value))
  })

  // async computed
  const series = shallowRef<SeriesOption[]>([])

  const _items: Record<string, api.EnrichedItem> = {}
  const _itemPromises: Record<string, Promise<api.EnrichedItem>> = {}
  const _persistencePromises: Record<string, Promise<api.ItemHistory>> = {}

  const getSeriesPromises = async (component: api.UiComponent): Promise<SeriesOption> => {
    const getter = (data: [api.EnrichedItem, api.ItemHistory][]): SeriesOption =>
      seriesComponents[component.component]!.get(
        chartContext.value,
        component,
        data.map((d) => d[1]),
        startTime.value,
        endTime.value
      )

    const neededItems = seriesComponents[component.component]!.neededItems(chartContext.value, component).filter((i) => !!i)
    if (neededItems.length === 0) {
      return getter([])
    }

    const now = dayjs()
    const isBetweenStartAndEnd =
      dayjs(startTime.value).subtract(5, 'minutes').isBefore(now) && dayjs(endTime.value).add(5, 'minutes').isAfter(now)

    let boundary = seriesComponents[component.component]!.includeBoundary?.(chartContext.value, component) ?? isBetweenStartAndEnd
    if (component.config.noBoundary === true) boundary = false

    let itemState = seriesComponents[component.component]!.includeItemState?.(chartContext.value, component) ?? isBetweenStartAndEnd
    if (component.config.noItemState === true) itemState = false

    neededItems.forEach((neededItem) => {
      if (_itemPromises[neededItem]) {
        // do nothing
      } else if (_items[neededItem]) {
        _itemPromises[neededItem] = Promise.resolve(_items[neededItem])
      } else {
        _itemPromises[neededItem] = openhab.api.get(`/rest/items/${neededItem}`).then((item: api.EnrichedItem) => {
          _items[neededItem] = item
          delete _itemPromises[neededItem]
          return item
        })
      }
    })

    const combinedPromises = neededItems.map(async (neededItem) => {
      const url = `/rest/persistence/items/${neededItem}`
      let seriesStartTime = startTime.value
      let seriesEndTime = endTime.value
      if (component.config.offsetAmount && component.config.offsetUnit) {
        seriesStartTime = seriesStartTime.subtract(
          component.config.offsetAmount as number,
          component.config.offsetUnit as dayjs.ManipulateType
        )
        seriesEndTime = seriesEndTime.subtract(component.config.offsetAmount as number, component.config.offsetUnit as dayjs.ManipulateType)
      }
      const serviceId = component.config.service ? (evaluateExpression('.serviceId', component.config.service) as string) : undefined
      const query = {
        serviceId,
        starttime: seriesStartTime.toISOString(),
        endtime: seriesEndTime.subtract(1, 'millisecond').toISOString(),
        boundary,
        itemState
      }
      const key = `${neededItem}-${query.serviceId ?? 'default'}-${query.starttime}-${query.endtime}-${boundary.toString()}-${itemState.toString()}`
      if (!_persistencePromises[key]) {
        _persistencePromises[key] = openhab.api.get(url, query).then((result: api.ItemHistory) => {
          delete _persistencePromises[key]
          return result
        })
      }

      return Promise.all([_itemPromises[neededItem], _persistencePromises[key]]) as Promise<[api.EnrichedItem, api.ItemHistory]>
    })

    return Promise.all(combinedPromises).then(getter)
  }

  const updateSeries = async (): Promise<void> => {
    if (!slots.value || !slots.value.series) {
      series.value = []
      return
    }
    series.value = await Promise.all(slots.value.series.map(async (s) => await getSeriesPromises(s)))
  }

  watch(
    [slots, startTime, endTime, chartContext],
    () => {
      void updateSeries()
    },
    { immediate: true }
  )

  const options = computed<EChartsOption>(() => {
    if (!config.value) return {}
    const chartConfig = ((config.value as { options?: EChartsOption }).options as EChartsOption) || {}
    if (!chartConfig.backgroundColor && uiOptionsStore.darkMode === 'dark') {
      chartConfig.backgroundColor = '#121212'
    }

    const cast = <T>(val: unknown): T => val as T

    return {
      ...chartConfig,
      grid: cast(grid.value),
      xAxis: cast(xAxis.value),
      yAxis: cast(yAxis.value),
      calendar: cast(calendar.value),
      singleAxis: cast(singleAxis.value),
      tooltip: cast(tooltip.value),
      visualMap: cast(visualMap.value),
      dataZoom: cast(dataZoom.value),
      legend: cast(legend.value),
      title: cast(title.value),
      toolbox: cast(toolbox.value),
      series: cast(series.value)
    }
  })

  // methods
  const setPeriod = (periodValue: string) => {
    speriod.value = periodValue
    endTime.value = addOrSubtractPeriod(dayjs(), future.value)
  }

  const setDate = (date: Date | string | number | Dayjs) => {
    const chartType = config.value.chartType
    const day = dayjs(date)
    endTime.value = addOrSubtractPeriod(chartType ? startOf(chartType, day) : day, 1)
  }

  const earlierPeriod = () => {
    endTime.value = addOrSubtractPeriod(endTime.value, -1)
  }

  const laterPeriod = () => {
    endTime.value = addOrSubtractPeriod(endTime.value, 1)
  }

  return {
    endTime: readonly(endTime.value),
    startTime,
    period,
    options,

    setPeriod,
    setDate,
    earlierPeriod,
    laterPeriod
  }
}
