<template>
  <f7-page
    ref="pagePersistenceEdit"
    class="persistence-edit-page"
    @keydown.stop.prevent.exact.ctrl.s="save"
    @keydown.stop.prevent.exact.meta.s="save">
    <f7-navbar>
      <oh-nav-content
        :title="pageTitle + dirtyIndicator"
        :editable
        :save-link="dirty ? 'Save' : null"
        back-link-url="/settings/persistence/"
        @save="save()"
        :f7router />
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
                <f7-link external color="blue" target="_blank" :href="`${websiteUrl}/link/persistence`">
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
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"> Strategies </f7-block-title>
              <f7-list class="skeleton-text skeleton-effect-blink">
                <f7-list-item />
              </f7-list>
              <!-- Default Strategies -->
              <strategy-picker class="skeleton-text skeleton-effect-blink" :cron-strategies="[]" :selected-strategies="[]" />
            </f7-block>
            <f7-block>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"> Filters </f7-block-title>
              <div v-for="ft in FilterTypes" :key="ft.name">
                <f7-block-title>
                  {{ ft.label }}
                </f7-block-title>
                <f7-list class="skeleton-text skeleton-effect-blink">
                  <f7-list-item />
                </f7-list>
              </div>
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
            <div class="padding-left">Note: {{ notEditableMsg }}</div>
          </f7-col>
          <f7-col class="modules">
            <!-- Configuration -->
            <f7-block>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)"> Configurations </f7-block-title>
              <f7-block-header style="padding-right: 16px"> Items to persist with strategies to use. </f7-block-header>
              <f7-list v-if="editable || persistence!.configs.length > 0" :media-list="editable" swipeout>
                <f7-list-item
                  v-for="(cfg, index) in persistence!.configs"
                  :key="cfg.items.join()"
                  :link="editable"
                  @click="(ev: MouseEvent) => editConfiguration(ev, index, cfg)"
                  swipeout>
                  <template #media>
                    <f7-link
                      v-if="editable"
                      icon-color="red"
                      icon-aurora="f7:minus_circle_filled"
                      icon-ios="f7:minus_circle_filled"
                      icon-md="material:remove_circle_outline"
                      @click.stop="showSwipeout" />
                  </template>
                  <template #title>
                    <div v-text="configurationAllItemsTitle(cfg.items)" />
                    <div v-text="configurationGroupsTitle(cfg.items)" />
                    <div v-text="configurationItemsTitle(cfg.items)" />
                    <div v-text="configurationGroupsTitle(cfg.items, true)" />
                    <div v-text="configurationItemsTitle(cfg.items, true)" />
                  </template>
                  <template #footer>
                    <div v-if="cfg.strategies?.length">{{ configurationStrategiesTitle(cfg.strategies) }}</div>
                    <div v-if="cfg.filters?.length">{{ configurationFiltersTitle(cfg.filters) }}</div>
                  </template>
                  <f7-swipeout-actions v-if="editable" right>
                    <f7-swipeout-button
                      @click.stop="(ev: MouseEvent) => deleteConfiguration(ev, index)"
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
                  subtitle="Add configuration"
                  @click="(ev: MouseEvent) => editConfiguration(ev, null, null)">
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
                      v-if="editable"
                      icon-color="red"
                      icon-aurora="f7:minus_circle_filled"
                      icon-ios="f7:minus_circle_filled"
                      icon-md="material:remove_circle_outline"
                      @click.stop="showSwipeout" />
                  </template>
                  <div class="alias-label">
                    {{ i }}
                  </div>
                  <div class="alias-input">
                    <f7-input
                      type="text"
                      placeholder="alias"
                      validate
                      :read-only="!editable"
                      pattern="[A-Za-z_][A-Za-z0-9_]*"
                      error-message="Required. Must not start with a number. A-Z,a-z,0-9,_ only"
                      :value="persistence?.aliases[i]"
                      @input="editAlias(i, $event.target.value)"
                      @blur="checkAliasForDuplicates(i, $event.target.value)"
                      @keydown.stop.prevent.tab="onAliasTab($event, index)" />
                  </div>
                  <f7-swipeout-actions v-if="editable" right>
                    <f7-swipeout-button
                      @click.stop="(ev: MouseEvent) => deleteAlias(ev, i)"
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
                    label="Select Items to Alias"
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
              <f7-list-button color="blue" @click="definitionsPopupOpen = true">
                {{ 'Manage Definitions' }}
              </f7-list-button>
              <f7-list-button v-if="!createMode" color="red" @click="deletePersistence"> Remove persistence configuration </f7-list-button>
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
          :tooltip="notEditableMsg" />
        <editor
          v-if="currentTab === 'code'"
          class="persistence-code-editor"
          mode="application/vnd.openhab.persistence+yaml"
          :value="persistenceYaml"
          @input="onEditorInput"
          :read-only="!editable"
          @save="save()" />
      </f7-tab>
    </f7-tabs>
  </f7-page>

  <!-- Configuration Popup (no router navigation as router gets confused with multiple popups) -->
  <configuration-popup
    v-if="ready && persistence"
    v-model:opened="configurationPopupOpen"
    :persistence="persistence"
    :suggested-strategies="suggestedStrategyNames"
    :item-configuration="currentConfiguration"
    @update:item-configuration="updateItemConfiguration"
    @add:item-configuration="addItemConfiguration"
    @update:definitions="updateDefinitions" />

  <!-- Definitions Popup (no router navigation as router gets confused with multiple popups) -->
  <definitions-popup
    v-if="ready && persistence"
    v-model:opened="definitionsPopupOpen"
    :persistence="persistence"
    @update:persistence="updatePersistence"
    :editable="editable" />
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

<script setup lang="ts">
import { defineAsyncComponent, ref, computed, onMounted, provide, type Ref } from 'vue'
import type { Router } from 'framework7'
import { f7 } from 'framework7-vue'

import YAML from 'yaml'

import { useDirty } from '../../useDirty'
import { useTabs } from '@/pages/useTabs'
import { CommonCronStrategies, FilterTypeName, persistenceKey, FilterTypes } from '@/assets/definitions/persistence'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import StrategyPicker from '@/pages/settings/persistence/strategy-picker.vue'
import ConfigurationPopup from '@/pages/settings/persistence/configuration-popup.vue'
import DefinitionsPopup from '@/pages/settings/persistence/definitions-popup.vue'
import { showConfirmDialog, showToast } from '@/js/dialog-promises'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import * as api from '@/api'
import { ApiError } from '@/js/hey-api'

const { dirty, dirtyIndicator, setupDirtyWatch } = useDirty('pagePersistenceEdit')
const { currentTab, switchTab } = useTabs()
currentTab.value = 'design' // default tab

const { websiteUrl } = useRuntimeStore()

let loading = false
const notEditableMsg = 'This persistence configuration is not editable because it has been provisioned from a file.'
const editor = defineAsyncComponent(() => import('@/components/config/controls/script-editor.vue'))

// Props and emits
const props = defineProps<{
  serviceId: string
  f7router: Router.Router
}>()

// Local state
const persistence = ref<api.PersistenceServiceConfiguration | null>(null)
const persistenceYaml = ref<string>('')
const ready = ref<boolean>(false)
const createMode = ref<boolean>(false)
const suggestedStrategies = ref<(api.PersistenceStrategy | api.PersistenceCronStrategy)[]>([])
const configurationPopupOpen = ref<boolean>(false)
const definitionsPopupOpen = ref<boolean>(false)

// props to pass to popups when opening
const currentConfiguration = ref<null | any>(null)

// provide access to the persistence object for duplicate checks in popups without prop drilling
// Cast: popups are only reachable after persistence is loaded and non-null
provide(persistenceKey, persistence as Ref<api.PersistenceServiceConfiguration>)

// Watches
setupDirtyWatch(persistence)

// Computed
const pageTitle = computed(() => {
  if (createMode.value) return `New Persistence Configuration [${props.serviceId}]`
  if (!ready.value) return ''
  if (!editable.value) return `Persistence Configuration [${props.serviceId}]`
  return `Edit Persistence Configuration [${props.serviceId}]`
})

const currentItemsWithAlias = computed(() => {
  return Object.keys(persistence.value?.aliases || {}).sort()
})

const suggestedStrategyNames = computed(() => {
  return suggestedStrategies.value.map((ss) => ss.name)
})

const editable = computed(() => {
  return persistence.value?.editable || false
})

// Lifecycle
onMounted(() => {
  void load()
})

// Methods
async function load() {
  const success = await loadPersistence(props.serviceId)

  if (!success) {
    // Failed to load - go back or show error
    return
  }

  // Success or new persistence - initialize if needed
  if (createMode.value) {
    initializeNewPersistence()
  }

  dirty.value = false
  ready.value = true
}

async function loadPersistence(serviceId: string): Promise<boolean> {
  if (loading) return false
  loading = true

  // Load suggestions in parallel (don't await, failure is OK)
  suggestedStrategies.value =
    (await api
      .getPersistenceServiceStrategySuggestions({ serviceId })
      .then((suggestions) => {
        return suggestions || []
      })
      .catch(() => {
        console.log('Getting persistence strategy suggestions failed for serviceId:', serviceId, '- default to no suggestions')
      })) || []

  try {
    createMode.value = false
    persistence.value = (await api.getPersistenceServiceConfiguration({ serviceId })) || null
    if (!persistence.value || Object.keys(persistence.value).length === 0) {
      // Empty object would be because of a 204
      console.log('Persistence configuration not found (204) for serviceId:', serviceId, '- creating new configuration')
      createMode.value = true
    }
    loading = false
    return true
  } catch (err) {
    // Only handle 404 from persistence endpoint as "new persistence"
    if (err instanceof ApiError && err.response.status === 404) {
      console.log('Persistence configuration not found (404) for serviceId:', serviceId, '- creating new configuration')
      createMode.value = true
      loading = false
      return true
    } else {
      console.error('Error loading persistence configuration for serviceId:', serviceId, '- Error:', err)
      showToast('Error loading persistence configuration')
      loading = false
      return false
    }
  }
}

function initializeNewPersistence() {
  const suggestedCronStrategies = suggestedStrategies.value.filter((s): s is api.PersistenceCronStrategy => 'cronExpression' in s)
  const suggestedCronStrategyNames = suggestedCronStrategies.map((s) => s.name)
  const commonCronStrategies = (CommonCronStrategies || []).filter((s) => !suggestedCronStrategyNames.includes(s.name))
  const cronStrategies = suggestedCronStrategies.concat(commonCronStrategies)
  persistence.value = {
    serviceId: props.serviceId,
    configs: [],
    aliases: {},
    cronStrategies: cronStrategies,
    defaults: [],
    timeFilters: [],
    equalsFilters: [],
    thresholdFilters: [],
    includeFilters: [],
    editable: true
  } satisfies api.PersistenceServiceConfiguration
}

async function save() {
  if (!editable.value || !persistence.value) return

  try {
    if (currentTab.value === 'code') fromYaml()
  } catch (err) {
    console.error('Error parsing YAML for persistence configuration:', err)
    showToast('Error parsing YAML for persistence configuration, not saved.')
    return
  }

  // Keep the code tab synchronized with current in-memory config
  if (persistenceYaml.value) toYaml()

  if (!(await validateAliases())) return

  try {
    await api.putPersistenceServiceConfiguration({
      serviceId: props.serviceId,
      persistenceServiceConfiguration: persistence.value
    })
    createMode.value = false
    dirty.value = false
    showToast('Persistence configuration saved')
  } catch (err) {
    console.error('Unable to save persistence configuration:', err)
    showToast('Error saving persistence configuration')
  }
}

async function deletePersistence() {
  if (!editable.value || !persistence.value) return
  if (
    !(await showConfirmDialog(
      `Are you sure you want to delete persistence configuration for ${props.serviceId}?`,
      'Delete persistence configuration'
    ))
  )
    return

  try {
    await api.deletePersistenceServiceConfiguration({ serviceId: props.serviceId })
    showToast('Persistence configuration deleted')
    props.f7router.navigate('/settings/persistence/', { reloadCurrent: true, ignoreCache: true })
  } catch (err) {
    console.error('Error deleting persistence configuration for serviceId:', props.serviceId, '- Error:', err)
    showToast('Error deleting persistence configuration')
  }
}

function showSwipeout(ev: MouseEvent) {
  const swipeoutElement = (ev.target as HTMLElement).closest('.swipeout')
  if (swipeoutElement instanceof HTMLElement) {
    f7.swipeout.open(swipeoutElement)
  }
}

const configurationAllItemsTitle = computed(() => (items: string[]) => {
  if (!items) return null
  const itemList = items.filter((item) => item === '*')
  return itemList.length ? 'All Items' : null
})

const configurationGroupsTitle = computed(() => (items: string[], exclude: boolean = false) => {
  if (!items) return null
  let itemList = []
  if (exclude) {
    itemList = items.filter((item) => item.match(/^![^!*]+\*$/)).map((item) => item.slice(1, -1))
  } else {
    itemList = items.filter((item) => item.match(/^[^!*]+\*$/)).map((item) => item.slice(0, -1))
  }
  return itemList.length ? (exclude ? 'Not members of: ' : 'Members of: ') + itemList.join(', ') : null
})

const configurationItemsTitle = computed(() => (items: string[], exclude: boolean = false) => {
  if (!items) return null
  let itemList = []
  if (exclude) {
    itemList = items.filter((item) => item.match(/^![^!*]+$/)).map((item) => item.slice(1))
  } else {
    itemList = items.filter((item) => item.match(/^[^!*]+$/))
  }
  return itemList.length ? (exclude ? 'Not: ' : '') + itemList.join(', ') : null
})

const configurationStrategiesTitle = computed(() => (strategies: string[]) => {
  if (!(strategies && strategies.length)) return null
  return strategies.join(', ')
})

const configurationFiltersTitle = computed(() => (filters: string[]) => {
  if (!(filters && filters.length)) return null
  return 'filters: ' + filters.join(', ')
})

function editConfiguration(ev: MouseEvent, index: number | null, configuration: api.PersistenceItemConfiguration | null) {
  if (!editable.value) return

  currentConfiguration.value = configuration
  configurationPopupOpen.value = true
}

function deleteConfiguration(ev: MouseEvent, index: number) {
  if (!editable.value) return
  const swipeoutElement = (ev.target as HTMLElement).closest('.swipeout')
  if (swipeoutElement instanceof HTMLElement) {
    f7.swipeout.delete(swipeoutElement, () => {
      persistence.value!.configs.splice(index, 1)
    })
  }
}

function addItemConfiguration(itemConfiguration: api.PersistenceItemConfiguration) {
  if (!editable.value || !persistence.value) return
  // Check for duplicate configuration
  const idx = persistence.value.configs.findIndex((cfg) => cfg.items.join() === itemConfiguration.items.join())
  if (idx !== -1) {
    f7.dialog.alert('A configuration for this/these Item(s) already exists!')
    return
  }
  persistence.value.configs.push(itemConfiguration)
}

function updateItemConfiguration(itemConfiguration: api.PersistenceItemConfiguration | null) {
  if (!editable.value || !persistence.value || !itemConfiguration) return
  const idx = persistence.value.configs.findIndex((cfg) => cfg.items.join() === itemConfiguration.items.join())
  if (idx !== -1) {
    persistence.value.configs[idx] = itemConfiguration
  }
}

function updateAliasItems(items: string[]) {
  if (!editable.value || !persistence.value) return
  const newAliases: Record<string, string> = {}
  items.forEach((item) => {
    newAliases[item] = persistence.value!.aliases[item] ?? ''
  })
  persistence.value.aliases = newAliases
}

function editAlias(item: string, alias: string) {
  if (!editable.value || !persistence.value) return
  persistence.value.aliases[item] = alias
}

function checkAliasForDuplicates(item: string, alias: string) {
  if (!editable.value || !alias || !persistence.value) return
  // Warn when alias already exists for a different item
  // TODO add support to ensure the alias does not match an existing item name
  const duplicate = Object.keys(persistence.value.aliases).find((key) => item !== key && persistence.value!.aliases[key] === alias)
  if (duplicate) {
    f7.dialog.alert('Alias ' + alias + ' for item ' + item + ' already exists for item ' + duplicate)
    persistence.value.aliases[item] = ''
  }
}

function deleteAlias(ev: MouseEvent, item: string) {
  if (!editable.value || !persistence.value) return

  const swipeoutElement = (ev.target as HTMLElement).closest('.swipeout')
  if (swipeoutElement instanceof HTMLElement) {
    f7.swipeout.delete(swipeoutElement, () => {
      const { [item]: _, ...rest } = persistence.value!.aliases
      persistence.value!.aliases = rest
    })
  }
}

async function validateAliases() {
  if (!persistence.value) return false

  const entries = Object.entries(persistence.value.aliases)
  if (entries.length === 0) return true
  // Check for invalid alias format
  const invalidEntry = entries.find(([, a]) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(a))
  if (invalidEntry) {
    if (!(await showConfirmDialog(`Alias not valid for item ${invalidEntry[0]}!\nSave anyway?`, 'Alias Validation Error'))) return false
  }
  // Check for duplicate aliases
  const seenAliases = new Map<string, string>() // alias -> itemName
  for (const [item, alias] of entries) {
    if (alias && seenAliases.has(alias)) {
      const firstItem = seenAliases.get(alias)!
      if (
        !(await showConfirmDialog(
          `Alias "${alias}" for item "${item}" already exists for item "${firstItem}".\nSave anyway?`,
          'Alias Validation Error'
        ))
      )
        return false
    }
    if (alias) {
      seenAliases.set(alias, item)
    }
  }
  return true
}

function updateDefinitions(persistenceWithUpdates: api.PersistenceServiceConfiguration) {
  if (!editable.value || !persistence.value) return
  // Merge strategies and filters from the popup back into main persistence
  persistence.value.cronStrategies = persistenceWithUpdates.cronStrategies
  Object.values(FilterTypeName).forEach((filterTypeName) => {
    persistence.value![filterTypeName] = persistenceWithUpdates[filterTypeName]
  })
}

function updatePersistence(updatedPersistence: api.PersistenceServiceConfiguration) {
  if (!editable.value || !persistence.value) return
  persistence.value = updatedPersistence
}

function onEditorInput(value: string) {
  persistenceYaml.value = value
}

function toYaml(): boolean {
  if (!persistence.value) return false

  const toCode = {
    configs: persistence.value.configs,
    aliases: persistence.value.aliases,
    cronStrategies: persistence.value.cronStrategies,
    [FilterTypeName.EqualsFilters]: persistence.value.equalsFilters,
    [FilterTypeName.TimeFilters]: persistence.value.timeFilters,
    [FilterTypeName.ThresholdFilters]: persistence.value.thresholdFilters,
    [FilterTypeName.IncludeFilters]: persistence.value.includeFilters
  }
  persistenceYaml.value = YAML.stringify(toCode)
  return true
}

function fromYaml() {
  if (!editable.value || !persistence.value) return true
  const updatedPersistence: unknown = YAML.parse(persistenceYaml.value)

  if (typeof updatedPersistence !== 'object' || updatedPersistence === null) {
    throw new Error('Invalid YAML format: expected an object at the root level.')
  }

  // TODO - better validation
  persistence.value.configs = 'configs' in updatedPersistence ? (updatedPersistence.configs as api.PersistenceItemConfiguration[]) : []
  persistence.value.aliases = 'aliases' in updatedPersistence ? (updatedPersistence.aliases as typeof persistence.value.aliases) : {}
  persistence.value.cronStrategies =
    'cronStrategies' in updatedPersistence ? (updatedPersistence.cronStrategies as api.PersistenceCronStrategy[]) : []
  persistence.value[FilterTypeName.EqualsFilters] =
    FilterTypeName.EqualsFilters in updatedPersistence ? (updatedPersistence[FilterTypeName.EqualsFilters] as api.PersistenceFilter[]) : []
  persistence.value[FilterTypeName.TimeFilters] =
    FilterTypeName.TimeFilters in updatedPersistence ? (updatedPersistence[FilterTypeName.TimeFilters] as api.PersistenceFilter[]) : []
  persistence.value[FilterTypeName.ThresholdFilters] =
    FilterTypeName.ThresholdFilters in updatedPersistence
      ? (updatedPersistence[FilterTypeName.ThresholdFilters] as api.PersistenceFilter[])
      : []
  persistence.value[FilterTypeName.IncludeFilters] =
    FilterTypeName.IncludeFilters in updatedPersistence
      ? (updatedPersistence[FilterTypeName.IncludeFilters] as api.PersistenceFilter[])
      : []

  return true
}

function onAliasTab(ev: KeyboardEvent, index: number) {
  const pageElement = (ev.target as HTMLElement | null)?.closest('.persistence-edit-page')
  if (!pageElement) return

  const aliasInputs = pageElement.querySelectorAll<HTMLInputElement>('.list-alias-item .alias-input input')
  const total = aliasInputs.length
  if (!total) return

  const direction = ev.shiftKey ? -1 : 1
  const targetIndex = (index + direction + total) % total
  aliasInputs[targetIndex]?.focus()
}
</script>
