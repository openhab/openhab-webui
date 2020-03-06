<template>
  <f7-block v-if="parameters" class="config-sheet">
    <div style="text-align:right" class="padding-right" v-if="hasAdvanced">
      <label @click="toggleAdvanced" class="advanced-label">Show advanced</label> <f7-checkbox :checked="showAdvanced" @change="toggleAdvanced"></f7-checkbox>
    </div>
    <f7-col>
      <f7-block width="100" class="parameter-group">
        <f7-row>
          <f7-col>
            <config-parameter
              v-for="parameter in displayedParameters.filter((p) => !p.groupName)"
              :key="parameter.name"
              :config-description="parameter"
              :value="configuration[parameter.name]"
              :parameters="parameters"
              :configuration="configuration"
              @update="(value) => updateParameter(parameter, value)"
            />
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-col>
    <f7-col v-if="parameterGroups.length">
      <f7-block width="100" class="parameter-group" v-for="group in parameterGroups" :key="group.name">
        <f7-row>
          <f7-col v-if="displayedParameters.some((p) => p.groupName === group.name)">
            <f7-block-title class="parameter-group-title">{{group.label}}</f7-block-title>
            <f7-block-footer class="param-description" v-if="group.description">
              <div v-html="group.description"></div>
            </f7-block-footer>

            <config-parameter
              v-for="parameter in displayedParameters.filter((p) => p.groupName === group.name)"
              :key="parameter.name"
              :config-description="parameter"
              :value="configuration[parameter.name]"
              :parameters="parameters"
              :configuration="configuration"
              @update="(value) => updateParameter(parameter, value)"
            />
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-col>
  </f7-block>
</template>

<style lang="stylus">

.config-sheet
  margin-left calc(-1*var(--f7-block-padding-horizontal))
  padding-left 0
  padding-right 0
.parameter-group
  padding-right 0
.param-description.block-footer h1
  font-size 1em

.advanced-label
  cursor pointer
</style>

<script>
import ConfigParameter from './config-parameter.vue'

export default {
  props: ['parameterGroups', 'parameters', 'configuration'],
  components: {
    ConfigParameter
  },
  data () {
    return {
      showAdvanced: false
    }
  },
  computed: {
    hasAdvanced () {
      return this.parameters.length > 0 && this.parameters.some((p) => p.advanced)
    },
    displayedParameters () {
      if (!this.parameters.length) return []
      return (this.showAdvanced) ? this.parameters : this.parameters.filter((p) => !p.advanced)
    }
  },
  methods: {
    toggleAdvanced (event) {
      this.showAdvanced = !this.showAdvanced // event.target.checked
    },
    updateParameter (parameter, value) {
      // this.configuration[parameter.name] = value
      this.$set(this.configuration, parameter.name, value)
      console.debug(JSON.stringify(this.configuration))
      this.$emit('updated')
    }
  }
}
</script>
