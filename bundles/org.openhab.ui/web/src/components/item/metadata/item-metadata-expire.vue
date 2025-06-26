<template>
  <div>
    <f7-block-title medium>
      Do
    </f7-block-title>
    <f7-list v-if="editable">
      <f7-list-item radio :checked="parsedAction.action === 'state'" name="action" title="update state" @click="updateAction('state')" />
      <f7-list-item radio :checked="parsedAction.action === 'command'" name="action" title="send command" @click="updateAction('command')" />
      <f7-list-input
        :label="parsedAction.action === 'command' ? 'Command' : 'State'"
        name="value"
        ref="value"
        type="text"
        placeholder="UNDEF if unset"
        :value="parsedAction.value"
        @blur="(evt) => updateActionValue(evt.target.value)" />
      <f7-list-item title="ignore state updates" checkbox :checked="ignoreStateUpdates" @change="(ev) => metadata.config['ignoreStateUpdates'] = new Boolean(ev.target.checked).toString()" />
      <f7-list-item title="ignore commands" checkbox :checked="ignoreCommands" @change="(ev) => metadata.config['ignoreCommands'] = new Boolean(ev.target.checked).toString()" />
    </f7-list>
    <f7-block v-else>
      {{ parsedAction.action === 'state' ? 'Update state to' : 'Send command' }} <strong>{{ parsedAction.value || 'UNDEF' }}</strong><br>
      {{ `${ignoreStateUpdates ? 'Ignore state updates' : ''}${ignoreCommands && ignoreCommands ? ', ' : ''}${ignoreCommands ? 'Ignore commands' : ''}` }}
    </f7-block>
    <f7-block-footer class="param-description padding-left">
      <small>After a different command or state update is received, perform the chosen action when the duration specified below has passed. The timer is reset if another state update or command is received before it expires. If the ignore state updates checkbox is set, only state changes and commands will reset the timer. If the ignore commands checkbox is set, only state updates and state changes will reset the timer.</small>
    </f7-block-footer>
    <f7-block-title medium>
      After
    </f7-block-title>
    <f7-list>
      <f7-list-input
        :floating-label="$theme.md"
        label="Expiration Delay"
        name="timer"
        ref="duration"
        type="text"
        :value="sanitizedDuration"
        :disabled="!editable"
        @blur="(evt) => updateDuration(evt.target.value)"
        pattern="(\d+h)*(\d+m)*(\d+s)*" validate validate-on-blur />
      <f7-list-item v-if="editable" class="display-flex justify-content-center">
        <div ref="picker" />
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="param-description padding-left">
      <small>Delay to wait before the timer expires and the action specified above is performed.</small>
    </f7-block-footer>
  </div>
</template>

<script>
export default {
  props: ['itemName', 'metadata', 'namespace', 'editable'],
  data () {
    return {
    }
  },
  computed: {
    sanitizedDuration () {
      return this.sanitizeDuration(this.metadata.value)
    },
    sanitizedAction () {
      if (!this.metadata.value) return ''
      let action = this.metadata.value.split(',')[1]
      if (!action) return ''
      return action.trim().replace(/\s/g, '')
    },
    parsedTimerParts () {
      if (!this.sanitizedDuration) return ['0', '0', '0']
      let match = this.sanitizedDuration.match(/(\d+h)*(\d+m)*(\d+s)*/)

      let hours = (match[1]) ? match[1].replace('h', '') : '0'
      let minutes = (match[2]) ? match[2].replace('m', '') : '0'
      let seconds = (match[3]) ? match[3].replace('s', '') : '0'

      return [hours, minutes, seconds]
    },
    parsedAction () {
      if (!this.sanitizedAction) return { action: 'state', value: '' }
      const action = this.sanitizedAction.indexOf('command=') === 0 ? 'command' : 'state'
      const value = this.sanitizedAction.replace('state=', '').replace('command=', '')
      return { action, value }
    },
    ignoreStateUpdates () {
      let configValue = this.metadata.config['ignoreStateUpdates']
      if (!configValue) return false
      return typeof (configValue) === 'string' ? configValue === 'true' : configValue
    },
    ignoreCommands () {
      let configValue = this.metadata.config['ignoreCommands']
      if (!configValue) return false
      return typeof (configValue) === 'string' ? configValue === 'true' : configValue
    }
  },
  mounted () {
    const self = this
    const inputControl = this.$refs.duration
    const containerControl = this.$refs.picker
    if (!inputControl || !inputControl.$el || !containerControl) return
    const inputElement = this.$$(inputControl.$el).find('input')

    if (!this.editable) return
    this.picker = this.$f7.picker.create({
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
            for (let i = 0; i <= 99; i++) { arr.push(i.toString()) }
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
            for (let i = 0; i <= 59; i++) { arr.push(i.toString()) }
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
            for (let i = 0; i <= 59; i++) { arr.push(i.toString()) }
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
    parsedTimerParts (val) {
      this.picker.setValue(val)
    }
  },
  methods: {
    sanitizeDuration (value) {
      if (!value) return ''
      return value.split(',')[0].trim().replace(/\s/g, '')
    },
    updateDuration (value) {
      if (!value) return
      this.metadata.value = this.sanitizeDuration(value) + ((this.sanitizedAction) ? ',' + this.sanitizedAction : '')
    },
    updateAction (value) {
      if (!value) return
      const action = ((value === 'command') ? 'command=' : '') + this.parsedAction.value
      this.metadata.value = this.sanitizedDuration + ((action) ? ',' + action : '')
    },
    updateActionValue (value) {
      if (!value) return
      const action = ((this.parsedAction.action === 'command') ? 'command=' : '') + value.trim()
      this.metadata.value = this.sanitizedDuration + ((action) ? ',' + action : '')
    }
  }
}
</script>
