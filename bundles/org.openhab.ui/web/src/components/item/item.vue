<template>
  <f7-list-item
    media-item
    class="itemlist-item"
    :link="link"
    :title="(item.label) ? item.label :item.name"
    :footer="(item.label) ? item.name : '\xa0'"
    :subtitle="noType ? '' : getItemTypeAndMetaLabel(item)"
    :after="state"
    v-on="$listeners">
    <oh-icon v-if="!noIcon && item.category" slot="media" :icon="item.category" :state="(noState) ? null : (context && context.store) ? context.store[item.name].state : item.state" height="32" width="32" />
    <span v-else-if="!noIcon" slot="media" class="item-initial">{{ item.name[0] }}</span>
    <f7-icon v-if="!item.editable && !ignoreEditable" slot="after-title" f7="lock_fill" size="1rem" color="gray" />
    <slot name="footer" #footer />
  </f7-list-item>
</template>

<script>
import ItemMixin from '@/components/item/item-mixin'

export default {
  mixins: [ItemMixin],
  props: ['item', 'context', 'ignoreEditable', 'noState', 'noType', 'noIcon', 'link'],
  computed: {
    state () {
      if (this.noState) return
      if (!this.context || !this.context.store) return this.item.state
      return this.context.store[this.item.name].displayState || this.context.store[this.item.name].state
    }
  }
}
</script>
