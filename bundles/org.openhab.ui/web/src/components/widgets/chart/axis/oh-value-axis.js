import ComponentId from '../../component-id'

export default {
  get (component, startTime, endTime, chart, chartWidget) {
    let axis = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    axis.type = 'value'
    return axis
  }
}
