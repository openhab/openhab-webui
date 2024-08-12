<template>
  <f7-list :accordion-list="!pickerMode">
    <f7-list-item group-title v-if="group && group.label && group.channels.length > 0"
                  :title="group.label"
                  :description="group.description"
                  :footer="group.description" />
    <f7-list-item
      v-for="c in group.channels"
      :key="c.channel.id" :title="c.channel.label || c.channelType.label"
      v-show="!(pickerMode || multipleLinksMode) || c.channelType.kind !== 'TRIGGER'"
      :accordion-item="!pickerMode && !multipleLinksMode"
      :radio="pickerMode"
      :checkbox="multipleLinksMode"
      :checked="isSelected(c.channel)"
      name="channel-picker"
      media-item class="channel-item"
      :subtitle="c.channel.id + ' (' + getItemType(c.channelType) + ')'"
      :badge="getLinkedItems(c.channel).length || ''" badge-color="blue"
      @change="$emit('selected', c.channel, c.channelType)"
      @accordion:beforeopen="openedChannel = c.channelType.id"
      @accordion:close="openedChannel = ''"
      @accordion:open="opened(c.channel)">
      <div slot="footer" v-html="c.channel.description || c.channelType.description" />
      <!-- Icon or initial letter -->
      <oh-icon v-if="!c.extensible && c.channelType.category" slot="media" :icon="c.channelType.category" height="32" width="32" />
      <span v-else-if="c.extensible && c.channel.label" slot="media" class="item-initial">{{ c.channel.label[0] }}</span>
      <span v-else-if="!c.extensible && c.channelType.label" slot="media" class="item-initial">{{ c.channelType.label[0] }}</span>
      <!-- Channel links -->
      <f7-accordion-content v-if="!pickerMode" class="searchbar-ignore">
        <slot :channelType="c.channelType" :channelId="c.channel.id" :channel="c.channel" :extensible="c.extensible" />
      </f7-accordion-content>
      <div v-if="multipleLinksMode" slot="root-end">
        <slot :channelType="c.channelType" :channelId="c.channel.id" :channel="c.channel" :extensible="c.extensible" />
      </div>
      <clipboard-icon slot="subtitle" class="channel-clipboard-icon" :value="c.channel.uid" tooltip="Copy UID" color="gray" />
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
  props: [
    'extensible',
    'group',
    'channelTypes',
    'thing',
    'pickerMode',
    'multipleLinksMode',
    'itemTypeFilter',
    'selection'
  ],
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
