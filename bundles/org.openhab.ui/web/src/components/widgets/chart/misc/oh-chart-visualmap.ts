import ComponentId from '../../component-id'
import type { MiscChartComponent } from '../types'
import type { OhChartVisualmap } from '@/types/components/widgets'
import type { VisualMapComponentOption } from 'echarts'

const presetPalettes = {
  greenred: ['#50a3ba', '#eac736', '#d94e5d'],
  whiteblue: ['#ffffff', '#4c9ffb'],
  bluered: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
}

const chartVisualMap: MiscChartComponent = {
  get(context, component) {
    const options = context.evaluateExpression<OhChartVisualmap.Config & VisualMapComponentOption>(
      ComponentId.get(component)!,
      component.config
    )
    if (options.presetPalette && (!options.inRange || !options.inRange.color)) {
      if (options.presetPalette in presetPalettes) {
        if (!options.inRange) options.inRange = {}
        // @ts-expect-error access to custom presetPalettes
        options.inRange.color = presetPalettes[options.presetPalette] as string[]
      }
    }
    if (options.min !== undefined) {
      ;(options as VisualMapComponentOption).min = parseFloat(options.min)
    } else if (context.series && context.series[0]) {
      ;(options as VisualMapComponentOption).min = Math.min(...(context.series[0].data as number[][]).map((p) => p[p.length - 1]!))
    }
    if (options.max !== undefined) {
      ;(options as VisualMapComponentOption).max = parseFloat(options.max)
    } else if (context.series && context.series[0]) {
      ;(options as VisualMapComponentOption).max = Math.max(...(context.series[0].data as number[][]).map((p) => p[p.length - 1] as number))
    }

    if (!options.formatter && context.numberFormatter) {
      options.formatter = (min: any, max?: any) => {
        return max
          ? context.numberFormatter!.format(min as number) + ' - ' + context.numberFormatter!.format(max as number)
          : context.numberFormatter!.format(min as number)
      }
    }

    return options
  }
}

export default chartVisualMap
