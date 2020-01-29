<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Link Channel to Item" back-link="Cancel">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Link</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col v-if="channel">
        <f7-block-title>Channel</f7-block-title>
        <f7-list media-list>
          <f7-list-item media-item class="channel-item"
            :title="channel.label || channelType.label"
            :footer="channel.description || channelType.description"
            :subtitle="channel.uid">
          </f7-list-item>
        </f7-list>
      </f7-col>

      <!-- Option to create new item (if not supplied by prop) -->
      <f7-col v-if="!item">
        <f7-block-title>Item</f7-block-title>
        <f7-list media-list>
          <f7-list-item radio :checked="createItem === false" value="false" @change="createItem = false" title="Use an existing Item" name="item-creation-choice" />
          <f7-list-item radio :checked="createItem === true" value="true" @change="createItem = true" title="Create a new Item" name="item-creation-choice" />
        </f7-list>
      </f7-col>

      <!-- Choose item to link -->
      <f7-col v-if="createItem === false && !item">
        <f7-list>
          <!-- TODO: filter with compatible item types -->
          <item-picker key="itemLink" title="Item to Link" name="item" :value="selectedItemName" :multiple="false"
            @input="(value) => selectedItemName = value"></item-picker>
        </f7-list>
      </f7-col>

      <!-- Create new item -->
      <f7-col v-else-if="createItem === true">
        <item-form :item="newItem" :enable-name="true" />
        <f7-list>
          <item-picker key="newItem-groups" title="Parent Group(s)" name="parent-groups" :value="newItem.groupNames" @input="(value) => newItem.groupNames = value" :multiple="true" filterType="Group"></item-picker>
        </f7-list>
      </f7-col>

      <!-- Item to link supplied as prop -->
      <f7-col v-else-if="item">
        <f7-block-title>Item</f7-block-title>
        <f7-list media-list>
          <ul>
            <item :item="item" />
          </ul>
        </f7-list>
        <f7-block-title>Thing</f7-block-title>
        <f7-list inline-labels no-hairlines-md>
          <thing-picker title="Thing" name="thing" :value="selectedThingId" @input="(e) => selectedThingId = e" />
        </f7-list>
        <div v-if="selectedThing.UID && selectedThingType.UID">
          <f7-block-title>Channel</f7-block-title>
            <channel-list :thing="selectedThing" :thingType="selectedThingType"
              :picker-mode="true" :item-type-filter="item.type" :channel-types="selectedThingChannelTypes"
              @selected="(channel) => loadProfileTypes(channel)" />
        </div>
      </f7-col>

      <f7-block v-if="!itemTypeCompatible()" class="text-color-red">
        The channel and the item type are not compatible.
      </f7-block>

      <f7-block v-if="!ready" class="text-align-center">
        <f7-preloader></f7-preloader>
        <div>Loading...</div>
      </f7-block>

      <!-- Profile configuration -->
      <f7-col v-else-if="profileTypes.length">
        <f7-block-title>Profile</f7-block-title>
        <f7-block-footer class="padding-left padding-right">
          Profiles define how Channels and Items work together. Install transformation add-ons to get additional profiles.
          <f7-link external color="blue" target="_blank" href="https://www.openhab.org/docs/configuration/items.html#profiles">Learn more about profiles.</f7-link>
        </f7-block-footer>
        <f7-list>
          <f7-list-item radio :checked="!currentProfileType" value="" @change="onProfileTypeChange()" title="No Profile (Default)" name="profile-type" />
          <f7-list-item radio v-for="profileType in profileTypes"
            :value="profileType.uid"
            @change="onProfileTypeChange(profileType.uid)"
            :key="profileType.uid" :title="profileType.label" name="profile-type"></f7-list-item>
        </f7-list>
      </f7-col>
      <f7-col v-if="profileTypeConfiguration != null">
        <f7-block-title>Profile Configuration</f7-block-title>
          <config-sheet
            :parameter-groups="profileTypeConfiguration.parameterGroups"
            :parameters="profileTypeConfiguration.parameters"
            :configuration="configuration"
          />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ThingPicker from '@/components/config/controls/thing-picker.vue'
import ChannelList from '@/components/thing/channel-list.vue'
import ItemForm from '@/components/item/item-form.vue'

import Item from '@/components/item/item.vue'

import { Categories } from '@/assets/categories.js'
import * as Types from '@/assets/item-types.js'
import * as SemanticClasses from '@/assets/semantics.js'

export default {
  components: {
    ConfigSheet,
    ItemPicker,
    ThingPicker,
    Item,
    ChannelList,
    ItemForm
  },
  props: ['thing', 'channel', 'channelType', 'item'],
  data () {
    return {
      ready: true,
      createItem: false,
      link: {
        itemName: null,
        channelUID: null,
        configuration: {}
      },
      selectedItem: null,
      selectedItemName: null,
      selectedThingId: '',
      selectedThing: {},
      selectedThingType: {},
      selectedThingChannelTypes: {},
      selectedChannel: null,
      profileTypes: [],
      currentProfileType: null,
      profileTypeConfiguration: null,
      newItem: {},
      configuration: {},
      types: Types,
      semanticClasses: SemanticClasses
    }
  },
  methods: {
    onPageAfterIn (event) {
      if (!this.channel) return
      this.loadProfileTypes(this.channel)
      let newItemName = this.thing.label.replace(/[^0-9a-z]/gi, '')
      newItemName += '_'
      newItemName += (this.channel.label) ? this.channel.label.replace(/[^0-9a-z]/gi, '') : this.channelType.label.replace(/[^0-9a-z]/gi, '')
      this.$set(this, 'newItem', {
        name: newItemName,
        label: this.channel.label || this.channelType.label,
        category: (this.channelType) ? this.channelType.category : '',
        groupNames: [],
        type: this.channel.itemType,
        tags: ['Point']
      })
    },
    loadProfileTypes (channel) {
      this.ready = false
      this.selectedChannel = channel
      const getProfileTypes = this.$oh.api.get('/rest/profile-types?channelTypeUID=' + channel.channelTypeUID)
      getProfileTypes.then((data) => {
        this.profileTypes = data
        this.ready = true
      })
    },
    onProfileTypeChange (profileTypeUid) {
      if (!profileTypeUid) {
        this.profileTypeConfiguration = null
        this.currentProfileType = null
        return
      }
      this.currentProfileType = this.profileTypes.find((p) => p.uid === profileTypeUid)
      const getProfileConfigDescription = this.$oh.api.get('/rest/config-descriptions/profile:' + profileTypeUid)
      getProfileConfigDescription.then((data) => {
        this.profileTypeConfiguration = data
      }).catch((err) => {
        // just clear out the config sheet
        console.log(`No configuration for profile type ${profileTypeUid}: ` + err)
        this.profileTypeConfiguration = null
      })
    },
    itemTypeCompatible () {
      // debugger
      // TODO move to testable .js file
      let item = this.item
      if (!item) item = (this.createItem) ? this.newItem : this.selectedItem
      if (!item) return true
      if (!item.type) return true
      if (!this.selectedChannel) return true
      if (!this.selectedChannel.itemType) return false

      if (this.currentProfileType && this.currentProfileType.supportedItemTypes && this.currentProfileType.supportedItemTypes.length > 0) {
        return (this.currentProfileType.supportedItemTypes.indexOf(this.item.type) >= 0)
      }

      const channelItemType = this.selectedChannel.itemType
      if (channelItemType === item.type) return true

      // Exceptions
      if (item.type.indexOf('Number') === 0 && channelItemType.indexOf('Number') === 0) return true
      if (item.type.indexOf('Number') === 0 && channelItemType === 'Dimmer') return true
      if (channelItemType === 'Color' && (item.type === 'Dimmer' || item.type === 'Switch')) return true
      if (channelItemType === 'Dimmer' && item.type === 'Switch') return true

      return false
    },
    save () {
      const link = {}
      if (this.channel) {
        link.channelUID = this.channel.uid
      } else if (this.selectedChannel) {
        link.channelUID = this.selectedChannel.uid
      }

      if (this.item) {
        link.itemName = this.item.name
      } else if (this.createItem) {
        link.itemName = this.newItem.name
      } else if (this.selectedItemName) {
        link.itemName = this.selectedItemName
      }

      link.configuration = Object.assign({}, this.configuration)
      if (this.currentProfileType) {
        link.configuration.profile = this.currentProfileType.uid
      }

      // checks
      if (!link.itemName) {
        this.$f7.dialog.alert('Please configure the item to link')
        return
      }
      if (!link.channelUID) {
        this.$f7.dialog.alert('Please configure the channel to link')
        return
      }
      // temporarily disabled
      // if (!this.itemTypeCompatible()) {
      //   this.$f7.dialog.alert('The channel and item type are not compatible')
      //   return
      // }

      if (this.createItem) {
        this.$oh.api.put('/rest/items/' + this.newItem.name, this.newItem).then((data) => {
          this.$oh.api.put('/rest/links/' + link.itemName + '/' + encodeURIComponent(link.channelUID), link).then((data) => {
            this.$f7.toast.create({
              text: 'Item and link created',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            this.$f7router.back()
          })
        })
      } else {
        this.$oh.api.put('/rest/links/' + link.itemName + '/' + encodeURIComponent(link.channelUID), link).then((data) => {
          this.$f7.toast.create({
            text: 'Link created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$f7router.back()
        })
      }
    }
  },
  watch: {
    selectedThingId () {
      this.selectedThing = {}
      this.selectedThingType = {}
      this.profileTypes = []
      this.currentProfileType = null
      this.profileTypeConfiguration = null
      this.ready = false
      if (!this.selectedThingId) return
      this.$oh.api.get('/rest/things/' + this.selectedThingId).then((data) => {
        this.selectedThing = data

        let typePromises = [this.$oh.api.get('/rest/thing-types/' + this.selectedThing.thingTypeUID),
          this.$oh.api.get('/rest/channel-types?prefixes=system,' + this.selectedThing.thingTypeUID.split(':')[0])]

        Promise.all(typePromises).then(data2 => {
          this.selectedThingType = data2[0]
          this.selectedThingChannelTypes = data2[1]
          this.ready = true
        })
      })
    }
  }
}
</script>
