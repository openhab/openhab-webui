<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar :title="item.label || item.name" :subtitle="thing.label" back-link="Cancel">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col>
        <!-- <f7-block-title>Current State</f7-block-title> -->
        <f7-block strong class="state-block">
          {{item.transformedState || item.state}}
          <f7-button v-show="$theme.md" :href="'/analyzer/?items=' + item.name">Analyze</f7-button>
        </f7-block>
        <f7-list class="analyze-button" v-show="!$theme.md">
          <f7-list-button color="blue" :href="'/analyzer/?items=' + item.name">Analyze</f7-list-button>
        </f7-list>
        <!-- <f7-block-title>Link Details</f7-block-title> -->
        <f7-list media-list>
          <ul>
            <f7-list-item divider title="Channel"></f7-list-item>
            <f7-list-item media-item class="channel-item"
              :title="channel.label || channelType.label"
              :footer="channel.uid"
              :subtitle="thing.label"
              :badge="thing.statusInfo.status"
              :badge-color="thing.statusInfo.status === 'ONLINE' ? 'green' : 'red'">
              <span slot="media" class="item-initial">{{(channel.label) ? channel.label[0] : (channelType.label) ? channelType.label[0] : '?'}}</span>
            </f7-list-item>
            <f7-list-item divider title="Item"></f7-list-item>
            <item :item="item" />
          </ul>
          <ul>
            <f7-list-button color="red" title="Unlink" @click="unlink()"></f7-list-button>
            <f7-list-button color="red" title="Unlink and Delete Item" @click="unlinkAndDelete()" v-if="source === 'thing'"></f7-list-button>
          </ul>
        </f7-list>
        <!-- <f7-block strong>
          <f7-block-title>{{channel.label}}</f7-block-title>
          <div>{{channel.uid}}</div>
          <f7-block-footer>{{channel.description}}</f7-block-footer>
        </f7-block> -->
      </f7-col>
      <f7-col>
        <f7-block-title>Profile</f7-block-title>
        <f7-block-footer class="padding-left padding-right">
          Profiles define how Channels and Items work together. Install transformation add-ons to get additional profiles.
          <f7-link external color="blue" target="_blank" href="https://www.openhab.org/docs/configuration/items.html#profiles">Learn more about profiles.</f7-link>
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader></f7-preloader>
          <div>Loading...</div>
        </f7-block>
        <f7-list v-else>
          <f7-list-item radio :checked="!currentProfileType" value="" @change="onProfileTypeChange()" title="No Profile (Default)" name="profile-type" />
          <f7-list-item radio v-for="profileType in profileTypes"
            :checked="profileType.uid === currentProfileType.uid"
            @change="onProfileTypeChange(profileType.uid)"
            :key="profileType.uid" :title="profileType.label" name="profile-type"></f7-list-item>
        </f7-list>
        </f7-block-footer>
      </f7-col>
      <f7-col v-if="profileTypeConfiguration != null">
        <f7-block-title>Profile Configuration</f7-block-title>
          <config-sheet
            :parameter-groups="profileTypeConfiguration.parameterGroups"
            :parameters="profileTypeConfiguration.parameters"
            :configuration="link.configuration"
          />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'
import Item from '@/components/item/item.vue'

export default {
  components: {
    ConfigSheet,
    Item
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
      currentProfileType: { uid: '' },
      profileTypeConfiguration: null,
      channelType: {}
    }
  },
  methods: {
    onPageAfterIn (event) {
      const itemName = this.item.name
      const itemType = this.item.type
      const channelUID = this.channel.uid.replace('#', '%23')
      const getProfileTypes = this.$oh.api.get('/rest/profile-types?channelTypeUID=' + this.channel.channelTypeUID + '&itemType=' + itemType)
      getProfileTypes.then((data) => {
        this.profileTypes = data

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
      })
    }
  }
}
</script>
