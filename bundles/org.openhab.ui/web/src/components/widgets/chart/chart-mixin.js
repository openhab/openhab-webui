import dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import Duration from 'dayjs/plugin/duration'

dayjs.extend(IsoWeek)
dayjs.extend(Duration)

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
  data () {
    const config = this.context.component.config || {}
    const chartType = config.chartType
    const future = config.future === true ? 1 : (config.future ?? 0)
    const endTime = (chartType)
      ? this.addOrSubtractPeriod(dayjs().startOf(chartType), 1 + future)
      : this.addOrSubtractPeriod(dayjs(), future)

    return {
      items: {},
      speriod: config.period || DEFAULT_PERIOD,
      future,
      endTime,
      orient: null
    }
  },
  computed: {
    startTime () {
      return this.addOrSubtractPeriod(this.endTime, -1)
    },
    period () {
      return this.evaluateExpression('.period', this.speriod)
    },
    options () {
      if (!this.config) return {}
      const chartConfig = this.config.options || {}
      if (!chartConfig.backgroundColor && useUIOptionsStore().getDarkMode() === 'dark') {
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
    grid () {
      if (!this.context.component.slots || !this.context.component.slots.grid) return undefined
      return this.context.component.slots.grid.map((g) => g.config)
    },
    xAxis () {
      if (!this.context.component.slots || !this.context.component.slots.xAxis) return undefined
      return this.context.component.slots.xAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component, this))
    },
    yAxis () {
      if (!this.context.component.slots || !this.context.component.slots.yAxis) return undefined
      return this.context.component.slots.yAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component, this, true)) // invert Y axis by default
    },
    calendar () {
      if (!this.context.component.slots || !this.context.component.slots.calendar) return undefined
      return this.context.component.slots.calendar.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component, this, this.orient))
    },
    singleAxis () {
      if (!this.context.component.slots || !this.context.component.slots.singleAxis) return undefined
      return this.context.component.slots.xAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component, this))
    },
    tooltip () {
      if (!this.context.component.slots || !this.context.component.slots.tooltip) return undefined
      return this.context.component.slots.tooltip.map((c) => OhChartTooltip.get(c, this.startTime, this.endTime, this, this.$device))
    },
    visualMap () {
      if (!this.context.component.slots) return undefined
      if (this.context.component.slots.visualMap) {
        return this.context.component.slots.visualMap.map((c) => OhChartVisualMap.get(c, this.startTime, this.endTime, this, this.$device))
      } else if (JSON.stringify(this.context.component.slots.series)?.includes('heatmap')) { // heatmap needs a visualMap, therefore fall back to a default
        const config = {
          calculable: true,
          presetPalette: 'bluered',
          show: false,
          type: 'continuous'
        }
        return OhChartVisualMap.get({ config }, this.startTime, this.endTime, this, this.$device)
      }
      return undefined
    },
    dataZoom () {
      if (!this.context.component.slots || !this.context.component.slots.dataZoom) return undefined
      return this.context.component.slots.dataZoom.map((c) => OhChartDataZoom.get(c, this.startTime, this.endTime, this, this.$device))
    },
    legend () {
      if (!this.context.component.slots || !this.context.component.slots.legend) return undefined
      return this.context.component.slots.legend.map((c) => OhChartLegend.get(c, this.startTime, this.endTime, this, this.$device))
    },
    title () {
      if (!this.context.component.slots || !this.context.component.slots.title) return undefined
      return this.context.component.slots.title.map((c) => OhChartTitle.get(c, this.startTime, this.endTime, this, this.$device))
    },
    toolbox () {
      if (!this.context.component.slots || !this.context.component.slots.toolbox) return undefined
      return this.context.component.slots.toolbox.map((c) => OhChartToolbox.get(c, this.startTime, this.endTime, this, this.$device))
    }
  },
  asyncComputed: {
    series () {
      if (!this.context.component.slots || !this.context.component.slots.series) return Promise.resolve([])
      return Promise.all(this.context.component.slots.series.map((s) => this.getSeriesPromises(s)))
    }
  },
  methods: {
    async getSeriesPromises (component) {
      const getter = (data) => seriesComponents[component.component].get(component, data.map((d) => d[1]), this.startTime, this.endTime, this)

      const neededItems = seriesComponents[component.component].neededItems(component, this).filter((i) => !!i)
      if (neededItems.length === 0) {
        return Promise.resolve(getter([]))
      }

      const now = dayjs()
      const isBetweenStartAndEnd = dayjs(this.startTime).subtract(5, 'minutes').isBefore(now) && dayjs(this.endTime).add(5, 'minutes').isAfter(now)

      let boundary = seriesComponents[component.component].includeBoundary?.(component) !== undefined
        ? seriesComponents[component.component].includeBoundary(component)
        : isBetweenStartAndEnd
      if (component.config.noBoundary === true) boundary = false

      let itemState = seriesComponents[component.component].includeItemState?.(component) !== undefined
        ? seriesComponents[component.component].includeItemState(component)
        : isBetweenStartAndEnd
      if (component.config.noItemState === true) itemState = false

      const itemPromises = neededItems.map((neededItem) => {
        if (this.items[neededItem]) return Promise.resolve(this.items[neededItem])
        return this.$oh.api.get(`/rest/items/${neededItem}`).then((item) => {
          this.items[neededItem] = item
          return item
        })
      })

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

        return Promise.all([itemPromises[neededItem], this.$oh.api.get(url, query)])
      })

      return Promise.all(combinedPromises).then(getter)
    },
    setPeriod (period) {
      this.speriod = period
      this.endTime = this.addOrSubtractPeriod(dayjs(), this.future)
    },
    setDate (date) {
      const chartType = this.context.component.config.chartType
      const day = dayjs(date)
      this.endTime = this.addOrSubtractPeriod((chartType) ? day.startOf(chartType) : day, 1)
    },
    earlierPeriod () {
      this.endTime = this.addOrSubtractPeriod(this.endTime, -1)
    },
    laterPeriod () {
      this.endTime = this.addOrSubtractPeriod(this.endTime, 1)
    },
    addOrSubtractPeriod (day, direction) {
      if (!this.context.component.config) return
      if (direction === 0) return day
      const fn = (direction < 0) ? day.subtract : day.add
      const chartType = this.context.component.config.chartType
      direction = Math.abs(direction)
      if (chartType) {
        const millis = dayjs.duration({ [chartType === 'isoWeek' ? 'week' : chartType]: 1 }).asMilliseconds() * direction
        day = fn.apply(day, [millis, 'millisecond'])
      } else {
        const period = this.period || this.context.component.config.period || DEFAULT_PERIOD
        const span = period.match(/^([\d]*)([smhdDwWMQyY])$/)
        if (span) {
          const millis = dayjs.duration({ [span[2].replace(/[DWY]/, (x) => x.toLowerCase())]: parseInt(span[1]) || 1 }).asMilliseconds() * direction
          day = fn.apply(day, [millis, 'millisecond'])
        }
      }

      return day
    }
  }
}
