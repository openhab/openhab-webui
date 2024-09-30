<template>
  <f7-block v-if="parameters" class="config-sheet no-margin" ref="sheet">
    <div style="text-align:right" class="padding-right" v-if="hasAdvanced">
      <label @click="toggleAdvanced" class="advanced-label">Show advanced</label> <f7-checkbox :checked="showAdvanced" @change="toggleAdvanced" />
    </div>
    <f7-col>
      <f7-block width="100" class="parameter-group no-margin no-padding">
        <f7-row v-if="displayedParameters.some((p) => !p.groupName)">
          <f7-col>
            <config-parameter
              v-for="parameter in displayedParameters.filter((p) => !p.groupName)"
              :key="parameter.name"
              :config-description="parameter"
              :value="configurationWithDefaults[parameter.name]"
              :parameters="parameters"
              :configuration="configurationWithDefaults"
              :read-only="readOnly"
              :status="parameterStatus(parameter)"
              @update="(value) => updateParameter(parameter, value)" />
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-col>
    <f7-col v-if="parameterGroups.length">
      <f7-block width="100" class="parameter-group" v-for="group in parameterGroups" :key="group.name">
        <f7-row v-if="displayedParameters.some((p) => p.groupName === group.name)">
          <f7-col>
            <f7-block-title class="parameter-group-title">
              {{ group.label }}
            </f7-block-title>
            <f7-block-footer class="param-description" v-if="group.description">
              <div v-html="group.description" />
            </f7-block-footer>

            <config-parameter
              v-for="parameter in displayedParameters.filter((p) => p.groupName === group.name)"
              :key="parameter.name"
              :config-description="parameter"
              :value="configurationWithDefaults[parameter.name]"
              :parameters="parameters"
              :configuration="configurationWithDefaults"
              :read-only="readOnly"
              :status="parameterStatus(parameter)"
              @update="(value) => updateParameter(parameter, value)" />
          </f7-col>
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
.parameter-group
  padding-right 0 !important
  padding-left 0 !important
  .smart-select > .item-content > .item-inner:after
    display none !important
  .item-content .item-inner
    overflow auto

.param-description.block-footer h1
  font-size 1em

.advanced-label
  cursor pointer

.item-input-info
    white-space normal
</style>

<script>
import { actionParams } from '@/assets/definitions/widgets/actions'

export default {
  props: ['parameterGroups', 'parameters', 'configuration', 'status', 'readOnly', 'setEmptyConfigAsNull'],
  components: {
    'config-parameter': () => import(/* webpackChunkName: "config-parameter" */ './config-parameter.vue')
  },
  data () {
    return {
      showAdvanced: false
    }
  },
  computed: {
    configurationWithDefaults () {
      const conf = Object.assign({}, this.configuration)
      this.parameters.forEach((p) => {
        if (conf[p.name] === undefined && p.default !== undefined) {
          conf[p.name] = typeof p.default === 'function' ? p.default(this.configuration) : p.default
        }
      })
      return conf
    },
    hasAdvanced () {
      return this.parameters.length > 0 && this.parameters.some((p) => p.advanced)
    },
    displayedParameters () {
      if (!this.parameters.length) return []
      let finalParameters = [...this.parameters]
      if (this.parameterGroups && this.parameterGroups.some((g) => g.context === 'action')) {
        this.parameterGroups.filter((g) => g.context === 'action').forEach((g) => {
          const prefix = g.name.replace(/action/gi, '')
          finalParameters = [...finalParameters, ...actionParams(g.name, prefix)]
        })
      }
      if (this.showAdvanced) return finalParameters // show all parameters
      // exclude advanced parameters, if:
      // - a default value is defined and the actual value differs from the default value
      // - no default value is defined and the param has a value
      return finalParameters.filter((p) => !p.advanced ||
        (p.default !== undefined && this.configuration[p.name] !== undefined && this.configuration[p.name] !== null ? this.configuration[p.name].toString() !== p.default : this.configuration[p.name] !== undefined))
    }
  },
  methods: {
    isValid () {
      return this.$f7.input.validateInputs(this.$refs.sheet.$el)
    },
    toggleAdvanced (event) {
      this.showAdvanced = !this.showAdvanced // event.target.checked
    },
    updateParameter (parameter, value) {
      if ((typeof value === 'number' && isNaN(value)) || value === '' || value === undefined || value === null || (parameter.multiple && Array.isArray(value) && !value.length)) {
        if (this.setEmptyConfigAsNull) {
          // deleting the parameter sometimes lead to saves not updating it, so set it explicitely to null
          this.$set(this.configuration, parameter.name, null)
        } else {
          this.$delete(this.configuration, parameter.name)
        }
      } else {
        this.$set(this.configuration, parameter.name, value)
      }
      console.debug(JSON.stringify(this.configuration))
      this.$emit('updated')
    },
    parameterStatus (parameter) {
      if (!this.status || !this.status.length) return null
      return this.status.find((ps) => ps.parameterName === parameter.name)
    }
  }
}
</script>
