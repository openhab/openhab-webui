import dayjs, { extend } from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import ComponentId from '../../component-id'

extend(IsoWeek)

export default {
  get (component, startTime, endTime, chart, chartWidget) {
    let axis = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
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

    if (!axis.axisPointer) {
      axis.axisPointer = { show: true, label: { backgroundColor: '#2196f3' } }
    }

    return axis
  }
}
