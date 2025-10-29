<template>
  <f7-block class="config-sheet no-margin" style="margin-bottom: 0">
    <f7-col>
      <f7-block width="100" class="parameter-group no-margin">
        <f7-row>
          <f7-col>
            <f7-list inline-labels no-hairlines-md class="no-margin">
              <f7-list-input v-if="createMode"
                             label="Thing ID"
                             type="text"
                             placeholder="Required"
                             :value="thing.ID"
                             input-id="input"
                             @input="changeUID"
                             info="Note: cannot be changed after the creation"
                             clear-button
                             required
                             :error-message="idErrorMessage"
                             :error-message-force="!!idErrorMessage">
                <template #inner>
                  <f7-link v-if="createMode && idErrorMessage && !idErrorMessage.includes('exists') && thing.ID"
                           icon-f7="hammer_fill"
                           style="margin-top: 4px; margin-left: 4px; margin-bottom: auto"
                           tooltip="Fix ID"
                           @click="$oh.utils.normalizeInputForThingId('#input')" />
                </template>
              </f7-list-input>
              <f7-list-input label="Thing UID"
                             type="text"
                             :input="false"
                             disabled>
                <template #input>
                  <span>
                    {{ thing.UID }}
                    <clipboard-icon v-if="thing.UID && ready"
                                    :value="thing.UID"
                                    tooltip="Copy UID"
                                    style="pointer-events: initial !important" />
                  </span>
                </template>
              </f7-list-input>
              <f7-list-input label="Label"
                             type="text"
                             :disabled="!ready || readOnly ? true : null"
                             placeholder="e.g. My Thing"
                             :value="thing.label"
                             @input="thing.label = $event.target.value"
                             required
                             validate />
              <f7-list-input label="Location"
                             type="text"
                             :disabled="!ready || readOnly ? true : null"
                             placeholder="e.g. Kitchen"
                             :value="thing.location"
                             @input="thing.location = $event.target.value"
                             :clear-button="ready && !readOnly" />
            </f7-list>
            <f7-block-title v-if="ready && thingType.supportedBridgeTypeUIDs.length">
              Parent Bridge
            </f7-block-title>
            <f7-block-footer v-if="ready && thingType.supportedBridgeTypeUIDs.length && !thing.bridgeUID"
                             class="padding-left padding-right">
              This type of Thing needs to be associated to a working Bridge to function properly.
            </f7-block-footer>
            <f7-list v-if="ready && thingType.supportedBridgeTypeUIDs.length" inline-labels no-hairlines-md>
              <f7-list-group v-if="editable">
                <thing-picker title="Bridge"
                              name="bridge"
                              :value="thing.bridgeUID"
                              @input="updateBridge"
                              :filterType="thingType.supportedBridgeTypeUIDs" />
              </f7-list-group>
              <f7-list-item v-else title="Bridge" :after="thing.bridgeUID" />
            </f7-list>
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-col>
  </f7-block>
</template>

<script>
import ThingPicker from '@/components/config/controls/thing-picker.vue'
import ClipboardIcon from '@/components/util/clipboard-icon.vue'
import ThingMixin from '@/components/thing/thing-mixin'

export default {
  mixins: [ThingMixin],
  props: {
    thing: Object,
    thingType: Object,
    createMode: Boolean,
    ready: Boolean,
    readOnly: Boolean,
    things: Array
  },
  components: {
    ThingPicker,
    ClipboardIcon
  },
  computed: {
    editable () {
      return this.createMode || (this.thing && this.thing.editable)
    },
    idErrorMessage () {
      return this.validateThingUID(this.thing.UID, this.thing.ID)
    }
  },
  methods: {
    computedThingUid () {
      return (this.thing.bridgeUID)
        ? [this.thing.thingTypeUID, this.thing.bridgeUID.substring(this.thing.bridgeUID.lastIndexOf(':') + 1), this.thing.ID].join(':')
        : [this.thing.thingTypeUID, this.thing.ID].join(':')
    },
    changeUID (event) {
      this.thing.ID = event.target.value
      this.thing.UID = this.computedThingUid()
    },
    updateBridge (value) {
      this.thing.bridgeUID = value
      if (this.createMode) this.thing.UID = this.computedThingUid()
    }
  }
}
</script>
