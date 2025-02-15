<template>
  <f7-block class="padding-vertical no-padding-horizontal">
    <f7-col>
      <f7-list class="no-margin" inline-labels no-hairlines-md>
        <f7-list-input v-if="createMode" ref="channelId" label="Channel ID" type="text" placeholder="A unique identifier for the channel" :value="channel.id"
                       info="Required. Note: cannot be changed after the creation" input-id="input"
                       required validate pattern="[A-Za-z0-9_][A-Za-z0-9_\-]*" error-message="Required. Must not start with a dash. A-Z,a-z,0-9,_,- only"
                       @input="channel.id = $event.target.value">
          <f7-link slot="inner" icon-f7="hammer_fill" style="margin-top: 4px; margin-left: 4px; margin-bottom: auto" tooltip="Fix ID" v-if="createMode && $refs.channelId?.state?.inputInvalid && channel.id.trim()" @click="$oh.utils.normalizeInputForThingId('#input')" />
        </f7-list-input>
        <f7-list-item v-if="!createMode" media-item class="channel-item" title="Channel UID">
          <div slot="subtitle">
            {{ channel.uid }}
            <clipboard-icon :value="channel.uid" tooltip="Copy UID" />
          </div>
        </f7-list-item>

        <f7-list-input label="Label" type="text" :disabled="disabled" :placeholder="(channelType !== null) ? channelType.label : 'Channel label for display purposes'" :value="channel.label"
                       required validate :info="(createMode) ? 'Required.' : ''"
                       @input="channel.label = $event.target.value" :clear-button="disabled !== true" />
        <f7-list-input label="Description" type="text" :disabled="disabled" :placeholder="(channelType !== null) ? channelType.description : ''" :value="channel.description"
                       @input="channel.description = $event.target.value" :clear-button="disabled !== true" />
      </f7-list>
    </f7-col>
  </f7-block>
</template>

<style lang="stylus">
.list
  .item-subtitle
    overflow-wrap break-word
    white-space inherit
</style>

<script>
import ClipboardIcon from '@/components/util/clipboard-icon.vue'
export default {
  props: ['channel', 'channelType', 'createMode', 'disabled'],
  components: {
    ClipboardIcon
  }
}
</script>
