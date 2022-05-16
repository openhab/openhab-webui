<template>
  <f7-input v-if="!config.item || !config.sendButton" class="input-field" ref="input" v-bind="config" :value="(config.type.indexOf('date') === 0) ? valueForDatepicker : value" @input="$evt => updated($evt.target.value)" :change="updated" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
  <f7-row no-gap v-else class="oh-input-with-send-button">
    <f7-input class="input-field col-90" ref="input" v-bind="config" :value="(config.type.indexOf('date') === 0) ? valueForDatepicker : value" @input="$evt => updated($evt.target.value)" :change="updated" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
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
import { OhInputDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhInputDefinition,
  data () {
    return {
      pendingUpdate: null
    }
  },
  computed: {
    value () {
      if (this.config.variable && this.context.vars[this.config.variable] !== undefined) {
        return this.context.vars[this.config.variable]
      } else if (this.config.sendButton && this.pendingUpdate !== null) {
        return this.pendingUpdate
      } else if (this.config.item && this.context.store[this.config.item].state !== 'NULL' && this.context.store[this.config.item].state !== 'UNDEF') {
        if (this.config.useDisplayState) {
          return this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
        } else {
          return this.context.store[this.config.item].state
        }
      }
      return this.config.defaultValue
    },
    valueForDatepicker () {
      const value = this.value
      switch (this.config.type) {
        case 'datepicker':
          if (Array.isArray(value)) return value
          const date = new Date(value)
          if (isNaN(date)) return null
          return [date]
        case 'date':
          return (Date.parse(value) > 0) ? value.split('T')[0] : null
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
      }
      if (this.config.type === 'datepicker' && Array.isArray(value) && this.valueForDatepicker[0].getTime() === value[0].getTime()) return
      if (this.config.sendButton) {
        this.$set(this, 'pendingUpdate', value)
      }
      if (this.config.variable) {
        this.$set(this.context.vars, this.config.variable, value)
      }
    },
    sendButtonClicked () {
      if (this.config.item && this.pendingUpdate) {
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
