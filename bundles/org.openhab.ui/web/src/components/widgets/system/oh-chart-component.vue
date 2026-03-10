<template>
  <div class="oh-chart-container" :style="{ height: activeHeight }">
    <VChart
      v-if="ready"
      ref="chart"
      :initOptions="initOptions"
      :option="options"
      class="oh-chart"
      @click="handleClick"
      :class="{ 'with-tabbar': context.tab, 'with-toolbar': context.analyzer }"
      :theme="uiOptionsStore.darkMode === 'dark' ? 'dark' : undefined"
      autoresize />
    <f7-menu v-if="periodVisible" class="padding float-right">
      <f7-menu-item @click="earlierPeriod()" icon-f7="chevron_left" />
      <f7-menu-item v-if="context.component.config.chartType" :text="fixedPeriodLabel" type="text" @click="pickFixedStartDate">
        <input ref="calendarInput" type="text" style="width: 40px; height: 0; visibility: hidden" />
      </f7-menu-item>
      <f7-menu-item v-else dropdown :text="period">
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item
            v-for="p in ['h', '2h', '4h', '12h', 'D', '2D', '3D', 'W', '2W', 'M', '2M', '4M', '6M', 'Y', '3Y', '5Y', '10Y']"
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

<script setup lang="ts">
import { f7 } from 'framework7-vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { useWidgetAction } from '@/components/widgets/useWidgetAction'
import { useChart } from '../chart/useChart'

import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { type ECElementEvent, registerLocale, use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { ChartType } from '@/types/components/widgets'

import { BarChart, CustomChart, GaugeChart, HeatmapChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import {
  CalendarComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  LegendScrollComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  SingleAxisComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components'

import 'echarts/theme/dark.js'

import VChart from 'vue-echarts'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { type Calendar } from 'framework7'
import type { WidgetContext } from '@/components/widgets/types'

dayjs.extend(LocalizedFormat)

use([CanvasRenderer, LineChart, BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart, CustomChart, TitleComponent,
  LegendComponent, LegendScrollComponent, GridComponent, SingleAxisComponent, ToolboxComponent, TooltipComponent, DataZoomComponent,
  MarkLineComponent, MarkPointComponent, MarkAreaComponent, VisualMapComponent, CalendarComponent, LabelLayout])

const props = defineProps<{
  context: WidgetContext
}>()

const uiOptionsStore = useUIOptionsStore()
const runtimeStore = useRuntimeStore()

let echartsLocale = runtimeStore.locale.split('-')[0]!.toUpperCase()
let initOptions = echartsLocale ? {
  locale: echartsLocale
} : {}

// composables
const { config, slots, evaluateExpression } = useWidgetContext(props.context)
const { performAction } = useWidgetAction(props.context, config, evaluateExpression)

const chartComposable = useChart(props.context, config, slots, evaluateExpression)
const { startTime, options, period, earlierPeriod, laterPeriod, setDate, setPeriod } = chartComposable

// data (state)
const ready = ref(false)
const calendarPicker = ref<Calendar.Calendar | null>(null)
const calendarInput = ref<HTMLElement | null>(null)

// computed
const activeHeight = computed(() => {
  const cfg = config.value || {}
  return cfg.height || '300px'
})

const periodVisible = computed(() => {
  if (!config.value || config.value.periodVisible === undefined) {
    if ('series' in slots.value && Array.isArray(slots.value.series) && slots.value.series.length) {
      return slots.value.series[0].component !== 'oh-data-series'
    }
    return true
  }
  return config.value.periodVisible
})

const fixedPeriodLabel = computed(() => {
  if (!startTime.value) return ''
  const chartType = props.context.component.config.chartType as ChartType
  try {
    switch (chartType) {
      case ChartType.day:
        return startTime.value.format('ll')
      case ChartType.week:
      case ChartType.isoWeek:
        return startTime.value.format('ll')
      case ChartType.month:
        return startTime.value.format('MMM YYYY')
      case ChartType.year:
        return startTime.value.format('YYYY')
      case ChartType.dynamic:
        return ''
      default:
        const exhaustiveCheck: never = chartType
        return exhaustiveCheck
    }
  } catch (e) {
    console.error('Error formatting fixed period label: ', e)
    return startTime.value
  }
})

// lifecycle
onMounted(() => {
  // echarts localisation for EN and ZH are already included
  if (['EN', 'ZH'].includes(echartsLocale)) {
    ready.value = true
  } else {
    import(`../../../../node_modules/echarts/lib/i18n/lang${echartsLocale}.js`).then((lang) => {
      registerLocale(echartsLocale, lang.default)
      console.log('echart localisation loaded: ', echartsLocale)
    }).catch(() => {
      console.log('echart localisation loading failed: ', echartsLocale)
    }).finally(() => {
      ready.value = true
    })
  }
})

onBeforeUnmount(() => {
  if (calendarPicker.value) calendarPicker.value.destroy()
})

// methods
const pickFixedStartDate = () => {
  if (!calendarInput.value) return

  const value = startTime.value.toDate()
  if (!calendarPicker.value) {
    calendarPicker.value = f7.calendar.create({
      inputEl: calendarInput.value,
      value: [value],
      on: {
        change (_calendar, value) {
          if ((value as unknown[]).length < 1) return
          if (dayjs((value as Date[])[0]).isSame(startTime.value)) return
          setDate((value as Date[])[0]!)
        }
      }
    })
  }
  calendarPicker.value.open()
}

const handleClick = (evt: ECElementEvent) => {
  if (evt.seriesIndex !== undefined) {
    if ('series' in slots.value && Array.isArray(slots.value.series) && slots.value.series.length) {
      let series = slots.value.series[evt.seriesIndex]
      performAction(undefined, '', undefined, series.config)
    }
  }
}

const forceRerender = () => {
  ready.value = false
  nextTick(() => {
    ready.value = true
  })
}

defineExpose({
  forceRerender
})
</script>
