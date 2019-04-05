<template>
  <line-chart v-if="!type || type === 'line'" :startTime="startTime" :endTime="endTime" :items="items" :options="options.line" auto-resize></line-chart>
  <calendar-chart v-else-if="type === 'calendar'" :startTime="startTime" :endTime="endTime" :items="items" :options="options.calendar" auto-resize></calendar-chart>
</template>

<style lang="stylus">
.echarts
  width 100%
  height 100%

.chart-tooltip-date
  font-weight bold

.chart-tooltip-dot
  display inline
  width 40px
  height 8px
  border-radius 4px
</style>

<script>

import LineChart from './LineChart.vue'
import CalendarChart from './CalendarChart.vue'

export default {
  props: ['items', 'type', 'startTime', 'endTime', 'options'],
  components: {
    LineChart,
    CalendarChart
  }
}
</script>
