<template>
  <f7-page @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="item.label || item.name" :subtitle="thing.label" back-link="Cancel">
      <f7-nav-right v-if="link.editable">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save
        </f7-link>
      </f7-nav-right>
      <f7-link v-else slot="right" icon-f7="lock_fill" icon-only tooltip="links defined in a .items file are not editable from this screen" />
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
                <f7-list-item media-item class="channel-item"
                              :title="channel.label || channelType.label"
                              :footer="channel.uid + ' (' + getItemType(channel) + ')'"
                              :subtitle="thing.label"
                              :badge="thingStatusBadgeText(thing.statusInfo)"
                              :badge-color="thingStatusBadgeColor(thing.statusInfo)">
                  <span slot="media" class="item-initial">{{ (channel.label) ? channel.label[0] : (channelType.label) ? channelType.label[0] : '?' }}</span>
                </f7-list-item>
                <f7-list-item divider title="Item" />
                <item :item="item" :context="context" :link="'/settings/items/' + item.name" />
              </ul>
            </f7-list>
          </f7-card-content>
          <f7-card-footer v-if="item && (item.editable || link.editable)">
            <f7-button color="red" fill @click="unlinkAndDelete()" v-if="source === 'thing' && item.editable">
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
          <f7-link external color="blue" target="_blank" href="https://www.openhab.org/link/profiles">
            Learn more about profiles.
          </f7-link>
          <f7-block v-if="!ready" class="text-align-center">
            <f7-preloader />
            <div>Loading...</div>
          </f7-block>
          <f7-list v-else>
            <f7-list-item radio v-for="profileType in profileTypes"
                          :checked="!currentProfileType && profileType.uid === 'system:default' || currentProfileType && profileType.uid === currentProfileType.uid"
                          :disabled="!link.editable"
                          @change="onProfileTypeChange(profileType.uid)"
                          :key="profileType.uid" :title="profileType.label" name="profile-type" />
          </f7-list>
        </f7-block-footer>
      </f7-col>
      <f7-col v-if="profileTypeConfiguration != null">
        <f7-block-title>Profile Configuration</f7-block-title>
        <config-sheet ref="profileConfiguration"
                      :key="'profileTypeConfiguration-' + currentProfileType.uid"
                      :parameter-groups="profileTypeConfiguration.parameterGroups"
                      :parameters="profileTypeConfiguration.parameters"
                      :configuration="link.configuration"
                      :read-only="!link.editable" />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'
import Item from '@/components/item/item.vue'
import ItemStatePreview from '@/components/item/item-state-preview.vue'
import ThingStatus from '@/components/thing/thing-status-mixin'

export default {
  mixins: [ThingStatus],
  components: {
    ConfigSheet,
    Item,
    ItemStatePreview
  },
  props: ['thing', 'channel', 'item', 'source'],
  data () {
    return {
      ready: false,
      link: {
        itemName: null,
        channelUID: null,
        configuration: {}
      },
      profileTypes: [],
      currentProfileType: null,
      profileTypeConfiguration: null,
      channelType: {}
    }
  },
  computed: {
    context () {
      return {
        store: this.$store.getters.trackedItems
      }
    }
  },
  methods: {
    onPageBeforeIn (event) {
      this.$store.dispatch('startTrackingStates')
    },
    onPageBeforeOut (event) {
      this.$store.dispatch('stopTrackingStates')
    },
    onPageAfterIn (event) {
      const itemName = this.item.name
      const itemType = this.item.type
      const channelUID = this.channel.uid.replace('#', '%23')
      this.$oh.api.get('/rest/profile-types?channelTypeUID=' + this.channel.channelTypeUID + '&itemType=' + itemType).then((data) => {
        this.profileTypes = data
        this.profileTypes.unshift(data.splice(data.findIndex(p => p.uid === 'system:default'), 1)[0]) // move default to be first
        this.profileTypes = this.profileTypes.filter(p => !p.supportedItemTypes.length || p.supportedItemTypes.includes(this.item.type.split(':', 1)[0])) // only show compatible profile types

        this.$oh.api.get('/rest/links/' + itemName + '/' + channelUID).then((data2) => {
          this.link = data2
          if (this.link.configuration.profile) {
            this.onProfileTypeChange(this.link.configuration.profile)
          }
          this.ready = true
        })
      })
      this.$oh.api.get('/rest/channel-types/' + this.channel.channelTypeUID).then((data3) => {
        this.channelType = data3
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
    getItemType (channel) {
      if (channel && channel.kind === 'TRIGGER') return 'Trigger'
      if (!channel || !channel.itemType) return '?'
      return channel.itemType
    },
    unlink () {
      this.$f7.dialog.confirm(
        `Are you sure you want to unlink ${this.item.name} from ${this.thing.label}?`,
        'Unlink',
        () => {
          const itemName = this.item.name
          const channelUID = encodeURIComponent(this.channel.uid)
          this.$oh.api.delete('/rest/links/' + itemName + '/' + channelUID).then(() => {
            this.$f7.toast.create({
              text: 'Link deleted',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            this.$f7router.back()
          }).catch((err) => {
            this.$f7.toast.create({
              text: 'Link not deleted (links defined in a .items file are not editable from this screen): ' + err,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          })
        })
    },
    unlinkAndDelete () {
      this.$f7.dialog.confirm(
        `Are you sure you want to unlink ${this.item.name} from ${this.thing.label} and delete it?`,
        'Unlink and Delete Item',
        () => {
          const itemName = this.item.name
          const channelUID = encodeURIComponent(this.channel.uid)
          this.$oh.api.delete('/rest/links/' + itemName + '/' + channelUID).then(() => {
            this.$oh.api.delete('/rest/items/' + itemName).then(() => {
              this.$f7.toast.create({
                text: 'Link and item deleted',
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            }).catch((err) => {
              this.$f7.toast.create({
                text: 'Link deleted but error while deleting item: ' + err,
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            })
            this.$f7router.back()
          }).catch((err) => {
            this.$f7.toast.create({
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
        this.$f7.dialog.alert('Please review the profile configuration and correct validation errors')
        return
      }

      // delete then recreate the link
      this.$oh.api.delete('/rest/links/' + itemName + '/' + channelUID).then(() => {
        this.$oh.api.put('/rest/links/' + link.itemName + '/' + encodeURIComponent(link.channelUID), link).then((data) => {
          this.$f7.toast.create({
            text: 'Link updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$f7router.back()
        })
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Link not updated (links defined in a .items file are not editable from this screen): ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    }
  }
}
</script>
