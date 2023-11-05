<template>
  <f7-page @page:afterin="onPageAfterIn" name="channel-copy">
    <f7-navbar :title="channel.label" :subtitle="thing.label" back-link="Cancel">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col v-if="channel">
        <f7-block-title>Channel</f7-block-title>
        <channel-general-settings :channel="channel" :channelType="channelType" :createMode="true" />
      </f7-col>
      <f7-col v-if="channelType != null">
        <f7-block-title v-if="configDescription.parameters">
          Configuration
        </f7-block-title>
        <f7-block-footer v-else-if="noConfig" class="padding">
          This channel has no configuration.<br><br><f7-link back>
            Go Back
          </f7-link>
        </f7-block-footer>
        <config-sheet
          :parameter-groups="configDescription.parameterGroups"
          :parameters="configDescription.parameters"
          :configuration="config" />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import ChannelGeneralSettings from '@/pages/settings/things/channel/channel-general-settings.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: {
    ChannelGeneralSettings,
    ConfigSheet
  },
  props: ['thing', 'channel', 'channelType', 'channelId'],
  data () {
    return {
      configDescription: {},
      config: {},
      noConfig: false
    }
  },
  methods: {
    onPageAfterIn (event) {
      this.channel.id = this.channel.id + '_copy'
      this.channel.uid = this.channel.uid + '_copy'
      this.channel.label = this.channel.label + ' copy'
      this.config = Object.assign({}, this.channel.configuration)
      this.$oh.api.get(`/rest/config-descriptions/channel:${this.thing.UID}:${this.channelId.replace('#', '%23')}`).then((ct) => {
        this.configDescription = ct
      }).catch((err) => {
        if (err === 'Not Found' || err === 404) {
          this.noConfig = true
        }
      })
    },
    save () {
      if (!this.channel.id) {
        this.$f7.dialog.alert('Please give an unique identifier')
        return
      }
      if (!this.channel.id.match(/^[a-zA-Z0-9_-]*$/)) {
        this.$f7.dialog.alert('The identifier should only contain alphanumeric characters')
        return
      }
      if (!this.channel.label) {
        this.$f7.dialog.alert('Please give a label')
        return
      }

      let finalChannel = Object.assign({}, this.channel, {
        uid: this.thing.UID + ':' + this.channel.id,
        channelTypeUID: this.channel.channelTypeUID,
        kind: this.channel.kind,
        itemType: this.channel.itemType,
        linkedItems: [],
        properties: this.channel.properties,
        defaultTags: this.channel.defaultTags,
        configuration: this.channel.configuration
      })
      this.$f7route.route.context.finalChannel = finalChannel
      // this.$f7router.emit('complete', finalChannel)
      this.$f7router.back()
    }
  }
}
</script>
