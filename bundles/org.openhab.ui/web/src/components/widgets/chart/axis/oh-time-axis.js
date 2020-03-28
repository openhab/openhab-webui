import * as dayjs from 'dayjs'

export default {
  get (component, startTime, endTime, chart) {
    let axis = Object.assign({}, component.config)
    axis.type = 'time'
    if (chart.config.chartType) {
      axis.min = (v) => {
        return isFinite(v.min) ? dayjs(v.min).startOf(chart.config.chartType).toDate().getTime() : v.min
      }
      axis.max = (v) => {
        return isFinite(v.max) ? dayjs(v.max).startOf(chart.config.chartType).add(1, chart.config.chartType).toDate().getTime() : v.max
      }
    }
    return axis
  }
}
