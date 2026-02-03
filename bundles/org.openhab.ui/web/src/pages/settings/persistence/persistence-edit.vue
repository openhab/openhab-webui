<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content :title="pageTitle + dirtyIndicator" :editable :save-link="dirty ? 'Save' : null" @save="save()" :f7router />
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" tab-link="#design"> Design </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" tab-link="#code"> Code </f7-link>
    </f7-toolbar>

    <f7-tabs>
      <!-- Design Tab -->
      <f7-tab id="design" :tab-active="currentTab === 'design'">
        <f7-block class="block-narrow">
          <f7-col>
            <div>
              <f7-block-footer style="padding-left: 16px; padding-right: 16px">
                Persistence stores data over time, which can be retrieved at a later time, e.g. to restore Item states after startup, or to
                display graphs in the UI.
                <f7-link external color="blue" target="_blank" :href="`${runtimeStore.websiteUrl}/link/persistence`">
                  Learn more about persistence.
                </f7-link>
              </f7-block-footer>
            </div>
          </f7-col>
        </f7-block>
        <!-- Skeletons for not ready -->
        <f7-block v-if="!ready" class="block-narrow">
          <f7-col class="modules">
            <f7-block>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"> Configurations </f7-block-title>
              <f7-block-header style="padding-right: 16px"> Items to persist with strategies to use. </f7-block-header>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
            </f7-block>
            <f7-block>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"> Aliases </f7-block-title>
              <f7-block-header style="padding-right: 16px">Item names mapped to aliases used in persistence store.</f7-block-header>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
            </f7-block>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready" class="block-narrow">
          <f7-col v-if="!editable">
            <div class="padding-left">Note: {{ notEditableMgs }}</div>
          </f7-col>
          <f7-col class="modules">
            <!-- Configuration -->
            <f7-block>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"> Configurations </f7-block-title>
              <f7-block-header style="padding-right: 16px"> Items to persist with strategies to use. </f7-block-header>
              <f7-list v-if="editable || persistence.configs.length > 0" :media-list="editable" swipeout>
                <f7-list-item
                  v-for="(cfg, index) in persistence.configs"
                  :key="cfg.items.join()"
                  :link="editable"
                  @click="(ev) => editConfiguration(ev, index, cfg)"
                  swipeout>
                  <template #media>
                    <f7-link
                      v-if="editable"
                      icon-color="red"
                      icon-aurora="f7:minus_circle_filled"
                      icon-ios="f7:minus_circle_filled"
                      icon-md="material:remove_circle_outline"
                      @click="showSwipeout" />
                  </template>
                  <template #title>
                    <div v-if="configurationAllItemsTitle(cfg.items)">{{ configurationAllItemsTitle(cfg.items) }}</div>
                    <div v-if="configurationGroupsTitle(cfg.items)">{{ configurationGroupsTitle(cfg.items) }}</div>
                    <div v-if="configurationItemsTitle(cfg.items)">{{ configurationItemsTitle(cfg.items) }}</div>
                    <div v-if="configurationGroupsTitle(cfg.items, true)">{{ configurationGroupsTitle(cfg.items, true) }}</div>
                    <div v-if="configurationItemsTitle(cfg.items, true)">{{ configurationItemsTitle(cfg.items, true) }}</div>
                  </template>
                  <template #footer>
                    <div v-if="cfg.strategies?.length">{{ configurationStrategiesTitle(cfg.strategies) }}</div>
                    <div v-if="cfg.filters?.length">{{ configurationFiltersTitle(cfg.filters) }}</div>
                  </template>
                  <f7-swipeout-actions right v-if="editable">
                    <f7-swipeout-button
                      @click="(ev) => deleteConfiguration(ev, index)"
                      style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-else-if="!editable">
                <f7-list-item> No configurations defined </f7-list-item>
              </f7-list>
              <f7-list v-if="editable">
                <f7-list-item
                  link
                  no-chevron
                  media-item
                  :color="(theme.dark) ? 'black' : 'white'"
                  subtitle="Add configuration"
                  @click="editConfiguration(undefined, null)">
                  <template #media>
                    <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
                  </template>
                </f7-list-item>
              </f7-list>
            </f7-block>
            <f7-block>
              <!-- Aliases -->
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"> Aliases </f7-block-title>
              <f7-block-header style="padding-right: 16px">Item names mapped to aliases used in persistence store.</f7-block-header>
              <f7-list v-if="editable || currentItemsWithAlias.length > 0" :media-list="editable" swipeout no-swipeout-opened>
                <f7-list-item v-for="(i, index) in currentItemsWithAlias" class="swipeout list-alias-item" :key="i">
                  <template #media>
                    <f7-link
                      icon-color="red"
                      icon-aurora="f7:minus_circle_filled"
                      icon-ios="f7:minus_circle_filled"
                      icon-md="material:remove_circle_outline"
                      @click="showSwipeout" />
                  </template>
                  <div class="alias-label">
                    {{ i }}
                  </div>
                  <div class="alias-input">
                    <f7-input
                      type="text"
                      :ref="'alias-input-' + index"
                      placeholder="alias"
                      validate
                      pattern="[A-Za-z_][A-Za-z0-9_]*"
                      error-message="Required. Must not start with a number. A-Z,a-z,0-9,_ only"
                      :value="persistence.aliases[i]"
                      @input="editAlias(i, $event.target.value)"
                      @blur="checkAliasForDuplicates(i, $event.target.value)"
                      @keydown="keyDown($event, index)" />
                  </div>
                  <f7-swipeout-actions right v-if="editable">
                    <f7-swipeout-button
                      @click="(ev) => deleteAlias(ev, i)"
                      style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-else-if="!editable">
                <f7-list-item> No aliases defined </f7-list-item>
              </f7-list>
              <f7-list v-if="editable">
                <f7-list-group>
                  <item-picker
                    class="alias-item-picker"
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
            </f7-block>
          </f7-col>
          <f7-col v-if="editable" class="persistence-config-links">
            <f7-list>
              <f7-list-button color="blue" @click="definitionsPopupOpen = true"> Manage definitions </f7-list-button>
              <f7-list-button v-if="!newPersistence" color="red" @click="deletePersistence">
                Remove persistence configuration
              </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <!-- Code Tab -->
      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <f7-icon
          v-if="!editable"
          f7="lock"
          class="float-right margin"
          style="opacity: 0.5; z-index: 4000; user-select: none"
          size="50"
          color="gray"
          :tooltip="notEditableMgs" />
        <editor
          v-if="currentTab === 'code'"
          class="persistence-code-editor"
          mode="application/vnd.openhab.persistence+yaml"
          :value="persistenceYaml"
          @input="onEditorInput"
          :read-only="!editable" />
      </f7-tab>
    </f7-tabs>
  </f7-page>

  <!-- Configuration Popup (no router navigation as router gets confused with multiple popups) -->
  <configuration-popup
    v-if="ready"
    v-model:opened="configurationPopupOpen"
    :persistence="persistence"
    :configurationIndex="currentConfigurationIndex"
    :predefinedStrategies="PredefinedStrategies"
    :suggestedStrategies="suggestedStrategyNames"
    @close="configurationPopupOpen = false"
    @configuration-update="saveConfiguration($event); configurationPopupOpen = false" />

  <!-- Definitions Popup (no router navigation as router gets confused with multiple popups) -->
  <definitions-popup
    v-if="ready"
    v-model:opened="definitionsPopupOpen"
    :persistence="persistence"
    :editable="editable"
    @close="definitionsPopupOpen = false"
    @definitions-update="saveDefinitions($event); definitionsPopupOpen = false" />
</template>

<style lang="stylus">
.moduleconfig-popup
  .page-content
    overflow-x hidden !important
  .config-sheet, .parameter-group
    margin-top 0 !important

.modules
  width 100%
  .block
    padding-left var(--f7-safe-area-left)
    padding-right var(--f7-safe-area-right)
    .block-title
      padding-left calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left))
    .block-header
      padding-left calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left))
      padding-right calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-right))
  .swipeout-opened
    .sortable-handler
      display none
  .item-media .icon
    color var(--f7-theme-color)
  .media-list
    margin-bottom 0
  .list
    margin-top 0
    margin-bottom 0

.module-picker-container
  .item-content
    padding-left calc(var(--f7-list-item-padding-horizontal) / 2 + var(--f7-safe-area-left))
  .item-media
    padding 0
    margin-top 8px
    .icon
      font-size calc(var(--f7-list-font-size) + 4px)
  .media-item .item-inner
    margin-left calc(var(--f7-list-item-media-margin) - 8px)
  .item-title
    padding-left 8px
  .popup-list
    .item-inner:after
      display block
  .defaults-picker
    cursor pointer

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
  .item-inner::before
    visibility: hidden

.persistence-config-links
  margin-top: 2.5rem

.persistence-code-editor.v-codemirror
  position absolute
  height calc(100% - var(--f7-navbar-height) - var(--f7-toolbar-height))
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapState, mapWritableState, mapStores } from 'pinia'

import YAML from 'yaml'

import DirtyMixin from '../dirty-mixin'
import { FilterTypes, PredefinedStrategies, CommonCronStrategies } from '@/assets/definitions/persistence'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ConfigurationPopup from '@/pages/settings/persistence/configuration-popup.vue'
import DefinitionsPopup from '@/pages/settings/persistence/definitions-popup.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { usePersistenceEditStore } from '@/js/stores/usePersistenceEditStore'

export default {
  mixins: [DirtyMixin],
  components: {
    ItemPicker,
    ConfigurationPopup,
    DefinitionsPopup,
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
      persistenceYaml: '',
      ready: false,
      currentTab: 'design',

      // popup visibility
      configurationPopupOpen: false,
      definitionsPopupOpen: false,

      // props to pass to popups when opening
      currentConfiguration: null,
      currentConfigurationIndex: null,

      // Backup for definitions popup revert functionality
      definitionsBackup: null,
      definitionsChanged: false,

      notEditableMgs: 'This persistence configuration is not editable because it has been provisioned from a file.'
    }
  },
  computed: {
    pageTitle () {
      if (this.newPersistence) return 'Create new persistence configuration'
      if (!this.ready) return ''
      if (!this.editable) return `${this.serviceId} persistence configuration details`
      return `Edit ${this.serviceId} persistence configuration`
    },
    currentItemsWithAlias () {
      return Object.keys(this.persistence.aliases || {}).sort()
    },
    suggestedStrategyNames () {
      return this.suggestedStrategies.map((ss) => ss.name)
    },
    ...mapStores(useRuntimeStore),
    ...mapState(usePersistenceEditStore, ['persistenceDirty', 'suggestedStrategies', 'editable', 'newPersistence']),
    ...mapWritableState(usePersistenceEditStore, ['persistence'])
  },
  watch: {
    persistenceDirty: function () { this.dirty = this.persistenceDirty }
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
      if (this.persistenceDirty) {
        usePersistenceEditStore().revertPersistence()
      }
    },
    initializeNewPersistence () {
      const suggestedCronStrategies = this.suggestedStrategies.filter((s) => s.cronExpression)
      const suggestedCronStrategyNames = suggestedCronStrategies.map((s) => s.name)
      const commonCronStrategies = (this.CommonCronStrategies || []).filter((s) => (!suggestedCronStrategyNames.includes(s.name)))
      const cronStrategies = suggestedCronStrategies.concat(commonCronStrategies)
      this.persistence = {
        serviceId: this.serviceId,
        configs: [],
        aliases: {},
        cronStrategies: cronStrategies,
        filters: []
      }
    },
    /**
     * Load required data from the REST API.
     */
    load () {
      const loadingFinished = (success) => {
        if (!success) return

        nextTick(() => {
          if (this.newPersistence) {
            this.initializeNewPersistence()
          }
          if (this.FilterTypes && this.persistence) {
            this.FilterTypes.forEach((ft) => {
              if (!this.persistence[ft.name]) this.persistence[ft.name] = []
            })
          }
          this.ready = true
        })
      }
      usePersistenceEditStore().loadPersistence(this.serviceId, loadingFinished)
    },
    async save () {
      if (!this.editable) return
      if (this.currentTab === 'code') this.fromYaml()
      // Update the code tab
      if (this.persistenceYaml) this.toYaml()
      const saveConfirmed = await this.validateAliases()
      if (!saveConfirmed) return
      usePersistenceEditStore().savePersistence()
    },
    deletePersistence () {
      if (!this.editable) return
      f7.dialog.confirm(
        `Are you sure you want to delete persistence configuration for ${this.serviceId}?`,
        'Delete persistence configuration',
        () => {
          usePersistenceEditStore().deletePersistence()
          this.f7router.back({ force: true })
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
        f7.swipeout.open(swipeoutElement)
      }
    },
    configurationAllItemsTitle (items) {
      if (!items) return null
      const itemList = items.filter((item) => item === '*')
      return itemList.length ? 'All Items' : null
    },
    configurationGroupsTitle (items, exclude) {
      if (!items) return null
      let itemList = []
      if (exclude) {
        itemList = items.filter((item) => item.match(/^![^!*]+\*$/)).map((item) =>  item.slice(1, -1))
      } else {
        itemList = items.filter((item) => item.match(/^[^!*]+\*$/)).map((item) => item.slice(0, -1))
      }
      return itemList.length ? (exclude ? 'Not members of: ' : 'Members of: ') + itemList.join(', ') : null
    },
    configurationItemsTitle (items, exclude) {
      if (!items) return null
      let itemList = []
      if (exclude) {
        itemList = items.filter((item) => item.match(/^![^!*]+$/)).map((item) =>  item.slice(1))
      } else {
        itemList = items.filter((item) => item.match(/^[^!*]+$/))
      }
      return itemList.length ? (exclude ? 'Not : ' : '') + itemList.join(', ') : null
    },
    configurationStrategiesTitle (strategies) {
      if (!(strategies && strategies.length)) return null
      return strategies.join(', ')
    },
    configurationFiltersTitle (filters) {
      if (!(filters && filters.length)) return null
      return 'filters: ' + filters.join(', ')
    },
    editConfiguration (ev, index, configuration) {
      if (!this.editable) return

      this.currentConfigurationIndex = index
      this.currentConfiguration = configuration
      this.configurationPopupOpen = true
    },
    deleteConfiguration (ev, index) {
      if (!this.editable) return
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      f7.swipeout.delete(swipeoutElement, () => {
        this.persistence.configs.splice(index, 1)
      })
    },
    saveConfiguration (persistenceWithUpdatedConfig) {
      // Merge the returned persistence back into our main persistence
      // The nested popups have already modified cronStrategies/filters in persistenceWithUpdatedConfig
      const updatedConfig = persistenceWithUpdatedConfig.configs[
        this.currentConfigurationIndex ?? (persistenceWithUpdatedConfig.configs.length - 1)
      ]
      if (updatedConfig) {
        // Update the configuration
        const idx = this.persistence.configs.findIndex((cfg) => cfg.items.join() === updatedConfig.items.join())
        if (this.currentConfigurationIndex === null && idx !== -1) {
          f7.dialog.alert('A configuration for this/these Item(s) already exists!')
          return
        }
        if (this.currentConfigurationIndex === null) {
          this.persistence.configs.push(updatedConfig)
        } else {
          this.persistence.configs[this.currentConfigurationIndex] = updatedConfig
        }
      }

      // Merge any new strategies/filters that were added in the nested popups
      if (persistenceWithUpdatedConfig.cronStrategies) {
        this.persistence.cronStrategies = persistenceWithUpdatedConfig.cronStrategies
      }
      Object.keys(persistenceWithUpdatedConfig).forEach((key) => {
        if (key.includes('Filters')) {
          this.persistence[key] = persistenceWithUpdatedConfig[key]
        }
      })
    },
    updateAliasItems (items) {
      if (!this.editable) return
      const aliases = { ...this.persistence.aliases }
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
    editAlias (item, alias) {
      if (!this.editable) return
      this.persistence.aliases[item] = alias
    },
    checkAliasForDuplicates (item, alias) {
      if (!this.editable || !alias) return
      // Warn when alias already exists
      const duplicate = Object.entries(this.persistence.aliases).find(([i, a]) => (item !== i) && (alias === a))
      if (duplicate) {
        f7.dialog.alert('Alias ' + alias + ' for item ' + item + ' already exists for item ' + duplicate[0])
        this.persistence.aliases[item] = ''
      }
    },
    deleteAlias (ev, item) {
      if (!this.editable) return
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      f7.swipeout.delete(swipeoutElement, () => {
        delete this.persistence.aliases[item]
      })
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
    saveDefinitions (persistenceWithUpdates) {
      // Merge strategies and filters from the popup back into main persistence
      if (persistenceWithUpdates.cronStrategies) {
        this.persistence.cronStrategies = persistenceWithUpdates.cronStrategies
      }
      Object.keys(persistenceWithUpdates).forEach((key) => {
        if (key.includes('Filters')) {
          this.persistence[key] = persistenceWithUpdates[key]
        }
      })

      this.dirty = true
    },
    onEditorInput (value) {
      this.persistenceYaml = value
      this.dirty = true
    },
    toYaml () {
      const toCode = {
        configurations: this.persistence.configs,
        aliases: this.persistence.aliases,
        cronStrategies: this.persistence.cronStrategies
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
    this.CommonCronStrategies = CommonCronStrategies
  }
}
</script>
