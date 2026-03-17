import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { OhChartTooltip } from '@/types/components/widgets'
import type { TooltipComponentOption } from 'echarts'
import type { TopLevelFormatterParams } from 'echarts/types/dist/shared'

dayjs.extend(LocalizedFormat)

const chartTooltip: MiscChartComponent = {
  get(context, component) {
    const options = context.evaluateExpression<OhChartTooltip.Config & TooltipComponentOption>(
      ComponentId.get(component)!,
      component.config
    )
    if (options.confine === undefined) options.confine = true

    if (!options.valueFormatter && context.numberFormatter) {
      // @ts-expect-error our value formatter is sufficient for our use cases, but doesn't match the generic ECharts requirements
      options.valueFormatter = (value: number) => context.numberFormatter!.format(value)
    }

    if (options.smartFormatter && context.numberFormatter) {
      options.formatter = (params: TopLevelFormatterParams): string => {
        let tooltip = ''
        // special tooltip for mark area:
        // - header: time range (start time to end time) in 'dd DD.MM.YYYY HH:mm - HH:mm'
        // - content: marker colour, series name and value (if available)
        if (!Array.isArray(params) && params.componentType === 'markArea') {
          if (!params.seriesId) return ''
          const [_seriesType, itemName, _id] = params.seriesId.split('#')
          const item = context.items?.[itemName!]
          const state = item
            ? item.stateDescription?.options.find((o) => o.value === (params.value as string))?.label
            : (params.value as string)

          // @ts-expect-error data access
          tooltip += `<div>${dayjs((params.data.coord as unknown[][])[0][0]).format('llll')} - ${dayjs((params.data.coord as unknown[][])[1][0]).format('HH:mm')}</div>`
          tooltip += params.marker as string
          tooltip += params.name
          if (state) tooltip += ': ' + state
          return tooltip
        }
        // standard tooltip:
        if (Array.isArray(params)) {
          if (!params[0] || !('axisType' in params[0])) return ''
          // header: x-axis time in 'dd DD.MM.YYYY HH:mm'
          if (params[0].axisType === 'xAxis.time' && 'axisValue' in params[0]) {
            tooltip += `<div>${dayjs(params[0].axisValue as string).format('llll')}</div>`
          }
          // content: for each oh-time-series marker color, series name and formatted value
          params.forEach((p) => {
            if (p.seriesId) {
              const [seriesType, itemName, _id, markArea] = p.seriesId.split('#')
              const item = context.items?.[itemName!]
              if (seriesType === 'oh-time-series' && !markArea) {
                let state = context.numberFormatter!.format((p.data as number[])[1]!)
                if (item && item.unitSymbol) state += ' ' + item.unitSymbol
                tooltip += (p.marker as string) + ' ' + p.seriesName + ': ' + state + '<br />'
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
