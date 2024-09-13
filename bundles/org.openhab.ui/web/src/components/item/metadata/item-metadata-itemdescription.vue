<template>
  <div v-if="ready">
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
      ready: false,
      transformations: []
    }
  },
  computed: {
    stateDescriptionParameters () {
      const options = this.transformations
        .map((t) => { return { label: t.label, value: `${t.type.toUpperCase()}(${t.uid}):%s` } })
        .sort((a, b) => (a.label).localeCompare(b.label))
      return [
        { type: 'BOOLEAN', name: 'readOnly', label: 'Read only', description: 'Item is read-only and should not accept commands' },
        { type: 'TEXT', name: 'pattern', label: 'Pattern', description: 'Pattern or transformation applied to the state for display purposes', options, limitToOptions: false },
        { type: 'TEXT', name: 'min', label: 'Min', description: 'Minimum allowed value' },
        { type: 'TEXT', name: 'max', label: 'Max', description: 'Maximum allowed value' },
        { type: 'TEXT', name: 'step', label: 'Step', description: 'Minimum interval between values' }
      ]
    },
    options () {
      if (!this.metadata.config.options) return []
      return this.metadata.config.options.trim().split(',').map((s) => s.trim()).join('\n')
    },
    docLink () {
      const docUrl = `${this.$store.state.websiteUrl}/link/thing`
      if (this.namespace === 'stateDescription') {
        return docUrl + '#state-description'
      } else {
        return docUrl + '#command-description'
      }
    }
  },
  methods: {
    updateOptions (ev) {
      this.metadata.config.options = ev.target.value.split('\n').map((s) => s.trim()).join(',').trim()
    },
    load () {
      if (this.namespace === 'commandDescription') {
        this.ready = true
        return
      }
      this.$oh.api.get('/rest/transformations').then((data) => {
        this.transformations = data
        this.ready = true
      })
    }
  },
  created () {
    this.load()
  }
}
</script>
