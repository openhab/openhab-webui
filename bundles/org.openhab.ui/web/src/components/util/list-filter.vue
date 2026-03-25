<template>
  <f7-list class="list-filter">
    <f7-list-item accordion-item>
      <template #title>
        Filter
        <span v-if="anyFilters">
          (active)
          <f7-link @click="resetFilters" text="Reset Filters" class="margin-right" href="javascript:void(0)" />
        </span>
        <span v-if="anyAdvanced" class="show-advanced">
          <f7-link
            @click="showAdvanced = !showAdvanced"
            :text="showAdvanced ? 'Hide Advanced' : 'Show Advanced'"
            class="margin-right"
            href="javascript:void(0)" />
        </span>
      </template>
      <f7-accordion-content>
        <f7-list class="no-hairlines-between">
          <div v-for="(filter, type) in listedFilters" :key="type">
            <f7-list-item group-title style="height: 2em"> Filter by {{ filter.label }} </f7-list-item>
            <f7-list-item class="padding-bottom">
              <div v-if="Object.keys(filter.options ?? {}).length === 0" class="text-color-gray" style="font-size: 0.9em">
                None of the items have any {{ filter.label.toLowerCase() }} assigned
              </div>
              <div v-else class="chip-wrap">
                <f7-chip
                  v-for="(label, value) in filter.options"
                  :key="value"
                  :text="label"
                  :color="isFilteredBy(type, value) ? 'blue' : ''"
                  media-bg-color="blue"
                  style="margin-right: 6px; cursor: pointer"
                  @click="toggleFilter(type, value)">
                  <template #media>
                    <f7-icon
                      v-if="isFilteredBy(type, value)"
                      ios="f7:checkmark_circle_fill"
                      md="material:check_circle"
                      aurora="f7:checkmark_circle_fill" />
                  </template>
                </f7-chip>
              </div>
            </f7-list-item>
          </div>
        </f7-list>
      </f7-accordion-content>
    </f7-list-item>
  </f7-list>
</template>

<style scoped lang="stylus">
.list-filter
  .chip-wrap
    display flex
    flex-wrap wrap
    gap 6px 0

  span a
    padding-left 15px

  .accordion-item:not(.accordion-item-opened)
    .show-advanced
      display none
</style>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { type FilterDefinition } from '@/components/useSearch'

export type ListFilterSelected = Record<string, Set<string>>

// define props, model and emits
const props = defineProps<{
  filtersDefinitions: Record<string, FilterDefinition>
  selected: ListFilterSelected
}>()

const emits = defineEmits<{
  (e: 'update:selected', value: ListFilterSelected): void
  (e: 'reset'): void
}>()

const showAdvanced = ref(false)

// computed properties
const anyFilters = computed(() => {
  return Object.values(props.selected).some((set) => set.size > 0)
})

const anyAdvanced = computed(() => {
  return Object.entries(props.filtersDefinitions).some(
    ([type, filter]) => filter.advanced === true && Object.keys(filter.options ?? {}).length > 0
  )
})

const listedFilters = computed(() => {
  return Object.fromEntries(
    Object.entries(props.filtersDefinitions).filter(([type, filter]) => {
      const hasOptions = Object.keys(filter.options ?? {}).length > 0
      if ('advanced' in filter) {
        return filter.advanced === showAdvanced.value && hasOptions
      }
      return hasOptions
    })
  )
})

// watchers
watch(
  () => props.filtersDefinitions,
  (newFiltersDefinitions) => {
    const _selected: ListFilterSelected = { ...props.selected }
    // ensure that all filter types are present in the selected object
    Object.entries(newFiltersDefinitions).forEach(([type, filter]) => {
      const opts = (filter && filter.options) || {}
      const valid = new Set(Object.keys(opts))

      const _optionsSelected = _selected[type]

      if (_optionsSelected) {
        // Remove any selected values that are no longer valid
        for (const v of Array.from(_optionsSelected)) {
          if (!valid.has(v)) _optionsSelected.delete(v)
        }

        // If there are no options left, delete the selection entirely
        if (valid.size === 0 && _optionsSelected.size > 0) {
          delete _selected[type]
        }
      }
    })
    emits('update:selected', _selected)
  },
  { immediate: false, deep: true }
)

// methods
function isFilteredBy(type: string, value: string) {
  const typeSelections = props.selected[type]
  return typeSelections && typeSelections.has(value)
}

// events
function toggleFilter(type: string, value: string) {
  const _selected = { ...props.selected }
  if (!_selected[type]) {
    _selected[type] = new Set()
  }
  const typeSelections = _selected[type]

  if (!props.filtersDefinitions[type]) {
    console.warn(`Invalid filter type: '${type}'. This is probably a bug! filters:`, props.filtersDefinitions)
    return
  }

  if (typeSelections.has(value)) {
    typeSelections.delete(value)
  } else {
    if (props.filtersDefinitions[type].singleSelect) {
      typeSelections.clear()
    }
    typeSelections.add(value)
  }

  emits('update:selected', _selected)
}

function resetFilters() {
  emits('update:selected', {} as ListFilterSelected)
  emits('reset')
}
</script>
