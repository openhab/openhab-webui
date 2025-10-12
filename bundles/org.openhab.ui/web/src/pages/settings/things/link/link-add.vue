<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Link Channel to Item" back-link="Cancel">
      <f7-nav-right class="if-not-aurora">
        <f7-link v-if="theme.md"
                 @click="save()"
                 icon-md="material:save"
                 icon-only />
        <f7-link v-if="!theme.md" @click="save()">
          Link
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col v-if="channel">
        <f7-block-title>Channel</f7-block-title>
        <f7-list media-list>
          <f7-list-item media-item
                        class="channel-item"
                        :title="channel.label || channelType.label"
                        :footer="channel.description || channelType.description"
                        :subtitle="channel.uid + ' (' + getItemType(channel) + ')'" />
        </f7-list>
      </f7-col>

      <div v-if="!item && !items" class="text-align-center">
        <f7-preloader />
        <div>Loading...</div>
      </div>
      <template v-if="!item && items">
        <!-- Option to create new item (if not supplied by prop) -->
        <f7-col>
          <f7-block-title>Item</f7-block-title>
          <f7-list media-list>
            <f7-list-item radio
                          :checked="!createMode ? true : null"
                          value="false"
                          @change="createMode = false"
                          title="Use an existing Item"
                          name="item-creation-choice" />
            <f7-list-item radio
                          :checked="createMode ? true : null"
                          value="true"
                          @change="createMode = true"
                          title="Create a new Item"
                          name="item-creation-choice" />
          </f7-list>
        </f7-col>

        <!-- Choose item to link -->
        <f7-col v-if="!createMode">
          <f7-list>
            <f7-list-group>
              <item-picker key="itemLink"
                           title="Item to Link"
                           name="item"
                           :value="selectedItemName"
                           :multiple="false"
                           :items="items"
                           :filterType="getCompatibleItemTypes()"
                           @input="(value) => selectedItemName = value" />
            </f7-list-group>
          </f7-list>
        </f7-col>

        <!-- Create new item -->
        <f7-col v-else>
          <item-form ref="itemForm"
                     :item="newItem"
                     :items="items"
                     :createMode="true"
                     :unitHint="linkUnit()"
                     :stateDescription="stateDescription()" />
        </f7-col>
      </template>

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
          <f7-list-group>
            <thing-picker title="Thing"
                          name="thing"
                          :value="selectedThingId"
                          @input="(e) => selectedThingId = e" />
          </f7-list-group>
        </f7-list>
        <div v-if="selectedThing.UID && selectedThingType.UID">
          <f7-block-title>Channel</f7-block-title>
          <channel-list :thing="selectedThing"
                        :thingType="selectedThingType"
                        :picker-mode="true"
                        :item-type-filter="item.type"
                        :channel-types="selectedThingChannelTypes"
                        @selected="(channel) => loadProfileTypes(channel)" />
        </div>
      </f7-col>

      <f7-block v-if="!ready && !(!item && !items)" class="text-align-center">
        <f7-preloader />
        <div>Loading...</div>
      </f7-block>

      <!-- Profile configuration -->
      <f7-col v-else-if="profileTypes.length && currentItem">
        <f7-block-title>Profile</f7-block-title>
        <f7-block-footer class="padding-left padding-right">
          Profiles define how Channels and Items work together. Install transformation add-ons to get additional profiles.
          <f7-link external
                   color="blue"
                   target="_blank"
                   :href="`${runtimeStore.websiteUrl}/link/profiles`">
            Learn more about profiles.
          </f7-link>
        </f7-block-footer>
        <f7-list class="profile-list">
          <f7-list-item v-for="profileType in profileTypes"
                        radio
                        class="profile-item"
                        :checked="(!currentProfileType && profileType.uid === 'system:default' && itemTypeCompatibleWithChannelType(currentItem, channel)) || (currentProfileType && profileType.uid === currentProfileType.uid) ? true : null"
                        :disabled="!compatibleProfileTypes.includes(profileType) ? true : null"
                        :class="{ 'profile-disabled': !compatibleProfileTypes.includes(profileType) }"
                        @change="onProfileTypeChange(profileType.uid)"
                        :key="profileType.uid"
                        :title="profileType.label"
                        name="profile-type" />
        </f7-list>
      </f7-col>
      <f7-col v-if="profileTypeConfiguration != null">
        <f7-block-title>Profile Configuration</f7-block-title>
        <config-sheet ref="profileConfiguration"
                      :key="'profileTypeConfiguration-' + currentProfileType.uid"
                      :parameter-groups="profileTypeConfiguration.parameterGroups"
                      :parameters="profileTypeConfiguration.parameters"
                      :configuration="configuration" />
      </f7-col>
    </f7-block>

    <div v-if="ready && profileTypes.length" class="if-aurora display-flex justify-content-center padding margin">
      <div class="flex-shrink-0">
        <f7-button class="padding-left padding-right"
                   style="width: 150px"
                   color="blue"
                   large
                   raised
                   fill
                   @click="save">
          Link
        </f7-button>
      </div>
    </div>
  </f7-page>
</template>

<style lang="stylus">
.profile-list
  .profile-item.profile-disabled
    pointer-events none
    .icon-radio
      opacity 0.3
    .item-title
      opacity 0.55
</style>

<script>
import { f7, theme } from 'framework7-vue'

import ConfigSheet from '@/components/config/config-sheet.vue'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ThingPicker from '@/components/config/controls/thing-picker.vue'
import ItemForm from '@/components/item/item-form.vue'

import Item from '@/components/item/item.vue'

import * as Types from '@/assets/item-types.js'
import ItemMixin from '@/components/item/item-mixin'
import uomMixin from '@/components/item/uom-mixin'
import LinkMixin from '@/pages/settings/things/link/link-mixin'

import { useSemanticsStore } from '@/js/stores/useSemanticsStore'
import { defineAsyncComponent } from 'vue'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore.js'
import { mapStores } from 'pinia'

export default {
  mixins: [ItemMixin, uomMixin, LinkMixin],
  components: {
    ConfigSheet,
    ItemPicker,
    ThingPicker,
    Item,
    // TODO-V3.1 ReferenceError: Cannot access 'ChannelList' before initialization when importing normal
    ChannelList: defineAsyncComponent(() => import('@/components/thing/channel-list.vue')),
    ItemForm
  },
  props: {
    thing: String,
    channel: String,
    channelType: String,
    item: String,
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      ready: true,
      createMode: false,
      items: null,
      link: {
        itemName: null,
        channelUID: null,
        configuration: {}
      },
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
      types: Types
    }
  },
  created () {
    if (!this.item) {
      this.$oh.api.get('/rest/items').then((items) => {
        this.items = items
      })
    }
  },
  computed: {
    currentItem () {
      return this.item ? this.item : (this.createMode ? this.newItem : (this.items ? this.items.find((item) => item.name === this.selectedItemName) : null))
    },
    compatibleProfileTypes () {
      return this.profileTypes.filter((p) => this.isProfileTypeCompatible(this.channel, p, this.currentItem))
    },
    ...mapStores(useRuntimeStore)
  },
  methods: {
    onPageAfterIn () {
      if (!this.channel) return
      this.loadProfileTypes(this.channel)
      let newItemName = this.$oh.utils.normalizeLabel(this.thing.label)
      newItemName += '_'
      newItemName += this.$oh.utils.normalizeLabel(this.channel.label || this.channelType.label)
      const defaultTags = (this.channel.defaultTags.length > 0) ? this.channel.defaultTags : this.channelType.tags
      this.newItem = {
        name: newItemName,
        label: this.thing.label + ' ' + (this.channel.label || this.channelType.label),
        category: (this.channelType) ? this.channelType.category : '',
        groupNames: [],
        type: this.channel.itemType || 'Switch',
        unit: this.linkUnit(),
        tags: defaultTags.find((t) => useSemanticsStore().Points.indexOf(t) >= 0) ? defaultTags : [...defaultTags, 'Point']
      }
    },
    linkUnit () {
      const dimension = (this.channel && this.channel.itemType && this.channel.itemType.startsWith('Number:')) ? this.channel.itemType.split(':')[1] : ''
      return dimension ? this.getUnitHint(dimension, this.channelType) : ''
    },
    stateDescription () {
      return this.channelType?.stateDescription?.pattern
    },
    loadProfileTypes (channel) {
      this.ready = false
      this.selectedChannel = channel
      this.$oh.api.get('/rest/profile-types?channelTypeUID=' + channel.channelTypeUID).then((data) => {
        this.profileTypes = data
        this.profileTypes.unshift(data.splice(data.findIndex((p) => p.uid === 'system:default'), 1)[0]) // move default to be first
        this.ready = true
      })
    },
    onProfileTypeChange (profileTypeUid) {
      this.profileTypeConfiguration = null
      if (!profileTypeUid) {
        this.currentProfileType = null
        return
      }
      this.currentProfileType = this.profileTypes.find((p) => p.uid === profileTypeUid)
      const getProfileConfigDescription = this.$oh.api.get('/rest/config-descriptions/profile:' + profileTypeUid)
      getProfileConfigDescription.then((data) => {
        this.profileTypeConfiguration = data
      }).catch((err) => {
        // just clear out the config sheet
        console.warn(`No configuration for profile type ${profileTypeUid}: ` + err)
        this.profileTypeConfiguration = null
      })
    },
    getItemType (channel) {
      if (channel && channel.kind === 'TRIGGER') return 'Trigger'
      if (!channel || !channel.itemType) return '?'
      return channel.itemType
    },
    getCompatibleItemTypes () {
      let compatibleItemTypes = []
      if (this.channel.itemType) {
        compatibleItemTypes.push(this.channel.itemType)
        if (this.channel.itemType.startsWith('Number')) { compatibleItemTypes.push('Number', 'Switch') }
        if (this.channel.itemType === 'Color') { compatibleItemTypes.push('Switch', 'Dimmer') }
        if (this.channel.itemType === 'Dimmer') { compatibleItemTypes.push('Switch') }
      }
      return compatibleItemTypes
    },
    save () {
      const link = {}
      if (this.channel) {
        link.channelUID = this.channel.uid
      } else if (this.selectedChannel) {
        link.channelUID = this.selectedChannel.uid
      }

      link.itemName = this.currentItem.name

      link.configuration = Object.assign({}, this.configuration)
      if (this.currentProfileType) {
        link.configuration.profile = this.currentProfileType.uid
      }

      // checks
      if (this.createMode) {
        const errorMessage = this.validateItemName(this.newItem.name)
        if (errorMessage !== '') {
          f7.dialog.alert('Please correct the item name: ' + errorMessage)
          return
        }
      }
      if (!link.itemName) {
        f7.dialog.alert('Please configure the item to link')
        return
      }
      if (!link.channelUID) {
        f7.dialog.alert('Please configure the channel to link')
        return
      }
      if (this.$refs.profileConfiguration && !this.$refs.profileConfiguration.isValid()) {
        f7.dialog.alert('Please review the profile configuration and correct validation errors')
        return
      }

      if ((this.channel ? this.channel : this.selectedChannel).kind === 'TRIGGER') {
        if (!this.compatibleProfileTypes.length) {
          f7.dialog.alert('There is no profile available for the selected item')
          return
        }
        if (!this.currentProfileType || !this.compatibleProfileTypes.includes(this.currentProfileType)) {
          f7.dialog.alert('Please configure a valid profile')
          return
        }
      }
      if (!this.itemTypeCompatibleWithChannelType(this.currentItem, this.channel) && (!this.currentProfileType || !this.compatibleProfileTypes.includes(this.currentProfileType))) {
        f7.dialog.alert('Please configure a valid profile')
        return
      }

      if (this.createMode) {
        this.saveItem(this.newItem).then((data) => {
          this.$oh.api.put('/rest/links/' + link.itemName + '/' + encodeURIComponent(link.channelUID), link).then((data) => {
            f7.toast.create({
              text: 'Item and link created',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            this.f7router.back()
          })
        })
      } else {
        this.$oh.api.put('/rest/links/' + link.itemName + '/' + encodeURIComponent(link.channelUID), link).then((data) => {
          f7.toast.create({
            text: 'Link created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.f7router.back()
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

        Promise.all(typePromises).then((data2) => {
          this.selectedThingType = data2[0]
          this.selectedThingChannelTypes = data2[1]
          this.ready = true
        })
      })
    },
    currentItem () {
      if (this.currentProfileType && !this.compatibleProfileTypes.find((p) => p.uid === this.currentProfileType.uid)) {
        this.currentProfileType = null
      }
    }
  }
}
</script>
