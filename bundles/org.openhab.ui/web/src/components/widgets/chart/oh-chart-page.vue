<template>
  <oh-chart class="oh-chart-page-chart" :context="this.context" />
</template>

<style lang="stylus">
.oh-chart-page-chart
  background-color white
  height: 100% !important
</style>

<script>
import mixin from '../widget-mixin'
import OhChart from '../system/oh-chart.vue'
import { OhChartPageDefinition } from '@/assets/definitions/widgets/chart/page'

export default {
  mixins: [mixin],
  components: {
    OhChart
  },
  widget: OhChartPageDefinition
}
</script>
