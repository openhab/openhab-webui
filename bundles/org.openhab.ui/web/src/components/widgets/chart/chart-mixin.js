import * as dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(IsoWeek)

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

// Other components
import OhChartTooltip from './misc/oh-chart-tooltip'
import OhChartVisualMap from './misc/oh-chart-visualmap'
import OhChartDataZoom from './misc/oh-chart-datazoom'
import OhChartLegend from './misc/oh-chart-legend'
import OhChartTitle from './misc/oh-chart-title'
import OhChartToolbox from './misc/oh-chart-toolbox'

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
  'oh-calendar-series': OhCalendarSeries
}

export default {
  data () {
    const config = this.context.component.config || {}
    const chartType = config.chartType
    const period = config.period || 'D'
    let endTime = (chartType) ? this.addOrSubtractPeriod(dayjs().startOf(chartType), 1) : dayjs()
    return {
      items: {},
      period,
      endTime,
      orient: null
    }
  },
  computed: {
    startTime () {
      return this.addOrSubtractPeriod(this.endTime, -1)
    },
    options () {
      if (!this.config) return {}
      const chartConfig = this.config.options || {}
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
      return this.context.component.slots.xAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component))
    },
    yAxis () {
      if (!this.context.component.slots || !this.context.component.slots.yAxis) return undefined
      return this.context.component.slots.yAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component, true)) // invert Y axis by default
    },
    calendar () {
      if (!this.context.component.slots || !this.context.component.slots.calendar) return undefined
      return this.context.component.slots.calendar.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component, this.orient))
    },
    singleAxis () {
      if (!this.context.component.slots || !this.context.component.slots.singleAxis) return undefined
      return this.context.component.slots.xAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component))
    },
    tooltip () {
      if (!this.context.component.slots || !this.context.component.slots.tooltip) return undefined
      return this.context.component.slots.tooltip.map((c) => OhChartTooltip.get(c, this.startTime, this.endTime, this, this.$device))
    },
    visualMap () {
      if (!this.context.component.slots || !this.context.component.slots.visualMap) return undefined
      return this.context.component.slots.visualMap.map((c) => OhChartVisualMap.get(c, this.startTime, this.endTime, this, this.$device))
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
    getSeriesPromises (component) {
      const getter = (data) => seriesComponents[component.component].get(component, data.map((d) => d[1]), this.startTime, this.endTime, this)

      const neededItems = seriesComponents[component.component].neededItems(component).filter(i => !!i)
      if (neededItems.length === 0) {
        return Promise.resolve(getter([]))
      }

      const itemPromises = neededItems.map((neededItem) => {
        if (this.items[neededItem]) return Promise.resolve(this.items[neededItem])
        return this.$oh.api.get(`/rest/items/${neededItem}`).then((item) => {
          this.items[neededItem] = item
          return item
        })
      })

      const combinedPromises = neededItems.map((neededItem) => {
        let url = `/rest/persistence/items/${neededItem}`
        let seriesStartTime = this.startTime
        let seriesEndTime = this.endTime
        if (component.config.offsetAmount && component.config.offsetUnit) {
          seriesStartTime = seriesStartTime.subtract(component.config.offsetAmount, component.config.offsetUnit)
          seriesEndTime = seriesEndTime.subtract(component.config.offsetAmount, component.config.offsetUnit)
        }
        let query = {
          serviceId: component.config.service || undefined,
          starttime: seriesStartTime.toISOString(),
          endtime: seriesEndTime.subtract(1, 'millisecond').toISOString()
        }

        return Promise.all([itemPromises[neededItem], this.$oh.api.get(url, query)])
      })

      return Promise.all(combinedPromises).then(getter)
    },
    setPeriod (period) {
      this.period = period
      this.endTime = dayjs()
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
      const fn = (direction < 0) ? day.subtract : day.add
      const chartType = this.context.component.config.chartType
      for (let i = 0; i < Math.abs(direction); i++) {
        if (chartType) {
          day = fn.apply(day, [1, chartType === 'isoWeek' ? 'week' : chartType])
        } else {
          switch (this.period) {
            case 'h': day = fn.apply(day, [1, 'hour']); break
            case '2h': day = fn.apply(day, [2, 'hour']); break
            case '4h': day = fn.apply(day, [4, 'hour']); break
            case '12h': day = fn.apply(day, [12, 'hour']); break
            case 'D': day = fn.apply(day, [1, 'day']); break
            case '2D': day = fn.apply(day, [2, 'day']); break
            case '3D': day = fn.apply(day, [3, 'day']); break
            case 'W': day = fn.apply(day, [1, 'week']); break
            case '2W': day = fn.apply(day, [2, 'week']); break
            case 'M': day = fn.apply(day, [1, 'month']); break
            case '2M': day = fn.apply(day, [2, 'month']); break
            case '4M': day = fn.apply(day, [4, 'month']); break
            case '6M': day = fn.apply(day, [6, 'month']); break
            case 'Y': day = fn.apply(day, [365, 'day']); break
          }
        }
      }

      return day
    }
  }
}
