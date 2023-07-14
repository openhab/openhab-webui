<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="newPersistence ? 'Create persistence configuration' : 'Edit persistence configuration'"
               back-link="Back">
      <f7-nav-right v-if="isEditable">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>

    <f7-tabs>
      <!-- Design Tab -->
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <!-- Skeletons for not ready -->
        <f7-block v-if="!ready" class="block-narrow">
          <f7-col class="modules">
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Configuration
              </f7-block-title>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
            </div>
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Strategies
              </f7-block-title>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
              <!-- Default Strategies -->
              <strategy-picker title="Default Strategies" class="skeleton-text skeleton-effect-blink" />
            </div>
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Filters
              </f7-block-title>
              <div v-for="ft in filterTypes" :key="ft.name">
                <f7-block-title>
                  {{ ft.label }}
                </f7-block-title>
                <f7-list class="skeleton-text skeleton-effect-blink">
                  <f7-list-item />
                </f7-list>
              </div>
            </div>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready" class="block-narrow">
          <f7-col v-if="!isEditable">
            <div class="padding-left">
              Note: {{ notEditableMgs }}
            </div>
          </f7-col>
          <f7-col class="modules">
            <!-- Configuration -->
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Configuration
              </f7-block-title>
              <f7-list :media-list="isEditable" swipeout>
                <f7-list-item v-for="(cfg, index) in persistence.configs" :key="cfg.items.join()"
                              :title="cfg.items.join(', ')"
                              :footer="cfg.strategies.join(', ') + (cfg.filters.length > 0 ? ' - ' + cfg.filters.join(', ') : '')" :link="isEditable"
                              @click.native="(ev) => editConfiguration(ev, index, cfg)" swipeout>
                  <f7-link slot="media" v-if="isEditable" icon-color="red" icon-aurora="f7:minus_circle_filled"
                           icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                           @click="showSwipeout" />
                  <f7-swipeout-actions right v-if="isEditable">
                    <f7-swipeout-button @click="(ev) => deleteModule(ev, 'configs', index)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="isEditable">
                <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'"
                              subtitle="Add configuration" @click="editConfiguration(undefined, null)">
                  <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill"
                           md="material:control_point" />
                </f7-list-item>
              </f7-list>
            </div>
            <!-- Strategies -->
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Strategies
              </f7-block-title>
              <!-- Cron Strategies -->
              <f7-list :media-list="isEditable" swipeout>
                <f7-list-item v-for="(cs, index) in persistence.cronStrategies" :key="cs.name" :title="cs.name"
                              :footer="cs.cronExpression" :link="isEditable"
                              @click.native="(ev) => editCronStrategy(ev, index, cs)" swipeout>
                  <f7-link slot="media" v-if="isEditable" icon-color="red" icon-aurora="f7:minus_circle_filled"
                           icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                           @click="showSwipeout" />
                  <f7-swipeout-actions right v-if="isEditable">
                    <f7-swipeout-button @click="(ev) => deleteCronStrategy(ev, index)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="isEditable">
                <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'"
                              subtitle="Add cron strategy" @click="editCronStrategy(undefined, null)">
                  <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill"
                           md="material:control_point" />
                </f7-list-item>
              </f7-list>
              <!-- Default Strategies -->
              <strategy-picker title="Default Strategies" name="defaults" :strategies="strategies"
                               :value="persistence.defaults" :disabled="!isEditable"
                               @strategiesSelected="persistence.defaults = $event" />
            </div>
            <!-- Filters -->
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Filters
              </f7-block-title>
              <div v-for="ft in filterTypes" :key="ft.name">
                <f7-block-title>
                  {{ ft.label }}
                </f7-block-title>
                <f7-list :media-list="isEditable" swipeout>
                  <f7-list-item v-for="(f, index) in persistence[ft.name]" :key="f.name" :title="f.name"
                                :footer="(typeof ft.footerFn === 'function') ? ft.footerFn(f) : ''" :link="isEditable"
                                @click.native="(ev) => editFilter(ev, ft, index, f)" swipeout>
                    <f7-link slot="media" v-if="isEditable" icon-color="red" icon-aurora="f7:minus_circle_filled"
                             icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                             @click="showSwipeout" />
                    <f7-swipeout-actions right v-if="isEditable">
                      <f7-swipeout-button @click="(ev) => deleteFilter(ev, ft.name, index)"
                                          style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                        Delete
                      </f7-swipeout-button>
                    </f7-swipeout-actions>
                  </f7-list-item>
                </f7-list>
                <f7-list v-if="isEditable">
                  <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'"
                                :subtitle="'Add ' + ft.label.toLowerCase() + ' filter'"
                                @click="editFilter(undefined, ft, null)">
                    <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill"
                             md="material:control_point" />
                  </f7-list-item>
                </f7-list>
              </div>
            </div>
          </f7-col>
          <f7-col>
            <f7-list>
              <f7-list-button color="blue" :href="`https://${$store.state.runtimeInfo.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org/docs/configuration/persistence.html`" external target="_blank">
                Open documentation
              </f7-list-button>
              <f7-list-button v-if="isEditable && !newPersistence" color="red" @click="deletePersistence">
                Remove persistence configuration
              </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <!-- Code Tab -->
      <f7-tab id="code" @tab:show="() => { currentTab = 'code'; toYaml() }" :tab-active="currentTab === 'code'">
        <f7-icon v-if="!isEditable" f7="lock" class="float-right margin"
                 style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray"
                 :tooltip="notEditableMgs" />
        <editor v-if="currentTab === 'code'" class="persistence-code-editor"
                mode="application/vnd.openhab.persistence+yaml" :value="persistenceYaml" @input="onEditorInput"
                :read-only="!isEditable" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.moduleconfig-popup
  .page-content
    overflow-x hidden !important
  .config-sheet, .parameter-group
    margin-top 0 !important

.modules
  .swipeout-opened
    .sortable-handler
      display none
  .item-media .icon
    color var(--f7-theme-color)
  .media-list
    margin-bottom 0
  .list
    margin-top 0

.persistence-code-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - 2 * var(--f7-navbar-height))
  width 100%
</style>

<script>
import DirtyMixin from '../dirty-mixin'
import YAML from 'yaml'
import CronStrategyPopup from '@/pages/settings/persistence/cron-strategy-popup.vue'
import StrategyPicker from '@/pages/settings/persistence/strategy-picker.vue'
import ConfigurationPopup from '@/pages/settings/persistence/configuration-popup.vue'
import FilterPopup from '@/pages/settings/persistence/filter-popup.vue'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

const filterInvertedParameter = {
  advanced: false,
  description: 'Whether to invert the above filter, i.e. persist values that do not equal the above values or are outside of the specified range',
  label: 'Inverted',
  name: 'inverted',
  required: false,
  type: 'BOOLEAN'
}

export default {
  mixins: [DirtyMixin],
  components: {
    StrategyPicker,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  props: ['serviceId'],
  data () {
    return {
      newPersistence: false,
      persistence: {},
      savedPersistence: {},
      persistenceYaml: '',
      ready: false,
      loading: false,
      currentTab: 'design',
      currentConfiguration: null,
      currentCronStrategy: null,
      currentFilter: null,

      predefinedStrategies: ['everyChange', 'everyUpdate', 'restoreOnStartup'],
      // Filter configuration is completely based on these definitions, when adding new filters, no code needs to be updated.
      // However, please note that some validation and checks are in place for some filter types in save(), editFilter(), saveFilter() and filter-popup.vue
      filterTypes: [
        {
          name: 'thresholdFilters',
          label: 'Threshold',
          configDescriptionParameters: [
            {
              advanced: false,
              description: 'Difference to last stored value that must be exceeded to persist a new value',
              label: 'Value',
              name: 'value',
              required: true,
              type: 'DECIMAL'
            },
            {
              advanced: false,
              description: 'Whether the difference is relative (i.e. in percent)',
              label: 'Relative',
              name: 'relative',
              required: false,
              type: 'BOOLEAN'
            },
            {
              advanced: false,
              description: 'Unit of the given value, only used for UoM Items and if relative is disabled',
              label: 'Unit',
              name: 'unit',
              required: false,
              type: 'STRING'
            }
          ],
          footerFn: (f) => f.relative ? f.value + ' %' : (f.unit ? f.value + ' ' + f.unit : f.value)
        },
        {
          name: 'timeFilters',
          label: 'Time',
          configDescriptionParameters: [
            {
              advanced: false,
              description: 'Amount of time that must have passed since the last value has been persisted',
              label: 'Value',
              name: 'value',
              required: true,
              type: 'DECIMAL'
            },
            {
              advanced: false,
              description: 'Time unit (defaults to seconds)',
              label: 'Unit',
              limitToOptions: true,
              multiple: false,
              name: 'unit',
              options: [
                { label: 'seconds', value: 's' },
                { label: 'minutes', value: 'm' },
                { label: 'hours', value: 'h' },
                { label: 'days', value: 'd' }
              ],
              required: false,
              type: 'STRING'
            }
          ],
          footerFn: (f) => f.value + ' ' + (f.unit || 's')
        },
        {
          name: 'equalsFilters',
          label: 'Equals/Not Equals',
          configDescriptionParameters: [
            {
              advanced: false,
              description: 'Enter values separated by comma (use point <code>.</code> as decimal point), e.g. <code>one, two, three</code>, to be persisted',
              label: 'Values',
              name: 'values',
              required: true,
              type: ''
            },
            filterInvertedParameter
          ],
          footerFn: (f) => (f.inverted === true ? 'not ' : '') + 'equals ' + f.values.join(', ')
        },
        {
          name: 'includeFilters',
          label: 'Include/Exclude',
          configDescriptionParameters: [
            {
              advanced: false,
              description: 'Lower bound of the range of values to be persisted',
              label: 'Lower Bound',
              name: 'lower',
              required: true,
              type: 'DECIMAL'
            },
            {
              advanced: false,
              description: 'Upper bound of the range of values to be persisted',
              label: 'Upper Bound',
              name: 'upper',
              required: true,
              type: 'DECIMAL'
            },
            {
              advanced: false,
              description: 'Unit of the given bounds, only used for UoM Items',
              label: 'Unit',
              name: 'unit',
              required: false,
              type: 'STRING'
            },
            filterInvertedParameter
          ],
          footerFn: (f) => (f.inverted === true ? ']' : '[') + f.lower + ';' + f.upper + (f.inverted === true ? '[' : ']' + (f.unit ? ' ' + f.unit : ''))
        }
      ],
      notEditableMgs: 'This persistence configuration is not editable because it has been provisioned from a file.'
    }
  },
  computed: {
    isEditable () {
      return this.newPersistence || (this.persistence && this.persistence.editable === true)
    },
    strategies () {
      return this.predefinedStrategies.concat(this.persistence.cronStrategies.map(cs => cs.name))
    },
    filters () {
      let names = []
      for (let i = 0; i < this.filterTypes.length; i++) {
        const filterTypeName = this.filterTypes[i].name
        if (this.persistence[filterTypeName]) names = names.concat(this.persistence[filterTypeName].map((f) => f.name))
      }
      return names
    }
  },
  watch: {
    persistence: {
      handler: function (newPersistence, oldPersistence) {
        if (!this.loading) { // ignore initial rule assignment
          this.dirty = !fastDeepEqual(this.persistence, this.savedPersistence)
        }
      },
      deep: true
    }
  },
  methods: {
    onPageAfterIn () {
      if (this.ready) return
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    initializeNewPersistence () {
      this.newPersistence = true
      this.persistence = {
        serviceId: this.serviceId,
        configs: [],
        defaults: [
          'everyChange'
        ],
        cronStrategies: [
          {
            name: 'everyMinute',
            cronExpression: '0 * * ? * *'
          },
          {
            name: 'everyHour',
            cronExpression: '0 0 * * * ?'
          },
          {
            name: 'everyDay',
            cronExpression: '0 0 0 * * ?'
          }
        ]
      }
      // Dynamically add empty arrays for all filter types defined in the filterTypes object
      this.filterTypes.forEach((ft) => { this.persistence[ft.name] = [] })
      this.ready = true
    },
    load () {
      if (this.loading) return
      this.loading = true

      this.$oh.api.get('/rest/persistence/' + this.serviceId).then((data) => {
        this.$set(this, 'persistence', data)
        this.savedPersistence = cloneDeep(this.persistence)
        // Ensure arrays for all filter types defined in the filterTypes object are existent
        this.filterTypes.forEach((ft) => {
          if (!this.persistence[ft.name]) this.persistence[ft.name] = []
        })
        this.loading = false
        this.ready = true
      }).catch((e) => {
        if (e === 404 || e === 'Not Found') {
          this.initializeNewPersistence()
          this.loading = false
          this.ready = true
        } else {
          Promise.reject(e)
        }
      })
    },
    save (noToast) {
      if (!this.isEditable) return
      if (this.currentTab === 'code') this.fromYaml()

      // Ensure relative is set on threshold filter, otherwise the save request fails with a 500
      this.persistence.thresholdFilters.forEach((f) => {
        if (f.relative === undefined) f.relative = false
      })
      // Ensure inverted is set for equals and include filter, otherwise the save request fails with a 500
      this.persistence.equalsFilters.forEach((f) => {
        if (f.inverted === undefined) f.inverted = false
      })
      this.persistence.includeFilters.forEach((f) => {
        if (f.inverted === undefined) f.inverted = false
      })
      // Update the code tab
      if (this.persistenceYaml) this.toYaml()

      return this.$oh.api.put('/rest/persistence/' + this.persistence.serviceId, this.persistence).then((data) => {
        this.dirty = false
        if (this.newPersistence) {
          this.newPersistence = false
          this.ready = false
          this.load()
        }
        if (!noToast) {
          this.$f7.toast.create({
            text: 'Persistence configuration saved',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving persistence configuration: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    deletePersistence () {
      this.$f7.dialog.confirm(
        `Are you sure you want to delete persistence configuration for ${this.serviceId}?`,
        'Delete persistence configuration',
        () => {
          this.$oh.api.delete('/rest/persistence/' + this.serviceId).then(() => {
            this.$f7router.back(`/settings/addons/persistence-${this.serviceId}/config`, { force: true })
          })
        }
      )
    },
    showSwipeout (ev) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        this.$f7.swipeout.open(swipeoutElement)
      }
    },
    editConfiguration (ev, index, configuration) {
      if (!this.isEditable) return
      this.currentConfiguration = configuration

      const popup = {
        component: ConfigurationPopup
      }
      this.$f7router.navigate({
        url: 'configuration-config',
        route: {
          path: 'configuration-config',
          popup
        }
      }, {
        props: {
          configuration: this.currentConfiguration,
          strategies: this.strategies,
          filters: this.filters
        }
      })

      this.$f7.once('configurationUpdate', (ev) => this.saveConfiguration(index, ev))
    },
    saveConfiguration (index, configuration) {
      const idx = this.persistence.configs.findIndex((cfg) => cfg.items.join() === configuration.items.join())
      if (index === null && idx !== -1) {
        this.$f7.dialog.alert('A configuration for this/these Item(s) already exists!')
        return
      }
      this.saveModule('configs', index, configuration)
    },
    editCronStrategy (ev, index, cronStrategy) {
      if (!this.isEditable) return
      this.currentCronStrategy = cronStrategy

      const popup = {
        component: CronStrategyPopup
      }
      this.$f7router.navigate({
        url: 'cron-strategy-config',
        route: {
          path: 'cron-strategy-config',
          popup
        }
      }, {
        props: {
          cronStrategy: this.currentCronStrategy
        }
      })

      this.$f7.once('cronStrategyConfigUpdate', (ev) => this.saveCronStrategy(index, ev))
    },
    saveCronStrategy (index, cronStrategy) {
      const idx = this.persistence.cronStrategies.findIndex((cs) => cs.name === cronStrategy.name)
      if ((index === null && idx !== -1) || this.predefinedStrategies.includes(cronStrategy.name)) {
        this.$f7.dialog.alert('A (cron) strategy with the same name already exists!')
        return
      }
      this.saveModule('cronStrategies', index, cronStrategy)
    },
    deleteCronStrategy (ev, index) {
      // Remove cron strategy from configs, otherwise we get a 400
      const csName = this.persistence.cronStrategies[index].name
      this.persistence.configs.forEach((cfg) => {
        const i = cfg.strategies.findIndex((cs) => cs === csName)
        cfg.strategies.splice(i, 1)
      })
      this.deleteModule(ev, 'cronStrategies', index)
    },
    editFilter (ev, filterType, index, filter) {
      if (!this.isEditable) return
      this.currentFilter = filter

      // Stringify values array from equals filter
      if (filterType.name === 'equalsFilters' && filter) filter.values = filter.values.join(', ')

      const popup = {
        component: FilterPopup
      }
      this.$f7router.navigate({
        url: 'filter-config',
        route: {
          path: 'filter-config',
          popup
        }
      }, {
        props: {
          filter: this.currentFilter,
          filterType: filterType,
          filterConfigDescriptionParameters: filterType.configDescriptionParameters
        }
      })

      this.$f7.once('filterUpdate', (ev, ftn) => this.saveFilter(ftn, index, ev))
    },
    saveFilter (filterTypeName, index, filter) {
      const idx = this.filters.findIndex((f) => f === filter.name)
      if (index === null && idx !== -1) {
        this.$f7.dialog.alert('A filter with the same name already exists!')
        return
      }
      // Convert comma separated string to array for equals filter
      if (filterTypeName === 'equalsFilters') filter.values = filter.values.split(',').map((v) => v.trim())

      // Ensure that the filter type array exists.
      // Even though the arrays are created when a new persistence config is initialized, we need this for existing, old configs.
      if (!this.persistence[filterTypeName]) this.persistence[filterTypeName] = []
      this.saveModule(filterTypeName, index, filter)
    },
    deleteFilter (ev, module, index) {
      // Remove filter from configs, otherwise we get a 400
      const filterName = this.persistence[module][index].name
      this.persistence.configs.forEach((cfg) => {
        const i = cfg.filters.findIndex((f) => f === filterName)
        cfg.filters.splice(i, 1)
      })
      this.deleteModule(ev, module, index)
    },
    saveModule (module, index, updatedModule) {
      if (index === null) {
        console.debug(`Adding ${module}:`)
        console.debug(updatedModule)
        this.persistence[module].push(updatedModule)
      } else {
        console.debug(`Updating ${module} at index ${index}:`)
        console.debug(updatedModule)
        this.persistence[module][index] = updatedModule
        this.$forceUpdate()
      }
    },
    deleteModule (ev, module, index) {
      let swipeoutElement = ev.target
      if (!this.isEditable) return
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      this.$f7.swipeout.delete(swipeoutElement, () => {
        console.debug(`Removing ${module}:`)
        console.debug(this.persistence[module][index])
        this.persistence[module].splice(index, 1)
      })
    },
    onEditorInput (value) {
      this.persistenceYaml = value
      this.dirty = true
    },
    toYaml () {
      const toCode = {
        configurations: this.persistence.configs,
        cronStrategies: this.persistence.cronStrategies,
        defaultStrategies: this.persistence.defaults
      }
      this.filterTypes.forEach((ft) => {
        toCode[ft.name] = this.persistence[ft.name]
      })
      this.persistenceYaml = YAML.stringify(toCode)
    },
    fromYaml () {
      if (!this.isEditable) return false
      try {
        const updatedPersistence = YAML.parse(this.persistenceYaml)
        this.$set(this.persistence, 'configs', updatedPersistence.configurations)
        this.$set(this.persistence, 'cronStrategies', updatedPersistence.cronStrategies)
        this.$set(this.persistence, 'defaults', updatedPersistence.defaultStrategies)
        this.filterTypes.forEach((ft) => {
          this.$set(this.persistence, ft.name, updatedPersistence[ft.name])
        })
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    },
    keyDown (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 83:
            this.save()
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    }
  }
}
</script>
