import Framework7 from 'framework7'

export default {
  neededItems () {
    return []
  },
  get (component, points, startTime, endTime, chart) {
    if (!component.config || typeof component.config !== 'object') return {}

    if (!component.dataSeriesId) {
      component.dataSeriesId = Framework7.utils.id()
    }

    let series = chart.evaluateExpression(component.dataSeriesId, component.config)

    if (series.data && Array.isArray(series.data)) {
      series.data = series.data.map((v, index) => {
        const item = chart.evaluateExpression(component.dataSeriesId + 'data.' + index, v)
        return Number.isNaN(item.value) ? {} : item
      })
    }

    if (series.axisLine && series.axisLine.lineStyle && series.axisLine.lineStyle.color && Array.isArray(series.axisLine.lineStyle.color)) {
      series.axisLine.lineStyle.color = series.axisLine.lineStyle.color.map((v, index) => {
        if (!Array.isArray(v)) return v
        return v.map((s, subindex) => chart.evaluateExpression(component.dataSeriesId + 'axisLine.lineStyle.color.' + index + '.' + subindex, s))
      })
    }

    return series
  }
}
