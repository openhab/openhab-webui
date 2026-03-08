import { f7 } from 'framework7-vue'
import ComponentId from '../../component-id'
import type { SeriesComponent, StateSeriesOption } from '../types.ts'
import { OhStateSeries } from '@/types/components/widgets'
import type { CustomSeriesRenderItem } from 'echarts'

const renderState: CustomSeriesRenderItem = (_params, api) => {
  const yValue = api.value(0)
  const start = api.coord([api.value(1), yValue])
  const end = api.coord([api.value(2), yValue])
  const state = api.value(3)
  const yHeight = parseFloat(api.value(4) as string)

  if (state === 'UNDEF' || state === 'NULL') return
  const height = (api.size!([0, 1]) as number[])[1]! * yHeight
  const rectShape = {
    x: start[0],
    y: start[1]! - height / 2,
    width: end[0]! - start[0]!,
    height
  }
  return (
    rectShape && {
      type: 'rect',
      shape: rectShape,
      style: api.style({}) // TODO: Address deprecation warning
    }
  )
}

export type MapStateFunction = (point: string) => string
export type StateColorMap = Record<string, string>

const stateSeries: SeriesComponent = {
  neededItems(context, component) {
    const series = context.evaluateExpression<OhStateSeries.Config>(ComponentId.get(component)!, component.config)
    return series.item ? [series.item] : []
  },
  get(context, component, points) {
    const series = context.evaluateExpression<OhStateSeries.Config & StateSeriesOption>(ComponentId.get(component)!, component.config)
    series.type = 'custom'
    series.renderItem = renderState
    series.encode = {
      x: -1, // don't filter by x value when zooming
      y: 0,
      tooltip: [3],
      itemName: 3
    }
    series.colorBy = 'data'
    series.clip = true
    if (!series.label) series.label = ({} as StateSeriesOption['label'])!
    if (series.label.show === undefined) series.label.show = true
    if (!series.label.position) series.label.position = 'insideLeft'
    // @ts-expect-error formatter not defined on type - TODO: Check whether it works
    if (!series.label.formatter) series.label.formatter = '{@[3]}'
    if (!series.labelLayout) series.labelLayout = { hideOverlap: true }
    if (!series.tooltip) series.tooltip = ({} as StateSeriesOption['tooltip'])!
    if (series.tooltip.formatter === undefined) {
      series.tooltip.formatter = (params) => {
        if (!Array.isArray(params.value) || params.value.length < 3) return ''
        let durationSec = ((params.value[2]! as number) - (params.value[1]! as number)) / 1000
        let hours = Math.floor(durationSec / 3600)
          .toString()
          .padStart(2, '0')
        let minutes = Math.floor((durationSec - parseInt(hours) * 3600) / 60)
          .toString()
          .padStart(2, '0')
        return params.seriesName + '<br />' + (params.marker as string) + params.name + '&#9;(' + hours + ':' + minutes + ')'
      }
    }

    series.data = []

    if (series.item) {
      let itemPoints = points.find((p) => p.name === series.item)?.data ?? []

      if ('mapState' in series) {
        for (let i = 0; i < itemPoints.length; i++) {
          itemPoints[i]!.state = (series.mapState as MapStateFunction)(itemPoints[i]!.state)
        }
      }

      let data = []
      let itemStartTime: Date | null = null
      for (let i = 0; i < itemPoints.length; i++) {
        // Merge timeframes with equal state
        if (itemPoints[i + 1] && itemPoints[i]!.state === itemPoints[i + 1]!.state) {
          itemStartTime = itemStartTime || new Date(itemPoints[i]!.time)
          continue
        }

        itemStartTime = itemStartTime || new Date(itemPoints[i]!.time)
        const itemEndTime = new Date(itemPoints[i + 1] ? itemPoints[i + 1]!.time : itemPoints[itemPoints.length - 1]!.time)
        const stateColor = 'stateColor' in series ? (series.stateColor as StateColorMap)[itemPoints[i]!.state] : undefined
        data.push({
          value: [series.yValue || 0, itemStartTime, itemEndTime, itemPoints[i]!.state, series.yHeight || 0.6],
          itemStyle: {
            color: stateColor
          }
        })
        itemStartTime = null
      }

      series.data = data

      series.id = `oh-state-series#${series.item}#${f7.utils.id()}`
    }

    if (!series.tooltip) {
      series.tooltip = { show: true }
    }

    return series
  }
}

export default stateSeries
