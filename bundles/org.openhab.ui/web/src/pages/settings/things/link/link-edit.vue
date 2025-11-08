<template>
  <f7-page @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content :title="(item.label || item.name) + dirtyIndicator"
                      :subtitle="thing.label"
                      back-link="Back"
                      :back-link-url="null"
                      :editable="link.editable"
                      save-link="Save"
                      @back="goBackWithDirtyCheck()"
                      @save="save()"
                      :f7router />
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col>
        <div v-if="item.state">
          <item-state-preview :item="item" :context="context" />
        </div>

        <f7-block-title>Link</f7-block-title>
        <f7-card>
          <f7-card-content>
            <f7-list media-list>
              <ul>
                <f7-list-item divider title="Channel" />
                <f7-list-item media-item
                              class="channel-item"
                              :title="channel.label || channelType.label"
                              :footer="channel.uid + ' (' + getItemType(channel) + ')'"
                              :subtitle="thing.label"
                              :badge="thingStatusBadgeText(thing.statusInfo)"
                              :badge-color="thingStatusBadgeColor(thing.statusInfo)">
                  <template #media>
                    <span class="item-initial">{{ (channel.label) ? channel.label[0] : channelType.label ? channelType.label[0] : '?' }}</span>
                  </template>
                </f7-list-item>
                <f7-list-item divider title="Item" />
                <item :item="item" :context="context" :link="'/settings/items/' + item.name" />
              </ul>
            </f7-list>
          </f7-card-content>
          <f7-card-footer v-if="item && (item.editable || link.editable)">
            <f7-button v-if="source === 'thing' && item.editable"
                       color="red"
                       fill
                       @click="unlinkAndDelete()">
              Unlink &amp; Remove Item
            </f7-button>
            <f7-button color="red" @click="unlink()" v-if="link.editable">
              {{ source === 'thing' && link.editable ? 'Unlink Only' : 'Unlink' }}
            </f7-button>
          </f7-card-footer>
        </f7-card>
      </f7-col>
      <f7-col>
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
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <f7-list v-else class="profile-list">
          <f7-list-item v-for="profileType in profileTypes"
                        radio
                        class="profile-item"
                        :checked="(!currentProfileType && profileType.uid === 'system:default' || currentProfileType && profileType.uid === currentProfileType.uid) ? true : null"
                        :disabled="!link.editable ? true : null"
                        :class="{ 'profile-disabled': !link.editable }"
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
                      :configuration="link.configuration"
                      :read-only="!link.editable"
                      @updated="updated" />
      </f7-col>
    </f7-block>
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
import { mapStores } from 'pinia'

import ConfigSheet from '@/components/config/config-sheet.vue'
import Item from '@/components/item/item.vue'
import ItemStatePreview from '@/components/item/item-state-preview.vue'
import ThingStatus from '@/components/thing/thing-status-mixin'
import LinkMixin from '@/pages/settings/things/link/link-mixin'
import DirtyMixin from '@/pages/settings/dirty-mixin'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

export default {
  mixins: [ThingStatus, LinkMixin, DirtyMixin],
  components: {
    ConfigSheet,
    Item,
    ItemStatePreview
  },
  props: {
    thing: Object,
    channel: Object,
    item: Object,
    source: String,
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      ready: false,
      originalLink: null,
      link: {
        itemName: null,
        channelUID: null,
        configuration: {}
      },
      profileTypes: [],
      originalProfileType: null,
      currentProfileType: null,
      profileTypeConfiguration: null,
      channelType: {}
    }
  },
  computed: {
    context () {
      return {
        store: useStatesStore().trackedItems
      }
    },
    ...mapStores(useRuntimeStore)
  },
  methods: {
    onPageBeforeIn (event) {
      useStatesStore().startTrackingStates()
    },
    onPageBeforeOut (event) {
      useStatesStore().stopTrackingStates()
    },
    onPageAfterIn (event) {
      const itemName = this.item.name
      const itemType = this.item.type
      const channelUID = this.channel.uid.replace('#', '%23')
      this.$oh.api.get('/rest/profile-types?channelTypeUID=' + this.channel.channelTypeUID + '&itemType=' + itemType).then((data) => {
        this.profileTypes = data
        this.profileTypes.unshift(data.splice(data.findIndex((p) => p.uid === 'system:default'), 1)[0]) // move default to be first
        this.profileTypes = this.profileTypes.filter((p) => this.isProfileTypeCompatible(this.channel, p, this.item)) // only show compatible profile types

        this.$oh.api.get('/rest/links/' + itemName + '/' + channelUID).then((data2) => {
          this.link = data2
          if (this.link.configuration.profile) {
            this.onProfileTypeChange(this.link.configuration.profile)
          }
          this.originalProfileType = this.currentProfileType
          this.originalLink = cloneDeep(this.link)
          this.dirty = false
          this.ready = true
        })
      })
      this.$oh.api.get('/rest/channel-types/' + this.channel.channelTypeUID).then((data3) => {
        this.channelType = data3
      })
    },
    updated () {
      this.dirty = this.currentProfileType !== this.originalProfileType || !fastDeepEqual(this.link, this.originalLink)
    },
    goBackWithDirtyCheck () {
      if (this.dirty) {
        this.confirmLeaveWithoutSaving(() => {
          this.f7router.back()
        })
      } else {
        this.f7router.back()
      }
    },
    onProfileTypeChange (profileTypeUid) {
      this.profileTypeConfiguration = null
      if (!profileTypeUid) {
        this.currentProfileType = null
        return
      }
      this.currentProfileType = this.profileTypes.find((p) => p.uid === profileTypeUid)
      this.updated()
      const getProfileConfigDescription = this.$oh.api.get('/rest/config-descriptions/profile:' + profileTypeUid)
      getProfileConfigDescription.then((data) => {
        this.profileTypeConfiguration = data
      }).catch((err) => {
        // just clear out the config sheet
        console.log(`No configuration for profile type ${profileTypeUid}: ` + err)
        this.profileTypeConfiguration = null
      })
    },
    getItemType (channel) {
      if (channel && channel.kind === 'TRIGGER') return 'Trigger'
      if (!channel || !channel.itemType) return '?'
      return channel.itemType
    },
    unlink () {
      f7.dialog.confirm(
        `Are you sure you want to unlink ${this.item.name} from ${this.thing.label}?`,
        'Unlink',
        () => {
          const itemName = this.item.name
          const channelUID = encodeURIComponent(this.channel.uid)
          this.$oh.api.delete('/rest/links/' + itemName + '/' + channelUID).then(() => {
            f7.toast.create({
              text: 'Link deleted',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            this.f7router.back()
          }).catch((err) => {
            f7.toast.create({
              text: 'Link not deleted (links defined in a .items file are not editable from this screen): ' + err,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          })
        })
    },
    unlinkAndDelete () {
      f7.dialog.confirm(
        `Are you sure you want to unlink ${this.item.name} from ${this.thing.label} and delete it?`,
        'Unlink and Delete Item',
        () => {
          const itemName = this.item.name
          const channelUID = encodeURIComponent(this.channel.uid)
          this.$oh.api.delete('/rest/links/' + itemName + '/' + channelUID).then(() => {
            this.$oh.api.delete('/rest/items/' + itemName).then(() => {
              f7.toast.create({
                text: 'Link and item deleted',
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            }).catch((err) => {
              f7.toast.create({
                text: 'Link deleted but error while deleting item: ' + err,
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            })
            this.f7router.back()
          }).catch((err) => {
            f7.toast.create({
              text: 'Link not deleted (links defined in a .items file are not editable from this screen): ' + err,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          })
        })
    },
    save () {
      const itemName = this.item.name
      const channelUID = encodeURIComponent(this.channel.uid)
      const link = this.link
      if (this.currentProfileType) {
        link.configuration.profile = this.currentProfileType.uid
      }
      if (this.$refs.profileConfiguration && !this.$refs.profileConfiguration.isValid()) {
        f7.dialog.alert('Please review the profile configuration and correct validation errors')
        return
      }

      // delete then recreate the link
      this.$oh.api.delete('/rest/links/' + itemName + '/' + channelUID).then(() => {
        this.$oh.api.put('/rest/links/' + link.itemName + '/' + encodeURIComponent(link.channelUID), link).then((data) => {
          f7.toast.create({
            text: 'Link updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.f7router.back()
        })
      }).catch((err) => {
        f7.toast.create({
          text: 'Link not updated (links defined in a .items file are not editable from this screen): ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    }
  }
}
</script>
