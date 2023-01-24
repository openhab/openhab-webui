import ComponentId from '../../component-id'

export default {
  neededItems () {
    return []
  },
  get (component, points, startTime, endTime, chart) {
    if (!component.config || typeof component.config !== 'object') return {}
    return chart.evaluateExpression(ComponentId.get(component), component.config)
  }
}
