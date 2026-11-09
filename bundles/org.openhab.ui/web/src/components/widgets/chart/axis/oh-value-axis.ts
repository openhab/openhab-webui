import ComponentId from '../../component-id'
import type { AxisComponent, OhValueAxisOption } from '../types'
import type { ValueAxisBaseOption } from 'echarts/types/dist/shared'
import { OhValueAxisDefinition } from '@/assets/definitions/widgets/chart'
import { ensureArray } from '@/js/openhab/utils'

const valueAxis: AxisComponent = {
  get(context, component, _startTime, _endTime) {
    const axis = context.evaluateExpression<OhValueAxisOption>(ComponentId.get(component)!, component.config, OhValueAxisDefinition)
    axis.type = 'value'
    axis.split = ensureArray(axis.split)

    if (!axis.axisLabel) axis.axisLabel = {}!
    if (!(axis.axisLabel as ValueAxisBaseOption['axisLabel'])!.formatter && context.numberFormatter) {
      ;(axis.axisLabel as ValueAxisBaseOption['axisLabel'])!.formatter = (value: number) => context.numberFormatter!.format(value)
    }

    return axis
  }
}

export default valueAxis
