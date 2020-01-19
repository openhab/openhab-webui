<template>
  <f7-list :accordion-list="!pickerMode">
    <f7-list-item group-title v-if="group"
      :title="group.label"
      :description="group.description"
      :footer="group.description" />
    <f7-list-item
      :accordion-item="!pickerMode && !multipleLinksMode"
      :radio="pickerMode"
      :checkbox="multipleLinksMode"
      name="channel-picker"
      media-item class="channel-item"
      v-for="channelType in channelTypes"
      :key="channelType.id" :title="channelType.label"
      :footer="channelType.description"
      :subtitle="getChannelId(channelType) + ' (' + getItemType(channelType) + ')'"
      :badge="getLinkedItems(channelType).length || ''" badge-color="blue"
      @change="$emit('selected', getChannel(getChannelId(channelType)), channelType)"
      @accordion:beforeopen="openedChannel = channelType.id"
      @accordion:close="openedChannel = ''"
      @accordion:open="opened(channelType)">
      <oh-icon v-if="!extensible && channelType.category" slot="media" :icon="channelType.category" height="32" width="32" />
      <span v-else-if="channelType.label" slot="media" class="item-initial">{{channelType.label[0]}}</span>
      <f7-accordion-content v-if="!pickerMode">
        <slot :channelType="channelType" :channelId="getChannelId(channelType)"></slot>
      </f7-accordion-content>
      <div v-if="multipleLinksMode" slot="root-end">
        <slot :channelType="channelType" :channelId="getChannelId(channelType)" :channel="getChannel(getChannelId(channelType))"></slot>
      </div>
    </f7-list-item>
  </f7-list>
</template>

<script>
export default {
  props: [
    'extensible',
    'group',
    'channelTypes',
    'thing',
    'pickerMode',
    'multipleLinksMode',
    'itemTypeFilter'
  ],
  data () {
    return {
      openedChannel: ''
    }
  },
  methods: {
    getChannelId (channelType) {
      if (this.extensible) return channelType.id
      return (this.group) ? this.group.id + '#' + channelType.id : channelType.id
    },
    getChannel (channelId) {
      return this.channels[channelId]
      // return this.thing.channels.find((c) => c.id === channelId)
    },
    getLinkedItems (channelType) {
      const channelId = this.getChannelId(channelType)
      const channel = this.getChannel(channelId)
      if (!channel || !channel.linkedItems.length) return []
      return channel.linkedItems
    },
    getItemType (channelType) {
      const channelId = this.getChannelId(channelType)
      const channel = this.getChannel(channelId)
      if (channel && channel.kind === 'TRIGGER') return 'Trigger'
      if (!channel || !channel.itemType) return '?'
      return channel.itemType
    },
    getChannelKind (channelType) {
      const channelId = this.getChannelId(channelType)
      const channel = this.getChannel(channelId)
      if (channel && channel.kind === 'TRIGGER') return 'Trigger'
      return ''
    },
    opened (channelType) {
      console.log('channel opened')
      this.$emit('channel-opened', {
        channelId: this.getChannelId(channelType),
        channel: this.getChannel(channelType)
      })
    },
    isItemTypeCompatible (channelType) {
      if (!this.pickerMode || !this.itemTypeFilter) return true
      return this.getItemType(channelType) === this.itemTypeFilter
    }
  },
  computed: {
    channels () {
      let channels = {}
      this.channelTypes.forEach((channelType) => {
        const channelId = this.getChannelId(channelType)
        channels[channelId] = this.thing.channels.find((c) => c.id === channelId)
      })
      return channels
    }
  }
}
</script>

<style>

</style>
