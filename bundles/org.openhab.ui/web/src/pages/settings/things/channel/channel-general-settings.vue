<template>
  <f7-block v-if="ready" class="padding-vertical no-padding-horizontal">
    <f7-col>
      <f7-list class="no-margin" inline-labels no-hairlines-md>
        <f7-list-input v-if="createMode" label="Channel Identifier" type="text" placeholder="Required" :value="channel.id"
                       info="Note: cannot be changed after the creation"
                       required validate pattern="[A-Za-z0-9_\-]+" error-message="Required. A-Z,a-z,0-9,_,- only"
                       @input="channel.id = $event.target.value" />
        <f7-list-item v-if="!createMode" media-item class="channel-item" title="Channel UID">
          <div slot="subtitle">
            {{ channel.uid }}
            <clipboard-icon :value="channel.uid" tooltip="Copy UID" />
          </div>
        </f7-list-item>
        <f7-list-input label="Label" type="text" :placeholder="(channelType !== null) ? channelType.label : 'Required'" :value="channel.label" required validate
                       @input="channel.label = $event.target.value" clear-button />
        <f7-list-input label="Description" type="text" :placeholder="(channelType !== null) ? channelType.description : ''" :value="channel.description"
                       @input="channel.description = $event.target.value" clear-button />
      </f7-list>
    </f7-col>
  </f7-block>
</template>

<script>
import ClipboardIcon from '@/components/util/clipboard-icon.vue'
export default {
  props: ['channel', 'channelType', 'createMode', 'ready'],
  components: {
    ClipboardIcon
  }
}
</script>
