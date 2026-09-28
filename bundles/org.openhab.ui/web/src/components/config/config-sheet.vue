<template>
  <f7-block v-if="parameters" class="config-sheet no-margin" ref="sheet">
    <div v-if="showFilterControls" class="config-sheet-filters">
      <f7-searchbar
        v-if="showSearchbar"
        ref="searchbar"
        custom-search
        :backdrop="false"
        placeholder="Search configuration"
        :disable-button-text="null"
        @searchbar:search="onSearch"
        @searchbar:clear="clearSearch" />
      <div class="advanced-filter-container">
        <f7-chip
          v-if="hasAdvanced"
          media-bg-color="theme-alt"
          :color="chipColor"
          :outline="chipOutline"
          class="advanced-chip not-selectable"
          text="Advanced"
          @click="toggleAdvancedMode">
          <template #media>
            <span class="dropdown-trigger" @click.stop="isDropdownOpen = !isDropdownOpen">
              <f7-icon ios="f7:chevron_down" md="material:arrow_drop_down" aurora="f7:chevron_down" />
            </span>
          </template>
        </f7-chip>

        <div v-if="isDropdownOpen" class="dropdown-backdrop" @click="isDropdownOpen = false"></div>

        <div v-if="isDropdownOpen" class="advanced-dropdown-menu">
          <f7-list list-strong inset-ios class="no-margin no-hairlines">
            <f7-list-item
              :title="`Modified only (${advancedNonDefaultCount})`"
              link
              no-chevron
              :disabled="advancedNonDefaultCount === 0"
              :class="{ 'selected-item': advancedMode === 'modified' && advancedNonDefaultCount > 0 }"
              @click="setAdvancedMode('modified')">
              <template #media>
                <span class="selection-dot" :style="{ opacity: advancedMode === 'modified' && advancedNonDefaultCount > 0 ? 1 : 0 }" />
              </template>
            </f7-list-item>

            <f7-list-item
              title="Show all"
              link
              no-chevron
              :class="{ 'selected-item': advancedMode === 'all' }"
              @click="setAdvancedMode('all')">
              <template #media>
                <span class="selection-dot" :style="{ opacity: advancedMode === 'all' ? 1 : 0 }" />
              </template>
            </f7-list-item>

            <f7-list-item
              title="Hide all"
              link
              no-chevron
              :class="{ 'selected-item': advancedMode === 'hidden' }"
              @click="setAdvancedMode('hidden')">
              <template #media>
                <span class="selection-dot" :style="{ opacity: advancedMode === 'hidden' ? 1 : 0 }" />
              </template>
            </f7-list-item>
          </f7-list>
        </div>
      </div>
    </div>

    <group-box v-if="searchQuery && !filteredDisplayedParameters.length" class="text-color-gray">
      <f7-list>
        <f7-list-item title="No configuration parameters match the current filter." />
      </f7-list>
    </group-box>

    <f7-col v-if="ungroupedParametersExists">
      <f7-block width="100" class="parameter-group no-margin no-padding">
        <group-box :title :accordion="accordion">
          <f7-list v-if="!ungroupedDisplayedParameters.length" class="text-color-gray">
            <f7-list-item v-if="!ungroupedAdvancedParametersExists" title="There are no general configuration parameters for this item." />
            <f7-list-item v-else title="There are no basic general configuration parameters." />
          </f7-list>
          <config-parameter
            v-for="parameter in ungroupedDisplayedParameters"
            :key="parameter.name"
            :config-description="parameter"
            :value="configurationWithDefaults[parameter.name]"
            :parameters="parameters"
            :configuration="configurationWithDefaults"
            :read-only="readOnly"
            :status="parameterStatus(parameter)"
            :f7router="f7router"
            @update="(value) => updateParameter(parameter, value)" />
        </group-box>
      </f7-block>
    </f7-col>
    <f7-col v-if="filteredDisplayedParameterGroups.length">
      <f7-block v-for="group in filteredDisplayedParameterGroups" width="100" class="parameter-group" :key="group.name">
        <f7-row>
          <group-box :title="group.label" :description="group.description">
            <config-parameter
              v-for="parameter in filteredDisplayedParameters.filter((p) => p.groupName === group.name)"
              :key="parameter.name"
              :config-description="parameter"
              :value="configurationWithDefaults[parameter.name]"
              :parameters="parameters"
              :configuration="configurationWithDefaults"
              :read-only="readOnly"
              :status="parameterStatus(parameter)"
              :f7router="f7router"
              @update="(value) => updateParameter(parameter, value)" />
          </group-box>
        </f7-row>
      </f7-block>
    </f7-col>
  </f7-block>
</template>

<style lang="stylus">
.config-sheet
  margin-left calc(-1*var(--f7-block-padding-horizontal))
  padding-left 0 !important
  padding-right 0 !important

.config-sheet-filters
  display flex
  align-items center
  gap 8px
  padding 8px var(--f7-block-padding-horizontal)

  .searchbar
    flex 1 1 auto
    min-width 0
    margin 0
    padding 0
    background transparent
    box-shadow none

    &:before, &:after
      display none !important

  .searchbar-inner
    padding 0

  .searchbar-input-wrap
    margin 0

  .advanced-filter-container
    position relative
    display flex
    align-items center

  .advanced-chip
    margin-left auto
    cursor pointer
    border 1px solid var(--f7-chip-border-color, rgba(0, 0, 0, 0.2)) !important

    &:not(.color-theme-alt)
      background-color var(--f7-chip-bg-color, rgba(0, 0, 0, 0.06)) !important
      color var(--f7-text-color, inherit)

    &.color-theme-alt
      border-color var(--f7-theme-color-alt, #2196f3) !important

    .dropdown-trigger
      display inline-flex
      align-items center
      justify-content center
      padding 0 2px
      border-radius 50%
      &:hover
        background rgba(0, 0, 0, 0.12)

  .not-selectable
    -webkit-user-select none
    -moz-user-select none
    -ms-user-select none
    user-select none

.dropdown-backdrop
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  z-index 400
  background transparent

.advanced-dropdown-menu
  position absolute
  top calc(100% + 6px)
  right 0
  z-index 500
  min-width 180px
  background var(--f7-popover-bg-color, var(--f7-card-bg-color))
  box-shadow 0 4px 20px rgba(0, 0, 0, 0.15)
  border-radius var(--f7-card-border-radius, 10px)
  overflow hidden

  .list .item-title
    font-size 14px

  .selected-item
    color var(--f7-theme-color-alt, #2196f3)
    background-color color-mix(unquote('in') srgb, var(--f7-theme-color-alt, #2196f3) 8%, transparent)

  .item-media
    min-width 0 !important
    padding 0 !important
    margin-right 2px !important
    justify-content center

  .selection-dot
    width 6px
    height 6px
    border-radius 50%
    background-color var(--f7-theme-color-alt, #2196f3)
    transition opacity 0.15s ease

.parameter-group
  padding-right 0 !important
  padding-left 0 !important
  .smart-select > .item-content > .item-inner:after
    display none !important
  .item-content .item-inner
    overflow-x auto
    overflow-y hidden

.item-input-info
    white-space normal
</style>

<script>
import { actionParams } from '@/assets/definitions/widgets/actions'
import { defineAsyncComponent } from 'vue'
import { f7 } from 'framework7-vue'

export default {
  props: {
    title: {
      type: String,
      default: 'Configuration'
    },
    accordion: {
      type: Boolean,
      default: false
    },
    parameterGroups: Array,
    parameters: Array,
    configuration: Object,
    status: Array,
    readOnly: Boolean,
    setEmptyConfigAsNull: Boolean,
    setEmptyArrayAsArray: Boolean,
    f7router: Object
  },
  emits: ['updated'],
  components: {
    'config-parameter': defineAsyncComponent(() => import(/* webpackChunkName: "config-parameter" */ './config-parameter.vue'))
  },
  data() {
    return {
      userAdvancedMode: null, // null = smart default based on modified count
      isDropdownOpen: false,
      searchQuery: '',
      // Keeps advanced fields visible while editing—even if reverted back to default values—
      // to prevent Vue from unmounting the field out from under the user's cursor.
      retainedKeys: []
    }
  },
  computed: {
    configurationWithDefaults() {
      const conf = Object.assign({}, this.configuration)
      this.parameters.forEach((p) => {
        if (conf[p.name] === undefined && (p.default ?? p.defaultValues !== undefined)) {
          if (typeof p.default === 'function') {
            conf[p.name] = p.default(this.configuration)
          } else if (p.multiple) {
            conf[p.name] = p.defaultValues
          } else {
            conf[p.name] = p.default
          }
        }
      })
      return conf
    },
    hasAdvanced() {
      return this.parameters.length > 0 && this.parameters.some((p) => p.advanced)
    },
    advancedMode() {
      if (this.userAdvancedMode !== null) {
        return this.userAdvancedMode
      }
      // Prevent dropping to 'hidden' mode while active session edits are being retained
      return this.advancedNonDefaultCount > 0 || this.retainedKeys.length > 0 ? 'modified' : 'hidden'
    },
    chipColor() {
      if (this.advancedMode === 'hidden') return undefined
      return 'theme-alt'
    },
    chipOutline() {
      return this.advancedMode !== 'all'
    },
    showSearchbar() {
      return this.allParameters.length > 1
    },
    showFilterControls() {
      return this.hasAdvanced || this.showSearchbar
    },
    displayedParameterGroups() {
      if (!this.parameterGroups || !this.parameterGroups.length) return []
      if (this.advancedMode === 'hidden') return this.parameterGroups.filter((pg) => !pg.advanced)
      return this.parameterGroups
    },
    allParameters() {
      if (!this.parameters.length) return []
      let finalParameters = [...this.parameters]
      if (this.parameterGroups && this.parameterGroups.some((g) => g.context === 'action')) {
        this.parameterGroups
          .filter((g) => g.context === 'action')
          .forEach((g) => {
            const prefix = g.name.replace(/action/gi, '')
            finalParameters = [...finalParameters, ...actionParams(g.name, prefix)]
          })
      }
      return finalParameters
    },
    baseParameters() {
      return this.allParameters.filter((p) => !p.advanced)
    },
    advancedParameters() {
      return this.allParameters.filter((p) => p.advanced)
    },
    advancedNonDefaultCount() {
      return this.advancedParameters.filter((p) => this.isNonDefault(p)).length
    },
    displayedParameters() {
      if (this.advancedMode === 'all') return this.allParameters
      if (this.advancedMode === 'hidden') return this.baseParameters
      return [...this.baseParameters, ...this.advancedParameters.filter((p) => this.isNonDefault(p) || this.retainedKeys.includes(p.name))]
    },
    filteredDisplayedParameters() {
      const query = this.searchQuery.trim().toLowerCase()
      if (!query) return this.displayedParameters
      return this.displayedParameters.filter((parameter) => this.parameterMatchesSearch(parameter, query))
    },
    filteredDisplayedParameterGroups() {
      const groupNames = new Set(this.filteredDisplayedParameters.map((p) => p.groupName).filter(Boolean))
      return this.displayedParameterGroups.filter((g) => groupNames.has(g.name))
    },
    ungroupedDisplayedParameters() {
      return this.filteredDisplayedParameters.filter((p) => !p.groupName)
    },
    ungroupedParametersExists() {
      return this.allParameters.some((p) => !p.groupName)
    },
    ungroupedAdvancedParametersExists() {
      return this.advancedParameters.some((p) => !p.groupName)
    }
  },
  methods: {
    toggleAdvancedMode() {
      this.userAdvancedMode = this.advancedMode === 'all' ? null : 'all'
      this.retainedKeys = []
    },
    setAdvancedMode(newMode) {
      this.userAdvancedMode = newMode
      this.isDropdownOpen = false
      this.retainedKeys = []
    },
    onSearch(searchbar, query) {
      this.searchQuery = (query || '').trim()
    },
    clearSearch() {
      this.searchQuery = ''
    },
    parameterMatchesSearch(parameter, query) {
      const label = parameter.label || parameter.name || ''
      const description = parameter.description || ''
      const value = this.serializeSearchValue(this.configurationWithDefaults[parameter.name])
      return `${label} ${description} ${value}`.toLowerCase().includes(query)
    },
    serializeSearchValue(value) {
      if (value == null) return ''
      if (Array.isArray(value)) return value.join(' ')
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value)
        } catch (e) {
          return String(value)
        }
      }
      return String(value)
    },
    isValid() {
      return f7.input.validateInputs(this.$refs.sheet.$el)
    },
    updateParameter(parameter, value) {
      // Retain field visibility during active editing session
      if (parameter.advanced && !this.retainedKeys.includes(parameter.name)) {
        this.retainedKeys.push(parameter.name)
      }
      if (
        (typeof value === 'number' && isNaN(value)) ||
        value === '' ||
        value === undefined ||
        value === null ||
        (parameter.multiple && Array.isArray(value) && !value.length)
      ) {
        if (Array.isArray(value) && this.setEmptyArrayAsArray) {
          this.configuration[parameter.name] = []
        } else if (this.setEmptyConfigAsNull) {
          // deleting the parameter sometimes lead to saves not updating it, so set it explicitly to null
          this.configuration[parameter.name] = null
        } else {
          delete this.configuration[parameter.name]
        }
      } else {
        this.configuration[parameter.name] = value
      }
      console.debug(JSON.stringify(this.configuration))
      this.$emit('updated')
    },
    parameterStatus(parameter) {
      if (!this.status || !this.status.length) return null
      return this.status.find((ps) => ps.parameterName === parameter.name)
    },
    isNonDefault(parameter) {
      const configValue = this.configuration[parameter.name]
      const defaultValue = parameter.default

      // If both are empty/null, they match.
      // Check using == instead of === to also catch undefined.
      if (configValue == null && defaultValue == null) {
        return false
      }

      // If a value is configured, but no default exists at all, it's custom
      if (configValue != null && defaultValue == null) {
        return true
      }

      // Fallback safety if configValue is still null for some reason
      if (configValue == null) {
        return false
      }

      return configValue.toString() !== defaultValue.toString()
    }
  }
}
</script>
