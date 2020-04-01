<template>
<div>
  <f7-block strong :style="{ zIndex: 100 - gridIdx }" v-for="(grid, gridIdx) in context.component.slots.grid" :key="gridIdx">
    <f7-block-title>Grid {{gridIdx}}</f7-block-title>
    <div>
      <f7-menu v-if="context.editmode" class="configure-layout-menu">
        <span v-for="(yAxis, yAxisIdx) in context.component.slots.yAxis" :key="yAxisIdx">
          <f7-menu-item v-if="yAxis.config.gridIndex === gridIdx" class="margin-right" :text="'Y' + parseInt(yAxisIdx).toString()" dropdown>
            <f7-menu-dropdown left>
              <f7-menu-dropdown-item @click="context.editmode.configureWidget(yAxis, context)" href="#" text="Configure Y Axis"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(yAxis, context)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.cutWidget(yAxis, context, 'yAxis')" href="#" text="Cut"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.copyWidget(yAxis, context, 'yAxis')" href="#" text="Copy"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" @click="context.editmode.pasteWidget(yAxis, context, 'yAxis')" href="#" text="Paste"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" divider></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(yAxis, context, 'yAxis')" href="#" text="Move Up"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(yAxis, context, 'yAxis')" href="#" text="Move Down"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.removeWidget(yAxis, context, 'yAxis')" href="#" text="Remove Axis"></f7-menu-dropdown-item>
            </f7-menu-dropdown>
          </f7-menu-item>
        </span>
        <f7-menu-item @click="addYAxis(gridIdx)" icon-f7="plus" />
        <f7-menu-item style="margin-left: auto" icon-f7="square_split_2x2" dropdown>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item @click="context.editmode.configureWidget(grid, context)" href="#" text="Configure Grid"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(grid, context)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.cutWidget(grid, context, 'grid')" href="#" text="Cut"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.copyWidget(grid, context, 'grid')" href="#" text="Copy"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" @click="context.editmode.pasteWidget(grid, context, 'grid')" href="#" text="Paste"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(grid, context, 'grid')" href="#" text="Move Up"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(grid, context, 'grid')" href="#" text="Move Down"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.removeWidget(grid, context, 'grid')" href="#" text="Remove Grid"></f7-menu-dropdown-item>
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
    </div>
    <div>
      <div class="skeleton-series">
        <f7-card class="elevation-4">
          <f7-list media-list>
            <f7-list-item media-item link-item v-for="(series, seriesIdx) in gridSeries(grid, gridIdx)" :key="seriesIdx"
                :title="series.config.name" :subtitle="series.config.item"
                :after="`X: ${series.config.xAxisIndex} Y: ${series.config.yAxisIndex}`">
              <f7-menu slot="content-start" class="configure-layout-menu">
                <f7-menu-item icon-f7="list_bullet" dropdown>
                  <f7-menu-dropdown>
                    <f7-menu-dropdown-item @click="context.editmode.configureWidget(series, context)" href="#" text="Configure Series"></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(series, context)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item @click="context.editmode.cutWidget(series, context, 'series')" href="#" text="Cut"></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item @click="context.editmode.copyWidget(series, context, 'series')" href="#" text="Copy"></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(series, context, 'series')" href="#" text="Move Up"></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(series, context, 'series')" href="#" text="Move Down"></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
                    <f7-menu-dropdown-item @click="context.editmode.removeWidget(series, context, 'series')" href="#" text="Remove Series"></f7-menu-dropdown-item>
                  </f7-menu-dropdown>
                </f7-menu-item>
              </f7-menu>
              <div slot="media">
                <a @click="context.editmode.configureWidget(series, context)">
                  <img slot="media" v-if="series.config.type === 'bar'" src="@/res/img/chartdesigner/bar.svg" width="32px">
                  <img slot="media" v-else-if="series.config.type === 'scatter'" src="@/res/img/chartdesigner/scatter.svg" width="32px">
                  <img slot="media" v-else-if="series.config.type === 'heatmap'" src="@/res/img/chartdesigner/heatmap.svg" width="32px">
                  <img slot="media" v-else src="@/res/img/chartdesigner/line.svg" width="32px">
                </a>
              </div>
            </f7-list-item>
            <f7-list-button color="blue" @click="addSeries('oh-time-series', gridIdx)">Add Time Series</f7-list-button>
            <f7-list-button color="blue" @click="addSeries('oh-aggregate-series', gridIdx)">Add Aggregate Series</f7-list-button>
          </f7-list>
        </f7-card>
      </div>
      <chart-skeleton :options="skeletonOptions(grid, gridIdx)" style="height: 400px; width: 100%" :autoresize="true" />
    </div>
    <div>
      <f7-menu v-if="context.editmode" class="configure-layout-menu">
        <span :style="{ marginLeft: xAxisIdx === 0 ? 'auto' : undefined }" v-for="(xAxis, xAxisIdx) in context.component.slots.xAxis" :key="xAxisIdx">
          <f7-menu-item v-if="xAxis.config.gridIndex === gridIdx" class="margin-right" :text="'X' + parseInt(xAxisIdx).toString()" dropdown>
            <f7-menu-dropdown right>
              <f7-menu-dropdown-item @click="context.editmode.configureWidget(xAxis, context)" href="#" text="Configure X Axis"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(xAxis, context)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.cutWidget(xAxis, context, 'xAxis')" href="#" text="Cut"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.copyWidget(xAxis, context, 'xAxis')" href="#" text="Copy"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" @click="context.editmode.pasteWidget(xAxis, context, 'xAxis')" href="#" text="Paste"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" divider></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(xAxis, context, 'xAxis')" href="#" text="Move Up"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(xAxis, context, 'xAxis')" href="#" text="Move Down"></f7-menu-dropdown-item>
              <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
              <f7-menu-dropdown-item @click="context.editmode.removeWidget(xAxis, context, 'xAxis')" href="#" text="Remove X Axis"></f7-menu-dropdown-item>
            </f7-menu-dropdown>
          </f7-menu-item>
        </span>

        <f7-menu-item :style="{ marginLeft: context.component.slots.xAxis.length === 0 ? 'auto' : undefined }" @click="addXAxis(gridIdx)" icon-f7="plus" />
      </f7-menu>
    </div>
  </f7-block>

  <f7-block class="block-narrow margin-bottom" inset>
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding" @click="addGrid">
          <img src="@/res/img/chartdesigner/gridSimple.svg" width="80px" />
          Add<br />Grid
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding" @click="addCalendar">
          <img src="@/res/img/chartdesigner/calendar.svg" width="80px" />
          Add<br />Calendar
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding" @click="addCalendar">
          <img src="@/res/img/chartdesigner/singleAxis.svg" width="80px" />
          Add<br />Single&nbsp;Axis
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding">
          <img src="@/res/img/chartdesigner/tooltip.svg" width="80px" />
          Tooltip
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding">
          <img src="@/res/img/chartdesigner/visualMap.svg" width="80px" />
          Visual Map
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding">
          <img src="@/res/img/chartdesigner/dataZoom.svg" width="80px" />
          Data Zoom
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding">
          <img src="@/res/img/chartdesigner/legend.svg" width="80px" />
          Legend
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding">
          <img src="@/res/img/chartdesigner/title.svg" width="80px" />
          Title
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 chartdesigner-big-button" width="33">
        <f7-link color="blue" class="display-flex flex-direction-column padding">
          <img src="@/res/img/chartdesigner/toolbox.svg" width="80px" />
          Toolbox
        </f7-link>
      </f7-col>
    </f7-row>
  </f7-block>
    <!-- <f7-list>
      <f7-list-button color="blue" @click="addGrid">Add Grid</f7-list-button>
      <f7-list-button color="blue" @click="addCalendar">Add Calendar</f7-list-button>
    </f7-list> -->
    <!-- <f7-button color="blue" icon-f7="squares_below_rectangle" large round raised text="Add Block" @click="$emit('add-block', context.component)"></f7-button> -->
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
.chartdesigner-big-button
  background var(--f7-card-bg-color)
  text-align center
  height 10rem
  .link
    color var(--f7-text-color)
</style>

<script>
import widget from '@/components/widgets/widget-mixin'

import ECharts from 'vue-echarts/components/ECharts'

export default {
  mixins: [widget],
  components: {
    'chart-skeleton': ECharts
  },
  methods: {
    skeletonOptions (grid, gridIdx) {
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
    gridSeries (grid, gridIdx) {
      const gridxAxisIndexes = this.context.component.slots.xAxis.map((a, idx) => a.config.gridIndex === gridIdx ? idx : null).filter(i => i !== null)
      const gridyAxisIndexes = this.context.component.slots.yAxis.map((a, idx) => a.config.gridIndex === gridIdx ? idx : null).filter(i => i !== null)
      return this.context.component.slots.series.filter((s) => gridxAxisIndexes.indexOf(s.config.xAxisIndex) >= 0 && gridyAxisIndexes.indexOf(s.config.yAxisIndex) >= 0)
    },
    addGrid () {
      if (!this.context.component.slots.grid) this.context.component.grid = []
      this.context.component.slots.grid.push({
        component: 'oh-chart-grid',
        config: {}
      })
    },
    addCalendar () {
      if (!this.context.component.slots.calendar) this.context.component.calendar = []
      this.context.component.slots.calendar.push({
        component: 'oh-calendar-axis'
      })
    },
    addXAxis (gridIdx, type = 'oh-time-axis') {
      this.context.component.slots.xAxis.push({
        component: 'oh-time-axis',
        config: {
          gridIndex: gridIdx
        }
      })
    },
    addYAxis (gridIdx, type = 'oh-value-axis') {
      this.context.component.slots.yAxis.push({
        component: 'oh-value-axis',
        config: {
          gridIndex: gridIdx
        }
      })
    },
    addSeries (type, gridIdx) {
      let firstXAxis = this.context.component.slots.xAxis.find(a => a.config.gridIndex === gridIdx)
      let firstYAxis = this.context.component.slots.yAxis.find(a => a.config.gridIndex === gridIdx)
      if (!firstXAxis) {
        if (type === 'oh-time-series') {
          this.addXAxis(gridIdx)
          firstXAxis = this.context.component.slots.xAxis.find(a => a.config.gridIndex === gridIdx)
        } else {
          this.$f7.dialog.alert('Please add at least one X axis and one Y axis')
          return
        }
      }
      if (!firstYAxis) {
        if (type === 'oh-time-series') {
          this.addYAxis(gridIdx)
          firstYAxis = this.context.component.slots.yAxis.find(a => a.config.gridIndex === gridIdx)
        } else {
          this.$f7.dialog.alert('Please add at least one X axis and one Y axis')
          return
        }
      }
      this.context.component.slots.series.push({
        component: type,
        config: {
          name: 'Series ' + (this.context.component.slots.series.length + 1),
          gridIndex: gridIdx,
          xAxisIndex: this.context.component.slots.xAxis.indexOf(firstXAxis),
          yAxisIndex: this.context.component.slots.yAxis.indexOf(firstYAxis),
          type: 'line'
        }
      })
    },
    configureSeries (evt, series, context) {
      debugger
    }
  }
}
</script>
