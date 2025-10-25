<template>
  <f7-page @page:afterin="onPageAfterIn" name="channel-duplicate">
    <f7-navbar>
      <oh-nav-content title="Duplicate channel"
                      :subtitle="thing.label"
                      back-link="Cancel"
                      save-link="Save"
                      @save="save()"
                      :f7router />
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
import { f7, theme } from 'framework7-vue'

import ChannelGeneralSettings from '@/pages/settings/things/channel/channel-general-settings.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: {
    ChannelGeneralSettings,
    ConfigSheet
  },
  props: {
    thing: Object,
    channel: Object,
    channelType: Object,
    channelId: String,
    f7router: Object,
    f7route: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      configDescription: {},
      config: {},
      noConfig: false
    }
  },
  methods: {
    onPageAfterIn () {
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
        f7.dialog.alert('Please give a unique identifier')
        return
      }
      if (!this.channel.id.match(/^[a-zA-Z0-9_-]*$/)) {
        f7.dialog.alert('The identifier should only contain alphanumeric characters')
        return
      }
      if (!this.channel.label) {
        f7.dialog.alert('Please give a label')
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
        configuration: this.config
      })
      this.f7route.route.context.finalChannel = finalChannel
      // this.f7router.emit('complete', finalChannel)
      this.f7router.back()
    }
  }
}
</script>
