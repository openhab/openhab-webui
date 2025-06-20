export default {
  getChartPage (analyzer) {
    let page = {
      component: 'oh-chart-page',
      config: {
        chartType: analyzer.chartType,
        period: analyzer.period
      },
      slots: {}
    }

    let valueGrid = (analyzer.valueAxesOptions.length > 0)
    let categoryGrid = (analyzer.categoryAxisValues.length > 0)

    page.slots.grid = []
    page.slots.xAxis = []
    page.slots.yAxis = []
    page.slots.series = []

    if (valueGrid) {
      page.slots.grid.push({ component: 'oh-chart-grid', config: { includeLabels: true, bottom: (categoryGrid) ? '55%' : 60 } })
      page.slots.xAxis.push({ component: 'oh-time-axis', config: { gridIndex: 0 } })
      analyzer.valueAxesOptions.forEach((a) => {
        page.slots.yAxis.push({
          component: 'oh-value-axis',
          config: {
            gridIndex: 0,
            name: a.name || a.unit,
            ...(a.min && a.min !== '') && { min: parseFloat(a.min) },
            ...(a.max && a.max !== '') && { max: parseFloat(a.max) },
            scale: a.scale,
            ...(a.split === 'none' || a.split === 'area' || a.split === 'area+minor') && { splitLine: { show: false } },
            ...(a.split === 'line+minor' || a.split === 'area+minor' || a.split === 'all') && { minorTick: { show: true }, minorSplitLine: { show: true } },
            ...(a.split === 'area' || a.split === 'line+area' || a.split === 'area+minor' || a.split === 'all') && { splitArea: { show: true } }
          }
        })
      })
    }

    let categoryGridIndex = (valueGrid) ? 1 : 0
    if (categoryGrid) {
      page.slots.grid.push({ component: 'oh-chart-grid', config: { includeLabels: true, top: (valueGrid) ? '55%' : 60 } })
      page.slots.xAxis.push({ component: 'oh-time-axis', config: { gridIndex: categoryGridIndex } })
      page.slots.yAxis.push({
        component: 'oh-category-axis',
        config: {
          data: analyzer.categoryAxisValues.map((itemName) => analyzer.items.find((item) => item.name === itemName).label),
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

      if (seriesOptions.discrete) {
        return {
          component: 'oh-state-series',
          config: {
            item: item.name,
            name: item.label,
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
