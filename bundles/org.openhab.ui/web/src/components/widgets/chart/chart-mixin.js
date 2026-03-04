import dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import DayDuration from 'dayjs/plugin/duration'

dayjs.extend(IsoWeek)
dayjs.extend(DayDuration)

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

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

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { startOf, addOrSubtractPeriod } from '@/components/widgets/chart/util/time.ts'

const DEFAULT_PERIOD = 'D'

const axisComponents = {
  'oh-time-axis': OhTimeAxis,
  'oh-value-axis': OhValueAxis,
  'oh-calendar-axis': OhCalendarAxis,
  'oh-category-axis': OhCategoryAxis
}

const seriesComponents = {
  'oh-data-series': OhDataSeries,
  'oh-time-series': OhTimeSeries,
  'oh-aggregate-series': OhAggregateSeries,
  'oh-calendar-series': OhCalendarSeries,
  'oh-state-series': OhStateSeries
}

export default {
  beforeCreate() {
    this.numberFormatter = new Intl.NumberFormat(useRuntimeStore().locale)
  },
  data() {
    const config = this.context.component.config || {}
    const chartType = config.chartType
    const future = config.future === true ? 1 : (config.future ?? 0)
    const endTime = chartType ? this.addOrSubtractPeriod(startOf(chartType), 1 + future) : this.addOrSubtractPeriod(dayjs(), future)

    return {
      speriod: config.period || DEFAULT_PERIOD,
      future,
      endTime,
      orient: null
    }
  },
  computed: {
    chartContext() {
      return {
        chart: {
          ...this.context.component,
          config: this.config
        },
        evaluateExpression: this.evaluateExpression,
        numberFormatter: this.numberFormatter
      }
    },
    startTime() {
      return this.addOrSubtractPeriod(this.endTime, -1)
    },
    period() {
      return this.evaluateExpression('.period', this.speriod)
    },
    options() {
      if (!this.config) return {}
      const chartConfig = this.config.options || {}
      if (!chartConfig.backgroundColor && useUIOptionsStore().darkMode === 'dark') {
        chartConfig.backgroundColor = '#121212'
      }
      return {
        ...chartConfig,
        grid: this.grid,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        calendar: this.calendar,
        singleAxis: this.singleAxis,
        tooltip: this.tooltip,
        visualMap: this.visualMap,
        dataZoom: this.dataZoom,
        legend: this.legend,
        title: this.title,
        toolbox: this.toolbox,
        series: this.series
      }
    },
    grid() {
      if (!this.context.component.slots || !this.context.component.slots.grid) return undefined
      return this.context.component.slots.grid.map((g) => g.config)
    },
    xAxis() {
      if (!this.context.component.slots || !this.context.component.slots.xAxis) return undefined
      return this.context.component.slots.xAxis.map((a) =>
        axisComponents[a.component].get(this.chartContext, a, this.startTime, this.endTime)
      )
    },
    yAxis() {
      if (!this.context.component.slots || !this.context.component.slots.yAxis) return undefined
      return this.context.component.slots.yAxis.map((a) =>
        axisComponents[a.component].get(this.chartContext, a, this.startTime, this.endTime, true)
      ) // invert Y axis by default
    },
    calendar() {
      if (!this.context.component.slots || !this.context.component.slots.calendar) return undefined
      return this.context.component.slots.calendar.map((a) =>
        axisComponents[a.component].get(this.chartContext, a, this.startTime, this.endTime, this.orient === 'vertical')
      )
    },
    singleAxis() {
      if (!this.context.component.slots || !this.context.component.slots.singleAxis) return undefined
      return this.context.component.slots.singleAxis.map((a) =>
        axisComponents[a.component].get(this.chartContext, a, this.startTime, this.endTime)
      )
    },
    tooltip() {
      if (!this.context.component.slots || !this.context.component.slots.tooltip) return undefined
      return this.context.component.slots.tooltip.map((c) => OhChartTooltip.get(this.chartContext, c, this.startTime, this.endTime))
    },
    visualMap() {
      if (!this.context.component.slots) return undefined
      if (this.context.component.slots.visualMap) {
        return this.context.component.slots.visualMap.map((c) => OhChartVisualMap.get(this.chartContext, c, this.startTime, this.endTime))
      } else if (JSON.stringify(this.context.component.slots.series)?.includes('heatmap')) {
        // heatmap needs a visualMap, therefore fall back to a default
        const config = {
          calculable: true,
          presetPalette: 'bluered',
          show: false,
          type: 'continuous'
        }
        return OhChartVisualMap.get(this.chartContext, { config }, this.startTime, this.endTime)
      }
      return undefined
    },
    dataZoom() {
      if (!this.context.component.slots || !this.context.component.slots.dataZoom) return undefined
      return this.context.component.slots.dataZoom.map((c) => OhChartDataZoom.get(this.chartContext, c, this.startTime, this.endTime))
    },
    legend() {
      if (!this.context.component.slots || !this.context.component.slots.legend) return undefined
      return this.context.component.slots.legend.map((c) => OhChartLegend.get(this.chartContext, c, this.startTime, this.endTime))
    },
    title() {
      if (!this.context.component.slots || !this.context.component.slots.title) return undefined
      return this.context.component.slots.title.map((c) => OhChartTitle.get(this.chartContext, c, this.startTime, this.endTime))
    },
    toolbox() {
      if (!this.context.component.slots || !this.context.component.slots.toolbox) return undefined
      return this.context.component.slots.toolbox.map((c) => OhChartToolbox.get(this.chartContext, c, this.startTime, this.endTime))
    }
  },
  asyncComputed: {
    series() {
      if (!this.context.component.slots || !this.context.component.slots.series) return Promise.resolve([])
      return Promise.all(this.context.component.slots.series.map((s) => this.getSeriesPromises(s)))
    }
  },
  methods: {
    async getSeriesPromises(component) {
      const getter = (data) =>
        seriesComponents[component.component].get(
          this.chartContext,
          component,
          data.map((d) => d[1]),
          this.startTime,
          this.endTime
        )

      const neededItems = seriesComponents[component.component].neededItems(this.chartContext, component).filter((i) => !!i)
      if (neededItems.length === 0) {
        return Promise.resolve(getter([]))
      }

      const now = dayjs()
      const isBetweenStartAndEnd =
        dayjs(this.startTime).subtract(5, 'minutes').isBefore(now) && dayjs(this.endTime).add(5, 'minutes').isAfter(now)

      let boundary = seriesComponents[component.component].includeBoundary?.(this.chartContext, component) ?? isBetweenStartAndEnd
      if (component.config.noBoundary === true) boundary = false

      let itemState = seriesComponents[component.component].includeItemState?.(this.chartContext, component) ?? isBetweenStartAndEnd
      if (component.config.noItemState === true) itemState = false

      // Store items to avoid querying them again; use underscore-prefixed property to avoid reactivity
      if (!this._items) this._items = {}
      // Store promises for ongoing item queries to avoid querying multiple times in parallel
      if (!this._itemPromises) this._itemPromises = {}
      neededItems.forEach((neededItem) => {
        if (this._itemPromises[neededItem]) {
          // do nothing, promise already exists
        } else if (this._items[neededItem]) {
          this._itemPromises[neededItem] = Promise.resolve(this._items[neededItem])
        } else {
          this._itemPromises[neededItem] = this.$oh.api.get(`/rest/items/${neededItem}`).then((item) => {
            this._items[neededItem] = item
            delete this._itemPromises[neededItem]
            return item
          })
        }
      })

      // Store promises for ongoing persistence queries to avoid querying multiple times in parallel
      if (!this._persistencePromises) this._persistencePromises = {}
      const combinedPromises = neededItems.map((neededItem) => {
        const url = `/rest/persistence/items/${neededItem}`
        let seriesStartTime = this.startTime
        let seriesEndTime = this.endTime
        if (component.config.offsetAmount && component.config.offsetUnit) {
          seriesStartTime = seriesStartTime.subtract(component.config.offsetAmount, component.config.offsetUnit)
          seriesEndTime = seriesEndTime.subtract(component.config.offsetAmount, component.config.offsetUnit)
        }
        const serviceId = component.config.service ? this.evaluateExpression('.serviceId', component.config.service) : undefined
        const query = {
          serviceId,
          starttime: seriesStartTime.toISOString(),
          endtime: seriesEndTime.subtract(1, 'millisecond').toISOString(),
          boundary,
          itemState
        }
        const key = `${neededItem}-${query.serviceId}-${query.starttime}-${query.endtime}-${query.boundary}-${query.itemState}`
        if (!this._persistencePromises[key]) {
          this._persistencePromises[key] = this.$oh.api.get(url, query).then((result) => {
            delete this._persistencePromises[key]
            return result
          })
        }

        return Promise.all([this._itemPromises[neededItem], this._persistencePromises[key]])
      })

      return Promise.all(combinedPromises).then(getter)
    },
    setPeriod(period) {
      this.speriod = period
      this.endTime = this.addOrSubtractPeriod(dayjs(), this.future)
    },
    setDate(date) {
      const chartType = this.context.component.config.chartType
      const day = dayjs(date)
      this.endTime = this.addOrSubtractPeriod(chartType ? startOf(chartType, day) : day, 1)
    },
    earlierPeriod() {
      this.endTime = this.addOrSubtractPeriod(this.endTime, -1)
    },
    laterPeriod() {
      this.endTime = this.addOrSubtractPeriod(this.endTime, 1)
    },
    addOrSubtractPeriod(day, direction) {
      if (!this.context.component.config) return
      const chartType = this.context.component.config.chartType
      const period = this.period || this.context.component.config.period || DEFAULT_PERIOD

      return addOrSubtractPeriod(chartType, period, day, direction)
    }
  }
}
