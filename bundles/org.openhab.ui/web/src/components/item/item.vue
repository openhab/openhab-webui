<template>
  <f7-list-item
    media-item
    class="itemlist-item"
    :link="link"
    :title="(item.label) ? item.label :item.name"
    :footer="(item.label) ? item.name : '\xa0'"
    :subtitle="getItemTypeAndMetaLabel(item)"
    :after="state"
    v-on="$listeners">
    <oh-icon v-if="!noIcon && item.category" slot="media" :icon="item.category" :state="(noState) ? null : (context && context.store) ? context.store[item.name].state : item.state" height="32" width="32" />
    <span v-else-if="!noIcon" slot="media" class="item-initial">{{ item.name[0] }}</span>
    <f7-icon v-if="!item.editable && !ignoreEditable" slot="after-title" f7="lock_fill" size="1rem" color="gray" />
    <slot name="footer" #footer />
  </f7-list-item>
</template>

<script>
export default {
  props: ['item', 'context', 'ignoreEditable', 'noState', 'noType', 'noIcon', 'link'],
  computed: {
    state () {
      if (this.noState) return
      if (!this.context || !this.context.store) return this.item.state
      return this.context.store[this.item.name].displayState || this.context.store[this.item.name].state
    }
  },
  methods: {
    getItemTypeAndMetaLabel () {
      if (this.noType) return
      let ret = this.item.type
      if (this.item.metadata && this.item.metadata.semantics) {
        ret += ' · '
        const classParts = this.item.metadata.semantics.value.split('_')
        ret += classParts[0]
        if (classParts.length > 1) {
          ret += ' > ' + classParts.pop()
          if (this.item.metadata.semantics.config && this.item.metadata.semantics.config.relatesTo) {
            const relatesToParts = this.item.metadata.semantics.config.relatesTo.split('_')
            if (relatesToParts.length > 1) {
              ret += ' · ' + relatesToParts.pop()
            }
          }
        }
      }
      return ret
    }
  }
}
</script>
