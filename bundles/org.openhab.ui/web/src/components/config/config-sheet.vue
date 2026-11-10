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
      <f7-chip
        v-if="hasAdvanced"
        media-bg-color="theme-alt"
        :color="showAdvanced ? 'theme-alt' : ''"
        class="advanced-chip not-selectable"
        text="Advanced"
        @click="showAdvanced = !showAdvanced">
        <template #media>
          <f7-icon v-if="showAdvanced" ios="f7:checkmark_circle_fill" md="material:check_circle" aurora="f7:checkmark_circle_fill" />
        </template>
      </f7-chip>
      <f7-badge v-if="advancedNonDefaultCount" color="theme-alt" class="count-badge" tooltip="Non-default advanced parameter">
        {{ advancedNonDefaultCount }}
      </f7-badge>
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

  .advanced-chip
    margin-left auto
    cursor pointer

  .not-selectable
    -webkit-user-select none
    -moz-user-select none
    -ms-user-select none
    user-select none

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
      showAdvanced: false,
      searchQuery: ''
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
    showSearchbar() {
      return this.allParameters.length > 1
    },
    showFilterControls() {
      return this.hasAdvanced || this.showSearchbar
    },
    displayedParameterGroups() {
      if (!this.parameterGroups || !this.parameterGroups.length) return []
      if (this.showAdvanced) return this.parameterGroups
      return this.parameterGroups.filter((pg) => !pg.advanced)
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
      if (this.showAdvanced) return this.allParameters // show all parameters
      return this.baseParameters
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

      // Using != null (instead of !==) to concisely check that neither
      // value is null or undefined in a single expression.
      return defaultValue != null && configValue != null && configValue.toString() !== defaultValue
    }
  }
}
</script>
