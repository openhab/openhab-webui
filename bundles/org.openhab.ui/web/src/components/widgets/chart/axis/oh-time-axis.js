import * as dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(IsoWeek)

export default {
  get (component, startTime, endTime, chart) {
    let axis = Object.assign({}, component.config)
    axis.type = 'time'
    if (chart.config.chartType) {
      axis.min = (v) => {
        return isFinite(v.min) ? dayjs(v.min).startOf(chart.config.chartType).toDate().getTime() : v.min
      }
      axis.max = (v) => {
        return isFinite(v.min) ? dayjs(v.min).startOf(chart.config.chartType).add(1, chart.config.chartType === 'isoWeek' ? 'week' : chart.config.chartType).toDate().getTime() : v.max
      }
    } else {
      axis.min = startTime.toDate().getTime()
      axis.max = endTime.toDate().getTime()
    }

    if (!component.config.axisPointer) {
      axis.axisPointer = { show: true }
    }

    return axis
  }
}
