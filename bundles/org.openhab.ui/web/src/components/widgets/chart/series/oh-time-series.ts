import { f7 } from 'framework7-vue'

import ComponentId from '../../component-id'
import MarkArea from './oh-mark-area'
import applyMarkers from '@/components/widgets/chart/util/markers'
import type { SeriesComponent, SeriesOption } from '../types.ts'
import { OhTimeSeries } from '@/types/components/widgets'
import * as api from '@/api'

const timeSeries: SeriesComponent = {
  neededItems(context, component) {
    let markAreaItems: string[] = []
    if ('slots' in component && Array.isArray((component as api.RootUiComponent).slots.markArea)) {
      markAreaItems = (component as api.RootUiComponent).slots
        .markArea!.map((a, i) =>
          context.evaluateExpression<string | undefined>(ComponentId.get(component)! + '.mitem' + i, (a.config as OhTimeSeries.Config).item)
        )
        .filter((i) => i !== undefined)
    }
    const series = context.evaluateExpression<OhTimeSeries.Config>(ComponentId.get(component)!, component.config)
    return series.item ? [series.item, ...markAreaItems] : markAreaItems
  },
  get(context, component, points, startTime, endTime) {
    const series = context.evaluateExpression<OhTimeSeries.Config & SeriesOption>(ComponentId.get(component)!, component.config)
    series.data = []

    if (series.item) {
      const itemPoints = points.find((p) => p.name === series.item)?.data ?? []

      const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
      series.data = itemPoints.map((p) => {
        return [new Date(p.time), typeof p.state === 'number' ? formatter.format(p.state) : p.state]
      })
      series.id = `oh-time-series#${series.item}#${f7.utils.id()}`
    }

    // other things
    if ('slots' in component && Array.isArray((component as api.RootUiComponent).slots.markArea)) {
      const markAreaComponent = (component as api.RootUiComponent).slots.markArea![0]
      if (markAreaComponent) series.markArea = MarkArea.get(context, markAreaComponent, points, startTime, endTime)
    }

    applyMarkers(series)

    if (series.showSymbol === undefined) series.showSymbol = false
    if (!series.tooltip) {
      series.tooltip = { show: true }
    }

    return series
  }
}

export default timeSeries
