<template>
  <oh-chart
    ref="chart"
    class="oh-chart-page-chart"
    :class="{ 'with-tabbar': context.tab, 'with-toolbar': context.analyzer }"
    :style="(this.$f7.data.themeOptions.dark === 'dark') ? 'background-color: black;' : 'background-color: white;'"
    :context="this.context" />
</template>

<style lang="stylus">
.oh-chart-page-chart
  position absolute !important
  overflow hidden
  top calc(var(--f7-safe-area-top) + var(--f7-navbar-height))
  width 100%
  --oh-chart-page-height calc(100% - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height))
  height var(--oh-chart-page-height) !important
  &.with-tabbar
    height calc(var(--oh-chart-page-height) - var(--f7-tabbar-labels-height)) !important
  &.with-toolbar
    height calc(var(--oh-chart-page-height) - var(--f7-toolbar-height)) !important
  &.sheet-opened
    height calc(var(--oh-chart-page-height) - var(--f7-sheet-height)) !important

.sheet-modal-inner
  .oh-chart-page-chart
    top 0
    height calc(var(--oh-chart-page-height) + var(--f7-toolbar-height)) !important

.device-ios /* fix chart rendering issues on iOS >= 17.4 */
  .oh-chart-page-chart
    --oh-chart-page-height calc(100dvh - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height)) /* use dvh because with % the height is calculated to 0px and ECharts fails to render */
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
  widget: OhChartPageDefinition,
  methods: {
    onOrientationChange () {
      this.$refs.chart.forceRerender()
    }
  },
  mounted () {
    if (this.$device.ios) {
      window.addEventListener('orientationchange', this.onOrientationChange)
    }
  },
  beforeUnmount () {
    if (this.$device.ios) {
      window.removeEventListener('orientationchange', this.onOrientationChange)
    }
  }
}
</script>
