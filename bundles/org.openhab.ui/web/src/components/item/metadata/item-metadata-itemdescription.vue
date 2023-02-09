<template>
  <div>
    <config-sheet v-if="namespace === 'stateDescription'" :parameterGroups="[]" :parameters="stateDescriptionParameters" :configuration="metadata.config" />
    <f7-list>
      <f7-list-input
        ref="input"
        type="textarea"
        :floating-label="$theme.md"
        :label="'Options'"
        name="options"
        :value="options"
        @input="updateOptions" />
      <f7-block-footer class="param-description" alot="after-list">
        <small>Enter each option on a separate line.<br>Use <code>value=label</code> format to provide a label different than the option.</small>
      </f7-block-footer>
    </f7-list>
    <p class="padding">
      <f7-link v-if="namespace === 'stateDescription'" color="blue" external target="_blank" :href="docLink">
        State Description Documentation
      </f7-link>
      <f7-link v-if="namespace === 'commandDescription'" color="blue" external target="_blank" :href="docLink">
        Command Description Documentation
      </f7-link>
    </p>
  </div>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  props: ['itemName', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      stateDescriptionParameters: [
        { type: 'BOOLEAN', name: 'readOnly', label: 'Read only', description: 'Item is read-only and should not accept commands' },
        { type: 'TEXT', name: 'pattern', label: 'Pattern', description: 'Pattern or transformation applied to the state for display purposes' },
        { type: 'TEXT', name: 'min', label: 'Min', description: 'Minimum allowed value' },
        { type: 'TEXT', name: 'max', label: 'Max', description: 'Maximum allowed value' },
        { type: 'TEXT', name: 'step', label: 'Step', description: 'Minimum interval between values' }
      ],
      docUrl: `https://${this.$store.state.runtimeInfo?.buildString === 'Release Build' ? 'www' : 'next'}.openhab.org` +
        '/link/thing'
    }
  },
  computed: {
    options () {
      if (!this.metadata.config.options) return []
      return this.metadata.config.options.trim().split(',').map((s) => s.trim()).join('\n')
    },
    docLink () {
      if (this.namespace === 'stateDescription') {
        return `${this.docUrl}#state-description`
      } else {
        return `${this.docUrl}#command-description`
      }
    }
  },
  methods: {
    updateOptions (ev) {
      this.metadata.config.options = ev.target.value.split('\n').map((s) => s.trim()).join(',').trim()
    }
  }
}
</script>
