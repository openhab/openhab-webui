<template>
  <f7-block v-if="!category">
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseItemCategory">
          <f7-icon size="35" f7="square_on_circle" class="margin" />
          Item<br>Event
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseThingCategory">
          <f7-icon size="35" f7="lightbulb" class="margin" />
          Thing<br>Event
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseTimeCategory">
          <f7-icon size="35" f7="clock" class="margin" />
          Time<br>Event
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseSystemCategory">
          <f7-icon size="35" f7="gear" class="margin" />
          System<br>Event
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-list>
      <f7-list-button title="Show All" color="blue" @click="$emit('show-advanced')" />
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'item'">
    <f7-list>
      <f7-list-group>
        <item-picker :required="true"
                     :value="currentItem.name"
                     label="Item"
                     @input="(val) => currentModule.configuration.itemName = val"
                     @item-selected="(value) => { currentItem = value; updateItemEventType('command') }" />
      </f7-list-group>
    </f7-list>
    <f7-list>
      <f7-list-item radio
                    :checked="itemEventType === 'command' ? true : null"
                    name="itemEventType"
                    title="received a command"
                    @click="updateItemEventType('command')" />
      <f7-list-item radio
                    :checked="itemEventType === 'updated' ? true : null"
                    name="itemEventType"
                    title="was updated"
                    @click="updateItemEventType('updated')" />
      <f7-list-item radio
                    :checked="itemEventType === 'changed'"
                    name="itemEventType"
                    title="changed"
                    @click="updateItemEventType('changed')" />
      <f7-list-item v-if="currentItem && currentItem.type === 'Group'"
                    radio
                    :checked="itemEventType === 'memberCommand' ? true : null"
                    name="itemEventType"
                    title="had a member receive a command"
                    @click="updateItemEventType('memberCommand')" />
      <f7-list-item v-if="currentItem && currentItem.type === 'Group'"
                    radio
                    :checked="itemEventType === 'memberUpdated' ? true : null"
                    name="itemEventType"
                    title="had a member update"
                    @click="updateItemEventType('memberUpdated')" />
      <f7-list-item v-if="currentItem && currentItem.type === 'Group'"
                    radio
                    :checked="itemEventType === 'memberChanged' ? true : null"
                    name="itemEventType"
                    title="had a member change"
                    @click="updateItemEventType('memberChanged')" />
    </f7-list>
    <f7-list :key="itemEventType">
      <f7-list-input
        v-if="itemEventType === 'command' || itemEventType === 'memberCommand'"
        label="Command"
        name="command"
        type="text"
        placeholder="Any"
        :value="currentModule.configuration.command"
        @blur="(evt) => currentModule.configuration.command = evt.target.value" />
      <f7-list-input
        v-if="itemEventType === 'updated' || itemEventType === 'memberUpdated'"
        label="to state"
        name="updatedState"
        type="text"
        placeholder="Any"
        :value="currentModule.configuration.state"
        @blur="(evt) => currentModule.configuration.state = evt.target.value" />
      <f7-list-input
        v-if="itemEventType === 'changed' || itemEventType === 'memberChanged'"
        label="from state"
        name="changedFromState"
        type="text"
        placeholder="Any"
        :value="currentModule.configuration.previousState"
        @blur="(evt) => currentModule.configuration.previousState = evt.target.value" />
      <f7-list-input
        v-if="itemEventType === 'changed' || itemEventType === 'memberChanged'"
        label="to state"
        name="changedToState"
        type="text"
        placeholder="Any"
        :value="currentModule.configuration.state"
        @blur="(evt) => currentModule.configuration.state = evt.target.value" />
    </f7-list>
    <f7-list v-if="(itemEventType === 'command' || itemEventType === 'memberCommand') && commandSuggestions.length">
      <f7-list-item v-for="suggestion in commandSuggestions"
                    radio
                    :checked="currentModule.configuration.command === suggestion.command ? true : null"
                    :key="suggestion.command"
                    :title="suggestion.label"
                    @click="currentModule.configuration.command = suggestion.command" />
    </f7-list>
    <f7-list v-else-if="stateSuggestions.length">
      <f7-list-item v-for="suggestion in stateSuggestions"
                    radio
                    :checked="currentModule.configuration.state === suggestion.value ? true : null"
                    :key="suggestion.value"
                    :title="suggestion.label"
                    @click="currentModule.configuration.state = suggestion.value" />
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'thing'">
    <f7-list>
      <f7-list-group>
        <thing-picker ref="thingPicker"
                      :value="currentModule.configuration.thingUID"
                      title="Thing"
                      @input="(val) => currentModule.configuration.thingUID = val"
                      :open-on-ready="true" />
      </f7-list-group>
    </f7-list>
    <f7-list />
    <f7-list>
      <f7-list-item radio
                    :checked="thingEventType === 'triggerChannelFired' ? true : null"
                    name="thingEventType"
                    title="a trigger channel fired"
                    @click="updateThingEventType('triggerChannelFired')" />
      <f7-list-item v-if="currentModule.configuration.thingUID"
                    radio
                    :checked="thingEventType === 'statusUpdated' ? true : null"
                    name="thingEventType"
                    title="status was updated"
                    @click="updateThingEventType('statusUpdated')" />
      <f7-list-item v-if="currentModule.configuration.thingUID"
                    radio
                    :checked="thingEventType === 'statusChanged' ? true : null"
                    name="thingEventType"
                    title="status changed"
                    @click="updateThingEventType('statusChanged')" />
    </f7-list>
    <f7-list :key="thingEventType">
      <f7-list-item
        v-if="thingEventType === 'statusUpdated'"
        title="to"
        smart-select
        :smart-select-params="{ view: f7.view.main, openIn: 'popover' }">
        <select name="thingStatus" required @change="(evt) => currentModule.configuration.status = evt.target.value">
          <option v-for="status in [{ value: '', label: '' }, ...currentModuleType.configDescriptions.find((p) => p.name === 'status').options]"
                  :value="status.value"
                  :key="status.value"
                  :selected="currentModule.configuration.status === status.value ? true : null">
            {{ status.label }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item
        v-if="thingEventType === 'statusChanged'"
        title="from"
        smart-select
        :smart-select-params="{ view: f7.view.main, openIn: 'popover' }">
        <select name="thingStatus" required @change="(evt) => currentModule.configuration.previousStatus = evt.target.value">
          <option v-for="status in [{ value: '', label: '' }, ...currentModuleType.configDescriptions.find((p) => p.name === 'previousStatus').options]"
                  :value="status.value"
                  :key="status.value"
                  :selected="currentModule.configuration.previousStatus === status.value ? true : null">
            {{ status.label }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item
        v-if="thingEventType === 'statusChanged'"
        title="to"
        smart-select
        :smart-select-params="{ view: f7.view.main, openIn: 'popover' }">
        <select name="thingStatus" required @change="(evt) => currentModule.configuration.status = evt.target.value">
          <option v-for="status in [{ value: '', label: '' }, ...currentModuleType.configDescriptions.find((p) => p.name === 'status').options]"
                  :value="status.value"
                  :key="status.value"
                  :selected="currentModule.configuration.status === status.value ? true : null">
            {{ status.label }}
          </option>
        </select>
      </f7-list-item>
    </f7-list>
    <f7-list>
      <f7-list-group>
        <trigger-channel-picker v-if="thingEventType === 'triggerChannelFired'"
                                :value="currentModule.configuration.channelUID"
                                title="Channel"
                                @input="(val) => currentModule.configuration.channelUID = val"
                                :filter-thing="currentModule.configuration.thingUID" />
      </f7-list-group>
    </f7-list>
    <f7-list>
      <f7-list-input
        v-if="thingEventType === 'triggerChannelFired'"
        label="Event"
        name="triggerChannelEvent"
        type="text"
        placeholder="Any"
        :value="currentModule.configuration.event"
        @blur="(evt) => currentModule.configuration.event = evt.target.value" />
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'time'">
    <f7-list>
      <f7-list-item radio
                    :checked="timeEventType === 'cron' ? true : null"
                    name="timeEventType"
                    title="on a schedule (cron)"
                    @click="updateTimeEventType('cron')" />
      <f7-list-item radio
                    :checked="timeEventType === 'timeOfDay' ? true : null"
                    name="timeEventType"
                    title="at a fixed time of the day"
                    @click="updateTimeEventType('timeOfDay')" />
      <f7-list-item radio
                    :checked="timeEventType === 'dateTime' ? true : null"
                    name="timeEventType"
                    title="at the time specified in an item's state"
                    @click="updateTimeEventType('dateTime')" />
    </f7-list>
    <config-sheet v-if="currentModuleType"
                  :key="currentModule.id"
                  :parameterGroups="[]"
                  :parameters="currentModuleType.configDescriptions"
                  :configuration="currentModule.configuration"
                  @updated="dirty = true" />
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'system'">
    <f7-list>
      <f7-list-item radio
                    :checked="systemEventType === 'start' ? true : null"
                    name="systemEventType"
                    title="the system is being initialized"
                    @click="updateSystemEventType('start')" />
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-vertical">
      and this start level has been reached:
    </f7-block-footer>
    <config-sheet v-if="currentModuleType"
                  :key="currentModule.id"
                  :parameterGroups="[]"
                  :parameters="currentModuleType.configDescriptions"
                  :configuration="currentModule.configuration"
                  @updated="dirty = true" />
  </f7-block>
</template>

<style lang="stylus">
.triggertype-big-button
  background var(--f7-card-bg-color)
  text-align center
  height 7.5rem
  .link
    color var(--f7-text-color)
</style>

<script>
import { f7 } from 'framework7-vue'

import ModuleWizard from './module-wizard-mixin'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ThingPicker from '@/components/config/controls/thing-picker.vue'
import TriggerChannelPicker from '@/components/config/controls/triggerchannel-picker.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  mixins: [ModuleWizard],
  props: {
    currentModule: Object,
    currentModuleType: Object
  },
  components: {
    ItemPicker,
    ThingPicker,
    TriggerChannelPicker,
    ConfigSheet
  },
  emits: ['show-advanced', 'type-select'],
  setup () {
    return {
      f7
    }
  },
  data () {
    return {
      category: '',
      itemEventType: 'command',
      thingEventType: 'triggerChannelFired',
      timeEventType: 'cron',
      currentItem: null
    }
  },
  methods: {
    chooseItemCategory () {
      this.openModelPicker()
    },
    chooseThingCategory () {
      this.category = 'thing'
      this.updateThingEventType('triggerChannelFired')
    },
    chooseTimeCategory () {
      this.category = 'time'
      this.updateTimeEventType('cron')
    },
    chooseSystemCategory () {
      this.category = 'system'
      this.updateSystemEventType('start')
    },
    updateItemEventType (type) {
      this.itemEventType = type
      switch (type) {
        case 'command':
          this.$emit('type-select', 'core.ItemCommandTrigger')
          if (this.currentItem) this.currentModule.configuration = Object.assign({}, { itemName: this.currentItem.name })
          break
        case 'updated':
          this.$emit('type-select', 'core.ItemStateUpdateTrigger')
          if (this.currentItem) this.currentModule.configuration = Object.assign({}, { itemName: this.currentItem.name })
          break
        case 'changed':
          this.$emit('type-select', 'core.ItemStateChangeTrigger')
          if (this.currentItem) this.currentModule.configuration = Object.assign({}, { itemName: this.currentItem.name })
          break
        case 'memberCommand':
          this.$emit('type-select', 'core.GroupCommandTrigger')
          if (this.currentItem) this.currentModule.configuration = Object.assign({}, { groupName: this.currentItem.name })
          break
        case 'memberUpdated':
          this.$emit('type-select', 'core.GroupStateUpdateTrigger')
          if (this.currentItem) this.currentModule.configuration = Object.assign({}, { groupName: this.currentItem.name })
          break
        case 'memberChanged':
          this.$emit('type-select', 'core.GroupStateChangeTrigger')
          if (this.currentItem) this.currentModule.configuration = Object.assign({}, { groupName: this.currentItem.name })
          break
      }
    },
    updateThingEventType (type) {
      this.thingEventType = type
      const currentThingUID = this.currentModule.configuration.thingUID
      switch (type) {
        case 'triggerChannelFired':
          this.$emit('type-select', 'core.ChannelEventTrigger', true)
          if (currentThingUID) this.currentModule.configuration = Object.assign({}, { thingUID: currentThingUID })
          break
        case 'statusUpdated':
          this.$emit('type-select', 'core.ThingStatusUpdateTrigger', true)
          if (currentThingUID) this.currentModule.configuration = Object.assign({}, { thingUID: currentThingUID })
          break
        case 'statusChanged':
          this.$emit('type-select', 'core.ThingStatusChangeTrigger', true)
          if (currentThingUID) this.currentModule.configuration = Object.assign({}, { thingUID: currentThingUID })
          break
      }
    },
    updateTimeEventType (type) {
      this.timeEventType = type
      switch (type) {
        case 'cron':
          this.$emit('type-select', 'timer.GenericCronTrigger', true)
          break
        case 'timeOfDay':
          this.$emit('type-select', 'timer.TimeOfDayTrigger', true)
          break
        case 'dateTime':
          this.$emit('type-select', 'timer.DateTimeTrigger', true)
          break
      }
    },
    updateSystemEventType (type) {
      this.systemEventType = type
      switch (type) {
        case 'start':
          this.$emit('type-select', 'core.SystemStartlevelTrigger', true)
          this.currentModule.configuration.startlevel = 20
          break
      }
    },
    itemPicked (value) {
      this.category = 'item'
      this.currentItem = value
      this.currentModule.configuration.itemName = value.name
      this.updateItemEventType('command')
    }
  }
}
</script>
