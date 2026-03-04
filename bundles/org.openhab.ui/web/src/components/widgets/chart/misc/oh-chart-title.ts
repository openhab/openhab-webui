import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { TitleComponentOption } from 'echarts'
import type { OhChartTitle } from '@/types/components/widgets'

const chartTitle: MiscChartComponent = {
  get(context, component) {
    return context.evaluateExpression<OhChartTitle.Config & TitleComponentOption>(ComponentId.get(component)!, component.config)
  }
}

export default chartTitle
