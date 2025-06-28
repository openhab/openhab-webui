<template>
  <div>
    <f7-list>
      <f7-list-input
        ref="input"
        type="textarea"
        :floating-label="$theme.md"
        :label="'Synonyms'"
        name="synonyms"
        :value="synonyms"
        :disabled="!editable"
        @input="updateValue" />
      <f7-block-footer class="param-description" slot="after-list">
        <small>Enter each synonym on a separate line.</small>
      </f7-block-footer>
    </f7-list>
  </div>
</template>

<script>
export default {
  props: ['itemName', 'metadata', 'namespace', 'editable'],
  computed: {
    synonyms () {
      if (!this.metadata.value) return []
      return this.metadata.value.split(',').map((s) => s.trim()).join('\n')
    }
  },
  methods: {
    updateValue (ev) {
      this.metadata.value = ev.target.value.split('\n').map((s) => s.trim()).join(',')
    }
  }
}
</script>
