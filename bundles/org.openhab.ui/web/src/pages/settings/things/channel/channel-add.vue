<template>
  <f7-page @page:afterin="onPageAfterIn" name="channel-add">
    <f7-navbar title="Add Channel" back-link="Cancel">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Done</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block class="block-narrow">
      <f7-col>
        <f7-list inline-labels no-hairlines-md>
          <f7-list-input type="text" placeholder="Channel Identifier" :value="channel.id"
                         @input="channel.id = $event.target.value" clear-button>
          </f7-list-input>
          <f7-list-input type="text" placeholder="Label" :value="channel.label"
                         @input="channel.label = $event.target.value" clear-button>
          </f7-list-input>
        </f7-list>
      </f7-col>
      <f7-col>
        <f7-block-title>Channel type</f7-block-title>
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader></f7-preloader>
          <div>Loading...</div>
        </f7-block>
        <f7-list v-else>
          <f7-list-item radio v-for="channelType in channelTypes"
            :value="channelType.UID"
            @change="currentChannelType = channelTypes.find((m) => m.UID === $event.target.value)"
            :key="channelType.UID" :title="channelType.label" :footer="channelType.description" name="channel-type"></f7-list-item>
        </f7-list>
      </f7-col>
      <f7-col v-if="currentChannelType != null">
        <f7-block-title>Configuration</f7-block-title>
          <config-sheet
            :parameter-groups="currentChannelType.parameterGroups"
            :parameters="currentChannelType.parameters"
            :configuration="config"
          />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: {
    ConfigSheet
  },
  props: ['thing', 'thingType'],
  data () {
    return {
      ready: false,
      channel: {
        id: '',
        description: ''
      },
      channelTypes: [],
      currentChannelType: null,
      config: {}
    }
  },
  methods: {
    onPageAfterIn (event) {
      const bindingId = this.thingType.UID.split(':')[0]
      const promises = this.thingType.extensibleChannelTypeIds.map((ctid) => this.$oh.api.get(`/rest/channel-types/${bindingId}:${ctid}`))
      Promise.all(promises).then((ct) => {
        this.channelTypes = ct
        this.ready = true
      })
    },
    save () {
      if (!this.channel.id) {
        this.$f7.dialog.alert('Please give an unique identifier')
        return
      }
      if (!this.channel.label) {
        this.$f7.dialog.alert('Please give a label')
        return
      }
      let finalChannel = Object.assign({}, this.channel, {
        uid: this.thing.UID + ':' + this.channel.id,
        channelTypeUID: this.currentChannelType.UID,
        kind: this.currentChannelType.kind,
        itemType: this.currentChannelType.itemType,
        linkedItems: [],
        properties: [],
        defaultTags: [],
        configuration: this.config
      })
      this.$f7route.route.context.finalChannel = finalChannel
      // this.$f7router.emit('complete', finalChannel)
      this.$f7router.back()
    }
  }
}
</script>
