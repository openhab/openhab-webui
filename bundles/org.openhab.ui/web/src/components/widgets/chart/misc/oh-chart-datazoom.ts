import ComponentId from '../../component-id'
import type { MiscChartComponent, ChartContext } from '../types'
import * as api from '@/api'
import type { DataZoomComponentOption } from 'echarts'
import type { OhChartDatazoom } from '@/types/components/widgets'

const OhChartDataZoom: MiscChartComponent = {
  get(context: ChartContext, component: api.UiComponent) {
    return context.evaluateExpression<OhChartDatazoom.Config & DataZoomComponentOption>(
      ComponentId.get(component)!,
      component.config as unknown as OhChartDatazoom.Config & DataZoomComponentOption
    )
  }
}

export default OhChartDataZoom
