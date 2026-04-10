import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { DataZoomComponentOption } from 'echarts'
import type { OhChartDatazoom } from '@/types/components/widgets'
import { OhChartDatazoomDefinition } from '@/assets/definitions/widgets/chart'

const OhChartDataZoom: MiscChartComponent = {
  get(context, component) {
    return context.evaluateExpression<OhChartDatazoom.Config & DataZoomComponentOption>(
      ComponentId.get(component)!,
      component.config as unknown as OhChartDatazoom.Config & DataZoomComponentOption,
      OhChartDatazoomDefinition
    )
  }
}

export default OhChartDataZoom
