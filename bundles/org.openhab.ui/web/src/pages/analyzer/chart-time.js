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

    page.slots.grid = [{ component: 'oh-chart-grid', config: { includeLabels: true } }]

    page.slots.xAxis = [
      {
        component: 'oh-time-axis',
        config: {
          gridIndex: 0
        }
      }
    ]

    page.slots.yAxis = analyzer.valueAxesOptions.map((a) => {
      return {
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
      }
    })
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
          component: 'oh-time-series',
          config: {
            name: seriesOptions.name,
            gridIndex: 0,
            xAxisIndex: 0,
            yAxisIndex: 0,
            type: 'line',
            areaStyle: seriesOptions.type === 'area' ? {} : undefined
          },
          slots: {
            markArea: [
              {
                component: 'oh-mark-area',
                config: {
                  name: item.name,
                  item: item.name,
                  silent: seriesOptions.silent
                }
              }
            ]
          }
        }
      }

      const markers = []
      if (seriesOptions.markers === 'all') markers.push('min', 'max', 'avg')
      if (seriesOptions.markers === 'min-max') markers.push('min', 'max')
      if (seriesOptions.markers === 'avg') markers.push('avg')

      return {
        component: 'oh-time-series',
        config: {
          name: seriesOptions.name,
          gridIndex: 0,
          xAxisIndex: 0,
          yAxisIndex: seriesOptions.valueAxisIndex,
          type: 'line',
          item: item.name,
          areaStyle: seriesOptions.type === 'area' ? { opacity: 0.2 } : undefined,
          markers
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
          type: 'inside'
        }
      }
    ]

    return page
  }
}
