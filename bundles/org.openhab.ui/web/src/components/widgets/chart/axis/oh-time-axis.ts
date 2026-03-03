import dayjs, { type Dayjs } from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import ComponentId from '../../component-id'
import { startOf } from '@/components/widgets/chart/utils'
import type { AxisComponent } from '../types'
import { OhChart } from '@/types/components/widgets'
import type { TimeAxisBaseOption } from 'echarts/types/dist/shared'

dayjs.extend(IsoWeek)

const timeAxis: AxisComponent = {
  get(context, component, startTime, endTime, inverse) {
    const axis = context.evaluateExpression<TimeAxisBaseOption>(ComponentId.get(component)!, component.config)
    axis.type = 'time'
    const chartType = (context.chart.config as any as OhChart.Config).chartType
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

    axis.inverse = inverse

    return axis
  }
}

export default timeAxis
