<template>
  <f7-block class="config-sheet" style="margin-bottom: 0">
    <f7-col>
      <f7-block width="100" class="parameter-group">
        <f7-row>
          <f7-col>
            <f7-block-title>General Settings</f7-block-title>
            <f7-list inline-labels no-hairlines-md>
              <f7-list-input label="Unique ID" v-if="createMode" type="text" placeholder="Required" :value="thing.ID"
                              @input="changeUID" info="Note: cannot be changed after the creation">
              </f7-list-input>
              <f7-list-input label="Identifier" type="text" placeholder="Name" :value="thing.UID" disabled>
              </f7-list-input>
              <f7-list-input label="Label" type="text" placeholder="e.g. My Thing" :value="thing.label"
                              @input="thing.label = $event.target.value; $emit('updated')">
              </f7-list-input>
              <f7-list-input label="Location" type="text" placeholder="e.g. Kitchen" :value="thing.location"
                              @input="thing.location = $event.target.value; $emit('updated')" clear-button>
              </f7-list-input>
            </f7-list>
            <f7-block-title v-if="thingType.supportedBridgeTypeUIDs.length">Parent Bridge</f7-block-title>
            <f7-block-footer v-if="thingType.supportedBridgeTypeUIDs.length && !thing.bridgeUID"
              class="padding-left padding-right">
              This type of Thing needs to be associated to a working Bridge to function properly.
            </f7-block-footer>
            <f7-list v-if="thingType.supportedBridgeTypeUIDs.length" inline-labels no-hairlines-md>
              <thing-picker
                title="Bridge" name="bridge" :value="thing.bridgeUID"
                @input="(value) => { thing.bridgeUID = value; $emit('updated') }"
                :filterType="thingType.supportedBridgeTypeUIDs" />
            </f7-list>
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-col>
  </f7-block>
</template>

<script>
import ThingPicker from '@/components/config/controls/thing-picker.vue'

export default {
  props: ['thing', 'thingType', 'createMode'],
  components: {
    ThingPicker
  },
  methods: {
    changeUID (event) {
      this.thing.ID = event.target.value
      this.thing.UID = this.thing.thingTypeUID + ':' + this.thing.ID
    }
  }
}
</script>
