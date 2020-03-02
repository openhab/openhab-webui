<template>
    <f7-list class="config-parameter" :no-hairlines-md="configDescription.type !== 'BOOLEAN' && (!configDescription.options || !configDescription.options.length) && ['item'].indexOf(configDescription.context) < 0"
      v-show="(configDescription.visible) ? configDescription.visible(value, configuration, configDescription, parameters) : true">
      <component :is="control" :config-description="configDescription" :value="value" :parameters="parameters" :configuration="configuration" :title="configDescription.title" @input="updateValue" />
      <f7-block-footer slot="after-list" class="param-description">
        <small v-html="configDescription.description"></small>
      </f7-block-footer>
    </f7-list>
</template>

<script>
// import ScriptEditorPopup from './config/script-editor-popup.vue'
import ThingPicker from './controls/thing-picker.vue'
import ParameterBoolean from './controls/parameter-boolean.vue'
import ParameterInteger from './controls/parameter-integer.vue'
import ParameterOptions from './controls/parameter-options.vue'
import ParameterItem from './controls/parameter-item.vue'
import ParameterScript from './controls/parameter-script.vue'
import ParameterLocation from './controls/parameter-location.vue'
import ParameterCronExpression from './controls/parameter-cronexpression.vue'
import ParameterDayOfWeek from './controls/parameter-dayofweek.vue'
import ParameterPageWidget from './controls/parameter-pagewidget.vue'
import ParameterProps from './controls/parameter-props.vue'
import ParameterText from './controls/parameter-text.vue'

export default {
  components: {
  },
  props: [
    'configDescription',
    'value',
    'parameters',
    'configuration'
  ],
  data () {
    return {
    }
  },
  computed: {
    control () {
      const configDescription = this.configDescription
      if (configDescription.options && configDescription.options.length && configDescription.limitToOptions) {
        return ParameterOptions
      } else if (configDescription.type === 'INTEGER') {
        return ParameterInteger
      } else if (configDescription.type === 'BOOLEAN') {
        return ParameterBoolean
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'script') {
        return ParameterScript
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'location') {
        return ParameterLocation
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'cronexpression') {
        return ParameterCronExpression
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'dayOfWeek') {
        return ParameterDayOfWeek
      } else if (configDescription.type === 'TEXT' && configDescription.context && configDescription.context.indexOf('page') >= 0) {
        return ParameterPageWidget
      } else if (configDescription.type === 'TEXT' && configDescription.context && configDescription.context.indexOf('widget') >= 0) {
        return ParameterPageWidget
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'props') {
        return ParameterProps
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'item') {
        return ParameterItem
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'thing') {
        return ThingPicker
      }

      return ParameterText
    }
  },
  methods: {
    updateValue (value) {
      console.debug(`Update ${this.configDescription.name} to ${value}`)
      this.$emit('update', value)
    }
  }
}
</script>

<style lang="stylus">
.parameter-group.block
  margin-top 0
  margin-bottom 0
.param-description
  padding-left 16px !important
  &.block-footer
    margin-top 2px
    margin-bottom 1rem
  p
    margin 0 !important
.smart-select-popover.popover
  --f7-popover-width 320px
</style>
