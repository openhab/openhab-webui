<template>
  <f7-input v-if="!config.item || !config.sendButton" class="input-field" ref="input" v-bind="config" :value="((config.type && config.type.indexOf('date') === 0) || config.type === 'time') ? valueForDatepicker : value"
            :calendar-params="calendarParams" :step="config.step ? config.step : 'any'"
            @input="$evt => updated($evt.target.value)" :change="updated" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
  <f7-row no-gap v-else class="oh-input-with-send-button">
    <f7-input class="input-field col-90" ref="input" v-bind="config" :value="((config.type && config.type.indexOf('date') === 0) || config.type === 'time') ? valueForDatepicker : value"
              :calendar-params="calendarParams" :step="config.step ? config.step : 'any'"
              @input="$evt => updated($evt.target.value)" :change="updated" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
    <f7-button class="send-button col-10" v-if="this.config.sendButton" @click.stop="sendButtonClicked" v-bind="config.sendButtonConfig || { iconMaterial: 'done', iconColor: 'gray' }" />
  </f7-row>
</template>

<style lang="stylus">
.oh-input-with-send-button
  .input-field
    padding-left 8px
    padding-right 8px
    --f7-input-font-size 1rem
  .send-button
    --f7-button-padding-horizontal 0px
</style>

<script>
import dayjs from 'dayjs'

import mixin from '../widget-mixin'
import variableMixin from '../variable-mixin'
import { OhInputDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin, variableMixin],
  widget: OhInputDefinition,
  data () {
    return {
      pendingUpdate: null
    }
  },
  computed: {
    value () {
      if (this.config.variable && this.config.variableKey) {
        const keyValue = this.getLastVariableKeyValue(this.context.vars[this.config.variable], this.config.variableKey)
        if (keyValue) {
          return keyValue
        }
      } else if (this.config.variable && this.context.vars[this.config.variable] !== undefined) {
        return this.context.vars[this.config.variable]
      } else if (this.config.sendButton && this.pendingUpdate !== null) {
        return this.pendingUpdate
      } else if (this.config.item && this.context.store[this.config.item].state !== 'NULL' && this.context.store[this.config.item].state !== 'UNDEF' && this.context.store[this.config.item].state !== 'Invalid Date') {
        if (this.config.useDisplayState) {
          return this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
        } else {
          return this.context.store[this.config.item].state
        }
      }
      return this.config.defaultValue
    },
    calendarParams () {
      if (this.config.type !== 'datepicker') return null
      let params = { dateFormat: { year: 'numeric', month: 'numeric', day: 'numeric' } }
      if (this.config.showTime) {
        params.timePicker = true
        params.dateFormat.hour = 'numeric'
        params.dateFormat.minute = 'numeric'
      }
      return params
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
      if (this.config.sendButton) {
        this.$set(this, 'pendingUpdate', value)
      }
      if (this.config.variable) {
        if (this.config.variableKey) {
          value = this.setVariableKeyValues(this.context.vars[this.config.variable], this.config.variableKey, value)
        }
        this.$set(this.context.vars, this.config.variable, value)
      }
    },
    sendButtonClicked () {
      if (this.config.item && this.pendingUpdate) {
        let cmd = this.pendingUpdate
        if (this.config.type === 'datepicker' && Array.isArray(cmd)) {
          cmd = dayjs(cmd[0]).format()
        }
        if (cmd === 'Invalid Date') return
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd })
        this.$set(this, 'pendingUpdate', null)
      }
    }
  }
}
</script>
