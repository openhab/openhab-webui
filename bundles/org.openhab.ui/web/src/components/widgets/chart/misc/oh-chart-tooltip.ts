import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { OhChartTooltip } from '@/types/components/widgets'
import type { TooltipComponentOption } from 'echarts'
import type { TopLevelFormatterParams } from 'echarts/types/dist/shared'
import { OhChartTooltipDefinition } from '@/assets/definitions/widgets/chart'

dayjs.extend(LocalizedFormat)

const chartTooltip: MiscChartComponent = {
  get(context, component) {
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
          // tooltip for aggregate & calendar series:
          // - header: series name
          // - content: category label and formatted value
          if (params.componentType === 'series') {
            if (!Array.isArray(params.data)) return ''
            let state = context.numberFormatter!.format(params.data[1] as number)
            const unit = params.data[params.data.length - 1] as string | undefined
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
          // - content: marker colour, series name and value (if available)
          if (params.componentType === 'markArea') {
            const [_seriesType, itemName, _id] = params.seriesId.split('#')
            const item = context.items?.[itemName]
            const state = item
              ? item.stateDescription?.options.find((o) => o.value === (params.value as string))?.label
              : (params.value as string)

            // @ts-expect-error data access
            tooltip += `<div>${dayjs((params.data.coord as unknown[][])[0][0]).format('llll')} - ${dayjs((params.data.coord as unknown[][])[1][0]).format('HH:mm')}</div>`
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
          if (param.axisType === 'xAxis.time' && 'axisValue' in param) {
            tooltip += `<div>${dayjs(param.axisValue as string).format('llll')}</div>`
          }
          params.forEach((p) => {
            if (p.seriesId) {
              const [seriesType, _itemName, _id, markArea] = p.seriesId.split('#')
              const unit = Array.isArray(p.value) ? (p.value[p.value.length - 1] as string) : undefined
              if ((seriesType === 'oh-time-series' && !markArea) || seriesType !== 'oh-time-series') {
                let state = context.numberFormatter!.format((p.data as number[])[1])
                if (unit) state += ' ' + unit
                tooltip += `${p.marker as string} ${p.seriesName}`
                tooltip += `<span style="float: right; margin-left: 20px"><b style="text-align: right;">${state}</b></span><br/>`
              }
            }
          })
        }

        return tooltip
      }
    }

    return options
  }
}

export default chartTooltip
