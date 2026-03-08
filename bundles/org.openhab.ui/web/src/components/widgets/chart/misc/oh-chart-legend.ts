import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { LegendComponentOption } from 'echarts'
import type { OhChartLegend } from '@/types/components/widgets'

const chartLegend: MiscChartComponent = {
  get(context, component) {
    return context.evaluateExpression<OhChartLegend.Config & LegendComponentOption>(ComponentId.get(component)!, component.config)
  }
}

export default chartLegend
