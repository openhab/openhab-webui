import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { OhChartTooltip } from '@/types/components/widgets'
import type { TooltipComponentOption } from 'echarts'
import type { TopLevelFormatterParams } from 'echarts/types/dist/shared'
import { OhChartTooltipDefinition } from '@/assets/definitions/widgets/chart'
import { formatTimestamp } from '@/components/widgets/chart/util/time.ts'

dayjs.extend(LocalizedFormat)

const chartTooltip: MiscChartComponent = {
  get(context, component, startTime, endTime) {
    const options = context.evaluateExpression<OhChartTooltip.Config & TooltipComponentOption>(
      ComponentId.get(component)!,
      component.config,
      OhChartTooltipDefinition
    )
    if (options.confine === undefined) options.confine = true

    if (!options.valueFormatter && context.numberFormatter) {
      // @ts-expect-error our value formatter is sufficient for our use cases, but doesn't match the generic ECharts requirements
      options.valueFormatter = (value: number) => context.numberFormatter!.format(value)
    }

    if (options.smartFormatter && context.numberFormatter) {
      options.formatter = (params: TopLevelFormatterParams): string => {
        let tooltip = ''
        if (!Array.isArray(params)) {
          if (!params.seriesId) return ''
          const [_seriesType, _itemName, unit, _id] = params.seriesId.split('#')
          // tooltip for aggregate & calendar series:
          // - header: series name
          // - content: category label and formatted value
          if (params.componentType === 'series') {
            if (!Array.isArray(params.data)) return ''
            let state = context.numberFormatter!.format(params.data[1] as number)
            if (unit) state += ' ' + unit
            tooltip += `<div>${params.seriesName}</div>`
            if (params.name) {
              // aggregate series
              tooltip += `${params.marker as string} ${params.name}`
              tooltip += `<span style="float: right; margin-left: 20px"><b style="text-align: right;">${state}</b></span><br/>`
            } else {
              // calendar series
              tooltip += params.marker as string
              tooltip += `<b style="text-align: right;">${state}</b><br/>`
            }
          }
          // mark area tooltip:
          // - header: time range (start time to end time) in 'dd DD.MM.YYYY HH:mm - HH:mm'
          // - content: marker color, series name and value (if available)
          if (params.componentType === 'markArea') {
            const [_seriesType, itemName, _id] = params.seriesId.split('#')
            const item = context.items?.[itemName]
            const state = item
              ? item.stateDescription?.options.find((o) => o.value === (params.value as string))?.label
              : (params.value as string)

            // @ts-expect-error data access
            const time = dayjs((params.data.coord as unknown[][])[0][0])
            const timestamp = formatTimestamp(time)
            // @ts-expect-error data access
            tooltip += `<div>${timestamp} - ${dayjs((params.data.coord as unknown[][])[1][0]).format('HH:mm')}</div>`
            tooltip += params.marker as string
            tooltip += params.name
            if (state) tooltip += `<span style="float: right; margin-left: 20px"><b style="text-align: right;">${state}</b></span><br/>`
            return tooltip
          }
        }
        // time series tooltip:
        // - header: x-axis time in 'dd DD.MM.YYYY HH:mm'
        // - content: for each oh-time-series marker color, series name and formatted value
        if (Array.isArray(params)) {
          const param = params[0]
          if (!param || !('axisType' in param)) return ''
          const hoveredTime = param.axisType === 'xAxis.time' && 'axisValue' in param ? dayjs(param.axisValue as string) : undefined
          let rows = ''
          params.forEach((p) => {
            if (p.seriesId) {
              const [seriesType, _itemName, unit, _id, markArea] = p.seriesId.split('#')
              if ((seriesType === 'oh-time-series' && !markArea) || seriesType !== 'oh-time-series') {
                // ECharts always passes the data point nearest to the pointer to the tooltip. For a chart without data in
                // the displayed period, that is the boundary point from before the period (or one after it), which would
                // be shown with its own, unrelated date. Only show points within the displayed period.
                if (seriesType === 'oh-time-series' && Array.isArray(p.data)) {
                  const option = context.series?.find((s) => s.id === p.seriesId) as
                    | { offsetAmount?: number; offsetUnit?: dayjs.ManipulateType }
                    | undefined
                  // series with an offset are queried for a shifted period, see useChart
                  const shift = (time: dayjs.Dayjs) =>
                    option?.offsetAmount && option.offsetUnit ? time.subtract(option.offsetAmount, option.offsetUnit) : time
                  const pointTime = dayjs(p.data[0])
                  if (pointTime.isBefore(shift(startTime)) || pointTime.isAfter(shift(endTime))) return
                }
                let state = context.numberFormatter!.format((p.data as number[])[1])
                if (unit) state += ' ' + unit
                rows += `${p.marker as string} ${p.seriesName}`
                rows += `<span style="float: right; margin-left: 20px"><b style="text-align: right;">${state}</b></span><br/>`
              }
            }
          })
          // no series has data within the displayed period: don't show a tooltip at all
          if (!rows) return ''
          if (hoveredTime) tooltip += `<div>${formatTimestamp(hoveredTime)}</div>`
          tooltip += rows
        }

        return tooltip
      }
    }

    return options
  }
}

export default chartTooltip
