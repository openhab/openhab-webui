<template>
  <f7-block v-if="thingType" class="channel-list">
    <f7-block>
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
    <f7-col v-if="thingType.channelGroups.length">
      <f7-block width="100" class="channel-group">
        <f7-row v-for="group in thingType.channelGroups" :key="group.id">
          <f7-col>
            <!-- <f7-block-title class="channel-group-title">{{group.label}}</f7-block-title>
            <f7-block-footer class="channel-description param-description" v-if="group.description">
              {{group.description}}
            </f7-block-footer> -->

            <channel-group
              :group="group"
              :channelTypes="displayedChannelTypes(group)"
              :thing="thing"
              :picker-mode="pickerMode" :multiple-links-mode="multipleLinksMode" :item-type-filter="itemTypeFilter"
              @selected="selectChannel"
              @channel-opened="channelOpened">
              <template v-slot:default="{ channelId, channelType }" v-if="!pickerMode && !multipleLinksMode">
                <channel-link :opened="openedChannelId === channelId"
                  :thing="thing" :channelId="channelId" :channelType="channelType" :channel="openedChannel"
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
    <f7-col v-else-if="knownChannelTypesUID.length > 0 || dynamicChannels.length > 0">
      <f7-block width="100" class="channel-group">
        <f7-row>
          <f7-col>
            <channel-group
              :channelTypes="displayedChannelTypes()"
              :thing="thing"
              :picker-mode="pickerMode" :multiple-links-mode="multipleLinksMode" :item-type-filter="itemTypeFilter"
              @selected="selectChannel"
              @channel-opened="channelOpened">
              <template v-slot:default="{ channelId, channelType, channel }" v-if="!pickerMode && !multipleLinksMode">
                <channel-link :opened="openedChannelId === channelId"
                  :thing="thing" :channelId="channelId" :channelType="channelType" :channel="openedChannel"
                  @channel-updated="(e) => $emit('channels-updated', e)">
                </channel-link>
              </template>
              <template v-slot:default="{ channel }" v-else-if="multipleLinksMode">
                <item-form v-if="isChecked(channel)" :item="newItem(channel)" :enable-name="true" :channel="channel" :checked="isChecked(channel)" />
              </template>
            </channel-group>

            <channel-group
              :extensible="true"
              :channelTypes="dynamicChannels"
              :thing="thing"
              :picker-mode="pickerMode" :multiple-links-mode="multipleLinksMode" :item-type-filter="itemTypeFilter"
              @selected="selectChannel"
              @channel-opened="channelOpened">
              <template v-slot:default="{ channelId, channelType }" v-if="!pickerMode && !multipleLinksMode">
                <channel-link :opened="openedChannelId === channelId" :extensible="true"
                  :thing="thing" :channelId="channelId" :channelType="channelType" :channel="openedChannel"
                  @channel-updated="(e) => $emit('channels-updated', e)">
                </channel-link>
              </template>
              <template v-slot:default="{ channel, channelId, channelType }" v-else-if="multipleLinksMode">
                <item-form v-if="isChecked(channel)" :item="newItem(channel)" :enable-name="true" :channel="channel" :checked="isChecked(channel)" />
              </template>
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
  props: ['thingType', 'thing', 'pickerMode', 'multipleLinksMode', 'itemTypeFilter', 'newItems'],
  components: {
    ChannelGroup,
    ChannelLink,
    ItemForm
  },
  data () {
    let knownChannelTypesUID = []
    if (this.thingType) {
      this.thingType.channelGroups.forEach((g) => {
        g.channels.forEach((c) => {
          knownChannelTypesUID.push(g.id + '#' + c.id)
        })
      })
      this.thingType.channels.forEach((c) => {
        knownChannelTypesUID.push(c.id)
      })
    }
    return {
      showAdvanced: false,
      openedChannelId: '',
      openedChannel: null,
      selectedChannel: null,
      selectedChannels: [],
      knownChannelTypesUID: knownChannelTypesUID
    }
  },
  computed: {
    isExtensible () {
      return this.thingType.extensibleChannelTypeIds.length > 0
    },
    hasAdvanced () {
      if (this.thingType.channelGroups.length > 0) {
        return this.thingType.channelGroups.some((g) => g.channels.some((c) => c.advanced))
      } else {
        return this.thingType.channels.some((c) => c.advanced)
      }
    },
    dynamicChannels () {
      return this.thing.channels.filter((c) => this.knownChannelTypesUID.indexOf(c.id) < 0 || this.thingType.extensibleChannelTypeIds.indexOf(c.channelTypeUID.split(':')[1]) >= 0)
    },
    displayedChannelTypes () {
      if (!this.thingType) return []
      return (group) => {
        if (!group) {
          return (this.showAdvanced) ? this.thingType.channels : this.thingType.channels.filter((p) => p.advanced === false)
        } else {
          return (this.showAdvanced) ? group.channels : group.channels.filter((p) => p.advanced === false)
        }
      }
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
        const newItem = {
          channel: channel,
          channelType: channelType,
          name: this.thing.label.replace(/[^0-9a-z]/gi, '') + '_' + channel.label.replace(/[^0-9a-z]/gi, ''),
          label: channel.label,
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
