<template>
  <div>
    <f7-list>
      <f7-list-input
        label="Android App: Device Controls"
        name="value"
        ref="value"
        type="text"
        :value="metadata.value"
        :disabled="editable"
        @input="updateValue" />
      <f7-block-footer class="param-description" slot="after-list">
        <small>
          Enter a valid URL, e.g. <code>https://www.openhab.org</code>, <code>/locations</code> or <code>/basicui/app?w=0004&sitemap=mysitemap</code>, to open when you long-press a tile in Android Device Control.
          <f7-link external color="blue" target="_blank" :href="$store.state.websiteUrl + '/docs/apps/android.html#device-controls'">Read the docs.</f7-link>
        </small>
      </f7-block-footer>
    </f7-list>
  </div>
</template>

<script>
import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

export default {
  props: ['itemName', 'metadata'],
  mixins: [ItemMetadataMixin],
  methods: {
    updateValue (ev) {
      this.metadata.value = ev.target.value
    }
  }
}
</script>
