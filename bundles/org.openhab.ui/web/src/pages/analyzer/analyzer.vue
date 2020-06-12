<template>
  <f7-popup tablet-fullscreen @popup:open="onOpen" @popup:close="onClose" @popup:opened="initChart">
    <f7-page class="analyzer-content">
      <f7-navbar :title="titleDisplayText" back-link="Back">
        <f7-nav-right>
          <f7-link v-if="$store.getters.isAdmin" icon-md="material:save" @click="savePage">{{ $theme.md ? '' : 'Save' }}</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar bottom>
        <span></span>
        <f7-link class="right controls-link padding-right" ref="detailsLink" @click="openControls">Controls&nbsp;<f7-icon f7="chevron_up"></f7-icon></f7-link>
        <f7-link v-if="coordSystem !== 'time'" color="blue" icon-f7="crop_rotate" @click="orientation = (orientation === 'horizontal') ? 'vertical' : 'horizontal'" />
        <span v-else></span>
      </f7-toolbar>
      <oh-chart-page v-if="showChart" class="analyzer-chart" :class="{ 'sheet-opened': controlsOpened }" :key="chartKey" :context="context" />
    </f7-page>
    <f7-sheet class="analyzer-controls" :backdrop="false" :close-on-escape="true" :opened="controlsOpened" @sheet:closed="controlsOpened = false">
      <f7-page>
        <f7-toolbar tabbar :bottom="true">
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'series'" @click="controlsTab = 'series'">Series</f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'coords'" @click="controlsTab = 'coords'">Coords</f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'ranges'" @click="controlsTab = 'ranges'">Ranges</f7-link>
          <div class="right">
            <f7-link sheet-close class="padding-right"><f7-icon f7="chevron_down"></f7-icon></f7-link>
          </div>
        </f7-toolbar>
        <f7-block class="no-margin no-padding" v-show="controlsTab === 'series'">
          <f7-row>
            <f7-col :width="100">
            </f7-col>
            <f7-col :width="100" v-if="showChart">
              <div class="card data-table">
                <div class="card-header no-padding" style="min-height: auto">
                  <f7-list style="width: 100%">
                    <item-picker :key="itemsPickerKey" title="Items" name="items-to-analyze" :value="itemNames" @input="updateItems" :multiple="true"></item-picker>
                  </f7-list>
                  <!-- <div class="data-table-title">Options</div> -->
                </div>
                <div class="card-content">
                  <table>
                    <thead>
                      <tr>
                        <th class="label-cell">Label</th>
                        <th class="label-cell">Type</th>
                        <th class="label-cell">Axis</th>
                        <th class="label-cell">Markers</th>
                        <th v-if="coordSystem !== 'time'" class="label-cell">Aggregation</th>
                        <th v-if="coordSystem === 'time'" class="label-cell">Silent</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(options, item) in seriesOptions" :key="item">
                        <td class="label-cell">
                          <div class="input">
                            <input type="text" v-model.lazy="options.name" style="min-width: 150px" />
                          </div>
                        </td>
                        <td class="label-cell">
                          <f7-segmented round>
                            <f7-button v-if="!options.discrete && coordSystem === 'aggregate' && aggregateDimensions === 1" small outline style="width: 60px" :fill="options.type === 'bar'" @click="options.type = 'bar'">Bar</f7-button>
                            <f7-button v-if="!options.discrete && coordSystem !== 'calendar' && aggregateDimensions === 1" small outline style="width: 60px" :fill="options.type === 'line'" @click="options.type = 'line'">Line</f7-button>
                            <f7-button v-if="coordSystem === 'time' || (coordSystem === 'aggregate' && aggregateDimensions === 1)" small outline style="width: 60px" :fill="options.type === 'area'" @click="options.type = 'area'">Area</f7-button>
                            <f7-button v-if="coordSystem === 'calendar' || (coordSystem === 'aggregate' && aggregateDimensions === 2)" small fill outline style="width: 90px">Heatmap</f7-button>
                          </f7-segmented>
                        </td>
                        <td class="label-cell">
                          <f7-segmented round v-if="!options.discrete && options.type !== 'heatmap'">
                            <f7-button v-for="(axis, $idx) in valueAxesOptions" :key="$idx" small outline style="width: 60px" :fill="options.valueAxisIndex === $idx" @click="options.valueAxisIndex = $idx">{{axis.unit}}</f7-button>
                          </f7-segmented>
                          <span v-else>N/A</span>
                        </td>
                        <td class="label-cell">
                          <f7-link v-if="!options.discrete && options.type !== 'heatmap'" @click="chooseMarkers(options)">{{options.markers || 'none'}}</f7-link>
                          <span v-else>N/A</span>
                        </td>
                        <td v-if="coordSystem !== 'time'" class="label-cell">
                          <f7-link @click="chooseAggregation(options)">{{options.aggregation || 'average'}}</f7-link>
                        </td>
                        <td v-if="coordSystem === 'time'" class="label-cell">
                          <f7-checkbox v-if="options.discrete" @change="(evt) => $set(options, 'silent', evt.target.checked)"></f7-checkbox>
                          <span v-else>N/A</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </f7-col>
          </f7-row>
        </f7-block>

        <f7-block class="no-margin" v-show="controlsTab === 'coords'">
          <f7-row>
            <f7-col :width="100" :medium="50" class="margin-bottom">
              <f7-block-header>Period</f7-block-header>
              <f7-segmented strong class="margin-bottom">
                <f7-button :active="chartType === ''" @click="changeChartType('')">Dynamic</f7-button>
                <f7-button :active="chartType !== ''" @click="changeChartType('day')">Fixed</f7-button>
              </f7-segmented>
              <f7-segmented v-if="chartType !== ''">
                <f7-button :disabled="coordSystem === 'calendar'" :active="chartType === 'day'" @click="changeChartType('day')">Day</f7-button>
                <f7-button :disabled="coordSystem === 'calendar'" :active="chartType === 'isoWeek'" @click="changeChartType('isoWeek')">Week</f7-button>
                <f7-button :active="chartType === 'month'" @click="changeChartType('month')">Month</f7-button>
                <f7-button :active="chartType === 'year'" @click="changeChartType('year')">Year</f7-button>
              </f7-segmented>
            </f7-col>
            <f7-col :width="100" :medium="50" class="margin-bottom">
              <f7-block-header>Coordinate System</f7-block-header>
              <f7-segmented strong class="margin-bottom">
                <f7-button :active="coordSystem === 'time'" @click="changeCoordSystem('time')">Time</f7-button>
                <f7-button :disabled="chartType === ''" :active="coordSystem === 'aggregate'" @click="changeCoordSystem('aggregate')">Aggregate</f7-button>
                <f7-button :disabled="chartType === ''" :active="coordSystem === 'calendar'" @click="changeCoordSystem('calendar')">Calendar</f7-button>
              </f7-segmented>
              <f7-segmented v-if="coordSystem === 'aggregate'">
                <f7-button :active="aggregateDimensions === 1" @click="changeAggregateDimensions(1)">1 dimension</f7-button>
                <f7-button :active="aggregateDimensions === 2" @click="changeAggregateDimensions(2)">2 dimensions</f7-button>
              </f7-segmented>
            </f7-col>
            <f7-col width="100" class="margin-top display-flex justify-content-center margin-bottom">
              <f7-button round raised fill color="black" v-if="coordSystem !== 'time'" icon-f7="crop_rotate" icon-size="20" @click="orientation = (orientation === 'horizontal') ? 'vertical' : 'horizontal'">Rotate</f7-button>
            </f7-col>
          </f7-row>
        </f7-block>

        <f7-block class="no-margin no-padding" v-show="controlsTab === 'ranges'">
          <f7-row v-if="(coordSystem === 'aggregate' && aggregateDimensions === 2) || coordSystem === 'calendar'">
            <f7-col :width="100" :medium="50">
              <f7-list class="no-margin-vertical">
                <f7-list-item divider>Visual Map Palette</f7-list-item>
                <f7-list-item radio name="visualMapPalette" :checked="visualMapPalette === ''" @change="changeVisualMapPalette('')">Yellow-Red</f7-list-item>
                <f7-list-item radio name="visualMapPalette" :checked="visualMapPalette === 'greenred'" @change="changeVisualMapPalette('greenred')">Green-Yellow-Red</f7-list-item>
                <f7-list-item radio name="visualMapPalette" :checked="visualMapPalette === 'whiteblue'" @change="changeVisualMapPalette('whiteblue')">White-Blue</f7-list-item>
                <f7-list-item radio name="visualMapPalette" :checked="visualMapPalette === 'bluered'" @change="changeVisualMapPalette('bluered')">Blue-Red</f7-list-item>
              </f7-list>
            </f7-col>
            <f7-col :width="100" :medium="50">
              <f7-list class="no-margin-vertical" inline-labels no-hairlines-md>
                <f7-list-item divider>Range</f7-list-item>
                <f7-list-input label="Min" :value="visualMapMin" type="number" @input="visualMapMin = $event.target.value" placeholder="Auto" clear-button />
                <f7-list-input label="Max" :value="visualMapMax" type="number" @input="visualMapMax = $event.target.value" placeholder="Auto" clear-button />
                <f7-list-item divider>Type</f7-list-item>
                <f7-list-item radio name="visualMapType" :checked="visualMapType === 'continuous'" @change="changeVisualMapType('continuous')">Continuous</f7-list-item>
                <f7-list-item radio name="visualMapType" :checked="visualMapType === 'piecewise'" @change="changeVisualMapType('piecewise')">Piecewise</f7-list-item>
              </f7-list>
            </f7-col>
          </f7-row>
          <f7-row v-else-if="valueAxesOptions.length > 0">
            <f7-col :width="100">
              <div class="card data-table">
                <div class="card-header">
                  Value Axes
                </div>
                <div class="card-content">
                  <table>
                    <thead>
                      <tr>
                        <th class="label-cell">Label</th>
                        <th class="label-cell">Min</th>
                        <th class="label-cell">Max</th>
                        <th class="label-cell">Scale</th>
                        <th class="label-cell">Split</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="axis in valueAxesOptions" :key="axis.unit">
                        <td class="label-cell">
                          <div class="input">
                            <input type="text" v-model.lazy="axis.name" style="min-width: 150px" />
                          </div>
                        </td>
                        <td class="label-cell">
                          <div class="input">
                            <input type="number" v-model.lazy="axis.min" style="min-width: 100px" placeholder="Auto" />
                          </div>
                        </td>
                        <td class="label-cell">
                          <div class="input">
                            <input type="number" v-model.lazy="axis.max" style="min-width: 100px" placeholder="Auto" />
                          </div>
                        </td>
                        <td class="label-cell">
                          <f7-checkbox :checked="axis.scale" @change="(evt) => $set(axis, 'scale', evt.target.checked)"></f7-checkbox>
                        </td>
                        <td class="label-cell">
                          <f7-link @click="chooseAxisSplit(axis)">{{axis.split || 'none'}}</f7-link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </f7-col>
          </f7-row>
        </f7-block>
      </f7-page>
    </f7-sheet>
  </f7-popup>
</template>

<style lang="stylus">
.analyzer-controls
  --f7-theme-color var(--f7-color-blue)
  --f7-theme-color-rgb var(--f7-color-blue-rgb)
  --f7-theme-color-tint var(--f7-color-blue-tint)
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
      seriesOptions: {},
      valueAxesOptions: {},
      orientation: (this.$device.desktop || this.$device.ipad) ? 'horizontal' : 'vertical',
      period: 'D',
      chartType: '',
      coordSystem: 'time',
      aggregateDimensions: 1,
      visualMapPalette: '',
      visualMapMin: null,
      visualMapMax: null,
      visualMapType: 'continuous',

      controlsOpened: false,
      controlsTab: 'series',
      itemsPickerKey: null,
      chartKey: this.$f7.utils.id(),

      aggregations: [
        { value: 'average', label: 'Average' },
        { value: 'sum', label: 'Sum' },
        { value: 'min', label: 'Minimum' },
        { value: 'max', label: 'Maximum' },
        { value: 'first', label: 'First (earliest)' },
        { value: 'last', label: 'Last (latest)' },
        { value: 'diff_first', label: 'Difference of firsts' },
        { value: 'diff_last', label: 'Difference of lasts' }
      ]
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
      if (this.$f7route.query.period) this.period = this.$f7route.query.period
      this.updateItems(this.$f7route.query.items.split(',')).then(() => {
        if (this.$f7route.query.chartType) this.changeChartType(this.$f7route.query.chartType)
        if (this.$f7route.query.coordSystem) this.changeCoordSystem(this.$f7route.query.coordSystem)
      })
      this.itemsPickerKey = this.$f7.utils.id()
    },
    updateItems (itemNames) {
      this.itemNames = itemNames
      const promises = itemNames.map((n) => this.$oh.api.get('/rest/items/' + n))
      return Promise.all(promises).then((resp) => {
        this.$set(this, 'items', [])
        this.$set(this, 'valueAxesOptions', [])
        resp.forEach((item) => {
          this.items.push(item)

          if (!this.seriesOptions[item.name]) {
            this.initializeSeriesOptions(item)
          }

          // dynamically add value axes according to unit if determined
          const seriesOptions = this.seriesOptions[item.name]
          if (!seriesOptions.discrete && (seriesOptions.type === 'line' || seriesOptions.type === 'bar')) {
            const unit = (item.transformedState && item.transformedState.split(' ').length === 2)
              ? item.transformedState.split(' ')[1]
              : (item.state.split(' ').length === 2)
                ? item.state.split(' ')[1]
                : (item.stateDescription && item.stateDescription.pattern && item.stateDescription.pattern.split(' ').length === 2)
                  ? item.stateDescription.pattern.split(' ')[1]
                  : undefined
            let unitAxis = this.valueAxesOptions.findIndex((a) => a.unit === unit)
            if (unitAxis >= 0) {
              this.$set(seriesOptions, 'valueAxisIndex', unitAxis)
            } else {
              this.valueAxesOptions.push({ name: unit, unit, split: 'line' })
              this.$set(seriesOptions, 'valueAxisIndex', this.valueAxesOptions.length - 1)
            }
          }
        })
        this.$set(this, 'items', resp)
        for (let item in this.seriesOptions) {
          if (itemNames.indexOf(item) < 0) {
            this.$delete(this.seriesOptions, item)
          }
        }
        this.showChart = true
      })
    },
    initializeSeriesOptions (item) {
      let seriesOptions = {}
      seriesOptions.name = item.label || item.name
      seriesOptions.type = 'line'
      seriesOptions.discrete = false
      if ((item.type.indexOf('Number') !== 0 && item.type.indexOf('Dimmer') !== 0) || (item.stateDescription && item.stateDescription.options.length > 0)) seriesOptions.discrete = true
      if (!seriesOptions.discrete && this.coordSystem === 'aggregate' && this.aggregateDimensions === 1) seriesOptions.type = 'bar'
      if (!seriesOptions.discrete && (this.coordSystem === 'calendar' || (this.coordSystem === 'aggregate' && this.aggregateDimensions === 2))) seriesOptions.type = 'heatmap'
      if (seriesOptions.discrete) seriesOptions.type = 'area'

      this.$set(this.seriesOptions, item.name, seriesOptions)
    },
    changeChartType (type) {
      this.showChart = false
      this.chartType = type
      if (type === '') {
        this.coordSystem = 'time'
        for (let item in this.seriesOptions) {
          if (!this.seriesOptions[item].discrete && this.seriesOptions[item].type !== 'line' && this.seriesOptions[item].type !== 'area') this.seriesOptions[item].type = 'line'
        }
      }
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    changeCoordSystem (coordSystem) {
      this.showChart = false
      this.coordSystem = coordSystem
      if (coordSystem !== 'aggregate') this.aggregateDimensions = 1
      if (this.coordSystem === 'calendar') {
        this.chartType = 'month'
        for (let item in this.seriesOptions) {
          if (!this.seriesOptions[item].discrete) this.seriesOptions[item].type = 'heatmap'
        }
      }
      if (this.coordSystem === 'aggregate') {
        for (let item in this.seriesOptions) {
          if (!this.seriesOptions[item].discrete) this.seriesOptions[item].type = (this.aggregateDimensions === 2) ? 'heatmap' : 'bar'
        }
      }
      if (this.coordSystem === 'time') {
        for (let item in this.seriesOptions) {
          if (!this.seriesOptions[item].discrete && this.seriesOptions[item].type !== 'line' && this.seriesOptions[item].type !== 'area') this.seriesOptions[item].type = 'line'
        }
      }
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    changeAggregateDimensions (dimensions) {
      this.showChart = false
      this.aggregateDimensions = dimensions
      if (this.coordSystem === 'aggregate') {
        for (let item in this.seriesOptions) {
          if (!this.seriesOptions[item].discrete) this.seriesOptions[item].type = (this.aggregateDimensions === 2) ? 'heatmap' : 'bar'
        }
      }
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    changeVisualMapPalette (palette) {
      this.showChart = false
      this.visualMapPalette = palette
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    changeVisualMapType (type) {
      this.showChart = false
      this.visualMapType = type
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    chooseMarkers (opt) {
      const actions = ['none', 'avg', 'min-max', 'all'].map((m) => {
        return {
          text: m,
          color: 'blue',
          onClick: () => { this.$set(opt, 'markers', m) }
        }
      })
      this.$f7.actions.create({
        buttons: [
          [
            { label: true, text: 'Markers' },
            ...actions
          ],
          [
            { color: 'red', text: 'Cancel', close: true }
          ]
        ]
      }).open()
    },
    chooseAggregation (opt) {
      const actions = this.aggregations.map((a) => {
        return {
          text: a.label,
          color: 'blue',
          onClick: () => { this.$set(opt, 'aggregation', a.value) }
        }
      })
      this.$f7.actions.create({
        buttons: [
          [
            { label: true, text: 'Aggregation Function' },
            ...actions
          ],
          [
            { color: 'red', text: 'Cancel', close: true }
          ]
        ]
      }).open()
    },
    chooseAxisSplit (axis) {
      const actions = ['none', 'line', 'area', 'line+area', 'line+minor', 'area+minor', 'all'].map((m) => {
        return {
          text: m,
          color: 'blue',
          onClick: () => { this.$set(axis, 'split', m) }
        }
      })
      this.$f7.actions.create({
        buttons: [
          [
            { label: true, text: 'Axis Split' },
            ...actions
          ],
          [
            { color: 'red', text: 'Cancel', close: true }
          ]
        ]
      }).open()
    },
    updateChart () {
      this.chartKey = this.$f7.utils.id()
    },
    openControls () {
      this.controlsOpened = true
    },
    closeControls () {
      this.controlsOpened = false
    },
    savePage () {
      if (!this.$store.getters.isAdmin) return // shouldn't get here if not an admin

      const self = this
      this.$f7.dialog.prompt('Enter the ID of the chart page you wish to create from the current status of the Analyzer',
        'Save as Page',
        (uid) => {
          if (!uid.match(/^[A-Za-z0-9_]+$/)) {
            self.$f7.dialog.alert('The UID should only contain alphanumeric characters and underscores')
            return
          }
          if (self.$store.getters.page(uid)) {
            self.$f7.dialog.confirm(
              `A page with the ID ${uid} already exists, would you like to overwrite it?`,
              'Page already exists',
              () => { self.doSavePage(uid, true) })
            return
          }

          this.doSavePage(uid)
        })
    },
    doSavePage (uid, overwrite) {
      let chartPage = Object.assign({
        uid: uid
      }, this.page)
      chartPage.config.label = this.titleDisplayText

      const promise = (!overwrite)
        ? this.$oh.api.postPlain('/rest/ui/components/ui:page', JSON.stringify(chartPage), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/ui:page/' + uid, chartPage)
      promise.then((data) => {
        if (overwrite) {
          this.$f7.toast.create({
            text: 'Chart page updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Chart page created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.$f7.emit('sidebarRefresh', null)
      })
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
            chartType: this.chartType,
            period: this.period
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
