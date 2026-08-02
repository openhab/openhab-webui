<template>
  <div>
    <group-box title="After" description="Duration to wait after a command or state update is received">
      <f7-list>
        <f7-list-input
          :floating-label="theme.md"
          label="Expiration Delay"
          name="timer"
          ref="duration"
          type="text"
          class="no-border"
          :value="sanitizedDuration"
          :disabled="!editable ? true : null"
          @blur="(evt) => updateDuration(evt.target.value)"
          pattern="(\d+h)*(\d+m)*(\d+s)*"
          validate
          validate-on-blur />
        <f7-list-item v-if="editable" class="display-flex justify-content-center">
          <div ref="picker" />
        </f7-list-item>
      </f7-list>
      <f7-block-footer class="param-description padding-left padding-bottom">
        <small>Delay to wait before the timer expires and the action specified above is performed.</small>
      </f7-block-footer>
    </group-box>

    <template v-if="editable">
      <group-box title="Perform Action" description="Choose the action to perform when the timer expires.">
        <f7-list>
          <f7-list-item
            radio
            :checked="parsedAction.action === 'state' ? true : null"
            name="action"
            title="Update state"
            @click="updateAction('state')" />
          <f7-list-item
            radio
            :checked="parsedAction.action === 'command'"
            name="action"
            title="Send a command"
            @click="updateAction('command')" />
          <f7-list-input
            ref="value"
            :label="parsedAction.action === 'command' ? 'Command' : 'State'"
            name="value"
            type="text"
            placeholder="UNDEF if unset"
            clear-button
            :value="parsedAction.value"
            @blur="(evt) => updateActionValue(evt.target.value)" />
        </f7-list>
      </group-box>

      <group-box
        title="Options"
        description="By default, any new command or state update resets the countdown timer. Use the settings below to change this behavior"
        full-width>
        <f7-list>
          <f7-list-item
            title="Ignore state updates"
            checkbox
            :checked="ignoreStateUpdates ? true : null"
            @change="(ev) => (metadata.config['ignoreStateUpdates'] = new Boolean(ev.target.checked).toString())" />
          <f7-list-item
            title="Ignore commands"
            checkbox
            :checked="ignoreCommands ? true : null"
            @change="(ev) => (metadata.config['ignoreCommands'] = new Boolean(ev.target.checked).toString())" />
        </f7-list>
      </group-box>
    </template>
    <f7-block v-else>
      {{ parsedAction.action === 'state' ? 'Update state to' : 'Send command' }}
      <strong>{{ parsedAction.value || 'UNDEF' }}</strong
      ><br />
      {{
        `${ignoreStateUpdates ? 'Ignore state updates' : ''}${ignoreCommands && ignoreCommands ? ', ' : ''}${ignoreCommands ? 'Ignore commands' : ''}`
      }}
    </f7-block>
  </div>
</template>

<script>
import { f7, theme } from 'framework7-vue'

import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

export default {
  props: {
    itemName: String,
    metadata: Object
  },
  mixins: [ItemMetadataMixin],
  setup() {
    return { theme }
  },
  computed: {
    sanitizedDuration() {
      return this.sanitizeDuration(this.metadata.value)
    },
    sanitizedAction() {
      if (!this.metadata.value) return ''
      let action = this.metadata.value.split(',')[1]
      if (!action) return ''
      return action.trim().replace(/\s/g, '')
    },
    parsedTimerParts() {
      if (!this.sanitizedDuration) return ['0', '0', '0']
      let match = this.sanitizedDuration.match(/(\d+h)*(\d+m)*(\d+s)*/)

      let hours = match[1] ? match[1].replace('h', '') : '0'
      let minutes = match[2] ? match[2].replace('m', '') : '0'
      let seconds = match[3] ? match[3].replace('s', '') : '0'

      return [hours, minutes, seconds]
    },
    parsedAction() {
      if (!this.sanitizedAction) return { action: 'state', value: '' }
      const action = this.sanitizedAction.indexOf('command=') === 0 ? 'command' : 'state'
      const value = this.sanitizedAction.replace('state=', '').replace('command=', '')
      return { action, value }
    },
    ignoreStateUpdates() {
      let configValue = this.metadata.config['ignoreStateUpdates']
      if (!configValue) return false
      return typeof configValue === 'string' ? configValue === 'true' : configValue
    },
    ignoreCommands() {
      let configValue = this.metadata.config['ignoreCommands']
      if (!configValue) return false
      return typeof configValue === 'string' ? configValue === 'true' : configValue
    }
  },
  mounted() {
    const self = this
    const inputControl = this.$refs.duration
    const containerControl = this.$refs.picker
    if (!inputControl || !inputControl.$el || !containerControl) return
    const inputElement = this.$$(inputControl.$el).find('input')

    if (!this.editable) return
    this.picker = f7.picker.create({
      containerEl: containerControl,
      inputEl: inputElement,
      toolbar: false,
      inputReadOnly: false,
      rotateEffect: true,
      value: this.parsedTimerParts,
      formatValue: function (values, displayValues) {
        return displayValues[0] + 'h' + displayValues[1] + 'm' + displayValues[2] + 's'
      },
      cols: [
        // Hours
        {
          values: (function () {
            let arr = []
            for (let i = 0; i <= 99; i++) {
              arr.push(i.toString())
            }
            return arr
          })()
        },
        // Divider
        {
          divider: true,
          content: 'h'
        },
        // Minutes
        {
          values: (function () {
            let arr = []
            for (let i = 0; i <= 59; i++) {
              arr.push(i.toString())
            }
            return arr
          })()
        },
        // Divider
        {
          divider: true,
          content: 'm'
        },
        // Seconds
        {
          values: (function () {
            let arr = []
            for (let i = 0; i <= 59; i++) {
              arr.push(i.toString())
            }
            return arr
          })()
        },
        // Divider
        {
          divider: true,
          content: 's'
        }
      ],
      on: {
        change: function (picker, values, displayValues) {
          self.updateDuration(displayValues[0] + 'h' + displayValues[1] + 'm' + displayValues[2] + 's')
        }
      }
    })
  },
  watch: {
    parsedTimerParts(val) {
      this.picker.setValue(val)
    }
  },
  methods: {
    sanitizeDuration(value) {
      if (!value) return ''
      return value.split(',')[0].trim().replace(/\s/g, '')
    },
    updateDuration(value) {
      if (!value) return
      this.metadata.value = this.sanitizeDuration(value) + (this.sanitizedAction ? ',' + this.sanitizedAction : '')
    },
    updateAction(value) {
      if (!value) return
      const action = (value === 'command' ? 'command=' : '') + this.parsedAction.value
      this.metadata.value = this.sanitizedDuration + (action ? ',' + action : '')
    },
    updateActionValue(value) {
      if (!value) return
      const action = (this.parsedAction.action === 'command' ? 'command=' : '') + value.trim()
      this.metadata.value = this.sanitizedDuration + (action ? ',' + action : '')
    }
  }
}
</script>
