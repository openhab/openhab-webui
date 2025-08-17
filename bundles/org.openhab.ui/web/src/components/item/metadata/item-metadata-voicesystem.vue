<template>
  <div>
    <f7-list>
      <f7-list-input ref="input"
                     type="textarea"
                     :floating-label="$theme.md"
                     :label="'Custom Rules'"
                     name="custom-rules"
                     :value="customRules"
                     :disabled="!editable"
                     @input="updateValue" />
      <f7-block-footer class="param-description" slot="after-list">
        <small>Enter each rule on a separate line. Available placeholders: $name$, $cmd$ and $*$</small>
      </f7-block-footer>
    </f7-list>
    <config-sheet :parameterGroups="[]"
                  :parameters="ruleOptionParameters"
                  :configuration="metadata.config"
                  :read-only="!editable" />
  </div>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'
import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

export default {
  props: ['itemName', 'metadata'],
  mixins: [ItemMetadataMixin],
  components: {
    ConfigSheet
  },
  data: () => {
    return {
      ruleOptionParameters: [
        { type: 'BOOLEAN', name: 'isForced', label: 'Is Forced', description: 'Send command without check current Item state' },
        { type: 'BOOLEAN', name: 'isSilent', label: 'Is Silent', description: 'Disable success confirmation message' },
        { type: 'BOOLEAN', name: 'isTemplate', label: 'Is Template', description: 'Target similar Items instead of the current one' }
      ]
    }
  },
  computed: {
    customRules () {
      if (!this.metadata.value) return []
      return this.metadata.value.split('\n').map((s) => s.trim()).join('\n')
    }
  },
  methods: {
    updateValue (ev) {
      this.metadata.value = ev.target.value.split('\n').map((s) => s.trim()).join('\n')
    }
  }
}
</script>
