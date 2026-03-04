import ComponentId from '../../component-id'
import type { SeriesComponent, SeriesOption } from '../types.ts'
import { OhDataSeries } from '@/types/components/widgets'

const dataSeries: SeriesComponent = {
  neededItems() {
    return []
  },
  get(context, component) {
    // safety guard to prevent crashing due to incorrect user-provided data
    if (!component.config || typeof component.config !== 'object') return {}
    return context.evaluateExpression<OhDataSeries.Config & SeriesOption>(ComponentId.get(component)!, component.config)
  }
}

export default dataSeries
