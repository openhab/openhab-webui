import ComponentId from '../../component-id'
import type { MiscChartComponent, ChartContext } from '../types'
import * as api from '@/api'
import type { LegendComponentOption } from 'echarts'
import type { OhChartLegend } from '@/types/components/widgets'

const chartLegend: MiscChartComponent = {
  get(context: ChartContext, component: api.UiComponent) {
    return context.evaluateExpression<OhChartLegend.Config & LegendComponentOption>(ComponentId.get(component)!, component.config)
  }
}

export default chartLegend
