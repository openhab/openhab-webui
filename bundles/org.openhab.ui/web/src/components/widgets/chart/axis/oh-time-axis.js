import dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import ComponentId from '../../component-id'
import { startOf } from '@/components/widgets/chart/utils.ts'

dayjs.extend(IsoWeek)

export default {
  get(component, startTime, endTime, chart, chartWidget, inverse, numberFormatter) {
    let axis = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    axis.type = 'time'
    const chartType = chart.config.chartType
    if (chartType) {
      // adjusts time-axis begin and end timestamps depending on the received data, allowing to display series with offset
      axis.min = (v) => {
        if (isNaN(v.min)) return startTime.toDate().getTime()
        if (!isFinite(v.min)) return v.min
        return startOf(chartType, v.min).toDate().getTime()
      }
      axis.max = (v) => {
        if (isNaN(v.min)) return endTime.toDate().getTime()
        if (!isFinite(v.max)) return v.max
        return startOf(chartType, v.min)
          .add(1, chartType === 'isoWeek' ? 'week' : chartType)
          .toDate()
          .getTime()
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
