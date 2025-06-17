<template>
  <f7-page class="analyzer-content">
    <f7-navbar :title="titleDisplayText" :back-link="$t('analyzer.back')">
      <f7-nav-right>
        <f7-link v-if="$store.getters.isAdmin" icon-md="material:save" @click="savePage">
          {{ $theme.md ? '' : $t('analyzer.save') }}
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-toolbar bottom>
      <span />
      <f7-link class="right controls-link padding-right" ref="detailsLink" @click="openControls">
        {{ $t('analyzer.controls') }}&nbsp;<f7-icon f7="chevron_up" />
      </f7-link>
      <f7-link v-if="uiParams.showRotation" color="blue" icon-f7="crop_rotate" @click="coordSettings.orientation = (coordSettings.orientation === 'horizontal') ? 'vertical' : 'horizontal'" />
      <span v-else />
    </f7-toolbar>

    <oh-chart-page v-if="showChart" class="analyzer-chart" :class="{ 'sheet-opened': controlsOpened }" :key="chartKey" :context="context" />
    <empty-state-placeholder v-else-if="invalidConfiguration" icon="exclamationmark" :title="$t('analyzer.invalid-configuration.title')" :text="$t('analyzer.invalid-configuration.text')" />

    <!-- analyzer controls -->
    <f7-sheet class="analyzer-controls" :backdrop="false" :close-on-escape="true" :opened="controlsOpened" @sheet:closed="controlsOpened = false">
      <f7-page>
        <f7-toolbar tabbar :bottom="true">
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'series'" @click="controlsTab = 'series'" v-t="'analyzer.series'" />
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'coords'" @click="controlsTab = 'coords'" v-t="'analyzer.coords'" />
          <f7-link class="padding-left padding-right" :tab-link-active="controlsTab === 'ranges'" @click="controlsTab = 'ranges'" v-t="'analyzer.ranges'" />
          <div class="right">
            <f7-link sheet-close class="padding-right">
              <f7-icon f7="chevron_down" />
            </f7-link>
          </div>
        </f7-toolbar>

        <!-- series controls tab -->
        <f7-block class="no-margin no-padding" v-show="controlsTab === 'series'">
          <f7-row>
            <f7-col :width="100" />
            <!-- use v-show instead of v-if to keep the item-picker props valid while selecting Items and avoid TypeErrors -->
            <f7-col :width="100" v-show="showChart">
              <div class="card data-table">
                <div class="card-header no-padding" style="min-height: auto">
                  <f7-list style="width: 100%">
                    <item-picker :key="itemsPickerKey" title="Items" name="items-to-analyze" :value="itemNames" @input="updateItems" :multiple="true" />
                  </f7-list>
                  <!-- <div class="data-table-title">Options</div> -->
                </div>
                <div v-if="showChart" class="card-content">
                  <table>
                    <thead>
                      <tr>
                        <th class="label-cell" v-t="'analyzer.series.table.header.label'" />
                        <th class="label-cell" v-t="'analyzer.series.table.header.type'" />
                        <th class="label-cell" v-t="'analyzer.series.table.header.axis'" />
                        <th class="label-cell" v-t="'analyzer.series.table.header.markers'" />
                        <th v-if="uiParams.isAggregate" class="label-cell" v-t="'analyzer.series.table.header.aggregation'" />
                        <th v-else class="label-cell" v-t="'analyzer.series.table.header.silent'" />
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(options, idx) in seriesOptions" :key="idx">
                        <td class="label-cell">
                          <div class="input">
                            <input type="text" v-model.lazy="options.name" style="min-width: 150px">
                          </div>
                        </td>
                        <td class="label-cell">
                          <f7-segmented round>
                            <f7-button v-for="type in options.uiParams.typeOptions" small outline :key="type" style="width: auto"
                                       :fill="options.type === type"
                                       @click="changeSeriesType(options, type)"
                                       v-t="'analyzer.series.table.type.' + type" />
                          </f7-segmented>
                        </td>
                        <td class="label-cell">
                          <f7-segmented round v-if="options.uiParams.showAxesOptions">
                            <f7-button v-for="(axis, $idx) in coordSettings.valueAxesOptions" :key="$idx" small outline style="width: auto"
                                       :fill="options.valueAxisIndex === $idx" @click="options.valueAxisIndex = $idx">
                              {{ axis.unit }}
                            </f7-button>
                          </f7-segmented>
                          <span v-else v-t="'analyzer.series.table.na'" />
                        </td>
                        <td class="label-cell">
                          <f7-link v-if="options.uiParams.showMarkerOptions" @click="chooseMarkers(options)">
                            {{ options.markers || 'none' }}
                          </f7-link>
                          <span v-else v-t="'analyzer.series.table.na'" />
                        </td>
                        <td v-if="options.uiParams.showAggregationOptions" class="label-cell">
                          <f7-link @click="chooseAggregation(options)">
                            {{ options.aggregation || 'average' }}
                          </f7-link>
                        </td>
                        <td v-else class="label-cell" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </f7-col>
          </f7-row>
        </f7-block>

        <!-- coordinates control tab -->
        <f7-block class="no-margin" v-show="controlsTab === 'coords'">
          <f7-row>
            <f7-col :width="100" :medium="50" class="margin-bottom">
              <f7-block-header v-t="'analyzer.coords.period'" />
              <f7-segmented strong class="margin-bottom">
                <f7-button :active="coordSettings.chartType === ''" @click="changeChartType('')" v-t="'analyzer.coords.period.dynamic'" />
                <f7-button :active="coordSettings.chartType !== ''" @click="changeChartType('day')" v-t="'analyzer.coords.period.fixed'" />
              </f7-segmented>
              <f7-segmented v-if="coordSettings.chartType !== ''">
                <f7-button v-for="type in ['day', 'isoWeek', 'month', 'year']" :key="type"
                           :disabled="!uiParams.typeOptions.includes(type)"
                           :active="coordSettings.chartType === type"
                           @click="changeChartType(type)"
                           v-t="'analyzer.coords.period.' + type" />
              </f7-segmented>
            </f7-col>
            <f7-col :width="100" :medium="50" class="margin-bottom">
              <f7-block-header v-t="'analyzer.coords.coordSystem'" />
              <f7-segmented strong class="margin-bottom">
                <f7-button v-for="cs in coordSystems" :key="cs"
                           v-t="'analyzer.coords.coordSystem.' + cs"
                           :disabled="coordSettings.chartType == ''"
                           :active="coordSystem.name === cs"
                           @click="changeCoordSystem(cs)" />
              </f7-segmented>
              <f7-segmented v-if="uiParams.showMultiDimension">
                <f7-button :active="coordSettings.dimensions === 1" @click="changeAggregateDimensions(1)" v-t="'analyzer.coords.coordSystem.aggregate.1dimension'" />
                <f7-button :active="coordSettings.dimensions === 2" @click="changeAggregateDimensions(2)" v-t="'analyzer.coords.coordSystem.aggregate.2dimensions'" />
              </f7-segmented>
            </f7-col>
            <f7-col width="100" class="margin-top display-flex justify-content-center margin-bottom">
              <f7-button round raised fill color="black" v-if="uiParams.showRotation" icon-f7="crop_rotate" icon-size="20" @click="coordSettings.orientation = (coordSettings.orientation === 'horizontal') ? 'vertical' : 'horizontal'">
                {{ $t('analyzer.coords.rotate') }}
              </f7-button>
            </f7-col>
          </f7-row>
        </f7-block>

        <!-- ranges control tab -->
        <f7-block class="no-margin no-padding" v-show="controlsTab === 'ranges'">
          <f7-row v-if="coordSettings.dimensions === 2">
            <f7-col :width="100" :medium="50">
              <f7-list class="no-margin-vertical">
                <f7-list-item divider v-t="'analyzer.ranges.visualPalette'" />
                <f7-list-item v-for="palette in ['yellowred', 'greenred', 'whiteblue', 'bluered']" :key="palette"
                              radio name="visualMap.palette"
                              :checked="visualMap.palette === palette"
                              @change="changeVisualMapPalette(palette)">
                  {{ $t('analyzer.ranges.visualPalette.' + palette) }}
                </f7-list-item>
              </f7-list>
            </f7-col>
            <f7-col :width="100" :medium="50">
              <f7-list class="no-margin-vertical" inline-labels no-hairlines-md>
                <f7-list-item divider v-t="'analyzer.ranges.range'" />
                <f7-list-input :label="$t('analyzer.ranges.range.min')" :value="visualMap.min" type="number" @input="visualMap.min = $event.target.value" placeholder="Auto" clear-button />
                <f7-list-input :label="$t('analyzer.ranges.range.max')" :value="visualMap.max" type="number" @input="visualMap.max = $event.target.value" placeholder="Auto" clear-button />
                <f7-list-item divider v-t="'analyzer.ranges.range.type'" />
                <f7-list-item radio name="visualMap.type" :checked="visualMap.type === 'continuous'" @change="changeVisualMapType('continuous')">
                  {{ $t('analyzer.ranges.range.type.continuous') }}
                </f7-list-item>
                <f7-list-item radio name="visualMap.type" :checked="visualMap.type === 'piecewise'" @change="changeVisualMapType('piecewise')">
                  {{ $t('analyzer.ranges.range.type.piecewise') }}
                </f7-list-item>
              </f7-list>
            </f7-col>
          </f7-row>
          <f7-row v-else-if="coordSettings.valueAxesOptions.length > 0">
            <f7-col :width="100">
              <div class="card data-table">
                <div class="card-header" v-t="'analyzer.ranges.valueAxes'" />
                <div class="card-content">
                  <table>
                    <thead>
                      <tr>
                        <th class="label-cell" v-t="'analyzer.ranges.valueAxes.table.header.label'" />
                        <th class="label-cell" v-t="'analyzer.ranges.valueAxes.table.header.min'" />
                        <th class="label-cell" v-t="'analyzer.ranges.valueAxes.table.header.max'" />
                        <th class="label-cell" v-t="'analyzer.ranges.valueAxes.table.header.scale'" />
                        <th class="label-cell" v-t="'analyzer.ranges.valueAxes.table.header.split'" />
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="axis in coordSettings.valueAxesOptions" :key="axis.unit">
                        <td class="label-cell">
                          <div class="input">
                            <input type="text" v-model.lazy="axis.name" style="min-width: 150px">
                          </div>
                        </td>
                        <td class="label-cell">
                          <div class="input">
                            <input type="number" v-model.lazy="axis.min" style="min-width: 100px" :placeholder="$t('analyzer.ranges.valueAxes.placeholder.auto')">
                          </div>
                        </td>
                        <td class="label-cell">
                          <div class="input">
                            <input type="number" v-model.lazy="axis.max" style="min-width: 100px" :placeholder="$t('analyzer.ranges.valueAxes.placeholder.auto')">
                          </div>
                        </td>
                        <td class="label-cell">
                          <f7-checkbox :checked="axis.scale" @change="(evt) => $set(axis, 'scale', evt.target.checked)" />
                        </td>
                        <td class="label-cell">
                          <f7-link @click="chooseAxisSplit(axis)">
                            {{ axis.split || 'none' }}
                          </f7-link>
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
  </f7-page>
</template>

<style lang="stylus">
.analyzer-controls
  --f7-theme-color var(--f7-color-blue)
  --f7-theme-color-rgb var(--f7-color-blue-rgb)
  --f7-theme-color-tint var(--f7-color-blue-tint)
  z-index 11000
.md .analyzer-controls .toolbar .link
  width 28%
</style>

<script>

import ItemPicker from '@/components/config/controls/item-picker.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { loadLocaleMessages } from '@/js/i18n'
import ChartTime from './chart-time'
import ChartAggregate from './chart-aggregate'
import ChartCalendar from './chart-calendar'

const COORD_SYSTEMS = {
  time: ChartTime,
  aggregate: ChartAggregate,
  calendar: ChartCalendar
}

export default {
  components: {
    'oh-chart-page': () => import(/* webpackChunkName: "chart-page" */ '../../components/widgets/chart/oh-chart-page.vue'),
    ItemPicker,
    EmptyStatePlaceholder
  },
  data () {
    return {
      showChart: false,
      invalidConfiguration: false,
      itemNames: [],
      items: [],
      seriesOptions: {},
      coordSystems: Object.keys(COORD_SYSTEMS),
      coordSystem: COORD_SYSTEMS['time'],
      coordSettings: COORD_SYSTEMS['time'].initCoordSystem(),
      visualMap: {
        palette: 'yellowred',
        min: null,
        max: null,
        type: 'continuous'
      },
      controlsOpened: false,
      controlsTab: 'series',
      itemsPickerKey: this.$f7.utils.id(),
      chartKey: this.$f7.utils.id()
    }
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/analyzer'))
  },

  computed: {
    uiParams () {
      return this.coordSettings.uiParams || {}
    },
    titleDisplayText () {
      if (!this.items || !this.items.length) return 'Analyze'
      if (this.items.length === 1) return (this.items[0].label) ? this.items[0].label : this.items[0].name
      return ((this.items[0].label) ? this.items[0].label : this.items[0].name) + ' + ' + (this.items.length - 1)
    },
    context () {
      return {
        component: this.page,
        analyzer: true
      }
    },
    page () {
      return this.coordSystem.getChartPage(this, this.coordSettings)
    }
  },
  methods: {
    onClose () {
      this.controlsOpened = false
    },
    initChart () {
      if (this.$f7route.query.period) this.period = this.$f7route.query.period
      if (this.$f7route.query.items === '') {
        this.invalidConfiguration = true
        return
      }
      this.updateItems(this.$f7route.query.items.split(',')).then(() => {
        if (this.$f7route.query.chartType) this.changeChartType(this.$f7route.query.chartType)
        if (this.$f7route.query.coordSystem) this.changeCoordSystem(this.$f7route.query.coordSystem)
        if (this.$f7route.query.aggregation) {
          for (const options in this.seriesOptions) {
            this.$set(this.seriesOptions[options], 'aggregation', this.$f7route.query.aggregation)
          }
        }
      })
    },
    refreshChart (fn) {
      this.showChart = false
      if (typeof fn === 'function') fn()
      this.$nextTick(() => {
        this.showChart = true
      })
    },
    initItemsSeries (freshInit = true) {
      console.log('initItemsSeries: ', this.items)
      if (freshInit) { this.$set(this, 'seriesOptions', {}) }
      this.coordSystem.initAxes(this.coordSettings)
      for (const item of this.items) {
        console.log('item: ', item)
        this.$set(this.seriesOptions, item.name, this.coordSystem.initSeries(item, this.coordSettings, freshInit ? {} : this.seriesOptions[item.name]))
      }
    },
    updateItems (itemNames) {
      console.log('updateItems: ', itemNames)
      this.itemNames = itemNames
      const promises = itemNames.map((n) => this.$oh.api.get('/rest/items/' + n))
      this.showChart = false
      return Promise.all(promises).then((resp) => {
        this.$set(this, 'items', [...resp])
        this.initItemsSeries(false)
        for (let optionKey in this.seriesOptions) {
          if (this.itemNames.indexOf(optionKey) < 0) {
            this.$delete(this.seriesOptions, optionKey)
          }
        }
        this.showChart = true

        return Promise.resolve()
      })
    },
    changeSeriesType (options, type) {
      console.log('changeSeriesType: ', options, type)
      if (options.type === type) return // no change
      this.refreshChart(() => {
        options.type = type
        this.initItemsSeries(false)
      })
    },
    changeChartType (type) {
      console.log('changeChartType: ', type)
      this.refreshChart(() => {
        this.$set(this.coordSettings, 'chartType', type)
        if (type === '') {
          this.changeCoordSystem('time')
        }
      })
    },
    changeCoordSystem (coordSystem) {
      console.log('changeCoordSystem: ', coordSystem)
      if (!COORD_SYSTEMS[coordSystem]) {
        this.invalidConfiguration = true
        return
      }

      this.refreshChart(() => {
        this.coordSystem = COORD_SYSTEMS[coordSystem]
        console.log('coordSystem: ', this.coordSystem)
        this.$set(this, 'coordSettings', this.coordSystem.initCoordSystem({
          ...this.coordSettings,
          orientation: (this.$device.desktop || this.$device.ipad) ? 'horizontal' : 'vertical'
        }))
        this.initItemsSeries(true)
      })
    },
    changeAggregateDimensions (dimensions) {
      console.log('changeAggregateDimensions: ', dimensions)
      if (this.coordSystem.name !== 'aggregate') {
        return
      }
      this.refreshChart(() => {
        this.coordSettings.dimensions = dimensions
        this.initItemsSeries(false)
      })
    },
    changeVisualMapPalette (palette) {
      this.refreshChart(() => {
        this.visualMap.palette = palette
      })
    },
    changeVisualMapType (type) {
      this.refreshChart(() => {
        this.visualMap.type = type
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
            { label: true, text: this.$t('analyzer.dialogs.header.markers') },
            ...actions
          ],
          [
            { color: 'red', text: this.$t('dialogs.cancel'), close: true }
          ]
        ]
      }).open()
    },
    chooseAggregation (opt) {
      const actions = this.Aggregations.map((a) => {
        return {
          text: a.label,
          color: 'blue',
          onClick: () => { this.$set(opt, 'aggregation', a.value) }
        }
      })
      this.$f7.actions.create({
        buttons: [
          [
            { label: true, text: this.$t('analyzer.dialogs.header.aggregation') },
            ...actions
          ],
          [
            { color: 'red', text: this.$t('dialogs.cancel'), close: true }
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
            { label: true, text: this.$t('analyzer.dialogs.header.split') },
            ...actions
          ],
          [
            { color: 'red', text: 'Cancel', close: true }
          ]
        ]
      }).open()
    },
    openControls () {
      this.controlsOpened = true
    },
    savePage () {
      if (!this.$store.getters.isAdmin) return // shouldn't get here if not an admin

      const self = this
      this.$f7.dialog.prompt(this.$t('analyzer.dialogs.save.message'),
        this.$t('analyzer.dialogs.save.title'),
        (uid) => {
          if (!uid.match(/^[A-Za-z0-9_]+$/)) {
            self.$f7.dialog.alert(this.$t('analyzer.dialogs.save.invalid'))
            return
          }
          if (self.$store.getters.page(uid)) {
            self.$f7.dialog.confirm(
              this.$t('analyzer.dialogs.save.replace.message', { uid }),
              this.$t('analyzer.dialogs.save.replace.title'),
              () => { self.doSavePage(uid, true) })
            return
          }

          this.doSavePage(uid)
        })
    },
    doSavePage (uid, overwrite) {
      let chartPage = Object.assign({
        uid
      }, this.page)
      chartPage.config.label = this.titleDisplayText

      const promise = (!overwrite)
        ? this.$oh.api.postPlain('/rest/ui/components/ui:page', JSON.stringify(chartPage), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/ui/components/ui:page/' + uid, chartPage)
      promise.then((data) => {
        if (overwrite) {
          this.$f7.toast.create({
            text: this.$t('analyzer.page.updated'),
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
        } else {
          this.$f7.toast.create({
            text: this.$t('analyzer.page.created'),
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        this.$f7.emit('sidebarRefresh', null)
      })
    }
  },
  created () {
    this.Aggregations = [
      { value: 'average', label: this.$t('analyzer.aggregations.average') },
      { value: 'sum', label: this.$t('analyzer.aggregations.sum') },
      { value: 'min', label: this.$t('analyzer.aggregations.min') },
      { value: 'max', label: this.$t('analyzer.aggregations.max') },
      { value: 'first', label: this.$t('analyzer.aggregations.first') },
      { value: 'last', label: this.$t('analyzer.aggregations.last') },
      { value: 'diff_first', label: this.$t('analyzer.aggregations.diffFirst') },
      { value: 'diff_last', label: this.$t('analyzer.aggregations.diffLast') }
    ]
  },
  mounted () {
    this.initChart()
  }
}
</script>
