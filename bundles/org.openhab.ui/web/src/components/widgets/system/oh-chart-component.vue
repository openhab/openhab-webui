<template>
  <div class="oh-chart-container" :style="{ height: activeHeight }">
    <chart
      v-if="ready"
      ref="chart"
      :init-options="initOptions"
      :option="options"
      class="oh-chart"
      @click="handleClick"
      :class="{ 'with-tabbar': context.tab, 'with-toolbar': context.analyzer }"
      :theme="uiOptionsStore.getDarkMode() === 'dark' ? 'dark' : undefined"
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
import { f7, theme } from 'framework7-vue'
import { nextTick } from 'vue'
import { mapStores } from 'pinia'

import mixin from '../widget-mixin'
import chart from '../chart/chart-mixin'
import { actionsMixin } from '../widget-actions'

import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(LocalizedFormat)

import { use, registerLocale, registerTheme } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import { LineChart, BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart, CustomChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import {
  TitleComponent, LegendComponent, LegendScrollComponent, GridComponent, SingleAxisComponent, ToolboxComponent, TooltipComponent,
  DataZoomComponent, MarkLineComponent, MarkPointComponent, MarkAreaComponent, VisualMapComponent, CalendarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import 'echarts/theme/dark.js'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

use([CanvasRenderer, LineChart, BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart, CustomChart, TitleComponent,
  LegendComponent, LegendScrollComponent, GridComponent, SingleAxisComponent, ToolboxComponent, TooltipComponent, DataZoomComponent,
  MarkLineComponent, MarkPointComponent, MarkAreaComponent, VisualMapComponent, CalendarComponent, LabelLayout])

export default {
  mixins: [mixin, chart, actionsMixin],
  components: {
    chart: VChart
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
    },
    initOptions () {
      return {
        locale: useRuntimeStore().locale.split('-')[0].toUpperCase()
      }
    },
    ...mapStores(useUIOptionsStore, useRuntimeStore)
  },
  data () {
    return {
      ready: false,
      calendarPicker: null
    }
  },
  watch: {
    'runtimeStore.locale': {
      handler: function (newValue) {
        let echartsLocale = newValue.split('-')[0].toUpperCase()
        console.log(`Locale changed to ${echartsLocale}, updating ECharts locale`)

        import(`../../../../node_modules/echarts/lib/i18n/lang${echartsLocale}.js`).then((lang) => {
          console.info(`Registering ECharts locale ${echartsLocale}`)
          registerLocale(echartsLocale, lang.default)
        }).catch(() => {
          console.warn(`No ECharts locale found for ${echartsLocale}`)
        })
      },
      immediate: true
    }
  },
  mounted () {
    this.ready = true
  },
  created () {
    registerTheme('dark', theme.dark)
  },
  beforeUnmount () {
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
      this.calendarPicker = f7.calendar.create({
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
      nextTick(() => {
        this.ready = true
      })
    }
  }
}
</script>
