import ComponentId from '../../component-id'
import type { MiscChartComponent, ChartContext } from '../types'
import * as api from '@/api'
import type { ToolboxComponentOption } from 'echarts'
import type { OhChartToolbox } from '@/types/components/widgets'

const presetFeatures = {
  saveAsImage: { title: 'Save as Image' },
  restore: { title: 'Restore' },
  dataView: { title: 'Data Table', lang: ['Data Table', 'Close', 'Refresh'] },
  dataZoom: { title: { zoom: 'Area Zooming', back: 'Restore Area Zoom' } },
  magicType: { title: { line: 'Line', bar: 'Bar', stack: 'Stack', tiled: 'Tiled' }, type: ['line', 'bar', 'stack', 'tiled'] }
}

const chartToolbox: MiscChartComponent = {
  get(context: ChartContext, component: api.UiComponent) {
    const options = context.evaluateExpression<OhChartToolbox.Config & ToolboxComponentOption>(
      ComponentId.get(component)!,
      component.config as unknown as OhChartToolbox.Config & ToolboxComponentOption
    )

    if (options.presetFeatures && !options.feature) {
      options.feature = Object.assign({}, presetFeatures) as ToolboxComponentOption['feature']
      for (const featureName in options.feature) {
        options.feature[featureName]!.show = options.presetFeatures.indexOf(featureName) >= 0
      }
    }

    if (!options.left) options.left = 'center'

    return options
  }
}

export default chartToolbox
