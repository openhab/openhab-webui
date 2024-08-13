<template>
  <oh-chart-component ref="chart" :context="this.context" />
</template>

<script>
import mixin from '../widget-mixin'
import { OhChartDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  components: {
    'oh-chart-component': () => import(/* webpackChunkName: "oh-chart-component" */ './oh-chart-component.vue')
  },
  widget: OhChartDefinition,
  methods: {
    forceRerender () {
      this.$refs.chart.forceRerender()
    }
  }
}
</script>
