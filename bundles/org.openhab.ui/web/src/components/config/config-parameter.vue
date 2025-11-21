<template>
  <f7-list ref="parameter"
           class="config-parameter"
           :no-hairlines-md="configDescription.type !== 'BOOLEAN' && (!configDescription.options || !configDescription.options.length) && ['item'].indexOf(configDescription.context) < 0"
           v-show="configDescription.visible ? configDescription.visible(value, configuration, configDescription, parameters) : true">
    <f7-list-group v-if="!readOnly && !configDescription.readOnly">
      <component :is="control"
                 :config-description="configDescription"
                 :value="value"
                 :parameters="parameters"
                 :configuration="configuration"
                 :title="configDescription.title"
                 :f7router
                 @input="updateValue" />
    </f7-list-group>
    <f7-list-item v-else-if="readOnly && configDescription.context === 'password'"
                  :is="passwords"
                  :config-description="configDescription"
                  :value="value"
                  :parameters="parameters"
                  :configuration="configuration"
                  :title="configDescription.title" />
    <f7-list-item v-else :after="value !== undefined && value !== null ? value.toString() : 'N/A'" />
    <template #after-list>
      <f7-block-footer class="config-parameter-description">
        <div v-if="status" class="param-status-info">
          <f7-chip v-if="status.type !== 'INFORMATION'"
                   :color="status.type === 'WARNING' ? 'orange' : status.type === 'ERROR' ? 'red' : 'gray'"
                   style="float: right"
                   :text="status.type" />
          <span v-if="status.statusCode">Status Code: &nbsp;{{ status.statusCode }}&nbsp;&nbsp;</span>
          <span v-if="status.message">{{ status.message }}</span>
        </div>
        <small v-html="`${configDescription.required ? '<strong>Required</strong>&nbsp;' : ''}${description || (showNonDefaultBadge ? ' ' : '')}`" />
        <f7-badge v-if="showNonDefaultBadge"
                  style="margin-left:2px"
                  color="blue"
                  class="count-badge"
                  tooltip="Non-default parameter">
          1
        </f7-badge>
      </f7-block-footer>
    </template>
  </f7-list>
</template>

<style lang="stylus">
.config-parameter .config-parameter-description
  padding-left calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left))
  padding-right calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-right))
  display flex
  justify-content space-between

</style>

<script>
import { f7 } from 'framework7-vue'

// import ScriptEditorPopup from './config/script-editor-popup.vue'
import ParameterThing from './controls/parameter-thing.vue'
import ParameterBoolean from './controls/parameter-boolean.vue'
import ParameterNumber from './controls/parameter-number.vue'
import ParameterOptions from './controls/parameter-options.vue'
import ParameterItem from './controls/parameter-item.vue'
import ParameterScript from './controls/parameter-script.vue'
import ParameterLocation from './controls/parameter-location.vue'
import ParameterCronExpression from './controls/parameter-cronexpression.vue'
import ParameterDayOfWeek from './controls/parameter-dayofweek.vue'
import ParameterTime from './controls/parameter-time.vue'
import ParameterDate from '@/components/config/controls/parameter-date.vue'
import ParameterDatetime from '@/components/config/controls/parameter-datetime.vue'
import ParameterPageWidget from './controls/parameter-pagewidget.vue'
import ParameterRule from './controls/parameter-rule.vue'
import ParameterPersistenceService from './controls/parameter-persistenceservice.vue'
import ParameterProps from './controls/parameter-props.vue'
import ParameterTriggerChannel from './controls/parameter-triggerchannel.vue'
import ParameterText from './controls/parameter-text.vue'
import ParameterQrcode from './controls/parameter-qrcode.vue'
import ParameterMonth from '@/components/config/controls/parameter-month.vue'

export default {
  props: {
    configDescription: Object,
    value: [String, Number, Boolean, Array, Object],
    parameters: Array,
    configuration: Object,
    readOnly: Boolean,
    status: Array,
    showNonDefaultBadge: Boolean
  },
  emits: ['update'],
  setup () {
    // make f7 optional for Vitest
    const f7router = f7?.views.main.router

    return {
      f7router
    }
  },
  computed: {
    passwords () {
      const configDescription = this.configDescription
      configDescription.readOnly = true
      return ParameterText
    },
    control () {
      const configDescription = this.configDescription
      if (configDescription.options?.length && configDescription.limitToOptions && (!configDescription.context || configDescription.context === 'network-interface' || configDescription.context === 'serial-port')) {
        return ParameterOptions
      } else if (configDescription.type === 'INTEGER' || configDescription.type === 'DECIMAL') {
        return ParameterNumber
      } else if (configDescription.type === 'BOOLEAN') {
        return ParameterBoolean
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'script') {
        return ParameterScript
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'location') {
        return ParameterLocation
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'cronexpression') {
        return ParameterCronExpression
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'month') {
        return ParameterMonth
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'dayOfWeek') {
        return ParameterDayOfWeek
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'time') {
        return ParameterTime
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'date') {
        return ParameterDate
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'datetime') {
        return ParameterDatetime
      } else if (configDescription.type === 'TEXT' && configDescription.context && configDescription.context.indexOf('page') >= 0) {
        return ParameterPageWidget
      } else if (configDescription.type === 'TEXT' && configDescription.context && configDescription.context.indexOf('widget') >= 0) {
        return ParameterPageWidget
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'props') {
        return ParameterProps
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'item') {
        return ParameterItem
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'thing') {
        return ParameterThing
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'rule') {
        return ParameterRule
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'channel') {
        return ParameterTriggerChannel
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'persistenceService') {
        return ParameterPersistenceService
      } else if (configDescription.type === 'TEXT' && configDescription.context === 'qrcode') {
        return ParameterQrcode
      }
      return ParameterText
    },
    description () {
      let description = this.configDescription.description || ''
      description = description.replace(/<a href="http/g, '<a class="external" target="_blank" href="http') // if class/target already declared, will be overwritten in most browsers
      // TODO: Remove this when proper UoM support is implemented for config parameters
      // Adds the unit to the description if it is available, UoM support is currently implemented through number parameters
      // where the user can enter the amount for the default unit
      if (this.configDescription.unit) return `${description} (${this.configDescription.unit})`
      return description
    }
  },
  mounted () {
    // Uncomment to perform initial validation on the field
    // f7.input.validateInputs(this.$refs.parameter.$el)
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
  .list ul
    padding-left 0
.param-description
  padding-left 16px !important
  &.block-footer
    margin-top 2px
    margin-bottom 1rem
  p
    margin 0 !important
  .param-status-info
    font-weight 500
    span
      color var(--f7-block-title-text-color) !important
.smart-select-popover.popover
  --f7-popover-width 320px
.config-parameter
  .smart-select
    .input-invalid + .item-input-error-message
      display block
      max-width 80%
      overflow hidden
      text-overflow ellipsis
      position relative
      display block
      white-space nowrap
      margin-top 0
      margin-bottom 0
</style>
