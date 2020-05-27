<template>
  <div>
    <chart
      ref="chart"
      v-if="ready"
      :options="options"
      class="oh-chart-page-chart"
      :class="{ 'with-tabbar': context.tab, 'with-toolbar': context.analyzer }"
      :theme="$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined" autoresize></chart>
    <f7-menu class="padding float-right">
      <f7-menu-item @click="earlierPeriod()" icon-f7="chevron_left" />
      <f7-menu-item v-if="context.component.config.chartType" :text="fixedPeriodLabel" type="text" @click="pickFixedStartDate">
      <input ref="calendarInput" type="text" style="width: 40px; height: 0; visibility: hidden">
      </f7-menu-item>
      <f7-menu-item v-else dropdown :text="period">
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item v-for="p in ['h', '2h', '4h', '12h', 'D', '2D', '3D', 'W', '2W', 'M', '2M', '4M', '6M', 'Y']"
            :key="p" @click="setPeriod(p)" href="#" :text="p"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
      <f7-menu-item @click="laterPeriod()" icon-f7="chevron_right" />
    </f7-menu>
  </div>
</template>

<style lang="stylus">
.oh-chart-page-chart
  position absolute
  background-color white
  overflow-x hidden
  top calc(var(--f7-safe-area-top) + var(--f7-navbar-height))
  width 100%
  height calc(100% - var(--f7-safe-area-top) - var(--f7-navbar-height)) !important
  &.with-tabbar
    height calc(100% - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height) - var(--f7-tabbar-labels-height)) !important
  &.with-toolbar
    height calc(100% - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height) - var(--f7-toolbar-height)) !important
  &.with-sheet
    height calc(100% - var(--f7-safe-area-top) - var(--f7-safe-area-bottom) - var(--f7-navbar-height) - var(--f7-sheet-height)) !important
  .echarts
    width calc(100% - 20px)
    height 100%
</style>

<script>
import mixin from '../widget-mixin'
import chart from './chart-mixin'

import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(LocalizedFormat)

// import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/heatmap'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/legendScroll'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markPoint'
import 'echarts/lib/component/markArea'
import 'echarts/lib/component/visualMap'
import 'echarts/lib/component/calendar'

import ECharts from 'vue-echarts/components/ECharts'

export default {
  mixins: [mixin, chart],
  components: {
    'chart': ECharts
  },
  widget: {
    name: 'oh-chart-page',
    label: 'Chart',
    description: 'Visualizes historical series',
    props: {
      parameterGroups: [],
      parameters: [
        {
          name: 'chartType',
          type: 'TEXT',
          label: 'Chart Type',
          limitToOptions: true,
          description: 'Define a fixed period for the chart, aligned at the beginning of the period, e.g. January 1st at midnight for a year chart. If not set (or set to dynamic), the length of the period will be configurable but certain combinations like aggregated series might not work',
          options: [
            { value: '', label: 'Dynamic period' },
            { value: 'day', label: 'Day' },
            { value: 'isoWeek', label: 'Week (starting on Monday)' },
            { value: 'week', label: 'Week (starting on Sunday)' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' }
          ]
        },
        {
          name: 'period',
          type: 'TEXT',
          label: 'Initial period',
          limitToOptions: true,
          description: 'The initial period for the chart',
          options: [
            { value: 'h', label: 'h' },
            { value: '2h', label: '2h' },
            { value: '4h', label: '4h' },
            { value: '12h', label: '12h' },
            { value: 'D', label: 'D' },
            { value: '2D', label: '2D' },
            { value: '3D', label: '3D' },
            { value: 'W', label: 'W' },
            { value: '2W', label: '2W' },
            { value: 'M', label: 'M' },
            { value: '2M', label: '2M' },
            { value: '4M', label: '4M' },
            { value: '6M', label: '6M' },
            { value: 'Y', label: 'Y' }
          ],
          visible: (value, configuration, configDescription, parameters) => {
            return !configuration.chartType
          }
        }
      ]
    }
  },
  computed: {
    fixedPeriodLabel () {
      const startTime = this.startTime
      if (!this.startTime) return ''
      switch (this.context.component.config.chartType) {
        case 'hour':
          return startTime.format('lll')
        case 'day':
          return startTime.format('ll')
        case 'week':
        case 'isoWeek':
          return startTime.format('ll')
        case 'month':
          return startTime.format('MMM YYYY')
        case 'year':
          return startTime.format('YYYY')
        default:
          return startTime.format('ll')
      }
    }
  },
  data () {
    return {
      ready: false,
      calendarPicker: null
    }
  },
  mounted () {
    this.ready = true
  },
  beforeDestroy () {
    if (this.calendarPicker) this.calendarPicker.destroy()
  },
  methods: {
    pickFixedStartDate (evt) {
      const self = this
      const value = this.startTime.toDate()
      this.calendarPicker = this.$f7.calendar.create({
        inputEl: this.$refs.calendarInput,
        value: [value],
        on: {
          change (calendar, value) {
            console.log(value)
            if (value.length < 1) return
            if (dayjs(value[0]).isSame(self.startTime)) return
            self.setDate(value[0])
          }
        }
      })
      this.calendarPicker.open()
    }
  }
}
</script>
