import ComponentId from '../../component-id'
import type { MiscChartComponent, ChartContext } from '../types'
import * as api from '@/api'
import type { TitleComponentOption } from 'echarts'
import type { OhChartTitle } from '@/types/components/widgets'

const chartTitle: MiscChartComponent = {
  get(context: ChartContext, component: api.UiComponent) {
    return context.evaluateExpression<OhChartTitle.Config & TitleComponentOption>(ComponentId.get(component)!, component.config)
  }
}

export default chartTitle
