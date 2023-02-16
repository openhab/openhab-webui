<template>
  <f7-input v-if="!config.item || !config.sendButton" class="input-field" ref="input" v-bind="config" :value="(config.type.indexOf('date') === 0) ? valueForDatepicker : value"
            :calendar-params="calendarParams"
            @input="$evt => updated($evt.target.value)" :change="updated" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
  <f7-row no-gap v-else class="oh-input-with-send-button">
    <f7-input class="input-field col-90" ref="input" v-bind="config" :value="(config.type.indexOf('date') === 0) ? valueForDatepicker : value"
              :calendar-params="calendarParams"
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
      pendingUpdate: null,
      metaValue: null
    }
  },
  asyncComputed: {
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
      } else if (this.config.item && !this.config.metaconfig && this.context.store[this.config.item].state !== 'NULL' && this.context.store[this.config.item].state !== 'UNDEF') {
        if (this.config.useDisplayState) {
          return this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
        } else {
          return this.context.store[this.config.item].state
        }
      } else if (this.config.item && this.config.metaconfig) {
        return this.processMetadataValue('get')
      }
      return this.config.defaultValue
    }
  },
  computed: {
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
        default:
          return null
      }
    }
  },
  methods: {
    processMetadataValue (command) {
      if (this.config.item && this.config.metaconfig) {
        let metaConfigPath = this.config.metaconfig
        let dot = metaConfigPath.indexOf('.')
        let namespace = metaConfigPath.slice(0, dot)
        let newValue = this.value
        this.$oh.api.get(`/rest/items/${this.config.item}?metadata=${namespace}`).then((data) => {
          if (data.metadata) {
            let propertyPath = metaConfigPath.slice(dot + 1, metaConfigPath.len)
            if (propertyPath === 'value') {
              if (command === 'patch') {
                data.metadata[namespace].value = newValue
              } else {
                this.metaValue = data.metadata[namespace].value
              }
            } else {
              let props = propertyPath.split('.')
              let meta = data.metadata[namespace].config
              if (command === 'patch') {
                let index = 0
                for (; index < props.length - 1; index++) {
                  let property = props[index]
                  meta = meta[property]
                }
                meta[props[index]] = newValue
              } else {
                props.forEach(property => {
                  meta = meta[property]
                })
                this.metaValue = meta
              }
            }
            if (command === 'patch') {
              this.$oh.api.put(`/rest/items/${this.config.item}/metadata/${namespace}`, data.metadata[namespace]).then((data) => {
                this.$f7.toast.create({
                  text: `Metadata ${metaConfigPath} for item ${this.config.item} updated to ${newValue}.`,
                  destroyOnClose: true,
                  closeTimeout: 3000
                }).open()
              }).catch((err) => {
                this.$f7.toast.create({
                  text: `Error while updating metadata ${metaConfigPath} for item ${this.config.item}. Error = ${err}`,
                  destroyOnClose: true,
                  closeTimeout: 15000
                }).open()
              })
            }
          }
        })
      }
      return this.metaValue
    },
    updated (value) {
      if (this.config.type === 'texteditor') {
        value = this.$$(this.$refs.input.$el).find('.text-editor-content')[0].innerHTML
        if (value === this.value) return
      }
      if (this.config.type === 'datepicker' && Array.isArray(value) && this.valueForDatepicker[0].getTime() === value[0].getTime()) return
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
      if (this.config.item && this.config.metaconfig) {
        this.processMetadataValue('patch')
      } else if (this.config.item && this.pendingUpdate) {
        let cmd = this.pendingUpdate
        if (this.config.type === 'datepicker' && Array.isArray(cmd)) {
          cmd = dayjs(cmd[0]).format()
        }
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd })
        this.$set(this, 'pendingUpdate', null)
      }
    }
  }
}
</script>
