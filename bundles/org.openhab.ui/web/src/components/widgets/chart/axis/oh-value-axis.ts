import ComponentId from '../../component-id'
import type { AxisComponent, OhValueAxisOption } from '../types'
import type { ValueAxisBaseOption } from 'echarts/types/dist/shared'

const valueAxis: AxisComponent = {
  get(context, component, _startTime, _endTime) {
    const axis = context.evaluateExpression<OhValueAxisOption>(ComponentId.get(component)!, component.config)
    axis.type = 'value'

    if (!axis.axisLabel) axis.axisLabel = ({} as ValueAxisBaseOption['axisLabel'])!
    if (!(axis.axisLabel as ValueAxisBaseOption['axisLabel'])!.formatter && context.numberFormatter) {
      ;(axis.axisLabel as ValueAxisBaseOption['axisLabel'])!.formatter = (value: number) => context.numberFormatter!.format(value)
    }

    return axis
  }
}

export default valueAxis
