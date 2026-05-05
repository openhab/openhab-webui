import { f7 } from 'framework7-vue'

import ComponentId from '../../component-id'
import MarkArea from './oh-mark-area'
import type { OhTimeSeriesOption, SeriesComponent } from '../types.ts'
import { OhTimeSeries } from '@/types/components/widgets'
import * as api from '@/api'
import { OhTimeSeriesDefinition } from '@/assets/definitions/widgets/chart'

const timeSeries: SeriesComponent = {
  neededItems(context, component) {
    let markAreaItems: string[] = []
    if ('slots' in component && Array.isArray((component as api.RootUiComponent).slots.markArea)) {
      markAreaItems = (component as api.RootUiComponent).slots.markArea
        .map((a, i) =>
          context.evaluateExpression<string | undefined>(
            ComponentId.get(component)! + '.mitem' + i,
            (a.config as OhTimeSeries.Config).item,
            null
          )
        )
        .filter((i) => i !== undefined)
    }
    const series = context.evaluateExpression<OhTimeSeriesOption>(ComponentId.get(component)!, component.config, OhTimeSeriesDefinition)
    return series.item ? [series.item, ...markAreaItems] : markAreaItems
  },
  get(context, component, points, startTime, endTime) {
    const series = context.evaluateExpression<OhTimeSeriesOption>(ComponentId.get(component)!, component.config, OhTimeSeriesDefinition)
    series.data = []

    if (series.item) {
      const itemSeries = points.find((p) => p.name === series.item)
      const itemPoints = itemSeries?.data ?? []

      const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
      series.data = itemPoints.map((p) => {
        return [new Date(p.time), formatter.format(Number(p.state)), itemSeries?.unit]
      })
      series.id = `oh-time-series#${series.item}#${f7.utils.id()}`
    }

    // other things
    if ('slots' in component && Array.isArray((component as api.RootUiComponent).slots.markArea)) {
      const markAreaComponent = (component as api.RootUiComponent).slots.markArea[0]
      if (markAreaComponent) {
        series.markArea = MarkArea.get(context, markAreaComponent, points, startTime, endTime)
        series.id += '#mark-area'
      }
    }

    if (series.showSymbol === undefined) series.showSymbol = false
    if (!series.tooltip) {
      series.tooltip = { show: true }
    }

    return series
  }
}

export default timeSeries
