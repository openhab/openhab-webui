import ComponentId from '../../component-id'
import type { SeriesComponent, OhDataSeriesOption } from '../types.ts'

const dataSeries: SeriesComponent = {
  neededItems() {
    return []
  },
  get(context, component) {
    // safety guard to prevent crashing due to incorrect user-provided data
    if (!component.config || typeof component.config !== 'object') return {}
    return context.evaluateExpression<OhDataSeriesOption>(ComponentId.get(component)!, component.config)
  }
}

export default dataSeries
