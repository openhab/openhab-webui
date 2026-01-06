import ComponentId from '../../component-id'

export default {
  get (component, startTime, endTime, chart, chartWidget, inverse, numberFormatter) {
    let axis = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    axis.type = 'value'

    axis.axisLabel = axis.axisLabel || {}
    if (!axis.axisLabel.formatter) {
      axis.axisLabel.formatter = (value, index) => numberFormatter.format(value)
    }

    return axis
  }
}
