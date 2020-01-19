<template>
  <div class="chart-fit">
    <line-chart :startTime="startTime" :endTime="endTime" :items="items" :options="{}" autoresize />
  </div>
</template>

<style lang="stylus">
.chart-fit
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
import LineChart from './line-chart.vue'
export default {
  components: {
    LineChart
  },
  props: ['items', 'type', 'startTime', 'endTime', 'options']
}
</script>
