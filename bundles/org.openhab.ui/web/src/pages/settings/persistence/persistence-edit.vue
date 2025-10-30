<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content :title="pageTitle + dirtyIndicator"
                      :editable
                      save-link="Save"
                      @save="save()"
                      :f7router />
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" tab-link="#design">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" tab-link="#code">
        Code
      </f7-link>
    </f7-toolbar>

    <f7-tabs>
      <!-- Design Tab -->
      <f7-tab id="design" :tab-active="currentTab === 'design'">
        <f7-block class="block-narrow">
          <f7-col>
            <div>
              <f7-block-footer style="padding-left: 16px; padding-right: 16px">
                Persistence stores data over time, which can be retrieved at a later time, e.g. to restore Item states after startup, or to display graphs in the UI.
                <f7-link external
                         color="blue"
                         target="_blank"
                         :href="`${runtimeStore.websiteUrl}/link/persistence`">
                  Learn more about persistence.
                </f7-link>
              </f7-block-footer>
            </div>
          </f7-col>
        </f7-block>
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
              <div v-for="ft in FilterTypes" :key="ft.name">
                <f7-block-title>
                  {{ ft.label }}
                </f7-block-title>
                <f7-list class="skeleton-text skeleton-effect-blink">
                  <f7-list-item />
                </f7-list>
              </div>
            </div>
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Aliases
              </f7-block-title>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
            </div>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready" class="block-narrow">
          <f7-col v-if="!editable">
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
              <f7-list :media-list="editable" swipeout>
                <f7-list-item v-for="(cfg, index) in persistence.configs"
                              :key="cfg.items.join()"
                              :title="cfg.items.join(', ')"
                              :footer="cfg.strategies.join(', ') + (cfg.filters.length > 0 ? ' - ' + cfg.filters.join(', ') : '')"
                              :link="editable"
                              @click="(ev) => editConfiguration(ev, index, cfg)"
                              swipeout>
                  <template #media>
                    <f7-link v-if="editable"
                             icon-color="red"
                             icon-aurora="f7:minus_circle_filled"
                             icon-ios="f7:minus_circle_filled"
                             icon-md="material:remove_circle_outline"
                             @click="showSwipeout" />
                  </template>
                  <f7-swipeout-actions right v-if="editable">
                    <f7-swipeout-button @click="(ev) => deleteModule(ev, 'configs', index)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="editable">
                <f7-list-item link
                              no-chevron
                              media-item
                              :color="(theme.dark) ? 'black' : 'white'"
                              subtitle="Add configuration"
                              @click="editConfiguration(undefined, null)">
                  <template #media>
                    <f7-icon color="green"
                             aurora="f7:plus_circle_fill"
                             ios="f7:plus_circle_fill"
                             md="material:control_point" />
                  </template>
                </f7-list-item>
              </f7-list>
            </div>
            <!-- Strategies -->
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Strategies
              </f7-block-title>
              <!-- Cron Strategies -->
              <f7-list :media-list="editable" swipeout>
                <f7-list-item v-for="(cs, index) in persistence.cronStrategies"
                              :key="cs.name"
                              :title="cs.name"
                              :footer="cs.cronExpression"
                              :link="editable"
                              @click="(ev) => editCronStrategy(ev, index, cs)"
                              swipeout>
                  <template #media>
                    <f7-link v-if="editable"
                             icon-color="red"
                             icon-aurora="f7:minus_circle_filled"
                             icon-ios="f7:minus_circle_filled"
                             icon-md="material:remove_circle_outline"
                             @click="showSwipeout" />
                  </template>
                  <f7-swipeout-actions right v-if="editable">
                    <f7-swipeout-button @click="(ev) => deleteCronStrategy(ev, index)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="editable">
                <f7-list-item link
                              no-chevron
                              media-item
                              :color="(theme.dark) ? 'black' : 'white'"
                              subtitle="Add cron strategy"
                              @click="editCronStrategy(undefined, null)">
                  <template #media>
                    <f7-icon color="green"
                             aurora="f7:plus_circle_fill"
                             ios="f7:plus_circle_fill"
                             md="material:control_point" />
                  </template>
                </f7-list-item>
              </f7-list>
              <!-- Default Strategies -->
              <strategy-picker title="Default Strategies"
                               name="defaults"
                               :strategies="strategies"
                               :value="persistence.defaults"
                               :disabled="!editable ? true : null"
                               @strategies-selected="persistence.defaults = $event" />
            </div>
            <!-- Filters -->
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Filters
              </f7-block-title>
              <div v-for="ft in FilterTypes" :key="ft.name">
                <f7-block-title>
                  {{ ft.label }}
                </f7-block-title>
                <f7-list :media-list="editable" swipeout>
                  <f7-list-item v-for="(f, index) in persistence[ft.name]"
                                :key="f.name"
                                :title="f.name"
                                :footer="(typeof ft.footerFn === 'function') ? ft.footerFn(f) : ''"
                                :link="editable"
                                @click="(ev) => editFilter(ev, ft, index, f)"
                                swipeout>
                    <template #media>
                      <f7-link v-if="editable"
                               icon-color="red"
                               icon-aurora="f7:minus_circle_filled"
                               icon-ios="f7:minus_circle_filled"
                               icon-md="material:remove_circle_outline"
                               @click="showSwipeout" />
                    </template>
                    <f7-swipeout-actions right v-if="editable">
                      <f7-swipeout-button @click="(ev) => deleteFilter(ev, ft.name, index)"
                                          style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                        Delete
                      </f7-swipeout-button>
                    </f7-swipeout-actions>
                  </f7-list-item>
                </f7-list>
                <f7-list v-if="editable">
                  <f7-list-item link
                                no-chevron
                                media-item
                                :color="(theme.dark) ? 'black' : 'white'"
                                :subtitle="'Add ' + ft.label.toLowerCase() + ' filter'"
                                @click="editFilter(undefined, ft, null)">
                    <template #media>
                      <f7-icon color="green"
                               aurora="f7:plus_circle_fill"
                               ios="f7:plus_circle_fill"
                               md="material:control_point" />
                    </template>
                  </f7-list-item>
                </f7-list>
              </div>
            </div>
            <!-- Aliases -->
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Aliases
              </f7-block-title>
              <f7-list :media-list="editable" swipeout no-swipeout-opened>
                <f7-list-item v-for="(i, index) in currentItemsWithAlias" class="swipeout list-alias-item" :key="i">
                  <template #media>
                    <f7-link icon-color="red"
                             icon-aurora="f7:minus_circle_filled"
                             icon-ios="f7:minus_circle_filled"
                             icon-md="material:remove_circle_outline"
                             @click="showSwipeout" />
                  </template>
                  <div class="alias-label">
                    {{ i }}
                  </div>
                  <div class="alias-input">
                    <f7-input type="text"
                              :ref="'alias-input-' + index"
                              placeholder="alias"
                              validate
                              pattern="[A-Za-z_][A-Za-z0-9_]*"
                              error-message="Required. Must not start with a number. A-Z,a-z,0-9,_ only"
                              :value="persistence.aliases[i]"
                              @input="editAlias($event, i, $event.target.value)"
                              @keydown="keyDown($event, index)" />
                  </div>
                  <f7-swipeout-actions right v-if="editable">
                    <f7-swipeout-button @click="(ev) => deleteAlias(ev, i)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="editable">
                <f7-list-group>
                  <item-picker class="alias-item-picker"
                               label="Add alias"
                               name="items"
                               :multiple="true"
                               :noModelPicker="true"
                               :setValueText="false"
                               iconColor="green"
                               auroraIcon="f7:plus_circle_fill"
                               iosIcon="f7:plus_circle_fill"
                               mdIcon="material:control_point"
                               :value="currentItemsWithAlias"
                               @input="updateAliasItems($event)" />
                </f7-list-group>
              </f7-list>
            </div>
          </f7-col>
          <f7-col v-if="editable && !newPersistence">
            <f7-list>
              <f7-list-button color="red" @click="deletePersistence">
                Remove persistence configuration
              </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <!-- Code Tab -->
      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <f7-icon v-if="!editable"
                 f7="lock"
                 class="float-right margin"
                 style="opacity: 0.5; z-index: 4000; user-select: none"
                 size="50"
                 color="gray"
                 :tooltip="notEditableMgs" />
        <editor v-if="currentTab === 'code'"
                class="persistence-code-editor"
                mode="application/vnd.openhab.persistence+yaml"
                :value="persistenceYaml"
                @input="onEditorInput"
                :read-only="!editable" />
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

.list-alias-item .item-content .item-inner
  display: flex
  align-items: center
.alias-label
  min-width: 20%
  margin-right: 5%
  flex-shrink: 0
  font-weight: var(--f7-list-media-item-title-font-weight, var(--f7-list-item-title-font-weight, inherit))
.alias-input
  flex-grow: 1
  .input input
    text-align: right
.alias-item-picker .item-picker .item-content
  padding-left: calc(var(--f7-list-item-padding-horizontal) + var(--f7-safe-area-left))

.persistence-code-editor.v-codemirror
  position absolute
</style>

<script>
import { defineAsyncComponent } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import YAML from 'yaml'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import DirtyMixin from '../dirty-mixin'
import { FilterTypes, PredefinedStrategies } from '@/assets/definitions/persistence'
import CronStrategyPopup from '@/pages/settings/persistence/cron-strategy-popup.vue'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import StrategyPicker from '@/pages/settings/persistence/strategy-picker.vue'
import ConfigurationPopup from '@/pages/settings/persistence/configuration-popup.vue'
import FilterPopup from '@/pages/settings/persistence/filter-popup.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  mixins: [DirtyMixin],
  components: {
    ItemPicker,
    StrategyPicker,
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'))
  },
  props: {
    serviceId: String,
    f7router: Object
  },
  setup () {
    return { theme }
  },
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

      notEditableMgs: 'This persistence configuration is not editable because it has been provisioned from a file.'
    }
  },
  computed: {
    editable () {
      return this.newPersistence || (this.persistence && this.persistence.editable === true)
    },
    pageTitle () {
      if (this.newPersistence) return 'Create new persistence configuration'
      if (!this.ready) return ''
      if (!this.editable) return `${this.serviceId} persistence configuration details`
      return `Edit ${this.serviceId} persistence configuration`
    },
    strategies () {
      return this.PredefinedStrategies.concat(this.persistence.cronStrategies.map((cs) => cs.name))
    },
    filters () {
      let names = []
      for (let i = 0; i < this.FilterTypes.length; i++) {
        const filterTypeName = this.FilterTypes[i].name
        if (this.persistence[filterTypeName]) names = names.concat(this.persistence[filterTypeName].map((f) => f.name))
      }
      return names
    },
    currentItemsWithAlias () {
      return Object.keys(this.persistence.aliases).sort()
    },
    ...mapStores(useRuntimeStore)
  },
  watch: {
    persistence: {
      handler: function () {
        if (!this.loading) { // ignore changes during loading
          this.checkDirty()
        }
      },
      deep: true
    }
  },
  methods: {
    onPageAfterIn () {
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
        aliases: [],
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
      // Dynamically add empty arrays for all filter types defined in the FilterTypes object
      this.FilterTypes.forEach((ft) => { this.persistence[ft.name] = [] })
      this.savedPersistence = cloneDeep(this.persistence)
      this.ready = true
    },
    load () {
      if (this.loading) return
      this.loading = true

      this.$oh.api.get('/rest/persistence/' + this.serviceId).then((data) => {
        this.persistence = data
        this.savedPersistence = cloneDeep(this.persistence)
        // Ensure arrays for all filter types defined in the FilterTypes object are existent
        this.FilterTypes.forEach((ft) => {
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
    async save (noToast) {
      if (!this.editable) return
      if (this.currentTab === 'code') this.fromYaml()

      // Update the code tab
      if (this.persistenceYaml) this.toYaml()

      const saveConfirmed = await this.validateAliases()
      if (!saveConfirmed) return

      return this.$oh.api.put('/rest/persistence/' + this.persistence.serviceId, this.persistence).then((data) => {
        this.dirty = false
        if (this.newPersistence) {
          this.newPersistence = false
          this.ready = false
          this.load()
        }
        if (!noToast) {
          f7.toast.create({
            text: 'Persistence configuration saved',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
      }).catch((err) => {
        f7.toast.create({
          text: 'Error while saving persistence configuration: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    deletePersistence () {
      f7.dialog.confirm(
        `Are you sure you want to delete persistence configuration for ${this.serviceId}?`,
        'Delete persistence configuration',
        () => {
          this.$oh.api.delete('/rest/persistence/' + this.serviceId).then(() => {
            this.dirty = false
            this.f7router.back({ force: true })
          })
        }
      )
    },
    checkDirty () {
      this.dirty = !fastDeepEqual(this.persistence, this.savedPersistence)
    },
    showSwipeout (ev) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        f7.swipeout.open(swipeoutElement)
      }
    },
    editConfiguration (ev, index, configuration) {
      if (!this.editable) return
      this.currentConfiguration = configuration

      const popup = {
        component: ConfigurationPopup
      }
      this.f7router.navigate({
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

      f7.once('configurationUpdate', (ev) => this.saveConfiguration(index, ev))
    },
    saveConfiguration (index, configuration) {
      const idx = this.persistence.configs.findIndex((cfg) => cfg.items.join() === configuration.items.join())
      if (index === null && idx !== -1) {
        f7.dialog.alert('A configuration for this/these Item(s) already exists!')
        return
      }
      this.saveModule('configs', index, configuration)
    },
    editCronStrategy (ev, index, cronStrategy) {
      if (!this.editable) return
      this.currentCronStrategy = cronStrategy

      const popup = {
        component: CronStrategyPopup
      }
      this.f7router.navigate({
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

      f7.once('cronStrategyConfigUpdate', (ev) => this.saveCronStrategy(index, ev))
    },
    saveCronStrategy (index, cronStrategy) {
      const idx = this.persistence.cronStrategies.findIndex((cs) => cs.name === cronStrategy.name)
      if ((index === null && idx !== -1) || this.PredefinedStrategies.includes(cronStrategy.name)) {
        f7.dialog.alert('A (cron) strategy with the same name already exists!')
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
      if (!this.editable) return
      this.currentFilter = filter

      // Stringify values array from equals filter
      if (filterType.name === 'equalsFilters' && filter) filter.values = filter.values.join(', ')

      const popup = {
        component: FilterPopup
      }
      this.f7router.navigate({
        url: 'filter-config',
        route: {
          path: 'filter-config',
          popup
        }
      }, {
        props: {
          filter: this.currentFilter,
          filterType,
          filterConfigDescriptionParameters: filterType.configDescriptionParameters
        }
      })

      f7.once('filterUpdate', (ev, ftn) => this.saveFilter(ftn, index, ev))
    },
    saveFilter (filterTypeName, index, filter) {
      const idx = this.filters.findIndex((f) => f === filter.name)
      if (index === null && idx !== -1) {
        f7.dialog.alert('A filter with the same name already exists!')
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
        if (i > -1) cfg.filters.splice(i, 1)
      })
      this.deleteModule(ev, module, index)
    },
    updateAliasItems (items) {
      if (!this.editable) return
      const aliases = this.persistence.aliases
      Object.keys(aliases)
        .filter((i) => !items.includes(i))
        .forEach((i) => { delete aliases[i] })
      items
        .filter((i) => !Object.keys(aliases).includes(i))
        .forEach((i) => { aliases[i] = '' })
      const newAliases = Object.keys(aliases)
        .reduce((obj, key) => {
          obj[key] = aliases[key]
          return obj
        }, {})
      this.persistence.aliases = newAliases
    },
    editAlias (ev, item, alias) {
      if (!this.editable) return
      // Warn when alias already exists
      const duplicate = Object.entries(this.persistence.aliases).find(([i, a]) => (item !== i) && (alias === a))
      if (duplicate) {
        f7.dialog.alert('Alias ' + alias + ' for item ' + item + ' already exists for item ' + duplicate[0])
        this.persistence.aliases[item] = ''
        return
      }
      this.persistence.aliases[item] = alias
    },
    deleteAlias (ev, item) {
      this.deleteModuleKey(ev, 'aliases', item)
    },
    async validateAliases () {
      const entries = Object.entries(this.persistence.aliases)
      // Check for invalid alias format
      const invalidEntry = entries.find(([i, a]) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(a))
      if (invalidEntry) {
        const confirmed = await this.showConfirmDialog(
          `Alias not valid for item ${invalidEntry[0]}!\nSave anyway?`,
          'Alias Validation Error'
        )
        if (!confirmed) return false
      }
      // Check for duplicate aliases
      for (let idx = 1; idx < entries.length; idx++) {
        const firstIdx = entries.slice(0, idx).findIndex(([i, a]) => a === entries[idx][1])
        if (firstIdx >= 0) {
          const confirmed = await this.showConfirmDialog(
            `Alias "${entries[idx][1]}" for item "${entries[idx][0]}" already exists for item "${entries[firstIdx][0]}".\nSave anyway?`,
            'Alias Validation Error'
          )
          if (!confirmed) return false
        }
      }
      return true
    },
    showConfirmDialog (message, title) {
      return new Promise((resolve) => {
        f7.dialog.confirm(
          message,
          title,
          () => resolve(true),
          () => resolve(false)
        )
      })
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
      this.checkDirty()
    },
    deleteModule (ev, module, index) {
      if (!this.editable) return
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      f7.swipeout.delete(swipeoutElement, () => {
        console.debug(`Removing ${module}:`)
        console.debug(this.persistence[module][index])
        this.persistence[module].splice(index, 1)
        this.checkDirty()
      })
    },
    deleteModuleKey (ev, module, key) {
      if (!this.editable) return
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      f7.swipeout.delete(swipeoutElement, () => {
        console.debug(`Removing ${module}:`)
        console.debug(key)
        delete this.persistence[module][key]
        this.checkDirty()
      })
    },
    onEditorInput (value) {
      this.persistenceYaml = value
      this.dirty = true
    },
    toYaml () {
      const toCode = {
        configurations: this.persistence.configs,
        aliases: this.persistence.aliases,
        cronStrategies: this.persistence.cronStrategies,
        defaultStrategies: this.persistence.defaults
      }
      this.FilterTypes.forEach((ft) => {
        toCode[ft.name] = this.persistence[ft.name]
      })
      this.persistenceYaml = YAML.stringify(toCode)
    },
    fromYaml () {
      if (!this.editable) return false
      try {
        const updatedPersistence = YAML.parse(this.persistenceYaml)
        this.persistence.configs = updatedPersistence.configurations
        this.persistence.aliases = updatedPersistence.aliases
        this.persistence.cronStrategies = updatedPersistence.cronStrategies
        this.persistence.defaults = updatedPersistence.defaultStrategies
        this.FilterTypes.forEach((ft) => {
          this.persistence[ft.name] = updatedPersistence[ft.name]
        })
        return true
      } catch (e) {
        f7.dialog.alert(e).open()
        return false
      }
    },
    keyDown (ev, index) {
      if (ev.key === 'Tab') {
        ev.stopPropagation()
        ev.preventDefault()
        const newIndex = index || 0
        const total = this.currentItemsWithAlias.length
        let targetIndex
        if (ev.shiftKey) {
          targetIndex = newIndex - 1 < 0 ? total - 1 : newIndex - 1
        } else {
          targetIndex = newIndex + 1 >= total ? 0 : newIndex + 1
        }
        const ref = this.$refs[`alias-input-${targetIndex}`]
        const target = Array.isArray(ref) ? ref[0] : ref
        if (target && target.$el) {
          const inputEl = target.$el.querySelector('input')
          if (inputEl) inputEl.focus()
        }
      } else if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 83:
            this.save()
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    }
  },
  created () {
    this.PredefinedStrategies = PredefinedStrategies
    this.FilterTypes = FilterTypes
  }
}
</script>
