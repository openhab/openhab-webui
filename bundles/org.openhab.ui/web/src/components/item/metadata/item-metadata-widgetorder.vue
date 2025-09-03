<template>
  <div>
    <f7-list>
      <f7-list-input
        label="Order in Lists"
        name="value"
        ref="value"
        type="text"
        :value="metadata.value"
        :disabled="!editable ? true : null"
        @input="(ev) => metadata.value = ev.target.value" />
    </f7-list>
    <f7-block-footer class="param-description padding-left">
      <small>Order index to give to the item's default widget when it is to be displayed in an
        automatically generated list with other items (semantic cards, group popups...), unless the
        order is explicitely configured.</small>
      <br><br>
      <small>Lower integer values promote items to the top, higher ones push them to the bottom. Those
        without an index set will be presented last, in alphabetical order.</small>
    </f7-block-footer>
  </div>
</template>

<script>
import ItemMetadataMixin from '@/components/item/metadata/item-metadata-mixin'

export default {
  props: {
    itemName: String,
    metadata: Object
  },
  mixins: [ItemMetadataMixin]
}
</script>
