export default {
  getChartPage (analyzer) {
    let page = {
      component: 'oh-chart-page',
      config: {
        chartType: analyzer.chartType
      },
      slots: {}
    }

    const calendar = {
      component: 'oh-calendar-axis',
      config: {
        orient: analyzer.orientation
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
          type: 'heatmap'
        }
      }
    })

    page.slots.visualMap = [
      {
        component: 'oh-chart-visualmap',
        config: {
          show: true,
          calculable: true,
          bottom: 40
        }
      }
    ]

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
