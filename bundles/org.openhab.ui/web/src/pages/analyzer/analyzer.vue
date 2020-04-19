<template>
  <f7-popup tablet-fullscreen close-on-escape @popup:open="onOpen" @popup:close="onClose" @popup:opened="initChart">
    <f7-page class="analyzer-content">
      <f7-navbar :title="titleDisplayText" back-link="Back">
        <!-- <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right> -->
      </f7-navbar>
      <oh-chart-page v-if="showChart" :context="context" />
    </f7-page>
  </f7-popup>
</template>

<script>
export default {
  components: {
    'oh-chart-page': () => import('../../components/widgets/chart/oh-chart-page.vue')
  },
  data () {
    return {
      showChart: false,
      items: null,
      period: 'D',
      // chartType: 'day'
    }
  },
  methods: {
    onOpen () {
      // this.$store.dispatch('startTrackingStates')
    },
    onClose () {
      // this.$store.dispatch('stopTrackingStates')
    },
    initChart () {
      const promises = this.$f7route.query.items.split(',').map((n) => this.$oh.api.get('/rest/items/' + n))
      Promise.all(promises).then((resp) => {
        this.items = resp
        this.showChart = true
      })
    }
  },
  computed: {
    titleDisplayText () {
      if (!this.items || !this.items.length) return 'Analyze'
      if (this.items.length === 1) return this.items[0].name
      return this.items[0].name + ' + ' + (this.items.length - 1)
    },
    context () {
      return {
        component: this.page
        // store: this.$store.getters.trackedItems
      }
    },
    page () {
      return {
        component: 'oh-chart-page',
        config: {
          chartType: this.chartType,
          period: this.period
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
          series: this.items.map((item) => {
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
          tooltip: [{ component: 'oh-chart-tooltip', config: {} }],
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
}
</script>
