import ComponentId from '../../component-id'

export default {
  neededItems () {
    return []
  },
  get (component, points, startTime, endTime, chart) {
    if (!component.config || typeof component.config !== 'object') return {}

    const dataSeriesId = ComponentId.get(component)
    return chart.evaluateExpression(dataSeriesId, component.config)
  }
}
