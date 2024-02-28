<template>
  <f7-page @page:afterin="onPageAfterIn" name="channel-edit">
    <f7-navbar :title="channel.label" :subtitle="thing.label" back-link="Cancel">
      <f7-nav-right>
        <f7-link v-if="!channel.editable" slot="right" icon-f7="lock_fill" icon-only tooltip="Channels of Things defined in a .things file are not editable from this screen" />
        <f7-link @click="save()" v-else-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-else>
          Done
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col v-if="channel">
        <f7-block-title>Channel</f7-block-title>
        <channel-general-settings :channel="channel" :channelType="channelType" :createMode="false" :disabled="!thing.editable" />
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
          :configuration="config"
          :read-only="!thing.editable" />
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
  props: ['thing', 'thingType', 'channel', 'channelType', 'channelId'],
  data () {
    return {
      configDescription: {},
      config: {},
      noConfig: false
    }
  },
  methods: {
    onPageAfterIn (event) {
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
      let finalChannel = Object.assign({}, this.channel, {
        configuration: this.config
      })
      this.$f7route.route.context.finalChannel = finalChannel
      this.$f7router.back()
      // this.$emit('channelAddComplete', finalChannel)
      // this.$f7.view.main.emit('complete', finalChannel)
    }
  }
}
</script>
