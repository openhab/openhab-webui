<template>
  <f7-block v-if="thingType" class="channel-list no-margin">
    <f7-block v-show="thing.channels.length > 0">
      <f7-col>
        <f7-searchbar
          ref="searchbar"
          :disable-button="false"
          inline
          disable-link-text="Cancel"
          placeholder="Search channels"
          search-container=".channel-group"
          search-in=".channel-item .item-title, .channel-item .item-subtitle, .channel-item .item-footer"
          search-group=".channel-group .row"
          :clear-button="true" />
      </f7-col>
    </f7-block>
    <div style="text-align:right" class="padding-right" v-if="hasAdvanced">
      <label @click="toggleAdvanced" class="advanced-label">Show advanced</label> <f7-checkbox name="channel-advanced" :checked="showAdvanced" @change="toggleAdvanced" />
    </div>
    <f7-col v-if="thing.channels.length > 0">
      <f7-block width="100" class="channel-group no-margin no-padding" ref="channelList">
        <f7-row class="searchbar-ignore">
          <f7-col class="padding-left padding-right searchbar-ignore">
            <f7-segmented class="searchbar-ignore" strong tag="p">
              <f7-button class="searchbar-ignore" @click="toggleLinkFilter(undefined)" small :active="showLinked === undefined" text="All" />
              <f7-button class="searchbar-ignore" @click="toggleLinkFilter(true)" small :active="showLinked === true" text="Linked" />
              <f7-button class="searchbar-ignore" @click="toggleLinkFilter(false)" small :active="showLinked === false" text="Unlinked" />
            </f7-segmented>
          </f7-col>
        </f7-row>
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
              :selection="(multipleLinksMode) ? selectedChannels : selectedChannel"
              @selected="selectChannel"
              @channel-opened="channelOpened">
              <template #default="{ channelId, channelType, channel, extensible }" v-if="!pickerMode && !multipleLinksMode">
                <channel-link :opened="openedChannelId === channelId"
                              :thing="thing" :channelId="channelId" :channelType="channelType" :channel="channel" :extensible="extensible" :context="context"
                              @channel-updated="(e) => $emit('channels-updated', e)" />
              </template>
              <template #default="{ channelType, channel }" v-else-if="multipleLinksMode">
                <item-picker v-if="isChecked(channel) && hasLinks(channel)"
                             :title="selectedItem(channel) ? 'Change Selected Item' : 'Pick Existing Linked Item'"
                             textColor="blue" :hideIcon="true"
                             :items="items.filter((i) => channel.linkedItems.includes(i.name))"
                             :multiple="false" :noModelPicker="true" :setValueText="false"
                             :value="selectedItem(channel)?.name"
                             @input="selectExistingItem($event, channel, channelType)" />
                <item-form v-if="selectedItem(channel)"
                           :item="selectedItem(channel)"
                           :items="items"
                           :createMode="false" />
                <item-form v-else-if="isChecked(channel)"
                           :item="newItem(channel)"
                           :items="items"
                           :createMode="true"
                           :unitHint="getUnitHint(channel, channelType)"
                           :stateDescription="stateDescription(channelType)" />
              </template>
              <!-- <channel-link #default="{ channelId }" /> -->
            </channel-group>
          </f7-col>
        </f7-row>
        <f7-list v-if="multipleLinksMode">
          <f7-list-button style="padding-left: 0; text-align: left" color="blue" @click="toggleAllChecks(true)">
            Select All
          </f7-list-button>
          <f7-list-button color="blue" @click="toggleAllChecks(false)">
            Unselect All
          </f7-list-button>
        </f7-list>
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
import ItemPicker from '@/components/config/controls/item-picker.vue'

import uomMixin from '@/components/item/uom-mixin'

import cloneDeep from 'lodash/cloneDeep'

export default {
  mixins: [uomMixin],
  props: ['thingType', 'thing', 'channelTypes', 'items', 'pickerMode', 'multipleLinksMode', 'itemTypeFilter', 'newItemsPrefix', 'newItems', 'updatedItems', 'context'],
  components: {
    ChannelGroup,
    ChannelLink,
    ItemForm,
    ItemPicker
  },
  data () {
    return {
      showAdvanced: false,
      showLinked: undefined,
      openedChannelId: '',
      openedChannel: null,
      selectedChannel: null,
      selectedChannels: [],
      channelTypesMap: new Map(this.channelTypes.map(ct => [ct.UID, ct]))
    }
  },
  watch: {
    newItemsPrefix () {
      this.newItems.forEach((i) => {
        i.name = this.newItemName(i.channel, i.channelType)
      })
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
          if ((this.showAdvanced || !channelType.advanced)) {
            if ((this.showLinked === undefined || (this.showLinked === true && this.hasLinks(c)) || (this.showLinked === false && !this.hasLinks(c)))) {
              groups[groupIndex].channels.push({ channel: c, channelType, extensible: this.thingType.extensibleChannelTypeIds.indexOf(c.channelTypeUID.split(':')[1]) >= 0 })
            }
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
    toggleLinkFilter (val) {
      this.showLinked = val
      const searchbar = this.$refs.searchbar.$el.f7Searchbar
      const filterQuery = searchbar.query
      this.$nextTick(() => {
        if (filterQuery) {
          searchbar.clear()
          searchbar.search(filterQuery)
        }
      })
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
    hasLinks (channel) {
      return channel.linkedItems && channel.linkedItems.length > 0
    },
    toggleItemCheck (channel, channelType) {
      if (this.isChecked(channel)) {
        this.selectedChannels.splice(this.selectedChannels.indexOf(channel), 1)
        this.newItems.splice(this.newItems.findIndex((i) => i.channel === channel), 1)
        this.updatedItems.splice(this.updatedItems.findIndex((i) => i.channel === channel))
      } else {
        this.selectedChannels.push(channel)
        this.createNewItem(channel, channelType)
      }
    },
    channelUnit (channel, channelType) {
      const dimension = channel.itemType.startsWith('Number:') ? channel.itemType.split(':')[1] : ''
      return dimension ? this.getUnitHint(dimension, channelType) : ''
    },
    stateDescription (channelType) {
      return channelType?.stateDescription?.pattern
    },
    toggleAllChecks (checked) {
      this.thing.channels.forEach((c) => {
        const channelType = this.channelTypesMap.get(c.channelTypeUID)
        if (!channelType) return
        if (channelType.advanced && !this.showAdvanced) return
        if (this.showLinked === true && !this.hasLinks(c)) return
        if (this.showLinked === false && this.hasLinks(c)) return
        if (this.isChecked(c) === checked) return
        this.toggleItemCheck(c, channelType)
      })
      this.$$(this.$refs.channelList.$el).find('input[type="checkbox"]').forEach((i) => { this.$$(i).prop('checked', checked) })
    },
    newItem (channel) {
      return this.newItems.find((i) => i.channel === channel)
    },
    createNewItem (channel, channelType) {
      const defaultTags = (channel.defaultTags.length > 0) ? channel.defaultTags : channelType.tags
      const newItem = {
        channel,
        channelType,
        name: this.newItemName(channel, channelType),
        label: channel.label || channelType.label,
        category: (channelType) ? channelType.category : '',
        type: channel.itemType,
        unit: this.channelUnit(channel, channelType),
        stateDescriptionPattern: '',
        tags: (defaultTags.find((t) => this.$store.getters.semanticClasses.Points.indexOf(t) >= 0)) ? defaultTags : [...defaultTags, 'Point']
      }
      this.newItems.push(newItem)
    },
    newItemName (channel, channelType) {
      let name = this.newItemsPrefix || this.$oh.utils.normalizeLabel(this.thing.label)
      name += '_'
      let suffix = channel.label || channelType.label || channel.id
      if (this.thing.channels.filter((c) => c.label === suffix || (c.channelTypeUID && this.channelTypesMap[c.channelTypeUID] && this.channelTypesMap[c.channelTypeUID].label === suffix)).length > 1) {
        suffix = channel.id.replace('#', '_').replace(/(^\w{1})|(_+\w{1})/g, letter => letter.toUpperCase())
      }
      name += this.$oh.utils.normalizeLabel(suffix)
      return name
    },
    selectExistingItem (value, channel, channelType) {
      const item = cloneDeep(this.items.find((i) => i.name === value))
      if (!item) {
        this.updatedItems.splice(this.updatedItems.findIndex((i) => i.channel === channel), 1)
        this.createNewItem(channel, channelType)
        return
      }
      item.channel = channel
      if (!item.tags) {
        item.tags = []
      }
      const hasPointTag = item.tags.find((t) => this.$store.getters.semanticClasses.Points.indexOf(t) >= 0)
      if (!hasPointTag) {
        const defaultTags = (channel.defaultTags.length > 0) ? channel.defaultTags : channelType.tags
        item.tags = (defaultTags.find((t) => this.$store.getters.semanticClasses.Points.indexOf(t) >= 0)) ? [...item.tags, ...defaultTags] : [...item.tags, ...defaultTags, 'Point']
      }
      this.updatedItems.push(item)
    },
    selectedItem (channel) {
      return this.updatedItems.find((i) => i.channel === channel)
    },
    channelOpened (payload) {
      this.openedChannelId = payload.channelId
      this.openedChannel = payload.channel
    }
  }
}
</script>
