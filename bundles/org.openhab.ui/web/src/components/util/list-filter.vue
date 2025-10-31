<template>
  <f7-list>
    <f7-list-item accordion-item>
      <template #title>
        Filter
        <template v-if="filtered">
          (active)
          <f7-link @click="resetFilters"
                   text="Reset filters"
                   class="margin-right"
                   href="javascript:void(0)" />
        </template>
      </template>
      <f7-accordion-content>
        <f7-list class="no-hairlines-between">
          <div v-for="(filter, type) in filters" :key="type">
            <f7-list-item group-title style="height: 2em;">
              Filter by {{ filter.label }}
            </f7-list-item>
            <f7-list-item class="padding-bottom">
              <div class="chip-wrap">
                <f7-chip v-for="(label, value) in filter.options"
                         :key="value"
                         :text="label"
                         :color="isFilteredBy(type, value) ? 'blue' : ''"
                         media-bg-color="blue"
                         style="margin-right: 6px; cursor: pointer;"
                         @click="toggleFilter(type, value)">
                  <template #media>
                    <f7-icon v-if="isFilteredBy(type, value)"
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

<style scoped>
.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 0;
}
</style>

<script>

/*
  This component provides a filter UI for a list of items.
  It allows users to filter the list based on various criteria.

  Usage:
    <list-filter ref="filters" :filters="filters" @toggled="handleFilterToggle" @reset="handleFilterReset" />

  Props:
    - filters: An object containing filter definitions, each with a label and options.
      Example, to define two filters: 'kind' and 'status' filters:
      {
        kind: {
          label: "Kind", // => Filter by Kind
          options: { editable: "Editable", readonly: "Read-only" } // { value: label, ... }
        },
        status: {
          label: "Status", // => Filter by Status
          options: { online: "Online", offline: "Offline" }
        }
      }

  Data/Properties:
    - selected: An object to track selected filters.
      Example: { kind: Set(['editable']), status: Set(['online']) }
      This tracks which values are selected for each filter type.
      e.g. this.$refs.componentRef.selected.kind.has('editable') returns true
      if 'editable' is selected in 'kind' filter.

  Computed:
    - filtered: Returns true if any filter has selections.

  Events:
    - toggled: Emitted when a filter is toggled, passing the type, value, and selection state.
    - reset: Emitted when all filters are reset.

  Methods:
    - isFilteredBy: Checks if a specific filter type has any selections, or if a specific value is selected.
      Example:
        isFilteredBy('kind') returns true if any 'kind' filter is selected.
        isFilteredBy('kind', 'readonly') returns true if 'readonly' is selected in 'kind'.
      It's easier to use the `selected` property directly, see above.

    - toggleFilter: Toggles the selection state of a filter value and emits the change.
*/
export default {
  props: ['filters'],
  emits: ['toggled', 'reset'],
  data () {
    return {
      selected: Object.keys(this.filters || {}).reduce((acc, key) => {
        acc[key] = new Set()
        return acc
      }, {})
    }
  },
  computed: {
    filtered () {
      return Object.keys(this.filters).some((type, _) => this.isFilteredBy(type))
    }
  },
  methods: {
    isFilteredBy (type, value) {
      const selections = this.selected[type]
      if (!selections) {
        console.warn(`Invalid filter type: '${type}'. This is probably a bug! filters:`, this.filters)
        return false
      }

      if (value !== undefined) {
        return selections.has(value)
      } else {
        return selections.size > 0
      }
    },
    toggleFilter (type, value) {
      const selections = this.selected[type]
      if (selections.has(value)) {
        selections.delete(value)
      } else {
        selections.add(value)
      }

      let selected = selections.has(value)
      this.$emit('toggled', this, type, value, selected)
    },
    resetFilters () {
      Object.keys(this.selected).forEach((type) => {
        this.selected[type].clear()
      })
      this.$emit('reset', this)
    }
  }
}
</script>
