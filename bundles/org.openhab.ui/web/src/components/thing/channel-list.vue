<template>
  <f7-block v-if="thingType" class="channel-list">
    <f7-block v-show="thing.channels.length > 0">
      <f7-row>
        <f7-col class="padding-left">
          <f7-searchbar
            :disable-button="false"
            inline
            disable-link-text="Cancel"
            placeholder="Search channels"
            search-container=".channel-group"
            search-in=".channel-item .item-title, .channel-item .item-subtitle, .channel-item .item-footer"
            search-group=".channel-group .row"
            :clear-button="true"
          ></f7-searchbar>
        </f7-col>
      </f7-row>
    </f7-block>
    <div style="text-align:right" class="padding-right" v-if="hasAdvanced">
      <label @click="toggleAdvanced" class="advanced-label">Show advanced</label> <f7-checkbox name="channel-advanced" :checked="showAdvanced" @change="toggleAdvanced"></f7-checkbox>
    </div>
    <f7-col v-if="thing.channels.length > 0">
      <f7-block width="100" class="channel-group">
        <f7-row v-for="group in channelGroups" :key="group.id">
          <f7-col>
            <!-- <f7-block-title class="channel-group-title">{{group.label}}</f7-block-title>
            <f7-block-footer class="channel-description param-description" v-if="group.description">
              {{group.description}}
            </f7-block-footer> -->

            <channel-group
              :group="group"
              :thing="thing"
              :picker-mode="pickerMode" :multiple-links-mode="multipleLinksMode" :item-type-filter="itemTypeFilter"
              @selected="selectChannel"
              @channel-opened="channelOpened">
              <template v-slot:default="{ channelId, channelType, channel, extensible }" v-if="!pickerMode && !multipleLinksMode">
                <channel-link :opened="openedChannelId === channelId"
                  :thing="thing" :channelId="channelId" :channelType="channelType" :channel="channel" :extensible="extensible"
                  @channel-updated="(e) => $emit('channels-updated', e)">
                </channel-link>
              </template>
              <template v-slot:default="{ channel }" v-else-if="multipleLinksMode">
                <item-form v-if="isChecked(channel)" :item="newItem(channel)" :enable-name="true" :channel="channel" :checked="isChecked(channel)" />
              </template>
              <!-- <channel-link #default="{ channelId }" /> -->
            </channel-group>
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-col>
    <f7-col v-else>
      <f7-block strong>
        <f7-row>
          <f7-col class="padding-left">
            This thing has no channels. Either the thing type doesn't define channels, or they may be detected and appear later.
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-col>
  </f7-block>
</template>

<style lang="stylus">

.channel-list
  margin-left calc(-1*var(--f7-block-padding-horizontal))
  padding-left 0
  padding-right 0
.channel-group
  padding-right 0
  .list
    margin 0
</style>

<script>
import ChannelGroup from './channel-group.vue'
import ChannelLink from './channel-link.vue'
import ItemForm from '@/components/item/item-form.vue'

export default {
  props: ['thingType', 'thing', 'channelTypes', 'pickerMode', 'multipleLinksMode', 'itemTypeFilter', 'newItemsPrefix', 'newItems'],
  components: {
    ChannelGroup,
    ChannelLink,
    ItemForm
  },
  data () {
    return {
      showAdvanced: false,
      openedChannelId: '',
      openedChannel: null,
      selectedChannel: null,
      selectedChannels: [],
      channelTypesMap: new Map(this.channelTypes.map(ct => [ct.UID, ct]))
    }
  },
  computed: {
    isExtensible () {
      return this.thingType.extensibleChannelTypeIds.length > 0
    },
    channelGroups () {
      if (!this.thing || !this.thingType || !this.channelTypes) return {}
      let groups = this.thingType.channelGroups.map((g) => { return { id: g.id, label: g.label, description: g.description, channels: [] } })
      groups.push({ id: '', channels: [] })

      try {
        this.thing.channels.forEach((c) => {
          let groupIndex = groups.findIndex(g => g.id === c.id.split('#')[0])
          if (groupIndex < 0) groupIndex = groups.length - 1
          let channelType = this.channelTypesMap.get(c.channelTypeUID)
          if (!channelType) {
            console.warn('Channel type ' + c.channelTypeUID + ' not found for channel ' + c.id)
            return
          }
          if (this.showAdvanced || !channelType.advanced) {
            groups[groupIndex].channels.push({ channel: c, channelType: channelType, extensible: this.thingType.extensibleChannelTypeIds.indexOf(c.channelTypeUID.split(':')[1]) >= 0 })
          }
          if (channelType.advanced) groups[groupIndex].hasAdvanced = true
        })
      } catch (e) {
        console.warn(e)
      }

      return groups
    },
    hasAdvanced () {
      return this.channelGroups.some(g => g.hasAdvanced)
    }
  },
  methods: {
    toggleAdvanced (event) {
      this.showAdvanced = !this.showAdvanced // event.target.checked
    },
    selectChannel (channel, channelType) {
      if (this.pickerMode) {
        this.selectedChannel = channel
      } else if (this.multipleLinksMode) {
        this.toggleItemCheck(channel, channelType)
      }
      this.$emit('selected', channel, channelType)
    },
    isChecked (channel) {
      return this.selectedChannels.indexOf(channel) >= 0
    },
    toggleItemCheck (channel, channelType) {
      console.log('toggle check')
      if (this.isChecked(channel)) {
        this.selectedChannels.splice(this.selectedChannels.indexOf(channel), 1)
        this.newItems.splice(this.newItems.findIndex((i) => i.channel === channel), 1)
      } else {
        this.selectedChannels.push(channel)
        let newItemName = (this.newItemsPrefix) ? this.newItemsPrefix : this.thing.label.replace(/[^0-9a-z]/gi, '')
        newItemName += '_'
        newItemName += (channel.label) ? channel.label.replace(/[^0-9a-z]/gi, '') : channelType.label.replace(/[^0-9a-z]/gi, '')
        const newItem = {
          channel: channel,
          channelType: channelType,
          name: newItemName,
          label: channel.label || channelType.label,
          category: (channelType) ? channelType.category : '',
          type: channel.itemType,
          tags: ['Point']
        }
        this.newItems.push(newItem)
      }
    },
    newItem (channel) {
      return this.newItems.find((i) => i.channel === channel)
    },
    channelOpened (payload) {
      console.log('caught channel-opened')
      this.openedChannelId = payload.channelId
      this.openedChannel = payload.channel
    }
  }
}
</script>
