<template>
  <div class="oh-chart-page-container" v-bind="config" :style="{ height: config.height || '300px' }" >
    <oh-chart-page :context="context" />
  </div>
</template>

<style lang="stylus">
.oh-chart-page-container
  position relative
  overflow hidden
  width 100%

.oh-chart-page-container .oh-chart-page-chart
  background-color transparent !important
</style>

<script>
import mixin from '../widget-mixin'
import OhChartPage from '../chart/oh-chart-page.vue'
import { OhChartPageDefinition } from '@/assets/definitions/widgets/chart/page'

export default {
  mixins: [mixin],
  components: {
    OhChartPage
  },
  widget: OhChartPageDefinition
}
</script>
