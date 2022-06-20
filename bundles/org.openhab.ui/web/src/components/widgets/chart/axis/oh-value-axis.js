import ComponentId from '../../component-id'

export default {
  get (component, startTime, endTime, chart, chartWidget) {
    let axis = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    axis.type = 'value'

    if (!component.config || typeof component.config !== 'object') return {}

    return axis
  }
}
