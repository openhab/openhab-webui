<template>
  <f7-row no-gap
          v-if="!config.item || !config.sendButton"
          class="oh-input"
          :style="config.style">
    <f7-input class="input-field"
              ref="input"
              v-bind="config"
              :style="{ width: '100%', ...config.style }"
              :value="((config.type && config.type.indexOf('date') === 0) || config.type === 'time') ? valueForDatepicker : value"
              :calendar-params="calendarParams"
              :step="config.step ? config.step : 'any'"
              @focus="listenForEnterKey"
              @blur="stopListeningForEnterKey"
              @input="$evt => updated($evt.target.value)"
              :change="updated"
              @calendar:change="updated"
              @texteditor:change="updated"
              @colorpicker:change="updated">
      <template v-if="context.component.slots && context.component.slots.default">
        <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.default"
                                  :context="childContext(slotComponent)"
                                  :key="'default-' + idx" />
      </template>
    </f7-input>
    <span v-if="unit" class="unit">{{ unit }}</span>
  </f7-row>
  <f7-row no-gap
          v-else
          class="oh-input"
          :style="config.style">
    <f7-input class="input-field"
              ref="input"
              v-bind="config"
              :value="((config.type && config.type.indexOf('date') === 0) || config.type === 'time') ? valueForDatepicker : value"
              :calendar-params="calendarParams"
              :step="config.step ? config.step : 'any'"
              :style="{ width: '100%' }"
              @focus="listenForEnterKey"
              @blur="stopListeningForEnterKey"
              @input="$evt => updated($evt.target.value)"
              :change="updated"
              @calendar:change="updated"
              @texteditor:change="updated"
              @colorpicker:change="updated">
      <template v-if="context.component.slots && context.component.slots.default">
        <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.default"
                                  :context="childContext(slotComponent)"
                                  :key="'default-' + idx" />
      </template>
    </f7-input>
    <span v-if="unit" class="unit">{{ unit }}</span>
    <f7-button v-if="this.config.sendButton"
               class="send-button col-10"
               @click.stop="sendButtonClicked"
               v-bind="config.sendButtonConfig || { iconMaterial: 'done', iconColor: 'gray' }" />
  </f7-row>
</template>

<style lang="stylus">
.oh-input
  flex-wrap nowrap !important
  align-items center !important
  input[type=number]
    text-align right
  .unit
    margin-left 4px
  .input-field
    padding-left 8px
    padding-right 8px
  .send-button
    --f7-button-padding-horizontal 0
</style>

<script>
import dayjs from 'dayjs'

import mixin from '../widget-mixin'
import variableMixin from '../variable-mixin'
import { OhInputDefinition } from '@/assets/definitions/widgets/system'

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  mixins: [mixin, variableMixin],
  widget: OhInputDefinition,
  data () {
    return {
      item: null,
      pendingUpdate: null
    }
  },
  computed: {
    value () {
      let variableLocation = this.context.vars
      if (this.config.variable) {
        const variableScope = this.getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        if (variableScope) variableLocation = this.context.ctxVars[variableScope]
      }
      if (this.config.variable && this.config.variableKey) {
        const keyValue = this.getLastVariableKeyValue(variableLocation[this.config.variable], this.config.variableKey)
        if (keyValue) {
          return keyValue
        }
      } else if (this.config.variable && variableLocation[this.config.variable] !== undefined) {
        return variableLocation[this.config.variable]
      } else if (this.pendingUpdate !== null) {
        return this.pendingUpdate
      } else if (this.config.item) {
        const item = this.context.store[this.config.item]
        if (item.state !== 'NULL' && item.state !== 'UNDEF' && item.state !== 'Invalid Date') {
          const value = (this.config.useDisplayState && item.displayState) || item.state
          return this.config.type === 'number' ? parseFloat(this.extractValue(value)) : value
        }
      }
      return this.config.defaultValue
    },
    // Returns the unit from the item's displayState, state description pattern or the item's unit symbol
    unit () {
      if (this.config.type !== 'number') return null
      if (!this.item?.unitSymbol) return null

      const storeItem = this.context.store[this.config.item]
      // When the state of a dimensioned item is UNDEF/NULL, item.displayState is undefined
      // so we need to pull it out of the item's state description pattern
      if (this.config.useDisplayState) {
        const unit = this.extractUnit(storeItem.displayState || this.item.stateDescription?.pattern)
        return unit === '%unit%' ? this.item.unitSymbol : unit
      }
      return this.item.unitSymbol
    },
    // Returns the index of the last pattern in the stateDescription
    // Example: displayState = "Some label %0.1f footext °C", returns 2
    // Returns -1 if no pattern is found
    valueIndexInDisplayState () {
      const parts = this.item?.stateDescription?.pattern?.trim()?.split(/\s+/) || []
      return parts.findLastIndex((part) => part.startsWith('%') && part !== '%unit%' && part !== '%%')
    },
    calendarParams () {
      if (this.config.type !== 'datepicker') return null
      let params = { dateFormat: { year: 'numeric', month: 'numeric', day: 'numeric' } }
      if (this.config.showTime) {
        params.timePicker = true
        params.dateFormat.hour = 'numeric'
        params.dateFormat.minute = 'numeric'
      }
      return {
        ...params,
        ...this.config.calendarParams
      }
    },
    valueForDatepicker () {
      const value = Array.isArray[this.value] ? this.value[0] : this.value
      const datetime = new Date(value)
      if (isNaN(datetime)) return null
      switch (this.config.type) {
        case 'datepicker':
          return [datetime]
        case 'date':
          return dayjs(datetime).format('YYYY-MM-DD')
        case 'datetime-local':
          return dayjs(datetime).format('YYYY-MM-DDTHH:mm')
        case 'time':
          return dayjs(datetime).format('HH:mm:ss')
        default:
          return null
      }
    }
  },
  mounted () {
    if (this.config.item) {
      this.$oh.api.get(`/rest/items/${this.config.item}?recursive=false`).then((item) => {
        this.item = item
        if (this.config.useDisplayState) {
          this.config.min ||= item.stateDescription?.minimum
          this.config.max ||= item.stateDescription?.maximum
          this.config.step ||= item.stateDescription?.step
        }
      })
    }
  },
  methods: {
    updated (value) {
      if (this.config.type === 'texteditor') {
        value = this.$$(this.$refs.input.$el).find('.text-editor-content')[0].innerHTML
        if (value === this.value) return
      } else if (this.config.type === 'time') {
        const oldDate = dayjs(Array.isArray[this.value] ? this.value[0] : this.value).set('millisecond', 0)
        let time = value.match(/(?<hour>[0-9]{2}):(?<minute>[0-9]{2})(:(?<second>[0-9]{2}))?/)
        if (!time) return // avoid error being thrown because there is no match
        time = time.groups
        if (isNaN(time.hour) || isNaN(time.minute)) return
        value = dayjs(oldDate).set('hour', time.hour).set('minute', time.minute).set('second', isNaN(time.second) ? 0 : time.second).set('millisecond', 0).format()
        if ((new Date(oldDate)).getTime() === (new Date(value)).getTime()) return
      } else if (this.config.type === 'date') {
        const oldDate = dayjs(Array.isArray[this.value] ? this.value[0] : this.value).set('millisecond', 0)
        value = dayjs(value).set('hour', oldDate.get('hour')).set('minute', oldDate.get('minute')).set('second', oldDate.get('second')).set('millisecond', 0).format()
        if ((new Date(oldDate)).getTime() === (new Date(value)).getTime()) return
      } else if (this.config.type === 'datepicker' && Array.isArray(value) && this.valueForDatepicker[0].getTime() === value[0].getTime()) {
        return
      }
      this.pendingUpdate = value
      if (this.config.variable) {
        const variableScope = this.getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          value = this.setVariableKeyValues(variableLocation[this.config.variable], this.config.variableKey, value)
        }
        variableLocation[this.config.variable] = value
      }
    },
    listenForEnterKey (evt) {
      evt.target.addEventListener('keyup', this.keyUp)
    },
    stopListeningForEnterKey (evt) {
      evt.target.removeEventListener('keyup', this.keyUp)
    },
    keyUp (evt) {
      if (evt.key === 'Enter') {
        this.sendButtonClicked()
      }
    },
    sendButtonClicked () {
      if (this.config.item && this.pendingUpdate) {
        let cmd = this.pendingUpdate
        if (this.unit) {
          cmd += ' ' + this.unit
        } else if (this.config.type === 'datepicker' && Array.isArray(cmd)) {
          cmd = dayjs(cmd[0]).format()
          if (cmd === 'Invalid Date') return
        }
        useStatesStore().sendCommand(this.config.item, cmd)
        this.pendingUpdate = null
      }
    },
    extractUnit (pattern) {
      if (!pattern) return null
      return pattern.trim().split(/\s+/).pop()
    },
    extractValue (pattern) {
      if (!pattern) return null

      const parts = pattern.trim().split(/\s+/)
      switch (parts.length) {
        case 0: return null
        case 1: return pattern
        case 2: return parts[0]
        default: return parts[this.valueIndexInDisplayState]
      }
    }
  }
}
</script>
