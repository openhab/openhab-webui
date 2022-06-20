import ComponentId from '../../component-id'

export default {
  neededItems () {
    return []
  },
  get (component, points, startTime, endTime, chart, chartWidget) {
    if (!component.config || typeof component.config !== 'object') return {}

    const dataSeriesId = ComponentId.get(component)
    let series = chartWidget.evaluateExpression(dataSeriesId, component.config)

    if (series.data && Array.isArray(series.data)) {
      series.data = series.data.map((v, index) => {
        const item = chartWidget.evaluateExpression(dataSeriesId + 'data.' + index, v)
        return Number.isNaN(item.value) ? {} : item
      })
    }

    if (series.axisLine && series.axisLine.lineStyle && series.axisLine.lineStyle.color && Array.isArray(series.axisLine.lineStyle.color)) {
      series.axisLine.lineStyle.color = series.axisLine.lineStyle.color.map((v, index) => {
        if (!Array.isArray(v)) return v
        return v.map((s, subindex) => chart.evaluateExpression(dataSeriesId + 'axisLine.lineStyle.color.' + index + '.' + subindex, s))
      })
    }

    return series
  }
}
