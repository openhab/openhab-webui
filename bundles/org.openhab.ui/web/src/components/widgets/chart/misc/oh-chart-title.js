import ComponentId from '../../component-id'

export default {
  get (component, startTime, endTime, chart, device) {
    return chart.evaluateExpression(ComponentId.get(component), component.config)
  }
}
