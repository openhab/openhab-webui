<template>
  <f7-popup tablet-fullscreen @popup:open="onOpen" @popup:close="onClose" @popup:opened="initChart">
    <f7-page class="analyzer-content">
      <f7-navbar :title="titleDisplayText" back-link="Back">
        <f7-nav-right>
          <f7-link @click="openControls">Controls</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar bottom>
        <span></span>
        <f7-link color="blue" icon-f7="crop_rotate" @click="orientation = (orientation === 'horizontal') ? 'vertical' : 'horizontal'" />
        <f7-link class="right controls-link padding-right" ref="detailsLink" @click="openControls">Controls&nbsp;<f7-icon f7="chevron_up"></f7-icon></f7-link>
      </f7-toolbar>
      <oh-chart-page v-if="showChart" class="analyzer-chart" :class="{ 'sheet-opened': controlsOpened }" :key="chartKey" :context="context" />
    </f7-page>
    <f7-sheet class="analyzer-controls" :backdrop="false" :close-on-escape="true" :opened="controlsOpened" @sheet:closed="controlsOpened = false">
      <f7-page>
        <f7-toolbar tabbar :bottom="true">
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'series'" @click="controlsTab = 'series'">Series</f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'coords'" @click="controlsTab = 'coords'">Coords</f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'chart'" @click="controlsTab = 'chart'">Chart</f7-link>
          <div class="right">
            <f7-link sheet-close class="padding-right"><f7-icon f7="chevron_down"></f7-icon></f7-link>
          </div>
        </f7-toolbar>
        <f7-block style="margin-bottom: 6rem" v-show="controlsTab === 'series'">
          <f7-list>
            <item-picker :key="itemsPickerKey" title="Items" name="items-to-analyze" :value="itemNames" @input="updateItems" :multiple="true"></item-picker>
          </f7-list>
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-show="controlsTab === 'coords'">
          <f7-block-header>Type</f7-block-header>
          <f7-col>
            <f7-segmented strong>
              <f7-button :active="coordSystem === 'time'" @click="changeCoordSystem('time')">Time</f7-button>
              <f7-button :active="coordSystem === 'aggregate'" @click="changeCoordSystem('aggregate')">Aggregate</f7-button>
              <f7-button :active="coordSystem === 'calendar'" @click="changeCoordSystem('calendar')">Calendar</f7-button>
            </f7-segmented>
          </f7-col>
          <f7-col v-if="coordSystem === 'aggregate'" class="margin-top">
            <f7-segmented strong>
              <f7-button :active="aggregateDimensions === 1" @click="changeAggregateDimensions(1)">1 dimension</f7-button>
              <f7-button :active="aggregateDimensions === 2" @click="changeAggregateDimensions(2)">2 dimensions</f7-button>
            </f7-segmented>
          </f7-col>
        </f7-block>
        <f7-block style="margin-bottom: 6rem" v-show="controlsTab === 'chart'">
          <f7-block-header>Period</f7-block-header>
          <f7-list>
            <f7-list-item radio name="chartType" :checked="chartType === ''" @change="changeChartType('')">Dynamic Period</f7-list-item>
            <f7-list-item radio name="chartType" :checked="chartType === 'day'" @change="changeChartType('day')">Day</f7-list-item>
            <f7-list-item radio name="chartType" :checked="chartType === 'isoWeek'" @change="changeChartType('isoWeek')">Week (starting on Monday)</f7-list-item>
            <f7-list-item radio name="chartType" :checked="chartType === 'week'" @change="changeChartType('week')">Week (starting on Sunday)</f7-list-item>
            <f7-list-item radio name="chartType" :checked="chartType === 'month'" @change="changeChartType('month')">Month</f7-list-item>
            <f7-list-item radio name="chartType" :checked="chartType === 'year'" @change="changeChartType('year')">Year</f7-list-item>
          </f7-list>
        </f7-block>
      </f7-page>
    </f7-sheet>
  </f7-popup>
</template>

<style lang="stylus">
.analyzer-controls
  --f7-theme-color var(--f7-color-blue)
  --f7-theme-color-rgb var(--f7-color-blue-rgb)
  z-index 11000
.analyzer-content
  .analyzer-chart.sheet-opened
    .oh-chart-page-chart
      height calc(100% - var(--f7-navbar-height) - var(--f7-sheet-height)) !important
.md .analyzer-controls .toolbar .link
  width 28%
</style>

<script>
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ChartTime from './chart-time'
import ChartAggregate from './chart-aggregate'
import ChartCalendar from './chart-calendar'

export default {
  components: {
    'oh-chart-page': () => import('../../components/widgets/chart/oh-chart-page.vue'),
    ItemPicker
  },
  data () {
    return {
      showChart: false,
      itemNames: [],
      items: null,
      orientation: (this.$device.desktop || this.$device.ipad) ? 'horizontal' : 'vertical',
      period: 'D',
      chartType: '',
      coordSystem: 'time',
      aggregateDimensions: 1,
      controlsOpened: false,
      controlsTab: 'series',
      itemsPickerKey: null,
      chartKey: this.$f7.utils.id()
    }
  },
  methods: {
    onOpen () {
      // this.$store.dispatch('startTrackingStates')
    },
    onClose () {
      this.controlsOpened = false
      // this.$store.dispatch('stopTrackingStates')
    },
    initChart () {
      this.updateItems(this.$f7route.query.items.split(','))
      this.itemsPickerKey = this.$f7.utils.id()
    },
    updateItems (itemNames) {
      this.itemNames = itemNames
      const promises = itemNames.map((n) => this.$oh.api.get('/rest/items/' + n))
      Promise.all(promises).then((resp) => {
        this.$set(this, 'items', resp)
        this.showChart = true
      })
    },
    changeChartType (type) {
      this.showChart = false
      this.chartType = type
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    changeCoordSystem (coordSystem) {
      this.showChart = false
      this.coordSystem = coordSystem
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    changeAggregateDimensions (dimensions) {
      this.showChart = false
      this.aggregateDimensions = dimensions
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    openControls () {
      this.controlsOpened = true
    },
    closeControls () {
      this.controlsOpened = false
    }
  },
  computed: {
    titleDisplayText () {
      if (!this.items || !this.items.length) return 'Analyze'
      if (this.items.length === 1) return this.items[0].name
      return this.items[0].name + ' + ' + (this.items.length - 1)
    },
    context () {
      return {
        component: this.page,
        analyzer: true
        // store: this.$store.getters.trackedItems
      }
    },
    page () {
      try {
        switch (this.coordSystem) {
          case 'time':
            return ChartTime.getChartPage(this)
          case 'aggregate':
            return ChartAggregate.getChartPage(this)
          case 'calendar':
            return ChartCalendar.getChartPage(this)
          default:
            throw new Error('Invalid coordinate system')
        }
      } catch (e) {
        return {
          component: 'oh-chart-page',
          config: {
            chartType: this.chartType
          },
          slots: {
            title: [
              { component: 'oh-chart-title', config: { subtext: e, top: 'center', left: 'center' } }
            ]
          }
        }
      }
    }
  }
}
</script>
