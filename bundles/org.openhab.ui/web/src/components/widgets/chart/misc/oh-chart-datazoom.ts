import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { DataZoomComponentOption } from 'echarts'
import type { OhChartDatazoom } from '@/types/components/widgets'

const OhChartDataZoom: MiscChartComponent = {
  get(context, component) {
    return context.evaluateExpression<OhChartDatazoom.Config & DataZoomComponentOption>(
      ComponentId.get(component)!,
      component.config as unknown as OhChartDatazoom.Config & DataZoomComponentOption
    )
  }
}

export default OhChartDataZoom
