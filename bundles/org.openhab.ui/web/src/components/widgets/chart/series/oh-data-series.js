import Framework7 from 'framework7'

export default {
  neededItems () {
    return []
  },
  get (component, points, startTime, endTime, chart) {
    let series = {}

    if (!component.dataSeriesId) {
      component.dataSeriesId = Framework7.utils.id() + '.'
    }

    if (component.config) {
      if (typeof component.config !== 'object') return {}
      
      for (const key in component.config) {
        chart.$set(series, key, chart.evaluateExpression(component.dataSeriesId + key, component.config[key]))
      }

      if (component.config.data && Array.isArray(component.config.data)) {
        series.data = component.config.data.map((v, index) =>  {
          const item = chart.evaluateExpression(component.dataSeriesId + 'data.' + index, v)
          return Number.isNaN(item.value) ? {} : item
        })
      }

      if (component.config.axisLine && component.config.axisLine.lineStyle && component.config.axisLine.lineStyle.color && Array.isArray(component.config.axisLine.lineStyle.color)) {
        series.axisLine.lineStyle.color = component.config.axisLine.lineStyle.color.map((v, index) => {
          if (!Array.isArray(v)) return v
          return v.map((s, subindex) => chart.evaluateExpression(component.dataSeriesId + 'axisLine.lineStyle.color.' + index + '.' + subindex, s))
        })
      }
    }

    return series
  }
}
