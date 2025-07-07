import { getYAxis, renderVisualMap, renderValueAxis } from './analyzer-helpers.js'

const DIMENSION_MAP = { // dimension1, category2, dimension2
  'day': ['hour', 'hour', 'minute'],
  'week': ['weekday', 'day', 'hour'],
  'isoWeek': ['isoWeekday', 'day', 'hour'],
  'month': ['date', 'day', 'hour'],
  'year': ['month', 'month', 'date']
}

export default {
  name: 'aggregate',
  initCoordSystem (coordSettings = {}) {
    const uiParams = {
      typeOptions: ['day', 'isoweek', 'month', 'year'],
      showRotation: true,
      showMultiDimension: true,
      isAggregate: true
    }
    return {
      dimensions: coordSettings.dimensions || 1,
      valueAxesOptions: [],
      uiParams,
      chartType: uiParams.typeOptions.includes(coordSettings.chartType) ? coordSettings.chartType : 'day',
      orientation: coordSettings.orientation || 'horizontal'
    }
  },
  initAxes (coordSettings) {
    coordSettings.valueAxesOptions = []
  },
  initSeries (item, coordSettings, seriesOptions = {}) {
    const options = {
      name: item.label || item.name,
      type: '',
      uiParams: {
        showAggregationOptions: false
      }
    }

    if (!(item.type.startsWith('Number') || item.type === 'Dimmer' ||
        item.groupType?.startsWith('Number') || item.groupType === 'Dimmer')) {
      return options
    }

    options.uiParams.showAggregationOptions = true

    if (coordSettings.dimensions === 2) {
      options.uiParams.typeOptions = ['heatmap']
      options.type = 'heatmap'
    } else {
      options.uiParams.typeOptions = ['bar', 'line', 'area']
      options.type = options.uiParams.typeOptions.includes(seriesOptions.type) ? seriesOptions.type : 'bar'
      options.uiParams.showAxesOptions = true
      options.uiParams.showMarkerOptions = true
      options.valueAxisIndex = getYAxis(item, coordSettings)
    }

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

    if (!coordSettings.chartType) {
      throw new Error('The aggregate coordinate system cannot be used with a dynamic period chart')
    }

    page.slots.grid = [{ component: 'oh-chart-grid', config: {} }]

    const axis1 = [{
      component: 'oh-category-axis',
      config: {
        gridIndex: 0,
        categoryType: (coordSettings.chartType === 'isoWeek') ? 'week' : coordSettings.chartType,
        startOnSunday: (coordSettings.chartType === 'week') ? true : undefined,
        monthFormat: 'short',
        weekdayFormat: 'short'
      }
    }]

    const dimension1 = DIMENSION_MAP[coordSettings.chartType][0]

    let axis2, dimension2
    if (coordSettings.dimensions === 2) {
      const category2 = DIMENSION_MAP[coordSettings.chartType][1]
      dimension2 = DIMENSION_MAP[coordSettings.chartType][2]
      axis2 = [{
        component: 'oh-category-axis',
        config: {
          gridIndex: 0,
          categoryType: category2,
          monthFormat: 'short',
          weekdayFormat: 'short'
        }
      }]
    } else {
      if (coordSettings.valueAxesOptions.length === 0) {
        axis2 = [{
          component: 'oh-value-axis',
          config: {
            gridIndex: 0
          }
        }]
      } else {
        axis2 = coordSettings.valueAxesOptions.map((a) => renderValueAxis(a))
      }
    }

    if (coordSettings.orientation === 'vertical') {
      page.slots.xAxis = axis2
      page.slots.yAxis = axis1
    } else {
      page.slots.xAxis = axis1
      page.slots.yAxis = axis2
    }

    page.slots.series = analyzer.items.map((item) => {
      const seriesOptions = analyzer.seriesOptions[item.name]

      const markLine = (seriesOptions.markers === 'avg' || seriesOptions.markers === 'all') ? {
        data: [
          { type: 'average' }
        ]
      } : undefined
      const markPoint = (seriesOptions.markers === 'min-max' || seriesOptions.markers === 'all') ? {
        label: {
          backgroundColor: 'auto'
        },
        data: [
          { type: 'min', name: 'min' },
          { type: 'max', name: 'max' }
        ]
      } : undefined

      return {
        component: 'oh-aggregate-series',
        config: {
          name: seriesOptions.name,
          item: item.name,
          gridIndex: 0,
          xAxisIndex: (coordSettings.orientation === 'vertical' && !dimension2) ? seriesOptions.valueAxisIndex : 0,
          yAxisIndex: (coordSettings.orientation !== 'vertical' && !dimension2) ? seriesOptions.valueAxisIndex : 0,
          type: dimension2 ? 'heatmap' : (seriesOptions.type === 'bar') ? 'bar' : 'line',
          dimension1,
          dimension2,
          markLine,
          markPoint,
          transpose: coordSettings.orientation === 'vertical' ? true : undefined,
          areaStyle: seriesOptions.type === 'area' ? { opacity: 0.2 } : undefined,
          aggregationFunction: seriesOptions.aggregation
        }
      }
    })

    if (dimension2) {
      page.slots.visualMap = renderVisualMap(analyzer.visualMap)
    }

    page.slots.tooltip = [
      {
        component: 'oh-chart-tooltip',
        config: {
          confine: true
          // smartFormatter: true
        }
      }
    ]

    if (!dimension2) {
      page.slots.legend = [
        {
          component: 'oh-chart-legend',
          config: {
            bottom: 3,
            type: 'scroll'
          }
        }
      ]
    }

    return page
  }
}
