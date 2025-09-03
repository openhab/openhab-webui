<template>
  <div>
    <f7-list>
      <f7-list-input
        label="Android App: Device Controls"
        name="value"
        ref="value"
        type="text"
        :value="metadata.value"
        :disabled="editable ? true : null"
        @input="updateValue" />
      <template #after-list>
        <f7-block-footer class="param-description">
          <small>
            Enter a valid URL, e.g. <code>https://www.openhab.org</code>, <code>/locations</code> or
            <code>/basicui/app?w=0004&sitemap=mysitemap</code>, to open when you long-press a tile
            in Android Device Control.
            <f7-link external
                     color="blue"
                     target="_blank"
                     :href="runtimeStore.websiteUrl + '/docs/apps/android.html#device-controls'">Read the docs.</f7-link>
          </small>
        </f7-block-footer>
      </template>
    </f7-list>
  </div>
</template>

<script>
import { mapStores } from 'pinia'

import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  props: {
    itemName: String,
    metadata: Object
  },
  mixins: [ItemMetadataMixin],
  computed: {
    ...mapStores(useRuntimeStore)
  },
  methods: {
    updateValue (ev) {
      this.metadata.value = ev.target.value
    }
  }
}
</script>
