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

    const axis1 = {
      component: 'oh-category-axis',
      config: {
        gridIndex: 0,
        categoryType: (analyzer.chartType === 'isoWeek') ? 'week' : analyzer.chartType,
        startOnSunday: (analyzer.chartType === 'week') ? true : undefined
      }
    }

    const dimension1 = (analyzer.chartType === 'day') ? 'hour'
      : (analyzer.chartType === 'week') ? 'weekday'
        : (analyzer.chartType === 'isoWeek') ? 'isoWeekday'
          : (analyzer.chartType === 'month') ? 'date'
            : (analyzer.chartType === 'year') ? 'month'
              : undefined

    const axis2 = {
      component: 'oh-value-axis',
      config: {
        gridIndex: 0
      }
    }

    page.slots.xAxis = [axis1]
    page.slots.yAxis = [axis2]

    page.slots.series = analyzer.items.map((item) => {
      return {
        component: 'oh-aggregate-series',
        config: {
          name: item.label || item.name,
          item: item.name,
          gridIndex: 0,
          xAxisIndex: 0,
          yAxisIndex: 0,
          type: 'bar',
          dimension1
        }
      }
    })

    page.slots.tooltip = [
      {
        component: 'oh-chart-tooltip',
        config: {
          confine: true
          // smartFormatter: true
        }
      }
    ]

    page.slots.legend = [
      { component: 'oh-chart-legend', config: {} }
    ]

    return page
  }
}
