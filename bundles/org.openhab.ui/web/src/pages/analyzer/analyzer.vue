<template>
  <f7-page class="analyzer-content">
    <f7-navbar :title="titleDisplayText" :back-link="t('analyzer.back')">
      <f7-nav-right>
        <f7-link v-if="userStore.isAdmin()" icon-md="material:save" @click="savePage">
          {{ theme.md ? '' : t('analyzer.save') }}
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-toolbar bottom>
      <span />
      <f7-link class="right controls-link padding-right" ref="detailsLink" @click="openControls">
        {{ t('analyzer.controls') }}&nbsp;<f7-icon f7="chevron_up" />
      </f7-link>
      <f7-link v-if="coordSystem !== 'time'"
               color="blue"
               icon-f7="crop_rotate"
               @click="orientation = (orientation === 'horizontal') ? 'vertical' : 'horizontal'" />
      <span v-else />
    </f7-toolbar>

    <oh-chart-page v-if="showChart"
                   class="analyzer-chart"
                   :class="{ 'sheet-opened': controlsOpened }"
                   :key="chartKey"
                   :context="context" />
    <empty-state-placeholder v-else-if="invalidConfiguration"
                             icon="exclamationmark"
                             :title="t('analyzer.invalid-configuration.title')"
                             :text="t('analyzer.invalid-configuration.text')" />

    <!-- analyzer controls -->
    <f7-sheet class="analyzer-controls"
              :backdrop="false"
              :close-on-escape="true"
              :opened="controlsOpened"
              @sheet:closed="controlsOpened = false">
      <f7-page>
        <f7-toolbar tabbar :bottom="true">
          <f7-link class="padding-left padding-right"
                   :tab-link="'#tab-series'"
                   :tab-link-active="controlsTab === 'series'"
                   @click="controlsTab = 'series'"
                   :text="t('analyzer.series')" />
          <f7-link class="padding-left padding-right"
                   :tab-link="'#tab-coords'"
                   :tab-link-active="controlsTab === 'coords'"
                   @click="controlsTab = 'coords'"
                   :text="t('analyzer.coords')" />
          <f7-link class="padding-left padding-right"
                   :tab-link="'#tab-ranges'"
                   :tab-link-active="controlsTab === 'ranges'"
                   @click="controlsTab = 'ranges'"
                   :text="t('analyzer.ranges')" />
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
            <f7-col :width="100" v-if="showChart">
              <div class="card data-table">
                <div class="card-header no-padding" style="min-height: auto">
                  <f7-list style="width: 100%">
                    <f7-list-group>
                      <item-picker :key="itemsPickerKey"
                                   title="Items"
                                   name="items-to-analyze"
                                   :value="itemNames"
                                   @input="updateItems"
                                   :multiple="true" />
                    </f7-list-group>
                  </f7-list>
                  <!-- <div class="data-table-title">Options</div> -->
                </div>
                <div class="card-content">
                  <table>
                    <thead>
                      <tr>
                        <th class="label-cell">
                          {{ t('analyzer.series.table.header.label') }}
                        </th>
                        <th class="label-cell">
                          {{ t('analyzer.series.table.header.type') }}
                        </th>
                        <th class="label-cell">
                          {{ t('analyzer.series.table.header.axis') }}
                        </th>
                        <th class="label-cell">
                          {{ t('analyzer.series.table.header.markers') }}
                        </th>
                        <th v-if="coordSystem !== 'time'" class="label-cell">
                          {{ t('analyzer.series.table.header.aggregation') }}
                        </th>
                        <th v-if="coordSystem === 'time'" class="label-cell">
                          {{ t('analyzer.series.table.header.silent') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(options, item) in seriesOptions" :key="item">
                        <td class="label-cell">
                          <div class="input">
                            <input type="text" v-model.lazy="options.name" style="min-width: 150px">
                          </div>
                        </td>
                        <td class="label-cell">
                          <f7-segmented round>
                            <f7-button v-if="!options.discrete && coordSystem === 'aggregate' && aggregateDimensions === 1"
                                       small
                                       outline
                                       style="width: 60px"
                                       :fill="options.type === 'bar'"
                                       @click="options.type = 'bar'"
                                       :text="t('analyzer.series.table.type.bar')" />
                            <f7-button v-if="!options.discrete && coordSystem !== 'calendar' && aggregateDimensions === 1"
                                       small
                                       outline
                                       style="width: 60px"
                                       :fill="options.type === 'line'"
                                       @click="options.type = 'line'"
                                       :text="t('analyzer.series.table.type.line')" />
                            <f7-button v-if="coordSystem === 'time' || (coordSystem === 'aggregate' && aggregateDimensions === 1)"
                                       small
                                       outline
                                       style="width: 60px"
                                       :fill="options.type === 'area'"
                                       @click="options.type = 'area'"
                                       :text="t('analyzer.series.table.type.area')" />
                            <f7-button v-if="coordSystem === 'calendar' || (coordSystem === 'aggregate' && aggregateDimensions === 2)"
                                       small
                                       fill
                                       outline
                                       style="width: 90px"
                                       :text="t('analyzer.series.table.type.heatmap')" />
                          </f7-segmented>
                        </td>
                        <td class="label-cell">
                          <f7-segmented v-if="!options.discrete && options.type !== 'heatmap'" round>
                            <f7-button v-for="(axis, $idx) in valueAxesOptions"
                                       :key="$idx"
                                       small
                                       outline
                                       style="width: 60px"
                                       :fill="options.valueAxisIndex === $idx"
                                       @click="options.valueAxisIndex = $idx">
                              {{ axis.unit }}
                            </f7-button>
                          </f7-segmented>
                          <span v-else>{{ t('analyzer.series.table.na') }}</span>
                        </td>
                        <td class="label-cell">
                          <f7-link v-if="!options.discrete && options.type !== 'heatmap'" @click="chooseMarkers(options)">
                            {{ options.markers || 'none' }}
                          </f7-link>
                          <span v-else>{{ t('analyzer.series.table.na') }}</span>
                        </td>
                        <td v-if="coordSystem !== 'time'" class="label-cell">
                          <f7-link @click="chooseAggregation(options)">
                            {{ options.aggregation || 'average' }}
                          </f7-link>
                        </td>
                        <!-- the silent option makes a series non-clickable/ignores mouse-events -->
                        <td v-if="coordSystem === 'time'" class="label-cell">
                          <f7-checkbox v-if="options.discrete"
                                       @change="(evt) => options.silent = evt.target.checked" />
                          <span v-else>{{ t('analyzer.series.table.na') }}</span>
                        </td>
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
              <f7-block-header>{{ t('analyzer.coords.period') }}</f7-block-header>
              <f7-segmented strong class="margin-bottom">
                <f7-button :active="chartType === ''"
                           @click="changeChartType('')"
                           :text="t('analyzer.coords.period.dynamic')" />
                <f7-button :active="chartType !== ''"
                           @click="changeChartType('day')"
                           :text="t('analyzer.coords.period.fixed')" />
              </f7-segmented>
              <f7-segmented v-if="chartType !== ''">
                <f7-button :disabled="coordSystem === 'calendar' ? true : null"
                           :active="chartType === 'day'"
                           @click="changeChartType('day')"
                           :text="t('analyzer.coords.period.day')" />
                <f7-button :disabled="coordSystem === 'calendar' ? true : null"
                           :active="chartType === 'isoWeek'"
                           @click="changeChartType('isoWeek')"
                           :text="t('analyzer.coords.period.week')" />
                <f7-button :active="chartType === 'month'"
                           @click="changeChartType('month')"
                           :text="t('analyzer.coords.period.month')" />
                <f7-button :active="chartType === 'year'"
                           @click="changeChartType('year')"
                           :text="t('analyzer.coords.period.year')" />
              </f7-segmented>
            </f7-col>
            <f7-col :width="100" :medium="50" class="margin-bottom">
              <f7-block-header>{{ t('analyzer.coords.coordSystem') }}</f7-block-header>
              <f7-segmented strong class="margin-bottom">
                <f7-button :active="coordSystem === 'time'"
                           @click="changeCoordSystem('time')"
                           :text="t('analyzer.coords.coordSystem.time')" />
                <f7-button :disabled="chartType === '' ? true : null"
                           :active="coordSystem === 'aggregate'"
                           @click="changeCoordSystem('aggregate')"
                           :text="t('analyzer.coords.coordSystem.aggregate')" />
                <f7-button :disabled="chartType === '' ? true : null"
                           :active="coordSystem === 'calendar'"
                           @click="changeCoordSystem('calendar')"
                           :text="t('analyzer.coords.coordSystem.calendar')" />
              </f7-segmented>
              <f7-segmented v-if="coordSystem === 'aggregate'">
                <f7-button :active="aggregateDimensions === 1"
                           @click="changeAggregateDimensions(1)"
                           :text="t('analyzer.coords.coordSystem.aggregate.1dimension')" />
                <f7-button :active="aggregateDimensions === 2"
                           @click="changeAggregateDimensions(2)"
                           :text="t('analyzer.coords.coordSystem.aggregate.2dimensions')" />
              </f7-segmented>
            </f7-col>
            <f7-col
              width="100"
              class="margin-top display-flex justify-content-center margin-bottom">
              <f7-button v-if="coordSystem !== 'time'"
                         round
                         raised
                         fill
                         color="black"
                         icon-f7="crop_rotate"
                         icon-size="20"
                         @click="orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'">
                {{ t('analyzer.coords.rotate') }}
              </f7-button>
            </f7-col>
          </f7-row>
        </f7-block>

        <!-- ranges control tab -->
        <f7-block class="no-margin no-padding" v-show="controlsTab === 'ranges'">
          <f7-row v-if="(coordSystem === 'aggregate' && aggregateDimensions === 2) || coordSystem === 'calendar'">
            <f7-col :width="100" :medium="50">
              <f7-list class="no-margin-vertical">
                <f7-list-item divider>
                  {{ t('analyzer.ranges.visualPalette') }}
                </f7-list-item>
                <f7-list-item radio
                              name="visualMapPalette"
                              :checked="visualMapPalette === '' ? true : null"
                              @change="changeVisualMapPalette('')">
                  {{ t('analyzer.ranges.visualPalette.yellowred') }}
                </f7-list-item>
                <f7-list-item radio
                              name="visualMapPalette"
                              :checked="visualMapPalette === 'greenred' ? true : null"
                              @change="changeVisualMapPalette('greenred')">
                  {{ t('analyzer.ranges.visualPalette.greenred') }}
                </f7-list-item>
                <f7-list-item radio
                              name="visualMapPalette"
                              :checked="visualMapPalette === 'whiteblue' ? true : null"
                              @change="changeVisualMapPalette('whiteblue')">
                  {{ t('analyzer.ranges.visualPalette.whiteblue') }}
                </f7-list-item>
                <f7-list-item radio
                              name="visualMapPalette"
                              :checked="visualMapPalette === 'bluered' ? true : null"
                              @change="changeVisualMapPalette('bluered')">
                  {{ t('analyzer.ranges.visualPalette.bluered') }}
                </f7-list-item>
              </f7-list>
            </f7-col>
            <f7-col :width="100" :medium="50">
              <f7-list class="no-margin-vertical" inline-labels no-hairlines-md>
                <f7-list-item divider>
                  {{ t('analyzer.ranges.range') }}
                </f7-list-item>
                <f7-list-input :label="t('analyzer.ranges.range.min')"
                               :value="visualMapMin"
                               type="number"
                               @input="visualMapMin = $event.target.value"
                               placeholder="Auto"
                               clear-button />
                <f7-list-input :label="t('analyzer.ranges.range.max')"
                               :value="visualMapMax"
                               type="number"
                               @input="visualMapMax = $event.target.value"
                               placeholder="Auto"
                               clear-button />
                <f7-list-item divider>
                  {{ t('analyzer.ranges.range.type') }}
                </f7-list-item>
                <f7-list-item radio
                              name="visualMapType"
                              :checked="visualMapType === 'continuous' ? true : null"
                              @change="changeVisualMapType('continuous')">
                  {{ t('analyzer.ranges.range.type.continuous') }}
                </f7-list-item>
                <f7-list-item radio
                              name="visualMapType"
                              :checked="visualMapType === 'piecewise' ? true : null"
                              @change="changeVisualMapType('piecewise')">
                  {{ t('analyzer.ranges.range.type.piecewise') }}
                </f7-list-item>
              </f7-list>
            </f7-col>
          </f7-row>
          <f7-row v-else-if="valueAxesOptions.length > 0">
            <f7-col :width="100">
              <div class="card data-table">
                <div class="card-header">
                  {{ t('analyzer.ranges.valueAxes') }}
                </div>
                <div class="card-content">
                  <table>
                    <thead>
                      <tr>
                        <th class="label-cell">
                          {{ t('analyzer.ranges.valueAxes.table.header.label') }}
                        </th>
                        <th class="label-cell">
                          {{ t('analyzer.ranges.valueAxes.table.header.min') }}
                        </th>
                        <th class="label-cell">
                          {{ t('analyzer.ranges.valueAxes.table.header.max') }}
                        </th>
                        <th class="label-cell">
                          {{ t('analyzer.ranges.valueAxes.table.header.scale') }}
                        </th>
                        <th class="label-cell">
                          {{ t('analyzer.ranges.valueAxes.table.header.split') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="axis in valueAxesOptions" :key="axis.unit">
                        <td class="label-cell">
                          <div class="input">
                            <input type="text" v-model.lazy="axis.name" style="min-width: 150px">
                          </div>
                        </td>
                        <td class="label-cell">
                          <div class="input">
                            <input type="number"
                                   v-model.lazy="axis.min"
                                   style="min-width: 100px"
                                   :placeholder="t('analyzer.ranges.valueAxes.placeholder.auto')">
                          </div>
                        </td>
                        <td class="label-cell">
                          <div class="input">
                            <input type="number"
                                   v-model.lazy="axis.max"
                                   style="min-width: 100px"
                                   :placeholder="t('analyzer.ranges.valueAxes.placeholder.auto')">
                          </div>
                        </td>
                        <td class="label-cell">
                          <f7-checkbox :checked="axis.scale ? true : null"
                                       @change="(evt) => axis.scale = evt.target.checked" />
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
import { nextTick, defineAsyncComponent } from 'vue'
import { utils } from 'framework7'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import ItemPicker from '@/components/config/controls/item-picker.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import ChartTime from './chart-time'
import ChartAggregate from './chart-aggregate'
import ChartCalendar from './chart-calendar'

import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'

import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'

export default {
  components: {
    'oh-chart-page': defineAsyncComponent(() => import(/* webpackChunkName: "chart-page" */ '../../components/widgets/chart/oh-chart-page.vue')),
    ItemPicker,
    EmptyStatePlaceholder
  },
  props: {
    f7router: Object,
    f7route: Object
  },
  setup () {
    const { t, setLocaleMessage } = useI18n({ useScope: 'local' })

    loadLocaleMessages('analyzer', setLocaleMessage)

    return {
      t, f7, theme
    }
  },
  data () {
    return {
      showChart: false,
      invalidConfiguration: false,
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
      itemsPickerKey: utils.id(),
      chartKey: utils.id()
    }
  },
  computed: {
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
      switch (this.coordSystem) {
        case 'time':
          return ChartTime.getChartPage(this)
        case 'aggregate':
          return ChartAggregate.getChartPage(this)
        case 'calendar':
          return ChartCalendar.getChartPage(this)
        default:
          return {
            component: 'oh-chart-page',
            config: {
              chartType: this.chartType,
              period: this.period
            },
            slots: {
              title: [
                { component: 'oh-chart-title', config: { subtext: `Invalid coordinate system: ${this.coordSystem}`, top: 'center', left: 'center' } }
              ]
            }
          }
      }
    },
    ...mapStores(useUserStore)
  },
  methods: {
    onClose () {
      this.controlsOpened = false
    },
    initChart () {
      if (this.f7route.query.period) this.period = this.f7route.query.period
      if (this.f7route.query.items === '') {
        this.invalidConfiguration = true
        return
      }
      this.updateItems(this.f7route.query.items.split(',')).then(() => {
        if (this.f7route.query.chartType) this.changeChartType(this.f7route.query.chartType)
        if (this.f7route.query.coordSystem) this.changeCoordSystem(this.f7route.query.coordSystem)
        if (this.f7route.query.aggregation) {
          for (const options in this.seriesOptions) {
            this.seriesOptions[options].aggregation = this.f7route.query.aggregation
          }
        }
      })
    },
    updateItems (itemNames) {
      this.itemNames = itemNames
      const promises = itemNames.map((n) => this.$oh.api.get('/rest/items/' + n))
      return Promise.all(promises).then((resp) => {
        this.items = []
        this.valueAxesOptions = []
        resp.forEach((item) => {
          this.items.push(item)

          if (!this.seriesOptions[item.name]) {
            this.initializeSeriesOptions(item)
          }

          // dynamically add value axes according to unit if determined
          const seriesOptions = this.seriesOptions[item.name]
          if (!seriesOptions.discrete && (seriesOptions.type === 'line' || seriesOptions.type === 'bar')) {
            let unit = (item.transformedState && item.transformedState.split(' ').length === 2)
              ? item.transformedState.split(' ')[1]
              : (item.state.split(' ').length === 2)
                ? item.state.split(' ')[1]
                : (item.stateDescription && item.stateDescription.pattern && item.stateDescription.pattern.split(' ').length === 2)
                  ? item.stateDescription.pattern.split(' ')[1]
                  : undefined
            if (unit) unit = unit.replace(/^%%/, '%')
            let unitAxis = this.valueAxesOptions.findIndex((a) => a.unit === unit)
            if (unitAxis >= 0) {
              seriesOptions.valueAxisIndex = unitAxis
            } else {
              this.valueAxesOptions.push({ name: unit, unit, split: 'line' })
              seriesOptions.valueAxisIndex = this.valueAxesOptions.length - 1
            }
          }
        })
        this.items = resp
        for (let item in this.seriesOptions) {
          if (itemNames.indexOf(item) < 0) {
            delete this.seriesOptions[item]
          }
        }
        this.showChart = true

        return Promise.resolve()
      })
    },
    initializeSeriesOptions (item) {
      const seriesOptions = {
        name: item.label || item.name,
        type: 'line',
        discrete: true
      }

      if (item.type.indexOf('Number') === 0 || item.type === 'Dimmer')
        seriesOptions.discrete = false
      if (item.groupType && (item.groupType.indexOf('Number') === 0 || item.groupType === 'Dimmer')) seriesOptions.discrete = false
      if (
        !seriesOptions.discrete &&
        this.coordSystem === 'aggregate' &&
        this.aggregateDimensions === 1
      )
        seriesOptions.type = 'bar'
      if (
        !seriesOptions.discrete &&
        (this.coordSystem === 'calendar' ||
          (this.coordSystem === 'aggregate' && this.aggregateDimensions === 2))
      )
        seriesOptions.type = 'heatmap'
      if (seriesOptions.discrete) seriesOptions.type = 'area'

      this.seriesOptions[item.name] = seriesOptions
    },
    changeChartType (type) {
      this.showChart = false
      this.chartType = type
      if (type === '') {
        this.coordSystem = 'time'
        for (let item in this.seriesOptions) {
          if (
            !this.seriesOptions[item].discrete &&
            this.seriesOptions[item].type !== 'line' &&
            this.seriesOptions[item].type !== 'area'
          )
            this.seriesOptions[item].type = 'line'
        }
      }
      nextTick(() => {
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
          if (!this.seriesOptions[item].discrete)
            this.seriesOptions[item].type = this.aggregateDimensions === 2 ? 'heatmap' : 'bar'
        }
      }
      if (this.coordSystem === 'time') {
        for (let item in this.seriesOptions) {
          if (
            !this.seriesOptions[item].discrete &&
            this.seriesOptions[item].type !== 'line' &&
            this.seriesOptions[item].type !== 'area'
          )
            this.seriesOptions[item].type = 'line'
        }
      }
      nextTick(() => {
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
      nextTick(() => {
        this.showChart = true
      })
    },
    changeVisualMapPalette (palette) {
      this.showChart = false
      this.visualMapPalette = palette
      nextTick(() => {
        this.showChart = true
      })
    },
    changeVisualMapType (type) {
      this.showChart = false
      this.visualMapType = type
      nextTick(() => {
        this.showChart = true
      })
    },
    chooseMarkers (opt) {
      const actions = ['none', 'avg', 'min-max', 'all'].map((m) => {
        return {
          text: m,
          color: 'blue',
          onClick: () => { opt.markers = m }
        }
      })
      this.$f7.actions.create({
        buttons: [
          [
            { label: true, text: this.t('analyzer.dialogs.header.markers') },
            ...actions
          ],
          [
            { color: 'red', text: this.t('dialogs.cancel'), close: true }
          ]
        ]
      }).open()
    },
    chooseAggregation (opt) {
      const actions = this.Aggregations.map((a) => {
        return {
          text: a.label,
          color: 'blue',
          onClick: () => { opt.aggregation = a.value }
        }
      })
      this.$f7.actions.create({
        buttons: [
          [
            { label: true, text: this.t('analyzer.dialogs.header.aggregation') },
            ...actions
          ],
          [
            { color: 'red', text: this.t('dialogs.cancel'), close: true }
          ]
        ]
      }).open()
    },
    chooseAxisSplit (axis) {
      const actions = ['none', 'line', 'area', 'line+area', 'line+minor', 'area+minor', 'all'].map((m) => {
        return {
          text: m,
          color: 'blue',
          onClick: () => { axis.split = m }
        }
      })
      f7.actions.create({
        buttons: [
          [{ label: true, text: this.t('analyzer.dialogs.header.split') }, ...actions],
          [{ color: 'red', text: 'Cancel', close: true }]
        ]
      })
        .open()
    },
    openControls () {
      this.controlsOpened = true
    },
    savePage () {
      if (!useUserStore().isAdmin()) return // shouldn't get here if not an admin

      const self = this
      f7.dialog.prompt(
        this.t('analyzer.dialogs.save.message'),
        this.t('analyzer.dialogs.save.title'),
        (uid) => {
          if (!uid.match(/^[A-Za-z0-9_]+$/)) {
            f7.dialog.alert(this.t('analyzer.dialogs.save.invalid'))
            return
          }
          if (useComponentsStore().page(uid)) {
            f7.dialog.confirm(
              this.t('analyzer.dialogs.save.replace.message', { uid }),
              this.t('analyzer.dialogs.save.replace.title'),
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
          f7.toast.create({
            text: this.t('analyzer.page.updated'),
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
        } else {
          f7.toast.create({
            text: this.t('analyzer.page.created'),
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        f7.emit('sidebarRefresh', null)
      })
    }
  },
  created () {
    this.Aggregations = [
      { value: 'average', label: this.t('analyzer.aggregations.average') },
      { value: 'sum', label: this.t('analyzer.aggregations.sum') },
      { value: 'min', label: this.t('analyzer.aggregations.min') },
      { value: 'max', label: this.t('analyzer.aggregations.max') },
      { value: 'first', label: this.t('analyzer.aggregations.first') },
      { value: 'last', label: this.t('analyzer.aggregations.last') },
      { value: 'diff_first', label: this.t('analyzer.aggregations.diffFirst') },
      { value: 'diff_last', label: this.t('analyzer.aggregations.diffLast') }
    ]
  },
  mounted () {
    this.initChart()
  }
}
</script>
