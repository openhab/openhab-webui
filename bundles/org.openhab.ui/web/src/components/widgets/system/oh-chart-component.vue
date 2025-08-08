<template>
  <div class="oh-chart-container" :style="{ height: activeHeight }">
    <chart
      ref="chart"
      v-if="ready"
      :init-options="{
        locale: ECHARTS_LOCALE
      }"
      :option="options"
      class="oh-chart"
      @click="handleClick"
      :class="{ 'with-tabbar': context.tab, 'with-toolbar': context.analyzer }"
      :theme="$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined"
      autoresize />
    <f7-menu class="padding float-right" v-if="periodVisible">
      <f7-menu-item @click="earlierPeriod()" icon-f7="chevron_left" />
      <f7-menu-item v-if="context.component.config.chartType"
                    :text="fixedPeriodLabel"
                    type="text"
                    @click="pickFixedStartDate">
        <input ref="calendarInput" type="text" style="width: 40px; height: 0; visibility: hidden">
      </f7-menu-item>
      <f7-menu-item v-else dropdown :text="period">
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item v-for="p in ['h', '2h', '4h', '12h', 'D', '2D', '3D', 'W', '2W', 'M', '2M', '4M', '6M', 'Y', '3Y', '5Y', '10Y']"
                                 :key="p"
                                 @click="setPeriod(p)"
                                 href="#"
                                 :text="p" />
        </f7-menu-dropdown>
      </f7-menu-item>
      <f7-menu-item @click="laterPeriod()" icon-f7="chevron_right" />
    </f7-menu>
  </div>
</template>

<style lang="stylus">
.oh-chart-container
  position relative
  .oh-chart
    position absolute
    width 100%
    height 100%
</style>

<script>
import mixin from '../widget-mixin'
import chart from '../chart/chart-mixin'
import { actionsMixin } from '../widget-actions'
import i18n from '@/js/i18n'

import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(LocalizedFormat)

import { use, registerLocale } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart, CustomChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import {
  TitleComponent, LegendComponent, LegendScrollComponent, GridComponent, SingleAxisComponent, ToolboxComponent, TooltipComponent,
  DataZoomComponent, MarkLineComponent, MarkPointComponent, MarkAreaComponent, VisualMapComponent, CalendarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart, CustomChart, TitleComponent,
  LegendComponent, LegendScrollComponent, GridComponent, SingleAxisComponent, ToolboxComponent, TooltipComponent, DataZoomComponent,
  MarkLineComponent, MarkPointComponent, MarkAreaComponent, VisualMapComponent, CalendarComponent, LabelLayout])

const ECHARTS_LOCALE = i18n.locale.split('-')[0].toUpperCase()

import(`echarts/i18n/lang${ECHARTS_LOCALE}-obj`)
  .then(lang => {
    console.info(`Registering ECharts locale ${ECHARTS_LOCALE}`)
    registerLocale(ECHARTS_LOCALE, lang.default)
  })
  .catch(() => {
    console.warn(`No ECharts locale found for ${ECHARTS_LOCALE}`)
  })

export default {
  mixins: [mixin, chart, actionsMixin],
  components: {
    'chart': VChart
  },
  computed: {
    activeHeight () {
      const config = this.config || {}
      return config.height || '300px'
    },
    periodVisible () {
      if (!this.config || this.config.periodVisible === undefined) {
        if (this.context.component.slots && this.context.component.slots.series && Array.isArray(this.context.component.slots.series) && this.context.component.slots.series.length) {
          return this.context.component.slots.series[0].component !== 'oh-data-series'
        }
        return true
      }
      return this.config.periodVisible
    },
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
  created () {
    this.ECHARTS_LOCALE = ECHARTS_LOCALE
  },
  beforeDestroy () {
    if (this.calendarPicker) this.calendarPicker.destroy()
  },
  methods: {
    handleClick (evt) {
      if (evt.seriesIndex !== undefined) {
        if (this.context.component.slots && this.context.component.slots.series && Array.isArray(this.context.component.slots.series) && this.context.component.slots.series.length) {
          let series = this.context.component.slots.series[evt.seriesIndex]
          this.performAction(evt.event, null, series.config, null)
        }
      }
    },
    pickFixedStartDate (evt) {
      const self = this
      const value = this.startTime.toDate()
      this.calendarPicker = this.$f7.calendar.create({
        inputEl: this.$refs.calendarInput,
        value: [value],
        on: {
          change (calendar, value) {
            if (value.length < 1) return
            if (dayjs(value[0]).isSame(self.startTime)) return
            self.setDate(value[0])
          }
        }
      })
      this.calendarPicker.open()
    },
    forceRerender () {
      this.ready = false
      this.$nextTick(() => {
        this.ready = true
      })
    }
  }
}
</script>
