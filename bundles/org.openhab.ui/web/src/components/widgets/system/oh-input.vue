<template>
  <f7-input v-if="!config.item || !config.sendButton" class="input-field" ref="input" v-bind="config" :value="value" @input="$evt => updated($evt.target.value)" :change="updated" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
  <f7-row no-gap v-else class="oh-input-with-send-button">
    <f7-col width="90">
      <f7-input class="input-field" ref="input" v-bind="config" :value="value" @input="$evt => updated($evt.target.value)" :change="updated" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
    </f7-col>
    <f7-col width="10">
      <f7-button class="send-button" v-if="this.config.sendButton" @click="clicked" v-bind="config.sendButtonConfig || { iconMaterial: 'done', iconColor: 'gray' }" />
    </f7-col>
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
import mixin from '../widget-mixin'
import { OhInputDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhInputDefinition,
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      if (this.config.variable && this.context.vars[this.config.variable] !== undefined) {
        return this.context.vars[this.config.variable]
      } else if (this.config.showOK && this.context.vars[this.config.value] !== undefined) {
        return this.context.vars[this.config.value]
      }
      return (this.config.item) ? this.context.store[this.config.item].state : this.config.defaultValue
    }
  },
  methods: {
    updated (value) {
      if (this.config.showOK) {
        this.$set(this.context.vars, this.config.value, value)
      }
      if (this.config.variable) {
        this.$set(this.context.vars, this.config.variable, value)
      }
    },
    clicked () {
      if (this.config.item) {
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: this.context.vars[this.config.value] })
      }
    }
  }
}
</script>
