import ComponentId from '../../component-id'
import { startOf } from '@/components/widgets/chart/util/time'
import type { AxisComponent, OhTimeAxisOption } from '../types'
import { OhChart } from '@/types/components/widgets'

const timeAxis: AxisComponent = {
  get(context, component, startTime, endTime) {
    const axis = context.evaluateExpression<OhTimeAxisOption>(ComponentId.get(component)!, component.config)
    axis.type = 'time'
    const chartType = context.chart.config.chartType
    if (chartType) {
      // adjusts time-axis begin and end timestamps depending on the received data, allowing to display series with offset
      axis.min = (v: { min: number; max: number }) => {
        if (isNaN(v.min)) return startTime.toDate().getTime()
        if (!isFinite(v.min)) return v.min
        return startOf(chartType, v.min).toDate().getTime()
      }
      axis.max = (v: { min: number; max: number }) => {
        if (isNaN(v.min)) return endTime.toDate().getTime()
        if (!isFinite(v.max)) return v.max
        return startOf(chartType, v.min)
          .add(1, chartType === OhChart.ChartType.isoWeek ? 'week' : chartType)
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

export default timeAxis
