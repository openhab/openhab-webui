export default {
  getChartPage (analyzer) {
    let page = {
      component: 'oh-chart-page',
      config: {
        chartType: analyzer.chartType
      },
      slots: {}
    }

    if (!analyzer.chartType) {
      throw new Error('The aggregate coordinate system cannot be used with a dynamic period chart')
    }

    page.slots.grid = [{ component: 'oh-chart-grid', config: {} }]

    const axis1 = [{
      component: 'oh-category-axis',
      config: {
        gridIndex: 0,
        categoryType: (analyzer.chartType === 'isoWeek') ? 'week' : analyzer.chartType,
        startOnSunday: (analyzer.chartType === 'week') ? true : undefined,
        monthFormat: 'short',
        weekdayFormat: 'short'
      }
    }]

    const dimension1 = (analyzer.chartType === 'day') ? 'hour'
      : (analyzer.chartType === 'week') ? 'weekday'
        : (analyzer.chartType === 'isoWeek') ? 'isoWeekday'
          : (analyzer.chartType === 'month') ? 'date'
            : (analyzer.chartType === 'year') ? 'month'
              : undefined

    let axis2, dimension2
    if (analyzer.aggregateDimensions === 2) {
      const category2 = (analyzer.chartType === 'day') ? 'hour'
        : (analyzer.chartType === 'week') ? 'day'
          : (analyzer.chartType === 'isoWeek') ? 'day'
            : (analyzer.chartType === 'month') ? 'day'
              : (analyzer.chartType === 'year') ? 'month'
                : undefined

      dimension2 = (category2 === 'hour') ? 'minute'
        : (category2 === 'day') ? 'hour'
          : (category2 === 'month') ? 'date'
            : undefined

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
      axis2 = analyzer.valueAxesOptions.map((a) => {
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
    }

    if (analyzer.orientation === 'vertical') {
      page.slots.xAxis = axis2
      page.slots.yAxis = axis1
    } else {
      page.slots.xAxis = axis1
      page.slots.yAxis = axis2
    }

    page.slots.series = analyzer.items.map((item) => {
      const seriesOptions = analyzer.seriesOptions[item.name]

      const markers = []
      if (seriesOptions.markers === 'all') markers.push('min', 'max', 'avg')
      if (seriesOptions.markers === 'min-max') markers.push('min', 'max')
      if (seriesOptions.markers === 'avg') markers.push('avg')

      return {
        component: 'oh-aggregate-series',
        config: {
          name: seriesOptions.name,
          item: item.name,
          gridIndex: 0,
          xAxisIndex: (analyzer.orientation === 'vertical' && !dimension2) ? seriesOptions.valueAxisIndex : 0,
          yAxisIndex: (analyzer.orientation !== 'vertical' && !dimension2) ? seriesOptions.valueAxisIndex : 0,
          type: dimension2 ? 'heatmap' : (seriesOptions.type === 'bar') ? 'bar' : 'line',
          dimension1,
          dimension2,
          markers,
          transpose: analyzer.orientation === 'vertical' ? true : undefined,
          areaStyle: seriesOptions.type === 'area' ? { opacity: 0.2 } : undefined,
          aggregationFunction: seriesOptions.aggregation
        }
      }
    })

    if (dimension2) {
      page.slots.visualMap = [
        {
          component: 'oh-chart-visualmap',
          config: {
            show: true,
            orient: 'horizontal',
            calculable: true,
            bottom: 0,
            left: 'center',
            presetPalette: analyzer.visualMapPalette,
            type: analyzer.visualMapType,
            ...(analyzer.visualMapMin && analyzer.visualMapMin !== '') && { min: parseFloat(analyzer.visualMapMin) },
            ...(analyzer.visualMapMax && analyzer.visualMapMax !== '') && { max: parseFloat(analyzer.visualMapMax) }
          }
        }
      ]
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
