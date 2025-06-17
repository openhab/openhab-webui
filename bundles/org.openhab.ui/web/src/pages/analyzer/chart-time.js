import { getYAxis, renderValueAxis } from './analyzer-helpers.js'

export default {
  name: 'time',
  initCoordSystem (coordSettings = {}) {
    const uiParams = {
      typeOptions: ['day', 'isoWeek', 'month', 'year']
    }

    return {
      period: coordSettings.period || 'D',
      categoryAxisValues: [],
      valueAxesOptions: [],
      uiParams,
      chartType: uiParams.typeOptions.includes(coordSettings.chartType) ? coordSettings.chartType : ''
    }
  },
  initAxes (coordSettings) {
    coordSettings.categoryAxisValues = []
    coordSettings.valueAxesOptions = []
  },
  initSeries (item, coordSettings, seriesOptions = {}) {
    const options = {
      name: item.label || item.name,
      uiParams: {}
    }

    if (item.type.startsWith('Number') || item.groupType?.startsWith('Number')) {
      options.uiParams.typeOptions = ['line', 'area']
      options.uiParams.showMarkerOptions = true
      options.uiParams.showAxesOptions = true
      options.type = options.uiParams.typeOptions.includes(seriesOptions.type) ? seriesOptions.type : 'line'
    } else if (item.type === 'Dimmer' || item.groupType === 'Dimmer') {
      options.uiParams.typeOptions = ['line', 'area', 'state']
      options.uiParams.showAxesOptions = false
      options.uiParams.showMarkerOptions = true
      options.type = options.uiParams.typeOptions.includes(seriesOptions.type) ? seriesOptions.type : 'line'
    } else {
      options.uiParams.typeOptions = ['state']
      options.uiParams.showMarkerOptions = false
      options.uiParams.showAxesOptions = false
      options.type = 'state'
    }

    // determine the Y axis for the item and uiParams
    if (options.type === 'state') {
      coordSettings.categoryAxisValues.unshift(item.name)
      options.yValue = coordSettings.categoryAxisValues.length - 1
    } else if (options.type === 'line' || options.type === 'area') {
      options.valueAxisIndex = getYAxis(item, coordSettings)
    }

    return options
  },
  getChartPage (analyzer, coordSettings) {
    let page = {
      component: 'oh-chart-page',
      config: {
        chartType: coordSettings.chartType,
        period: coordSettings.period
      },
      slots: {}
    }

    let valueGrid = (coordSettings.valueAxesOptions.length > 0)
    let categoryGrid = (coordSettings.categoryAxisValues.length > 0)

    page.slots.grid = []
    page.slots.xAxis = []
    page.slots.yAxis = []
    page.slots.series = []

    if (valueGrid) {
      page.slots.grid.push({ component: 'oh-chart-grid', config: { includeLabels: true, bottom: (categoryGrid) ? '55%' : 60 } })
      page.slots.xAxis.push({ component: 'oh-time-axis', config: { gridIndex: 0 } })
      page.slots.yAxis = coordSettings.valueAxesOptions.map((a) => {
        return renderValueAxis(a)
      })
    }

    let categoryGridIndex = (valueGrid) ? 1 : 0
    if (categoryGrid) {
      page.slots.grid.push({ component: 'oh-chart-grid', config: { includeLabels: true, top: (valueGrid) ? '55%' : 60 } })
      page.slots.xAxis.push({ component: 'oh-time-axis', config: { gridIndex: categoryGridIndex } })
      page.slots.yAxis.push({
        component: 'oh-category-axis',
        config: {
          data: coordSettings.categoryAxisValues.map((item) => { return analyzer.seriesOptions[item].name }),
          gridIndex: categoryGridIndex
        }
      })
    }

    if (page.slots.yAxis.length === 0) {
      // add a default axis if none was found (for instance, only discrete values)
      page.slots.yAxis.push({
        component: 'oh-value-axis',
        config: {
          gridIndex: 0
        }
      })
    }

    page.slots.series = analyzer.items.map((item) => {
      const seriesOptions = analyzer.seriesOptions[item.name]

      if (seriesOptions.type === 'state') {
        return {
          component: 'oh-state-series',
          config: {
            item: item.name,
            name: seriesOptions.name,
            xAxisIndex: categoryGridIndex,
            yAxisIndex: page.slots.yAxis.length - 1,
            yValue: seriesOptions.yValue
          }
        }
      }

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
        component: 'oh-time-series',
        config: {
          name: seriesOptions.name,
          xAxisIndex: 0,
          yAxisIndex: seriesOptions.valueAxisIndex,
          type: 'line',
          item: item.name,
          areaStyle: seriesOptions.type === 'area' ? { opacity: 0.2 } : undefined,
          markLine,
          markPoint
        }
      }
    })

    page.slots.tooltip = [
      {
        component: 'oh-chart-tooltip',
        config: {
          confine: true,
          smartFormatter: true
        }
      }
    ]

    page.slots.legend = [
      {
        component: 'oh-chart-legend',
        config: {
          bottom: 3,
          type: 'scroll'
        }
      }
    ]

    page.slots.dataZoom = [
      {
        component: 'oh-chart-datazoom',
        config: {
          type: 'inside',
          xAxisIndex: (categoryGrid && valueGrid) ? [0, 1] : 0
        }
      }
    ]

    return page
  }
}
