<template>
  <div class="network-fit">
    <chart :options="finalOptions" :theme="$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined" autoresize />
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
import 'echarts/lib/component/tooltip'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart } from 'echarts/charts'
import { ToolboxComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, GraphChart, ToolboxComponent])

import ThingStatus from '@/components/thing/thing-status-mixin'

export default {
  mixins: [ThingStatus],
  props: ['bridgeUID'],
  components: {
    'chart': VChart
  },
  computed: {
    finalOptions () {
      return {
        tooltip: {
          formatter: '{b}: {c}',
          confine: true,
          position: [10, 10]
        },
        backgroundColor: (this.$f7.data.themeOptions.dark === 'dark') ? '#121212' : undefined,
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
        let zWaveNodes = data.filter((t) => (t.bridgeUID === this.bridgeUID || t.UID === this.bridgeUID) && t.properties && t.properties.zwave_nodeid && t.properties.zwave_neighbours)
        const links = []

        zWaveNodes.forEach((t) => {
          let nodeid = t.properties.zwave_nodeid
          let bridgeUID = t.bridgeUID
          let listening = t.properties.zwave_listening === 'true'
          links.push([nodeid, t.properties.zwave_neighbours ? t.properties.zwave_neighbours : ''])
          serie.data.push({
            name: nodeid,
            value: t.label,
            symbolSize: bridgeUID ? 28 : 42,
            itemStyle: {
              color: this.thingStatusBadgeColor(t.statusInfo),
              borderColor: !bridgeUID ? 'orange' : listening ? 'yellow' : 'none',
              borderWidth: 3
            }
          })
        })
        links.forEach((l) => {
          const nodeid = l[0]
          const neighbours = l[1]
          neighbours.split(',').forEach((n) => {
            let returnlink = serie.links.find((l) => l.target === nodeid && l.source === n)
            if (!returnlink) {
              serie.links.push({
                source: nodeid,
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
