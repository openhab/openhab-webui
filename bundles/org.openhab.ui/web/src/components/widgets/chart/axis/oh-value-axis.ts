import ComponentId from '../../component-id'
import type { AxisComponent } from '../types'
import type { ValueAxisBaseOption } from 'echarts/types/dist/shared'

const valueAxis: AxisComponent = {
  get(context, component, _startTime, _endTime, inverse) {
    let axis = context.evaluateExpression<ValueAxisBaseOption>(ComponentId.get(component)!, component.config)
    axis.type = 'value'

    if (!axis.axisLabel) axis.axisLabel = ({} as ValueAxisBaseOption['axisLabel'])!
    if (!axis.axisLabel.formatter && context.numberFormatter) {
      axis.axisLabel.formatter = (value: number) => context.numberFormatter!.format(value)
    }

    axis.inverse = inverse

    return axis
  }
}

export default valueAxis
