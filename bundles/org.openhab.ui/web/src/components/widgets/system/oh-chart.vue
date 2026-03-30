<template>
  <oh-chart-component ref="chart" :context="this.context" />
</template>

<script>
import { OhChartDefinition } from '@/assets/definitions/widgets/system'
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    'oh-chart-component': defineAsyncComponent(() => import(/* webpackChunkName: "oh-chart-component" */ './oh-chart-component.vue'))
  },
  props: {
    context: Object
  },
  widget: OhChartDefinition,
  methods: {
    forceRerender() {
      this.$refs.chart.forceRerender()
    }
  }
}
</script>
