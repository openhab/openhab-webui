<template>
  <div>
    <f7-block class="block-narrow margin-bottom" inset>
      <f7-block-title>Coordinate Systems</f7-block-title>
      <f7-row class="margin-bottom">
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="50">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="addGrid">
            <img src="./gridSimple.svg" width="80px">
            Add<br>Grid
          </f7-link>
        </f7-col>
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="50">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="addCalendar">
            <img src="./calendar.svg" width="80px">
            Add<br>Calendar
          </f7-link>
        </f7-col>
      </f7-row>
    </f7-block>

    <!-- Grids -->
    <f7-block strong
              :style="{ zIndex: 100 - gridIdx }"
              v-for="(grid, gridIdx) in context.component.slots.grid"
              :key="gridIdx">
      <f7-block-title>Grid {{ gridIdx }}</f7-block-title>
      <div>
        <f7-menu v-if="context.editmode" class="configure-layout-menu">
          <span v-for="(yAxis, yAxisIdx) in context.component.slots.yAxis" :key="yAxisIdx">
            <edit-context-menu v-if="yAxis.config.gridIndex === gridIdx"
                               :context="context"
                               :component="yAxis"
                               :parentSlot="'yAxis'"
                               class="margin-right"
                               :text="'Y' + parseInt(yAxisIdx).toString()"
                               :configureLabel="'Configure Y Axis'"
                               :removeLabel="'Remove Axis'" />
          </span>
          <f7-menu-item icon-f7="plus" dropdown>
            <f7-menu-dropdown left>
              <f7-menu-dropdown-item @click="addAxis(gridIdx, 'yAxis', 'oh-value-axis')" href="#" text="Add value axis" />
              <f7-menu-dropdown-item @click="addAxis(gridIdx, 'yAxis', 'oh-category-axis')" href="#" text="Add category axis" />
            </f7-menu-dropdown>
          </f7-menu-item>
          <edit-context-menu :context="context"
                             :component="grid"
                             :parentSlot="'grid'"
                             style="margin-left: auto"
                             icon-f7="square_split_2x2"
                             right
                             :configureLabel="'Configure Grid'"
                             :removeLabel="'Remove Grid'" />
        </f7-menu>
      </div>
      <div>
        <div class="skeleton-series">
          <f7-card class="elevation-4">
            <f7-list media-list>
              <f7-list-item media-item
                            link-item
                            v-for="(series, seriesIdx) in gridSeries(grid, gridIdx)"
                            :key="seriesIdx"
                            :title="series.config.name"
                            :subtitle="series.config.item"
                            :after="`X: ${series.config.xAxisIndex} Y: ${series.config.yAxisIndex}`"
                            link="#"
                            @click.native="(ev) => configureSeries(ev, series, context)">
                <f7-menu slot="content-start" class="configure-layout-menu" style="z-index: 50">
                  <edit-context-menu :context="context"
                                     :component="series"
                                     :parentSlot="'series'"
                                     icon-f7="list_bullet"
                                     :configureLabel="'Configure Series'"
                                     :removeLabel="'Remove Series'" />
                </f7-menu>
                <div slot="media">
                  <img slot="media"
                       v-if="series.config.type === 'bar'"
                       src="./bar.svg"
                       width="32px">
                  <img slot="media"
                       v-else-if="series.config.type === 'scatter'"
                       src="./scatter.svg"
                       width="32px">
                  <img slot="media"
                       v-else-if="series.config.type === 'heatmap'"
                       src="./heatmap.svg"
                       width="32px">
                  <img slot="media"
                       v-else
                       src="./line.svg"
                       width="32px">
                </div>
              </f7-list-item>
              <f7-list-button color="blue" @click="addSeries('oh-time-series', gridIdx)">
                Add Time Series
              </f7-list-button>
              <f7-list-button color="blue" @click="addSeries('oh-aggregate-series', gridIdx)">
                Add Aggregate Series
              </f7-list-button>
              <f7-list-button color="blue" @click="addSeries('oh-state-series', gridIdx)">
                Add State Series
              </f7-list-button>
            </f7-list>
          </f7-card>
        </div>
        <chart-skeleton :option="skeletonGridOptions(grid, gridIdx)" style="height: 400px; width: 100%" :autoresize="true" />
      </div>
      <div>
        <f7-menu v-if="context.editmode" class="configure-layout-menu">
          <span :style="{ marginLeft: xAxisIdx === 0 ? 'auto' : undefined }" v-for="(xAxis, xAxisIdx) in context.component.slots.xAxis" :key="xAxisIdx">
            <edit-context-menu v-if="xAxis.config.gridIndex === gridIdx"
                               :context="context"
                               :component="xAxis"
                               :parentSlot="'xAxis'"
                               class="margin-right"
                               :text="'X' + parseInt(xAxisIdx).toString()"
                               right
                               :configureLabel="'Configure X Axis'"
                               :removeLabel="'Remove Axis'" />
          </span>

          <f7-menu-item :style="{ marginLeft: context.component.slots.xAxis.length === 0 ? 'auto' : undefined }" icon-f7="plus" dropdown>
            <f7-menu-dropdown right>
              <f7-menu-dropdown-item @click="addAxis(gridIdx, 'xAxis', 'oh-time-axis')" href="#" text="Add time axis" />
              <f7-menu-dropdown-item @click="addAxis(gridIdx, 'xAxis', 'oh-category-axis')" href="#" text="Add category axis" />
              <f7-menu-dropdown-item @click="addAxis(gridIdx, 'xAxis', 'oh-value-axis')" href="#" text="Add value axis" />
            </f7-menu-dropdown>
          </f7-menu-item>
        </f7-menu>
      </div>
    </f7-block>

    <!-- Calendars -->
    <f7-block strong
              :style="{ zIndex: 50 - calendarIdx }"
              v-for="(calendar, calendarIdx) in context.component.slots.calendar"
              :key="calendarIdx">
      <f7-block-title>Calendar {{ calendarIdx }}</f7-block-title>
      <div>
        <f7-menu v-if="context.editmode" class="configure-layout-menu">
          <edit-context-menu :context="context"
                             :component="calendar"
                             :parentSlot="'calendar'"
                             style="margin-left: auto"
                             icon-f7="calendar"
                             right
                             :configureLabel="'Configure Calendar'"
                             :removeLabel="'Remove Calendar'" />
        </f7-menu>
      </div>
      <div>
        <div class="skeleton-series">
          <f7-card class="elevation-4">
            <f7-list media-list>
              <f7-list-item media-item
                            link-item
                            v-for="(series, seriesIdx) in calendarSeries(calendar, calendarIdx)"
                            :key="seriesIdx"
                            :title="series.config.name"
                            :subtitle="series.config.item"
                            link="#"
                            @click.native="(ev) => configureSeries(ev, series, context)">
                <f7-menu slot="content-start" class="configure-layout-menu">
                  <edit-context-menu :context="context"
                                     :component="series"
                                     :parentSlot="'series'"
                                     icon-f7="list_bullet"
                                     :configureLabel="'Configure Series'"
                                     :removeLabel="'Remove Series'" />
                </f7-menu>
                <div slot="media">
                  <img slot="media"
                       v-if="series.config.type === 'scatter'"
                       src="./scatter.svg"
                       width="32px">
                  <img slot="media"
                       v-else-if="series.config.type === 'heatmap'"
                       src="./heatmap.svg"
                       width="32px">
                  <img slot="media"
                       v-else
                       src="./line.svg"
                       width="32px">
                </div>
              </f7-list-item>
              <f7-list-button color="blue" @click="addCalendarSeries('oh-calendar-series', calendarIdx)">
                Add Calendar Series
              </f7-list-button>
            </f7-list>
          </f7-card>
        </div>
        <chart-skeleton :option="skeletonCalendarOptions(calendar, calendarIdx)" style="height: 400px; width: 100%" :autoresize="true" />
      </div>
    </f7-block>

    <f7-block class="block-narrow margin-bottom" inset>
      <f7-block-title>Other Components</f7-block-title>
      <f7-row class="margin-bottom">
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="configureSlot('tooltip')">
            <f7-badge v-if="context.component.slots.tooltip" color="blue" class="count-badge">
              {{ context.component.slots.tooltip.length }}
            </f7-badge>
            <img src="./tooltip.svg" width="80px">
            Tooltip
          </f7-link>
        </f7-col>
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="configureSlot('visualMap')">
            <f7-badge v-if="context.component.slots.visualMap" color="blue" class="count-badge">
              {{ context.component.slots.visualMap.length }}
            </f7-badge>
            <img src="./visualMap.svg" width="80px">
            Visual Map
          </f7-link>
        </f7-col>
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="configureSlot('dataZoom')">
            <f7-badge v-if="context.component.slots.dataZoom" color="blue" class="count-badge">
              {{ context.component.slots.dataZoom.length }}
            </f7-badge>
            <img src="./dataZoom.svg" width="80px">
            Data Zoom
          </f7-link>
        </f7-col>
      </f7-row>
      <f7-row class="margin-bottom">
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="configureSlot('legend')">
            <f7-badge v-if="context.component.slots.legend" color="blue" class="count-badge">
              {{ context.component.slots.legend.length }}
            </f7-badge>
            <img src="./legend.svg" width="80px">
            Legend
          </f7-link>
        </f7-col>
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="configureSlot('title')">
            <f7-badge v-if="context.component.slots.title" color="blue" class="count-badge">
              {{ context.component.slots.title.length }}
            </f7-badge>
            <img src="./title.svg" width="80px">
            Title
          </f7-link>
        </f7-col>
        <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
          <f7-link color="blue" class="display-flex flex-direction-column padding" @click="configureSlot('toolbox')">
            <f7-badge v-if="context.component.slots.toolbox" color="blue" class="count-badge">
              {{ context.component.slots.toolbox.length }}
            </f7-badge>
            <img src="./toolbox.svg" width="80px">
            Toolbox
          </f7-link>
        </f7-col>
      </f7-row>
    </f7-block>
  </div>
</template>

<style lang="stylus">
.skeleton-series
  position absolute
  left 30
  width calc(100% - 30px)
  display flex
  justify-content center
  z-index 10
  .card
    width 60%
    margin-top 4rem
    // overflow-y auto
  .item-link
    overflow inherit
    z-index inherit !important
.chartdesigner-big-button
  background var(--f7-card-bg-color)
  text-align center
  height 10rem
  .link
    color var(--f7-text-color)
    height 10rem
  .count-badge
    position absolute
    top 0.3rem
    right 0.3rem
</style>

<script>
import widget from '@/components/widgets/widget-mixin'
import EditContextMenu from '@/components/pagedesigner/edit-menu.vue'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent, LegendComponent, LegendScrollComponent, GridComponent, SingleAxisComponent, ToolboxComponent, TooltipComponent,
  DataZoomComponent, MarkLineComponent, MarkPointComponent, MarkAreaComponent, VisualMapComponent, CalendarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GaugeChart, HeatmapChart, PieChart, ScatterChart, TitleComponent,
  LegendComponent, LegendScrollComponent, GridComponent, SingleAxisComponent, ToolboxComponent, TooltipComponent, DataZoomComponent,
  MarkLineComponent, MarkPointComponent, MarkAreaComponent, VisualMapComponent, CalendarComponent])

import * as dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(IsoWeek)

const defaultSlotComponentType = {
  'tooltip': 'oh-chart-tooltip',
  'title': 'oh-chart-title',
  'visualMap': 'oh-chart-visualmap',
  'dataZoom': 'oh-chart-datazoom',
  'legend': 'oh-chart-legend',
  'toolbox': 'oh-chart-toolbox'
}

export default {
  mixins: [widget],
  components: {
    'chart-skeleton': VChart,
    EditContextMenu
  },
  methods: {
    skeletonGridOptions (grid, gridIdx) {
      let options = {}
      options.grid = grid.config

      let axisTypes = ['xAxis', 'yAxis']
      axisTypes.forEach((axisType) => {
        let skeletonAxis = JSON.parse(JSON.stringify(
          this.context.component.slots[axisType]
            .filter(a => a.config.gridIndex === gridIdx)))
        skeletonAxis = skeletonAxis.map(a => { delete a.config.gridIndex; return a.config })
        options[axisType] = skeletonAxis
      })

      return options
    },
    skeletonCalendarOptions (calendar, calendarIdx) {
      let options = {}
      let calendarOptions = Object.assign({}, calendar.config)
      if (!calendarOptions.dayLabel) calendarOptions.dayLabel = {}
      if (calendarOptions.dayLabel.firstDay === undefined) calendarOptions.dayLabel.firstDay = 1
      if (calendarOptions.dayLabel.margin === undefined) calendarOptions.dayLabel.margin = 5
      if (!calendarOptions.monthName) calendarOptions.monthName = {}
      if (calendarOptions.monthName.margin === undefined) calendarOptions.monthName.margin = 5

      // calculate range based on chart type and/or initial period
      const chartType = this.context.component.config.chartType
      const period = this.context.component.config.period || 'M'
      let endTime = (chartType) ? dayjs().startOf(chartType).add(1, chartType === 'isoWeek' ? 'week' : chartType) : dayjs()
      let startTime = endTime

      const fn = endTime.subtract
      if (chartType) {
        startTime = fn.apply(endTime, [1, chartType === 'isoWeek' ? 'week' : chartType])
      } else {
        switch (period) {
          case 'h': startTime = fn.apply(endTime, [1, 'hour']); break
          case '2h': startTime = fn.apply(endTime, [2, 'hour']); break
          case '4h': startTime = fn.apply(endTime, [4, 'hour']); break
          case '12h': startTime = fn.apply(endTime, [12, 'hour']); break
          case 'D': startTime = fn.apply(endTime, [1, 'day']); break
          case '2D': startTime = fn.apply(endTime, [2, 'day']); break
          case '3D': startTime = fn.apply(endTime, [3, 'day']); break
          case 'W': startTime = fn.apply(endTime, [1, 'week']); break
          case '2W': startTime = fn.apply(endTime, [2, 'week']); break
          case 'M': startTime = fn.apply(endTime, [1, 'month']); break
          case '2M': startTime = fn.apply(endTime, [2, 'month']); break
          case '4M': startTime = fn.apply(endTime, [4, 'month']); break
          case '6M': startTime = fn.apply(endTime, [6, 'month']); break
          case 'Y': startTime = fn.apply(endTime, [365, 'day']); break
        }
      }

      calendarOptions.range = [startTime.toDate(), endTime.subtract(1, 'second').toDate()]
      calendarOptions.top = 20
      calendarOptions.bottom = 20
      calendarOptions.left = 60
      calendarOptions.right = 60

      if (document && document.documentElement.classList.contains('theme-dark')) {
        if (!calendarOptions.itemStyle) calendarOptions.itemStyle = {}
        if (!calendarOptions.itemStyle.color) calendarOptions.itemStyle.color = '#202020'
        if (!calendarOptions.itemStyle.borderColor) calendarOptions.itemStyle.borderColor = '#555'
        if (!calendarOptions.itemStyle) calendarOptions.itemStyle = {}
        if (!calendarOptions.dayLabel) calendarOptions.dayLabel = {}
        if (!calendarOptions.dayLabel.color) calendarOptions.dayLabel.color = '#aaa'
        if (!calendarOptions.monthLabel) calendarOptions.monthLabel = {}
        if (!calendarOptions.monthLabel.color) calendarOptions.monthLabel.color = '#aaa'
        if (!calendarOptions.splitLine) calendarOptions.splitLine = {}
        if (!calendarOptions.splitLine.lineStyle) calendarOptions.splitLine.lineStyle = {}
        if (!calendarOptions.splitLine.lineStyle.color) calendarOptions.splitLine.lineStyle.color = '#aaa'
      }

      options.calendar = calendarOptions

      return options
    },
    gridSeries (grid, gridIdx) {
      const gridxAxisIndexes = this.context.component.slots.xAxis.map((a, idx) => a.config.gridIndex === gridIdx ? idx : null).filter(i => i !== null)
      const gridyAxisIndexes = this.context.component.slots.yAxis.map((a, idx) => a.config.gridIndex === gridIdx ? idx : null).filter(i => i !== null)
      return this.context.component.slots.series.filter((s) => gridxAxisIndexes.indexOf(s.config.xAxisIndex) >= 0 && gridyAxisIndexes.indexOf(s.config.yAxisIndex) >= 0)
    },
    calendarSeries (calendar, calendarIdx) {
      return this.context.component.slots.series.filter((s) => s.config.calendarIndex === calendarIdx)
    },
    addGrid () {
      if (!this.context.component.slots.grid) this.$set(this.context.component.slots, 'grid', [])
      this.context.component.slots.grid.push({
        component: 'oh-chart-grid',
        config: {}
      })
    },
    addCalendar () {
      if (!this.context.component.slots.calendar) this.$set(this.context.component.slots, 'calendar', [])
      this.context.component.slots.calendar.push({
        component: 'oh-calendar-axis',
        config: {}
      })
    },
    addAxis (gridIdx, axis, type) {
      if (!this.context.component.slots[axis]) this.$set(this.context.component.slots, axis, [])
      this.context.component.slots[axis].push({
        component: type,
        config: {
          gridIndex: gridIdx
        }
      })
    },
    addCalendarSeries (type, calendarIdx) {
      if (!this.context.component.slots.series) this.$set(this.context.component.slots, 'series', [])
      this.context.component.slots.series.push({
        component: type,
        config: {
          name: 'Series ' + (this.context.component.slots.series.length + 1),
          calendarIndex: calendarIdx,
          type: 'heatmap'
        }
      })
    },
    addSeries (type, gridIdx) {
      if (!this.context.component.slots.series) this.$set(this.context.component.slots, 'series', [])
      let automaticAxisCreated = false
      let firstXAxis = this.context.component.slots.xAxis.find(a => a.config.gridIndex === gridIdx)
      let firstYAxis = this.context.component.slots.yAxis.find(a => a.config.gridIndex === gridIdx)
      if (!firstXAxis) {
        if (type === 'oh-time-series' || type === 'oh-state-series') {
          this.addAxis(gridIdx, 'xAxis', 'oh-time-axis')
          firstXAxis = this.context.component.slots.xAxis.find(a => a.config.gridIndex === gridIdx)
          automaticAxisCreated = true
        } else {
          this.$f7.dialog.alert('Please add at least one X axis and one Y axis')
          return
        }
      }
      if (!firstYAxis) {
        if (type === 'oh-time-series') {
          this.addAxis(gridIdx, 'yAxis', 'oh-value-axis')
          firstYAxis = this.context.component.slots.yAxis.find(a => a.config.gridIndex === gridIdx)
          automaticAxisCreated = true
        } else if (type === 'oh-state-series') {
          this.addAxis(gridIdx, 'yAxis', 'oh-category-axis')
          firstYAxis = this.context.component.slots.yAxis.find(a => a.config.gridIndex === gridIdx)
          firstYAxis.config.categoryType = 'values'
          automaticAxisCreated = true
        } else {
          this.$f7.dialog.alert('Please add at least one X axis and one Y axis')
          return
        }
      }

      if (automaticAxisCreated) {
        this.$f7.toast.create({
          text: 'Missing axes have been created automatically.',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }

      let component = {
        component: type,
        config: {
          name: 'Series ' + (this.context.component.slots.series.length + 1),
          gridIndex: gridIdx,
          xAxisIndex: this.context.component.slots.xAxis.indexOf(firstXAxis),
          yAxisIndex: this.context.component.slots.yAxis.indexOf(firstYAxis)
        }
      }

      if (type === 'oh-state-series') {
        if (firstYAxis.config.categoryType === 'values') {
          firstYAxis.config.data = firstYAxis.config.data || []
          firstYAxis.config.data.unshift(component.config.name)
          component.config.yValue = firstYAxis.config.data.length - 1
        }
      } else {
        component.config.type = 'line'
      }

      this.context.component.slots.series.push(component)
    },
    configureSeries (ev, series, context) {
      let el = ev.target
      ev.cancelBubble = true
      while (!el.classList.contains('media-item')) {
        if (el && el.classList.contains('menu')) return
        el = el.parentElement
      }
      this.context.editmode.configureWidget(series, context)
    },
    configureSlot (slotName) {
      this.context.editmode.configureSlot(this.context.component, slotName, defaultSlotComponentType[slotName])
    }
  }
}
</script>
