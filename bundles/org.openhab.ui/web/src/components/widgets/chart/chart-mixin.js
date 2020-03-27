import * as dayjs from 'dayjs'

// Axis components
import OhTimeAxis from './axis/oh-time-axis'
import OhCalendarAxis from './axis/oh-calendar-axis'
import OhWeekAxis from './axis/oh-week-axis'

// Series components
import OhTimeSeries from './series/oh-time-series'
import OhCalendarSeries from './series/oh-calendar-series'

const axisComponents = {
  'oh-time-axis': OhTimeAxis,
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
    let endTime
    switch (chartType) {
      default:
        endTime = dayjs()
    }
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
      return this.context.component.slots.xAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime))
    },
    yAxis () {
      if (!this.context.component.slots || !this.context.component.slots.yAxis) return undefined
      return this.context.component.slots.yAxis.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime))
    },
    calendar () {
      if (!this.context.component.slots || !this.context.component.slots.calendar) return undefined
      return this.context.component.slots.calendar.map((a) => axisComponents[a.component].get(a, this.startTime, this.endTime, this.orient))
    }
  },
  asyncComputed: {
    series () {
      if (!this.context.component.slots || !this.context.component.slots.series) return Promise.resolve([])
      return Promise.all(this.context.component.slots.series.map((s) => this.getSeriesPromise(s)))
    }
  },
  methods: {
    getSeriesPromise (component) {
      if (!component || !component.config || !component.config.item) return Promise.resolve({})
      let url = `/rest/persistence/items/${component.config.item}`
      let query = {
        serviceId: component.config.service || undefined,
        starttime: this.startTime.toISOString(),
        endtime: this.endTime.toISOString()
      }

      return this.$oh.api.get(url, query).then((data) => {
        return seriesComponents[component.component].get(component, data)
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

      return day
    }
  }
}
