<template>
  <f7-block class="channel-general-settings padding-vertical no-padding-horizontal">
    <f7-col>
      <group-box :title="createMode ? 'Create Channel' : 'Channel Details'">
        <f7-list class="no-margin" inline-labels no-hairlines-md>
          <f7-list-group>
            <f7-list-input
              v-if="createMode"
              ref="channelId"
              label="Channel ID"
              type="text"
              placeholder="A unique identifier for the channel"
              :value="channel.id"
              info="Required. Note: cannot be changed after the creation"
              input-id="input"
              required
              validate
              pattern="[A-Za-z0-9_][A-Za-z0-9_\-]*"
              error-message="Required. Must not start with a dash. A-Z,a-z,0-9,_,- only"
              @input="channel.id = $event.target.value">
              <template #inner>
                <f7-link
                  v-if="$refs.channelId?.state?.inputInvalid && channel.id.trim()"
                  icon-f7="hammer_fill"
                  style="margin-top: 4px; margin-left: 4px; margin-bottom: auto"
                  tooltip="Fix ID"
                  @click="$oh.utils.normalizeInputForThingId('#input')" />
              </template>
            </f7-list-input>
            <wrapped-list-output v-else label="Channel UID" :value="channel.uid" clipboard />

            <f7-list-input
              v-if="!readOnly"
              label="Label"
              type="text"
              :placeholder="channelType !== null ? channelType.label : 'Channel label for display purposes'"
              :value="channel.label"
              required
              validate
              :info="createMode ? 'Required.' : ''"
              @input="channel.label = $event.target.value"
              clear-button />
            <wrapped-list-output v-else label="Label" :value="channel.label" />
            <f7-list-input
              v-if="!readOnly"
              label="Description"
              type="text"
              :placeholder="channelType !== null ? channelType.description : ''"
              :value="channel.description"
              @input="channel.description = $event.target.value"
              clear-button />
            <wrapped-list-output v-else label="Description" :value="channel.description" />
          </f7-list-group>

          <f7-list-item
            v-if="channel.properties && Object.keys(channel.properties).length > 0"
            accordion-item
            title="Properties"
            :badge="Object.keys(channel.properties).length">
            <f7-accordion-content>
              <f7-list>
                <f7-list-item v-for="(value, key) in channel.properties" :key="key" class="thing-property">
                  <template #title>
                    <div class="item-title-content">
                      <span class="property-key">{{ key }}</span>
                    </div>
                  </template>
                  <template #after>
                    <div class="item-after-content">
                      <span>{{ value }}</span>
                    </div>
                  </template>
                </f7-list-item>
              </f7-list>
            </f7-accordion-content>
          </f7-list-item>
        </f7-list>
      </group-box>
    </f7-col>
  </f7-block>
</template>

<style lang="stylus">
.channel-general-settings
  .list
    .item-subtitle
      overflow-wrap break-word
      white-space inherit
  .property-key
    display inline-block
    padding-left 12px
</style>

<script>
import WrappedListOutput from '@/components/util/wrapped-list-output.vue'

export default {
  props: {
    channel: Object,
    channelType: Object,
    createMode: Boolean,
    readOnly: Boolean
  },
  components: {
    WrappedListOutput
  }
}
</script>
