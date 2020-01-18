<template>
  <chart :options="finalOptions" :theme="$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined" autoresize></chart>
</template>

<script>

// import ECharts modules manually to reduce bundle size
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markPoint'

import ECharts from 'vue-echarts/components/ECharts'

// import mixin from './index'

import { sprintf } from 'sprintf-js'

export default {
  props: ['items', 'type', 'startTime', 'endTime', 'options'],
  // mixins: [mixin],
  components: {
    'chart': ECharts
  },
  methods: {
    formatTooltip (params) {
      let tooltip = `<div class="chart-tooltip-date">${params[0].axisValueLabel}</div>`
      for (let serie of params) {
        let name = this.items[serie.seriesIndex]
        let value = serie.value[1]
        // let name = this.itemLabels[serie.seriesIndex]
        // let pattern = this.itemFormats[serie.seriesIndex]
        // let value = (pattern) ? sprintf(pattern, serie.value[1]) : serie.value[1]
        tooltip += `<div class="chart-tooltip-series"><span class="chart-tooltip-dot" style="background-color: ${serie.color}">&nbsp;</span> ${name}: ${value}</div>`
      }
      return tooltip
    }
  },
  computed: {
    finalOptions () {
      if (!this.data) return null
      return {
        startDate: this.startTime,
        grid: this.defaultOptions.grid,
        xAxis: this.defaultOptions.xAxis,
        yAxis: this.defaultOptions.yAxis,
        dataZoom: this.defaultOptions.dataZoom,
        legend: {},
        tooltip: {
          formatter: this.formatTooltip,
          textStyle: {
            fontSize: 11
          }
        },
        series: this.items.map((item, idx) => {
          let seriesOptions = {
            name: item.name,
            type: 'line',
            // smooth: true,
            showSymbol: false,
            symbol: 'circle',
            symbolSize: 5,
            // sampling: 'average',
            data: this.data[idx]
          }
          // use other y axis if the format is different than the previous series
          // if (idx > 0 && this.itemFormats[idx] && (this.itemFormats[idx] !== this.itemFormats[0])) {
          //   seriesOptions.yAxisIndex = 1
          //   seriesOptions.areaStyle = {
          //     opacity: 0.2
          //   }
          //   seriesOptions.lineStyle = {
          //     opacity: 0.2
          //   }
          // }
          if (this.options.markers) {
            if (this.options.markers.averageLine || this.options.markers.minMaxLines) {
              seriesOptions.markLine = {
                data: []
              }
              if (this.options.markers.averageLine) {
                seriesOptions.markLine.data.push({ type: 'average', name: 'avg', label: { position: 'middle' } })
              }
              if (this.options.markers.minMaxLines) {
                seriesOptions.markLine.data.push({ type: 'min', name: 'min', label: { position: 'middle' } })
                seriesOptions.markLine.data.push({ type: 'max', name: 'max', label: { position: 'middle' } })
              }
            }
            if (this.options.markers.minMaxPoints) {
              seriesOptions.markPoint = {
                symbol: 'diamond',
                symbolSize: 15,
                label: {
                  show: !this.options.markers.minMaxLines,
                  position: 'right',
                  color: 'auto',
                  formatter: (params) => {
                    let pattern = this.itemFormats[params.seriesIndex]
                    return (pattern) ? sprintf(pattern, params.value) : params.value
                  },
                  textStyle: {
                    fontSize: 11
                  }
                },
                data: [
                  { type: 'max', name: 'min', symbolRotate: 180 },
                  { type: 'min', name: 'max' }
                ]
              }
            }
          }

          return seriesOptions
        })
      }
    }
  },
  asyncComputed: {
    data: {
      get () {
        // let vm = this
        let formattedData = []

        let promises = []
        for (let item of this.items) {
          promises.push(this.$oh.api.get('/rest/persistence/items/' + item, {
            starttime: new Date(this.startTime).toISOString(),
            endtime: new Date(this.endTime).toISOString()
          }).then((data) => {
            return data
          }))
        }

        return Promise.all(promises).then((data) => {
          for (let serie of data) {
            formattedData.push(serie.data.map((datapoint) => {
              return [
                new Date(datapoint.time),
                datapoint.state
              ]
            }))
          }

          return formattedData
        })
      }
    }
  },
  data () {
    return {
      defaultOptions: {
        animation: true,
        tooltip: {
          // triggerOn: 'none'
        },
        // toolbox: {
        //   left: 'center',
        //   itemSize: 25,
        //   top: 55,
        //   feature: {
        //     dataZoom: {
        //       yAxisIndex: 'none'
        //     },
        //     restore: {}
        //   }
        // },
        xAxis: {
          type: 'time',
          // boundaryGap: [0, 0],
          axisPointer: {
            show: true,
            snap: true,
            lineStyle: {
              color: '#4c9ffb',
              opacity: 0.5,
              width: 2
            },
            label: {
              show: true,
              formatter: function (params) {
                return echarts.format.formatTime('dd.MM.yyyy hh:mm', params.value)
              },
              backgroundColor: '#4c9ffb'
            },
            handle: {
              show: !this.$f7.device.desktop, // this.$q.platform.is.mobile,
              color: '#4c9ffb'
            }
          },
          splitLine: {
            show: true
          }
        },
        yAxis: [
          {
            type: 'value',
            scale: true,
            axisTick: {
              inside: false
            },
            splitLine: {
              show: true
            },
            axisLabel: {
              inside: false,
              formatter: '{value}\n'
            }
            // z: 10
          },
          {
            type: 'value',
            scale: true,
            axisTick: {
              inside: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              inside: false,
              formatter: '{value}\n'
            }
          }
        ],
        grid: {
          top: 20,
          left: 0,
          right: 30,
          bottom: 75,
          containLabel: true
          // height: 160
        },
        // dataZoom: [{
        //   type: 'slider',
        //   throttle: 50
        // }],
        dataZoom: [{
          type: 'inside'
        }, {
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }],
        series: [
          {
            name: 'series1',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            sampling: 'average'
            // itemStyle: {
            //   normal: {
            //     color: '#8ec6ad'
            //   }
            // },
            // stack: 'a',
            // areaStyle: {
            //   normal: {
            //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            //       offset: 0,
            //       color: '#8ec6ad'
            //     }, {
            //       offset: 1,
            //       color: '#ffe'
            //     }])
            //   }
            // },
            // data: data1
          },
          {
            name: 'series2',
            type: 'line',
            smooth: true,
            stack: 'a',
            symbol: 'circle',
            symbolSize: 5,
            sampling: 'average'
            // itemStyle: {
            //   normal: {
            //     color: '#d68262'
            //   }
            // },
            // areaStyle: {
            //   normal: {
            //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            //       offset: 0,
            //       color: '#d68262'
            //     }, {
            //       offset: 1,
            //       color: '#ffe'
            //     }])
            //   }
            // },
            // data: data2
          }

        ]
      }
    }
  }
}
</script>
