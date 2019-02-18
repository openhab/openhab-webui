<template>
  <chart v-if="items.length === 1" :options="finalOptions" auto-resize></chart>
  <div v-else-if="items.length > 1">The calendar supports only one item. Select a single item.</div>
</template>

<script>
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/heatmap'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/calendar'
import 'echarts/lib/component/visualMap'

import ECharts from 'vue-echarts/components/ECharts'

import mixin from './index'

import { sprintf } from 'sprintf-js'

export default {
  props: ['items', 'type', 'startTime', 'endTime', 'options'],
  mixins: [mixin],
  components: {
    'chart': ECharts
  },
  methods: {
    formatTooltip (params) {
      let tooltip = `<div class="chart-tooltip-date">${echarts.format.formatTime('dd.MM.yyyy hh:mm', params.data[0])}</div>`
      let name = this.itemLabels[0]
      let pattern = this.itemFormats[0]
      let value = (pattern) ? sprintf(pattern, params.data[1]) : Math.round(parseFloat(params.data[1]))
      tooltip += `<div class="chart-tooltip-series">${name}: ${value}</div>`
      // debugger
      return tooltip
    }
  },
  computed: {
    maxValue () {
      return (this.series) ? Math.max(...this.series[0].data.map(d => d[1])) : null
    },
    minValue () {
      return (this.series) ? Math.min(...this.series[0].data.map(d => d[1])) : null
    },
    colorPalette () {
      switch (this.options.colorPalette) {
        case 'greenred': return ['#50a3ba', '#eac736', '#d94e5d']
        case 'whiteblue': return ['#ffffff', '#4c9ffb']
        case 'bluered': return ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        default: return null
      }
    },
    finalOptions () {
      return {
        tooltip: {
          formatter: this.formatTooltip,
          textStyle: {
            fontSize: 11
          }
        },
        visualMap: {
          show: this.options.showVisualMap,
          min: Math.floor(this.minValue),
          max: Math.ceil(this.maxValue),
          type: 'continuous',
          orient: 'horizontal',
          left: 'center',
          top: 0,
          realtime: false,
          calculable: true,
          textStyle: {
            color: '#000'
          },
          inRange: (this.colorPalette) ? { color: this.colorPalette } : undefined
        },
        calendar: {
          top: (this.options.showVisualMap) ? 80 : 30,
          left: 30,
          right: 30,
          cellSize: ['auto', 'auto'],
          range: [
            echarts.format.formatTime('yyyy-MM-dd', this.startTime),
            echarts.format.formatTime('yyyy-MM-dd', this.endTime)
          ],
          orient: (this.options.vertical) ? 'vertical' : 'horizontal',
          dayLabel: {
            firstDay: 1,
            margin: 5
          },
          monthName: {
            margin: 5
          },
          itemStyle: {
            normal: {borderWidth: 0.5}
          },
          yearLabel: {show: false}
        },
        series: this.series /* {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: this.getVirtualData(2016)
        } */
      }
    }
  },
  asyncComputed: {
    series: {
      get () {
        // let vm = this
        let series = []

        let promises = []
        for (let item of this.items) {
          promises.push(this.$http.get('/rest/persistence/items/' + item, {
            params: {
              starttime: new Date(this.startTime).toISOString(),
              endtime: new Date(this.endTime).toISOString()
            }
          }).then((resp) => {
            return resp.data
          }))
        }

        return Promise.all(promises).then((data) => {
          for (let serie of data) {
            series.push({
              type: 'heatmap',
              coordinateSystem: 'calendar',
              // Make sure to average the data points over the day if there are more than one
              data: serie.data.reduce((acc, point) => {
                let date = echarts.format.formatTime('yyyy-MM-dd', point.time)
                if (acc.length && acc[acc.length - 1][0] === date) {
                  acc[acc.length - 1][1].push(parseFloat(point.state))
                } else {
                  acc.push([date, [parseFloat(point.state)]])
                }
                return acc
              }, []).map((arr) => {
                let avg = arr[1].reduce((sum, state) => sum + state, 0) / arr[1].length
                return [new Date(arr[0]), avg]
              })
            })
          }

          return series
        })
      }
    }
  }
}
</script>
