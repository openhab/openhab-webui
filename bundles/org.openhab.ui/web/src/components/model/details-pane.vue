<template>
  <div>
    <item-state-preview v-if="model.item.created !== false" :item="model.item" :context="context" />

    <f7-block-title>Item</f7-block-title>
    <item-details
      :model="model"
      :links="links"
      :items="items"
      :context="context"
      @item-updated="$emit('item-updated')"
      @item-created="$emit('item-created')"
      @item-removed="$emit('item-removed')"
      @cancel-create="$emit('cancel-create')" />
    <metadata-menu v-if="model.item.created !== false" :item="model.item" :f7router />
    <link-details :item="model.item" :links="links" :f7router />
  </div>
</template>

<script>
import { f7 } from 'framework7-vue'

import ItemStatePreview from '@/components/item/item-state-preview.vue'
import ItemDetails from '@/components/model/item-details.vue'
import MetadataMenu from '@/components/item/metadata/item-metadata-menu.vue'
import LinkDetails from '@/components/model/link-details.vue'

export default {
  props: {
    model: Object,
    links: Array,
    items: Array,
    context: Object,
    f7router: Object
  },
  components: {
    ItemStatePreview,
    ItemDetails,
    MetadataMenu,
    LinkDetails
  },
  emits: ['item-updated', 'item-created', 'item-removed', 'cancel-create'],
  setup() {
    return {
      f7
    }
  }
}
</script>
