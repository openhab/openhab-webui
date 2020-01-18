<template>
  <div class="network-fit">
    <chart :options="finalOptions" :theme="$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined" autoresize></chart>
  </div>
</template>

<style lang="stylus">
.network-fit
  position absolute
  left 0
  top var(--f7-navbar-height)
  height calc(100% - var(--f7-navbar-height))
  width 100%
  display flex
  align-items center
  justify-content center
  .echarts
    width calc(100% - 20px)
    height 100%
</style>

<script>

// import ECharts modules manually to reduce bundle size
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/graph'
import 'echarts/lib/component/tooltip'

import ECharts from 'vue-echarts/components/ECharts'

// import mixin from './index'

// import { sprintf } from 'sprintf-js'

export default {
  components: {
    'chart': ECharts
  },
  computed: {
    finalOptions () {
      return {
        tooltip: {
          formatter: '{b}: {c}',
          confine: true,
          position: [10, 10]
        },
        series: this.series
      }
    }
  },
  asyncComputed: {
    series () {
      let serie = {
        type: 'graph',
        layout: 'force',
        force: {
          initLayout: 'force',
          gravity: 0.9,
          repulsion: 2000,
          edgeLength: 120,
          layoutAnimation: false
        },
        data: [],
        links: [],
        label: {
          textStyle: {
            fontSize: 16
          },
          show: true
        },
        // label: {
        //   emphasis: {
        //     position: 'right',
        //     show: true
        //   },
        //   color: 'blue'
        // },
        roam: true,
        focusNodeAdjacency: true,
        lineStyle: {
          normal: {
            width: 1,
            curveness: 0.3,
            opacity: 0.7
          },
          emphasis: {
            width: 6
          }
        },
        symbolSize: 28,
        itemStyle: {
          normal: {
            color: 'blue'
          }
        }
      }
      return this.$oh.api.get('/rest/things').then((data) => {
        let zWaveNodes = data.filter((t) => t.properties && t.properties.zwave_nodeid)

        zWaveNodes.forEach((t) => {
          let nodeid = t.properties.zwave_nodeid
          let bridgeUID = t.bridgeUID
          let listening = t.properties.zwave_listening === 'true'
          serie.data.push({
            name: nodeid,
            value: t.label,
            symbolSize: bridgeUID ? 28 : 42,
            itemStyle: {
              color: t.statusInfo.status === 'ONLINE' ? 'green' : t.statusInfo.status === 'OFFLINE' ? 'crimson' : 'gray',
              borderColor: !bridgeUID ? 'orange' : listening ? 'yellow' : 'none',
              borderWidth: 3
            }
          })
          t.properties.zwave_neighbours.split(',').forEach((n) => {
            let returnlink = serie.links.find((l) => l.target === nodeid && l.source === n)
            if (!returnlink) {
              serie.links.push({
                source: t.properties.zwave_nodeid,
                target: n,
                symbol: ['circle', 'arrow'],
                symbolSize: [4, 10],
                value: 'Unidirectional',
                lineStyle: {
                  type: 'dashed'
                }
              })
            } else {
              returnlink.symbol = null
              returnlink.value = 'Bidirectional'
              returnlink.lineStyle.type = 'solid'
            }
          })
        })

        return [serie]
      })
    }
  }
}
</script>
