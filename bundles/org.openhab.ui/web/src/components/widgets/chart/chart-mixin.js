import * as dayjs from 'dayjs'

// Axis components
import OhTimeAxis from './axis/oh-time-axis'
import OhValueAxis from './axis/oh-value-axis'
import OhCalendarAxis from './axis/oh-calendar-axis'
import OhWeekAxis from './axis/oh-week-axis'

// Series components
import OhTimeSeries from './series/oh-time-series'
import OhCalendarSeries from './series/oh-calendar-series'

const axisComponents = {
  'oh-time-axis': OhTimeAxis,
  'oh-value-axis': OhValueAxis,
  'oh-calendar-axis': OhCalendarAxis,
  'oh-week-axis': OhWeekAxis
}

const seriesComponents = {
  'oh-time-series': OhTimeSeries,
  'oh-calendar-series': OhCalendarSeries
}

export default {
  data () {
    const chartType = this.context.component.config.chartType
    const period = this.context.component.config.period || 'D'
    let endTime = (chartType) ? dayjs().startOf(chartType).add(1, chartType) : dayjs()
    return {
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
      const chartConfig = this.config.options || {}
      return {
        ...chartConfig,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        calendar: this.calendar,
        series: this.series
      }
    },
    xAxis () {
      if (!this.context.component.slots || !this.context.component.slots.xAxis) return undefined
      return this.context.component.slots.xAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component))
    },
    yAxis () {
      if (!this.context.component.slots || !this.context.component.slots.yAxis) return undefined
      return this.context.component.slots.yAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component))
    },
    calendar () {
      if (!this.context.component.slots || !this.context.component.slots.calendar) return undefined
      return this.context.component.slots.calendar.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.context.component, this.orient))
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
      const neededItems = seriesComponents[component.component].neededItems(component)
      const promises = neededItems.map((neededItem) => {
        let url = `/rest/persistence/items/${neededItem}`
        let seriesStartTime = this.startTime
        let seriesEndTime = this.endTime
        if (component.config.offset_amount && component.config.offset_unit) {
          seriesStartTime = seriesStartTime.subtract(component.config.offset_amount, component.config.offset_unit)
          seriesEndTime = seriesEndTime.subtract(component.config.offset_amount, component.config.offset_unit)
        }
        let query = {
          serviceId: component.config.service || undefined,
          starttime: seriesStartTime.toISOString(),
          endtime: seriesEndTime.toISOString()
        }

        return this.$oh.api.get(url, query)
      })

      return Promise.all(promises).then((data) => {
        return seriesComponents[component.component].get(component, data, this.startTime, this.endTime, this.context.component)
      })
    },
    setPeriod (period) {
      this.period = period
      this.endTime = dayjs()
    },
    earlierPeriod () {
      this.endTime = this.addOrSubtractPeriod(this.endTime, -1)
    },
    laterPeriod () {
      this.endTime = this.addOrSubtractPeriod(this.endTime, 1)
    },
    addOrSubtractPeriod (day, direction) {
      const fn = (direction < 0) ? day.subtract : day.add
      for (let i = 0; i < Math.abs(direction); i++) {
        if (this.config.chartType) {
          day = fn.apply(day, [1, this.config.chartType])
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
