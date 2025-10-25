<template>
  <f7-list-item v-bind="$attrs"
                media-item
                class="itemlist-item"
                :link="link"
                :title="(item.label) ? item.label : item.name"
                :footer="(item.label) ? item.name : '\xa0'"
                :subtitle="noType ? '' : getItemTypeAndMetaLabel(item)"
                :after="state">
    <template #media>
      <oh-icon v-if="!noIcon && item.category"
               :icon="item.category"
               :state="(noState || item.type === 'Image') ? null : context?.store[item.name]?.state || item.state"
               height="32"
               width="32" />
      <span v-else-if="!noIcon" class="item-initial">{{ item.name[0] }}</span>
    </template>
    <template #after-title>
      <f7-icon v-if="!item.editable"
               f7="lock_fill"
               size="1rem"
               color="gray" />
    </template>
    <slot name="footer" />
    <template #subtitle>
      <div v-if="!noTags">
        <f7-chip v-for="tag in getNonSemanticTags(item)"
                 :key="tag"
                 :text="tag"
                 media-bg-color="blue"
                 style="margin-right: 6px">
          <template #media>
            <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
          </template>
        </f7-chip>
      </div>
    </template>
  </f7-list-item>
</template>

<script>
import ItemMixin from '@/components/item/item-mixin'

export default {
  mixins: [ItemMixin],
  props: {
    item: Object,
    context: Object,
    noState: Boolean,
    noType: Boolean,
    noIcon: Boolean,
    noTags: Boolean,
    link: String
  },
  computed: {
    state () {
      if (this.noState) return
      if (!this.context || !this.context.store) return this.item.state
      return this.context.store[this.item.name].displayState || this.context.store[this.item.name].state
    }
  }
}
</script>
