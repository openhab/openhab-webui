import { renderVisualMap } from './analyzer-helpers'

export default {
  name: 'calendar',
  initCoordSystem (coordSettings = {}) {
    const uiParams = {
      showRotation: true,
      isAggregate: true,
      typeOptions: ['month', 'year']
    }
    return {
      uiParams,
      chartType: uiParams.typeOptions.includes(coordSettings.chartType) ? coordSettings.chartType : 'month',
      dimensions: 2,
      orientation: coordSettings.orientation || 'horizontal'
    }
  },
  initAxes (coordSettings) {
  },
  initSeries (item, coordSettings, seriesOptions = {}) {
    const options = {
      name: item.label || item.name,
      type: '',
      uiParams: {
        typeOptions: ['heatmap']
      }
    }

    if (!(item.type.startsWith('Number') || item.type === 'Dimmer' ||
      item.groupType?.startsWith('Number') || item.groupType === 'Dimmer')) {
      return options
    }

    options.type = 'heatmap'
    options.uiParams.typeOptions = ['heatmap']
    options.uiParams.showAggregationOptions = true

    return options
  },
  getChartPage (analyzer, coordSettings) {
    let page = {
      component: 'oh-chart-page',
      config: {
        chartType: coordSettings.chartType
      },
      slots: {}
    }

    const calendar = {
      component: 'oh-calendar-axis',
      config: {
        orient: coordSettings.orientation
      }
    }

    page.slots.calendar = [calendar]

    page.slots.series = analyzer.items.map((item) => {
      return {
        component: 'oh-calendar-series',
        config: {
          name: item.label || item.name,
          item: item.name,
          calendarIndex: 0,
          type: 'heatmap',
          aggregationFunction: analyzer.seriesOptions[item.name].aggregation
        }
      }
    })

    page.slots.visualMap = renderVisualMap(analyzer.visualMap)

    page.slots.tooltip = [
      {
        component: 'oh-chart-tooltip',
        config: {
          confine: true
          // smartFormatter: true
        }
      }
    ]

    return page
  }
}
