import dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import ComponentId from '../../component-id'

dayjs.extend(IsoWeek)

export default {
  get (component, startTime, endTime, chart, chartWidget, inverse, numberFormatter) {
    let axis = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    axis.type = 'time'
    axis.min = startTime.toDate().getTime()
    axis.max = endTime.toDate().getTime()

    if (!axis.axisPointer) {
      axis.axisPointer = { show: true, label: { backgroundColor: '#2196f3' } }
    }

    return axis
  }
}
