export default {
  getChartPage (analyzer) {
    return {
      component: 'oh-chart-page',
      config: {
        chartType: analyzer.chartType,
        period: analyzer.period
      },
      slots: {
        grid: [{ component: 'oh-chart-grid', config: {} }],
        xAxis: [
          {
            component: 'oh-time-axis',
            config: {
              gridIndex: 0
            }
          }
        ],
        yAxis: [
          {
            component: 'oh-value-axis',
            config: {
              gridIndex: 0
            }
          }
        ],
        series: analyzer.items.map((item) => {
          if (item.type === 'Switch' || item.type === 'Contact') {
            return {
              component: 'oh-time-series',
              config: {
                name: item.label || item.name,
                gridIndex: 0,
                xAxisIndex: 0,
                yAxisIndex: 0,
                type: 'line'
              },
              slots: {
                markArea: [
                  {
                    component: 'oh-mark-area',
                    config: {
                      name: item.name,
                      item: item.name
                    }
                  }
                ]
              }
            }
          }
          return {
            component: 'oh-time-series',
            config: {
              name: item.label || item.name,
              gridIndex: 0,
              xAxisIndex: 0,
              yAxisIndex: 0,
              type: 'line',
              item: item.name
            }
          }
        }),
        tooltip: [{ component: 'oh-chart-tooltip',
          config: {
            confine: true,
            smartFormatter: true
          } }],
        dataZoom: [
          { component: 'oh-chart-datazoom', config: { type: 'inside' } }
        ],
        legend: [
          { component: 'oh-chart-legend', config: {} }
        ]
      }
    }
  }
}
