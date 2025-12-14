<template>
  <f7-page class="analyzer-content">
    <f7-navbar>
      <oh-nav-content :title="titleDisplayText"
                      :back-link="t('analyzer.back')"
                      :save-link="userStore.isAdmin() ? t('analyzer.save') : undefined"
                      @save="savePage"
                      :f7router />
    </f7-navbar>

    <f7-toolbar bottom>
      <span />
      <f7-link class="right controls-link padding-right" ref="detailsLink" @click="openControls">
        {{ t('analyzer.controls') }}&nbsp;<f7-icon f7="chevron_up" />
      </f7-link>
      <f7-link v-if="'orientation' in coordSettings"
               color="blue"
               icon-f7="crop_rotate"
               @click="toggleOrientation" />
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
              ref="controlsSheet"
              :backdrop="false"
              :close-on-escape="true"
              :opened="controlsOpened">
      <f7-page>
        <f7-toolbar tabbar :bottom="true">
          <f7-link class="padding-left padding-right"
                   tab-link="#tab-series"
                   tab-link-active
                   :text="t('analyzer.series')" />
          <f7-link class="padding-left padding-right"
                   tab-link="#tab-coords"
                   :text="t('analyzer.coords')" />
          <f7-link class="padding-left padding-right"
                   tab-link="#tab-ranges"
                   :text="t('analyzer.ranges')" />
          <div class="right">
            <f7-link sheet-close class="padding-right">
              <f7-icon f7="chevron_down" />
            </f7-link>
          </div>
        </f7-toolbar>

        <!-- series controls tab -->
        <f7-tabs>
          <f7-tab id="tab-series" class="no-margin no-padding" tab-active>
            <f7-row>
              <f7-col :width="100" />
              <f7-col :width="100">
                <div class="card data-table">
                  <div class="card-header no-padding" style="min-height: auto">
                    <f7-list style="width: 100%">
                      <f7-list-group>
                        <item-picker :key="itemsPickerKey"
                                     label="Items"
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
                          <th class="label-cell">
                            <span v-if="'auxColumn' in coordSettings">{{ t('analyzer.series.table.header.' + coordSettings.auxColumn) }}</span>
                            <span v-else />
                          </th>
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
                              <f7-button v-for="type in options.typeOptions"
                                         small
                                         outline
                                         :key="type"
                                         style="width: auto"
                                         :fill="options.type === type"
                                         @click="changeSeriesType(options, type)"
                                         :text="t('analyzer.series.table.type.' + type)" />
                            </f7-segmented>
                          </td>
                          <td class="label-cell">
                            <f7-segmented v-if="'showAxesOptions' in options && options.showAxesOptions" round>
                              <f7-button v-for="(axis, $idx) in (coordSettings as TimeCoordSettings | AggregateCoordSettings).valueAxesOptions"
                                         :key="$idx"
                                         small
                                         outline
                                         style="width: auto"
                                         :fill="(options as TimeSeriesOptions | AggregateSeriesOptions).valueAxisIndex === $idx"
                                         @click="(options as TimeSeriesOptions | AggregateSeriesOptions).valueAxisIndex = $idx">
                                {{ axis.unit }}
                              </f7-button>
                            </f7-segmented>
                            <span v-else>{{ t('analyzer.series.table.na') }}</span>
                          </td>
                          <td class="label-cell">
                            <f7-link v-if="'marker' in options" @click="chooseMarkers(options as TimeSeriesOptions | AggregateSeriesOptions)">
                              {{ (options as TimeSeriesOptions | AggregateSeriesOptions).marker || 'none' }}
                            </f7-link>
                            <span v-else>{{ t('analyzer.series.table.na') }}</span>
                          </td>
                          <td class="label-cell">
                            <f7-link v-if="'aggregation' in options" @click="chooseAggregation(options as AggregateSeriesOptions)">
                              {{ (options as AggregateSeriesOptions).aggregation ? t('analyzer.aggregations.' + (options as AggregateSeriesOptions).aggregation) : 'none' }}
                            </f7-link>
                            <span v-else />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </f7-col>
            </f7-row>
          </f7-tab>

          <!-- coordinates control tab -->
          <f7-tab id="tab-coords" class="no-margin">
            <f7-row>
              <f7-col :width="100" :medium="50" class="margin-bottom">
                <f7-block-header>{{ t('analyzer.coords.period') }}</f7-block-header>
                <f7-segmented strong class="margin-bottom">
                  <f7-button
                    :active="coordSettings.chartType === ChartType.dynamic"
                    @click="changeChartType(ChartType.dynamic)"
                    :text="t('analyzer.coords.period.dynamic')" />
                  <f7-button
                    :active="coordSettings.chartType !== ChartType.dynamic"
                    @click="changeChartType(ChartType.day)"
                    :text="t('analyzer.coords.period.fixed')" />
                </f7-segmented>
                <f7-segmented v-if="coordSettings.chartType !== ChartType.dynamic">
                  <f7-button v-for="type in [ChartType.day, ChartType.isoWeek, ChartType.week, ChartType.month, ChartType.year]"
                             :key="type"
                             :disabled="!coordSettings.typeOptions.includes(type)"
                             :active="coordSettings.chartType === type"
                             @click="changeChartType(type)"
                             :text="t('analyzer.coords.period.' + type)" />
                </f7-segmented>
              </f7-col>
              <f7-col :width="100" :medium="50" class="margin-bottom">
                <f7-block-header>{{ t('analyzer.coords.coordSystem') }}</f7-block-header>
                <f7-segmented strong class="margin-bottom">
                  <f7-button v-for="cs in coordSystemsName"
                             :key="cs"
                             :disabled="coordSettings.chartType === ChartType.dynamic"
                             :active="coordSystemName === cs"
                             @click="changeCoordSystem(cs)"
                             :text="t('analyzer.coords.coordSystem.' + cs)" />
                </f7-segmented>
                <f7-segmented v-if="'dimensions' in coordSettings">
                  <f7-button
                    :active="dimensions === 1"
                    @click="changeAggregateDimensions(1)"
                    :text="t('analyzer.coords.coordSystem.aggregate.1dimension')" />
                  <f7-button
                    :active="dimensions === 2"
                    @click="changeAggregateDimensions(2)"
                    :text="t('analyzer.coords.coordSystem.aggregate.2dimensions')" />
                </f7-segmented>
              </f7-col>
              <f7-col width="100" class="margin-top display-flex justify-content-center margin-bottom">
                <f7-button v-if="'orientation' in coordSettings"
                           round
                           raised
                           fill
                           color="black"
                           icon-f7="crop_rotate"
                           icon-size="20"
                           @click="toggleOrientation">
                  {{ t('analyzer.coords.rotate') }}
                </f7-button>
              </f7-col>
            </f7-row>
          </f7-tab>

          <!-- ranges control tab -->
          <f7-tab id="tab-ranges" class="no-margin no-padding">
            <f7-row v-if="'visualMap' in coordSettings && dimensions === 2">
              <f7-col :width="100" :medium="50">
                <f7-list class="no-margin-vertical">
                  <f7-list-item divider>
                    {{ t('analyzer.ranges.visualPalette') }}
                  </f7-list-item>
                  <f7-list-item v-for="palette in OhChartVisualmap.PresetPalette"
                                :key="palette"
                                radio
                                name="visualMap.palette"
                                :checked="coordSettings.visualMap.palette === palette"
                                @change="changeVisualMapPalette(palette as OhChartVisualmap.PresetPalette)">
                    {{ t('analyzer.ranges.visualPalette.' + palette) }}
                  </f7-list-item>
                </f7-list>
              </f7-col>
              <f7-col :width="100" :medium="50">
                <f7-list class="no-margin-vertical" inline-labels no-hairlines-md>
                  <f7-list-item divider>
                    {{ t('analyzer.ranges.range') }}
                  </f7-list-item>
                  <f7-list-input :label="t('analyzer.ranges.range.min')"
                                 :value="coordSettings.visualMap.min"
                                 type="number"
                                 @input="coordSettings.visualMap.min = $event.target.value"
                                 placeholder="Auto"
                                 clear-button />
                  <f7-list-input :label="t('analyzer.ranges.range.max')"
                                 :value="coordSettings.visualMap.max"
                                 type="number"
                                 @input="coordSettings.visualMap.max = $event.target.value"
                                 placeholder="Auto"
                                 clear-button />
                  <f7-list-item divider>
                    {{ t('analyzer.ranges.range.type') }}
                  </f7-list-item>
                  <f7-list-item v-for="type in ['continuous', 'piecewise']"
                                :key="type"
                                radio
                                name="type"
                                :checked="coordSettings.visualMap.type === type"
                                @change="changeVisualMapType(type as OhChartVisualmap.Type)">
                    {{ t('analyzer.ranges.range.type.' + type) }}
                  </f7-list-item>
                </f7-list>
              </f7-col>
            </f7-row>
            <f7-row v-else-if="'valueAxesOptions' in coordSettings && coordSettings.valueAxesOptions?.length > 0">
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
                        <tr v-for="axis in coordSettings?.valueAxesOptions" :key="axis.unit">
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
                                         @change="(evt : Event) => axis.scale = (evt.target as HTMLInputElement).checked" />
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
          </f7-tab>
        </f7-tabs>
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
.tabs .tab
  padding-left calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left))
  padding-right calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-right))
</style>

<script lang="ts">
/*
  Analyzer page for ad-hoc charting and data analysis.

  There are separate chart-<coord-system>.ts files that implement the methods defined for each CoordSystem interface.
  These include methods to init the coord system settings, init the axes, init a series for an item on that coorsystem
  and finally, generate the chart page.
 */

import { nextTick, defineAsyncComponent } from 'vue'
import { getDevice } from 'framework7'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import ItemPicker from '@/components/config/controls/item-picker.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import ChartTime from './chart-time'
import ChartAggregate, { type AggregateCoordSettings, type AggregateSeriesOptions } from './chart-aggregate'
import ChartCalendar from './chart-calendar'

import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'

import api from '@/js/openhab/api'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'
import { type CoordSettings, Marker, ValueAxisSplitOptions, type CoordSystem, type SeriesOptions, type VisualMap, type SeriesType, type ValueAxisOptions } from './types'
import { AggregationFunction, ChartType, Orient, OhChartVisualmap } from '@/types/components/widgets'
import type { TimeCoordSettings, TimeSeriesOptions } from './chart-time'
import type { CalendarSeriesOptions } from './chart-calendar'
import type { Item } from '@/types/openhab'

enum CoordSystemsName {
  time = 'time',
  aggregate = 'aggregate',
  calendar = 'calendar'
}

const COORD_SYSTEMS : Record<string, CoordSystem> = {
  [CoordSystemsName.time]: ChartTime,
  [CoordSystemsName.aggregate]: ChartAggregate,
  [CoordSystemsName.calendar]: ChartCalendar
}

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
    const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('analyzer', mergeLocaleMessage)

    const userStore = useUserStore()
    const componentsStore = useComponentsStore()
    return {
      t, f7, theme, userStore, componentsStore, ChartType, CoordSystemsName, OhChartVisualmap
    }
  },
  data () {
    return {
      showChart: false,
      invalidConfiguration: false,
      itemNames: [] as Array<string>,
      items: [] as Array<Item>,
      seriesOptions: {} as Record<string, SeriesOptions>,
      coordSystems: Object.keys(COORD_SYSTEMS),
      coordSystemName: CoordSystemsName.time,
      coordSystem: COORD_SYSTEMS[CoordSystemsName.time],
      coordSettings: COORD_SYSTEMS[CoordSystemsName.time].initCoordSystem() as CoordSettings,
      controlsOpened: false,
      itemsPickerKey: f7.utils.id(),
      chartKey: f7.utils.id(),
      label: null as string | null
    }
  },
  computed: {
    titleDisplayText () {
      if (this.label != null) return this.label
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
      const chartPage = this.coordSystem.getChartPage(this.coordSettings, this.seriesOptions, this.items)
      chartPage.config.label = this.label
      return chartPage
    },
    dimensions () {
      return ('dimensions' in this.coordSettings) ? this.coordSettings.dimensions : 1
    },
    coordSystemsName () {
      return CoordSystemsName
    },
    ...mapStores(useUserStore)
  },
  methods: {
    close () {
      this.controlsOpened = false
      f7.sheet.close(this.$refs.controlsSheet)
    },
    openControls () {
      this.controlsOpened = true
    },
    initChart () {
      if (this.f7route?.query.period) (this.coordSettings as TimeCoordSettings).period = this.f7route.query.period
      if (this.f7route?.query.items === '') {
        this.invalidConfiguration = true
        return
      }
      this.updateItems(this.f7route?.query.items.split(',')).then(() => {
        if (this.f7route?.query.chartType) this.changeChartType(this.f7route.query.chartType)
        if (this.f7route?.query.coordSystem) this.changeCoordSystem(this.f7route.query.coordSystem)
        if (this.f7route?.query.aggregation) {
          for (const options in this.seriesOptions) {
            if ('aggregation' in this.seriesOptions[options]) {
              this.seriesOptions[options].aggregation = this.f7route.query.aggregation
            }
          }
        }
      })
    },
    refreshChart (fn : () => void) {
      this.showChart = false
      if (typeof fn === 'function') fn()
      nextTick(() => {
        this.showChart = true
      })
    },
    initItemsSeries (freshInit = true) {
      if (freshInit) {
        this.seriesOptions = {}
      }
      this.coordSystem.initAxes(this.coordSettings)
      for (const item of this.items) {
        this.seriesOptions[item.name] = this.coordSystem.initSeries(item, this.coordSettings, freshInit ? {} : this.seriesOptions[item.name])
      }
    },
    async updateItems (itemNames : Array<string>) {
      this.itemNames = itemNames
      this.showChart = false
      const promises = itemNames.map((n) => api.get('/rest/items/' + n))
      return Promise.all(promises).then((resp) => {
        this.items = [...resp]
        this.initItemsSeries(false)
        for (let optionKey in this.seriesOptions) {
          if (this.itemNames.indexOf(optionKey) < 0) {
            delete this.seriesOptions[optionKey]
          }
        }
        this.showChart = true

        return Promise.resolve()
      })
    },
    changeSeriesType (options : SeriesOptions, type : SeriesType) {
      if (options.type === type) return // no change
      this.refreshChart(() => {
        options.type = type
        this.initItemsSeries(false)
      })
    },
    changeChartType (type : ChartType) {
      this.refreshChart(() => {
        this.coordSettings.chartType = type
        if (type === '') {
          this.changeCoordSystem(CoordSystemsName.time)
        }
      })
    },
    changeCoordSystem (coordSystem : CoordSystemsName) {
      if (!COORD_SYSTEMS[coordSystem]) {
        this.invalidConfiguration = true
        return
      }

      this.refreshChart(() => {
        this.coordSystemName = coordSystem
        this.coordSystem = COORD_SYSTEMS[coordSystem]
        const device = getDevice()
        this.coordSettings = this.coordSystem.initCoordSystem({
          ...this.coordSettings,
          orientation: (device.desktop || device.ipad) ? Orient.horizontal : Orient.vertical
        } as CoordSettings) as CoordSettings
        this.initItemsSeries(true)
      })
    },
    changeAggregateDimensions (dimensions : number) {
      if (!('dimensions' in this.coordSettings)) {
        return
      }
      this.refreshChart(() => {
        (this.coordSettings as any).dimensions = dimensions
        this.initItemsSeries(false)
      })
    },
    toggleOrientation () {
      if ('orientation' in this.coordSettings) {
        this.coordSettings.orientation = (this.coordSettings.orientation === Orient.horizontal) ? Orient.vertical : Orient.horizontal
      }
    },
    changeVisualMapPalette (palette : OhChartVisualmap.PresetPalette) {
      this.refreshChart(() => {
        if ('visualMap' in this.coordSettings) {
          this.coordSettings.visualMap.palette = palette
        }
      })
    },
    changeVisualMapType (type : OhChartVisualmap.Type) {
      this.refreshChart(() => {
        if ('visualMap' in this.coordSettings) {
          this.coordSettings.visualMap.type = type
        }
      })
    },
    chooseMarkers (seriesOptions : TimeSeriesOptions | AggregateSeriesOptions) {
      const actions = Object.values(Marker).map((m) => {
        return {
          text: m,
          color: 'blue',
          onClick: () => { seriesOptions.marker = m }
        }
      })
      f7.actions.create({
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
    chooseAggregation (seriesOptions : AggregateSeriesOptions | CalendarSeriesOptions) {
      const actions = Object.values(AggregationFunction).map((a) => {
        return {
          text: this.t('analyzer.aggregations.' + a),
          color: 'blue',
          onClick: () => { seriesOptions.aggregation = AggregationFunction[a as keyof typeof AggregationFunction]}
        }
      })
      f7.actions.create({
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
    chooseAxisSplit (axis : ValueAxisOptions) {
      const actions = Object.keys(ValueAxisSplitOptions).map((key) => {
        return {
          text: ValueAxisSplitOptions[key as keyof typeof ValueAxisSplitOptions],
          color: 'blue',
          onClick: () => { axis.split = key as ValueAxisSplitOptions }
        }
      })
      f7.actions.create({
        buttons: [
          [{ label: true, text: this.t('analyzer.dialogs.header.split') }, ...actions],
          [{ color: 'red', text: 'Cancel', close: true }]
        ]
      }).open()
    },
    savePage () {
      if (!this.userStore.isAdmin()) return // shouldn't get here if not an admin

      const self = this

      const pageId = 'page_' + f7.utils.id()
      f7.dialog.create({
        title: this.t('analyzer.dialogs.save.title'),
        text: this.t('analyzer.dialogs.save.message'),
        content: `
          <div class="dialog-input-field input">
            <div class="dialog-input-label" style="padding-bottom: 8px">Page ID</div>
            <input type="text" placeholder="${pageId}" id="page-id" class="dialog-input">
          </div>
          <div class="dialog-input-field input">
            <div class="dialog-input-label" style="padding-bottom: 8px">Label</div>
            <input type="text" placeholder="${this.titleDisplayText}" id="page-label" class="dialog-input">
          </div>
        `,
        buttons: [
          { text: this.t('dialogs.cancel'), color: 'gray', close: true },
          { text: this.t('dialogs.save'), color: 'red', close: true, onClick: () => {
            const uid = (document.getElementById('page-id') as HTMLInputElement).value || pageId
            const label = (document.getElementById('page-label') as HTMLInputElement).value || this.titleDisplayText
            if (!uid.match(/^[A-Za-z0-9_]+$/)) {
              f7.dialog.alert(this.t('analyzer.dialogs.save.invalid'))
              return
            }
            if (this.componentsStore.page(uid)) {
              f7.dialog.confirm(
                this.t('analyzer.dialogs.save.replace.message', { uid }),
                this.t('analyzer.dialogs.save.replace.title'),
                () => { self.doSavePage(uid, label, true) })
              return
            }

            this.doSavePage(uid, label, false)
          }
          }
        ],
        destroyOnClose: true
      }).open()
    },
    doSavePage (uid : string, label: string, overwrite : boolean = false) {
      this.label = label
      let chartPage = Object.assign({ uid }, this.page)

      const promise = (!overwrite)
        ? api.postPlain('/rest/ui/components/ui:page', JSON.stringify(chartPage), 'text/plain', 'application/json')
        : api.put('/rest/ui/components/ui:page/' + uid, chartPage)
      promise.then((data) => {
        if (overwrite) {
          f7.toast.create({
            text: this.t('analyzer.page.updated'),
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
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
  mounted () {
    this.initChart()
  }
}
</script>
