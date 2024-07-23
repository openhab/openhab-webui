<template>
  <oh-chart
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
  height calc(100dvh - var(--f7-safe-area-top) - var(--f7-navbar-height)) !important
  &.with-tabbar
    height calc(100dvh - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height) - var(--f7-tabbar-labels-height)) !important
  &.with-toolbar
    height calc(100dvh - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height) - var(--f7-toolbar-height)) !important
  &.sheet-opened
    height calc(100dvh - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height) - var(--f7-sheet-height)) !important
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
