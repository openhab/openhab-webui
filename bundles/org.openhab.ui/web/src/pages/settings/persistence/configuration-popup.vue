<template>
  <f7-popup :opened="opened" @popup:opened="onOpen" class="configuration-popup moduleconfig-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="closePopup" />
        </f7-nav-left>
        <f7-nav-title> Configure Persistence </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="localItemConfiguration.items.length > 0" @click="onDone">
            {{ createMode ? 'Add' : 'Done' }}
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-margin no-padding">
        <f7-col>
          <f7-block-title medium class="padding-bottom"> Items </f7-block-title>
          <f7-list>
            <f7-list-item title="Persist all Items">
              <template #after>
                <f7-toggle v-model:checked="allItemsSelected" />
              </template>
            </f7-list-item>
          </f7-list>
          <f7-list>
            <f7-list-group>
              <item-picker
                key="groups"
                label="Select groups"
                name="groupItems"
                :multiple="true"
                filterType="Group"
                :disabled="allItemsSelected ? true : null"
                :value="groupItems"
                @input="groupItems = $event" />
            </f7-list-group>
            <f7-list-item>... whose members are to be persisted.</f7-list-item>
          </f7-list>
          <f7-list>
            <f7-list-group>
              <item-picker
                key="items"
                label="Select Items"
                name="items"
                :multiple="true"
                :disabled="allItemsSelected ? true : null"
                :value="items"
                @input="items = $event" />
            </f7-list-group>
            <f7-list-item>... to be persisted.</f7-list-item>
          </f7-list>
          <f7-list>
            <f7-list-group>
              <item-picker
                key="exclude-groups"
                label="Select exclude groups"
                name="excludeGroupItems"
                :multiple="true"
                filterType="Group"
                :disabled="!anySelected ? true : null"
                :value="excludeGroupItems"
                @input="excludeGroupItems = $event" />
            </f7-list-group>
            <f7-list-item>... whose members are to be excluded from persistence.</f7-list-item>
          </f7-list>
          <f7-list>
            <f7-list-group>
              <item-picker
                key="exclude-items"
                label="Select exclude Items"
                name="excludeItems"
                :multiple="true"
                :disabled="!anySelected ? true : null"
                :value="excludeItems"
                @input="excludeItems = $event" />
            </f7-list-group>
            <f7-list-item>... to be excluded from persistence.</f7-list-item>
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium class="padding-bottom"> Strategies </f7-block-title>
          <strategy-picker v-model:cron-strategies="cronStrategies" v-model:selected-strategies="localItemConfiguration.strategies" />
        </f7-col>
        <f7-col>
          <f7-block-title medium class="padding-bottom"> Filters </f7-block-title>
          <filter-picker v-model:filter-definitions="filterDefinitions" v-model:selected="localItemConfiguration.filters" />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { f7 } from 'framework7-vue'

import ItemPicker from '@/components/config/controls/item-picker.vue'
import StrategyPicker from '@/pages/settings/persistence/strategy-picker.vue'
import FilterPicker from '@/pages/settings/persistence/filter-picker.vue'

import { FilterTypeName, type FiltersDefinition, emptyPersistenceServiceConfig } from '@/assets/definitions/persistence'
import * as api from '@/api'
import cloneDeep from 'lodash/cloneDeep'

// Props and emits
const opened = defineModel<boolean>('opened')
const itemConfiguration = defineModel<api.PersistenceItemConfiguration | null>('item-configuration', { required: true })
const props = defineProps<{
  persistence: api.PersistenceServiceConfiguration
  suggestedStrategies: string[]
}>()
const emits = defineEmits<{
  (e: 'add:itemConfiguration', itemConfiguration: api.PersistenceItemConfiguration): void
  (e: 'update:definitions', persistence: api.PersistenceServiceConfiguration): void
}>()

// Local state
const localItemConfiguration = ref<api.PersistenceItemConfiguration>(createNewItemPersistenceConfig())
const localPersistence = ref<api.PersistenceServiceConfiguration>(cloneDeep(emptyPersistenceServiceConfig))
const definitionsDirty = ref<boolean>(false)

const createMode = computed(() => {
  return itemConfiguration.value === null
})

const cronStrategies = computed<api.PersistenceCronStrategy[]>({
  get() {
    return localPersistence.value.cronStrategies
  },
  set(newStrategies: api.PersistenceCronStrategy[]) {
    localPersistence.value.cronStrategies = newStrategies
    definitionsDirty.value = true
  }
})

const filterDefinitions = computed({
  get: () => {
    return {
      [FilterTypeName.EqualsFilters]: localPersistence.value.equalsFilters,
      [FilterTypeName.IncludeFilters]: localPersistence.value.includeFilters,
      [FilterTypeName.ThresholdFilters]: localPersistence.value.thresholdFilters,
      [FilterTypeName.TimeFilters]: localPersistence.value.timeFilters
    } satisfies FiltersDefinition
  },
  set: (newDefinitions: FiltersDefinition) => {
    localPersistence.value.equalsFilters = newDefinitions[FilterTypeName.EqualsFilters]
    localPersistence.value.includeFilters = newDefinitions[FilterTypeName.IncludeFilters]
    localPersistence.value.thresholdFilters = newDefinitions[FilterTypeName.ThresholdFilters]
    localPersistence.value.timeFilters = newDefinitions[FilterTypeName.TimeFilters]
    definitionsDirty.value = true
  }
})

// Computed properties
const groupItems = computed({
  get() {
    return localItemConfiguration.value.items
      .filter((i) => i.length > 1 && !i.startsWith('!') && i.endsWith('*'))
      .map((i) => i.slice(0, -1))
  },
  set(newGroupItems) {
    localItemConfiguration.value.items = itemConfig(
      allItemsSelected.value,
      newGroupItems.sort((a, b) => a.localeCompare(b)),
      items.value,
      excludeGroupItems.value,
      excludeItems.value
    )
  }
})

const items = computed({
  get() {
    return localItemConfiguration.value.items.filter((i) => !i.startsWith('!') && !i.endsWith('*'))
  },
  set(newItems) {
    localItemConfiguration.value.items = itemConfig(
      allItemsSelected.value,
      groupItems.value,
      newItems.sort((a, b) => a.localeCompare(b)),
      excludeGroupItems.value,
      excludeItems.value
    )
  }
})

const excludeGroupItems = computed({
  get() {
    return localItemConfiguration.value.items.filter((i) => i.startsWith('!') && i.endsWith('*')).map((i) => i.slice(1, -1))
  },
  set(newExcludeGroupItems) {
    localItemConfiguration.value.items = itemConfig(
      allItemsSelected.value,
      groupItems.value,
      items.value,
      newExcludeGroupItems.sort((a, b) => a.localeCompare(b)),
      excludeItems.value
    )
  }
})

const excludeItems = computed({
  get() {
    return localItemConfiguration.value.items.filter((i) => i.startsWith('!') && !i.endsWith('*')).map((i) => i.slice(1))
  },
  set(newExcludeItems) {
    localItemConfiguration.value.items = itemConfig(
      allItemsSelected.value,
      groupItems.value,
      items.value,
      excludeGroupItems.value,
      newExcludeItems.sort((a, b) => a.localeCompare(b))
    )
  }
})

const allItemsSelected = computed({
  get() {
    return localItemConfiguration.value.items.includes('*')
  },
  set(newAllItemsSelected) {
    localItemConfiguration.value.items = itemConfig(
      newAllItemsSelected,
      groupItems.value,
      items.value,
      excludeGroupItems.value,
      excludeItems.value
    )
  }
})

const anySelected = computed(() => {
  return allItemsSelected.value || groupItems.value.length > 0 || items.value.length > 0
})

// Methods
function createNewItemPersistenceConfig() {
  return {
    items: ['*'],
    strategies: [...props.suggestedStrategies],
    filters: []
  } satisfies api.PersistenceItemConfiguration
}

function itemConfig(allItemsSelected: boolean, groupItems: string[], items: string[], excludeGroupItems: string[], excludeItems: string[]) {
  return (allItemsSelected ? ['*'] : [])
    .concat(groupItems.map((i) => i + '*'))
    .concat(items)
    .concat(excludeGroupItems.map((i) => '!' + i + '*'))
    .concat(excludeItems.map((i) => '!' + i))
}

function closePopup() {
  opened.value = false
}

// Event handlers
function onOpen() {
  localItemConfiguration.value = itemConfiguration.value ? cloneDeep(itemConfiguration.value) : createNewItemPersistenceConfig()
  localPersistence.value = cloneDeep(props.persistence)
  if (localItemConfiguration.value.strategies.length === 0) {
    localItemConfiguration.value.strategies = [...props.suggestedStrategies]
  }
  definitionsDirty.value = false
}

function onDone() {
  if (!anySelected.value) {
    f7.dialog.alert('Please select Items')
    return
  }

  if (definitionsDirty.value) {
    emits('update:definitions', localPersistence.value)
  }

  if (createMode.value) {
    emits('add:itemConfiguration', cloneDeep(localItemConfiguration.value))
  } else {
    itemConfiguration.value = cloneDeep(localItemConfiguration.value)
  }

  closePopup()
}
</script>
