import ComponentId from '../../component-id'

export default {
  get (component, startTime, endTime, chart, chartWidget, device) {
    return chartWidget.evaluateExpression(ComponentId.get(component), component.config)
  }
}
