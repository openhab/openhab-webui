<template>
  <f7-list-item
  media-item
  class="itemlist-item"
  :link="link"
  :title="(item.label) ? item.label :item.name"
  :footer="(item.label) ? item.name : '\xa0'"
  :subtitle="getItemTypeAndMetaLabel(item)"
  :after="item.state"
>
  <oh-icon v-if="item.category" slot="media" :icon="item.category" height="32" width="32" />
  <span v-else slot="media" class="item-initial">{{item.name[0]}}</span>
  <f7-icon v-if="!item.editable" slot="after-title" f7="lock_fill" size="1rem" color="gray"></f7-icon>
</f7-list-item>
</template>

<script>
export default {
  props: ['item', 'link'],
  methods: {
    getItemTypeAndMetaLabel () {
      let ret = this.item.type
      if (this.item.metadata && this.item.metadata.semantics) {
        ret += ' · '
        const classParts = this.item.metadata.semantics.value.split('_')
        ret += classParts[0]
        if (classParts.length > 1) {
          ret += '>' + classParts.pop()
        }
      }
      return ret
    }
  }
}
</script>
