<template>
  <div>
    <f7-list>
      <f7-list-input
        ref="input"
        type="textarea"
        :floating-label="theme.md"
        :label="'Synonyms'"
        name="synonyms"
        :value="synonyms"
        :disabled="!editable ? true : null"
        @input="updateValue" />
      <template #after-list>
        <f7-block-footer class="param-description">
          <small>Enter each synonym on a separate line.</small>
        </f7-block-footer>
      </template>
    </f7-list>
  </div>
</template>

<script>
import { theme } from 'framework7-vue'

import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

export default {
  props: {
    itemName: String,
    metadata: Object
  },
  mixins: [ItemMetadataMixin],
  setup () {
    return { theme }
  },
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
