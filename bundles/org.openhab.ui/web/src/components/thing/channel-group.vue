<template>
  <f7-list :accordion-list="!pickerMode">
    <f7-list-item v-if="group && group.label && group.channels.length > 0"
                  group-title
                  :title="group.label"
                  :description="group.description"
                  :footer="group.description" />
    <f7-list-item v-for="c in group.channels"
                  :key="c.channel.id"
                  :title="c.channel.label || c.channelType.label"
                  v-show="!(pickerMode || multipleLinksMode) || c.channelType.kind !== 'TRIGGER'"
                  :accordion-item="!pickerMode && !multipleLinksMode"
                  :radio="pickerMode"
                  :checkbox="multipleLinksMode"
                  :checked="isSelected(c.channel) ? true : null"
                  name="channel-picker"
                  media-item
                  class="channel-item"
                  :subtitle="c.channel.id + ' (' + getItemType(c.channelType) + ')'"
                  :badge="getLinkedItems(c.channel).length || ''"
                  badge-color="blue"
                  @change="$emit('selected', c.channel, c.channelType)"
                  @accordion:beforeopen="openedChannel = c.channelType.id"
                  @accordion:close="openedChannel = ''"
                  @accordion:open="opened(c.channel)">
      <template #footer>
        <div v-html="c.channel.description || c.channelType.description" />
      </template>
      <!-- Icon or initial letter -->
      <template #media>
        <oh-icon v-if="!c.extensible && c.channelType.category"
                 :icon="c.channelType.category"
                 height="32"
                 width="32" />
        <span v-else-if="c.extensible && c.channel.label" class="item-initial">{{ c.channel.label[0] }}</span>
        <span v-else-if="!c.extensible && c.channelType.label" class="item-initial">{{ c.channelType.label[0] }}</span>
      </template>
      <!-- Channel links -->
      <f7-accordion-content v-if="!pickerMode" class="searchbar-ignore">
        <slot :channelType="c.channelType"
              :channelId="c.channel.id"
              :channel="c.channel"
              :extensible="c.extensible" />
      </f7-accordion-content>
      <template #root-end>
        <div v-if="multipleLinksMode">
          <slot :channelType="c.channelType"
                :channelId="c.channel.id"
                :channel="c.channel"
                :extensible="c.extensible" />
        </div>
      </template>
      <template #subtitle>
        <clipboard-icon class="channel-clipboard-icon"
                        :value="c.channel.uid"
                        tooltip="Copy UID"
                        color="gray" />
      </template>
    </f7-list-item>
  </f7-list>
</template>

<style lang="stylus">
.channel-clipboard-icon
  margin-left 3px
</style>

<script>
import ClipboardIcon from '@/components/util/clipboard-icon.vue'

export default {
  components: {
    ClipboardIcon
  },
  props: {
    extensible: Boolean,
    group: Object,
    channelTypes: Array,
    thing: Object,
    pickerMode: Boolean,
    multipleLinksMode: Boolean,
    itemTypeFilter: String,
    selection: [String, Array]
  },
  emits: ['selected', 'channel-opened'],
  data () {
    return {
      openedChannel: ''
    }
  },
  methods: {
    getLinkedItems (channel) {
      if (!channel || !channel.linkedItems.length) return []
      return channel.linkedItems
    },
    getItemType (channel) {
      if (channel && channel.kind === 'TRIGGER') return 'Trigger'
      if (!channel || !channel.itemType) return '?'
      return channel.itemType
    },
    getChannelKind (channel) {
      if (channel && channel.kind === 'TRIGGER') return 'Trigger'
      return ''
    },
    opened (channel) {
      this.$emit('channel-opened', {
        channelId: channel.id,
        channel
      })
    },
    isItemTypeCompatible (channelType) {
      if (!this.pickerMode || !this.itemTypeFilter) return true
      return this.getItemType(channelType) === this.itemTypeFilter
    },
    isSelected (channel) {
      if (Array.isArray(this.selection)) {
        return this.selection.indexOf(channel) >= 0
      } else {
        return this.selection === channel
      }
    }
  }
}
</script>
