<template>
  <f7-block v-if="!category">
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseItemCategory">
          <f7-icon size="35" f7="square_on_circle" class="margin" />
          Item<br>Condition
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseScriptCategory">
          <f7-icon size="35" f7="doc_plaintext" class="margin" />
          Script<br>Condition
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseTimeCategory">
          <f7-icon size="35" f7="clock" class="margin" />
          Time<br>Condition
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseEphemerisCategory">
          <f7-icon size="35" f7="calendar_today" class="margin" />
          Ephemeris<br>Schedule
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
        <item-picker :value="currentModule.configuration.itemName" label="Item" @input="(val) => currentModule.configuration.itemName = val" />
      </f7-list-group>
    </f7-list>
    <f7-list>
      <f7-list-item v-for="operator in operators"
                    radio
                    :key="operator.value"
                    :title="operator.label"
                    name="itemStateOperator"
                    :checked="currentModule.configuration.operator === operator.value ? true : null"
                    @click="currentModule.configuration.operator = operator.value" />
      <f7-list-input
        label="State"
        name="itemState"
        type="text"
        :value="currentModule.configuration.state"
        @blur="(evt) => currentModule.configuration.state = evt.target.value" />
    </f7-list>
    <f7-list v-if="stateSuggestions.length">
      <f7-list-item v-for="suggestion in stateSuggestions"
                    radio
                    :checked="currentModule.configuration.state === suggestion.value ? true : null"
                    :key="suggestion.value"
                    :title="suggestion.label"
                    @click="currentModule.configuration.state = suggestion.value" />
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'script'">
    <f7-block-title class="padding-horizontal">
      A script evaluates to true
    </f7-block-title>
    <f7-list media-list>
      <f7-list-item media-item
                    title="Design with Blockly"
                    text="A beginner-friendly way to build scripts visually by assembling blocks"
                    :footer="!isJsAvailable ? 'You need to install the JavaScript Scripting addon before you will be able to run' : undefined"
                    link=""
                    @click="scriptLanguagePicked('blockly')">
        <template #media>
          <img src="@/images/blockly.svg" height="32" width="32">
        </template>
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-vertical">
      or choose the scripting language:
    </f7-block-footer>
    <f7-list media-list>
      <f7-list-item v-for="language in languages"
                    media-item
                    :key="language.contentType"
                    :title="language.name"
                    :after="language.version"
                    :footer="language.contentType"
                    link=""
                    @click="scriptLanguagePicked(language.contentType)">
        <template #media>
          <span class="item-initial">{{ language.name[0] }}</span>
        </template>
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-bottom">
      <small><strong>Note:</strong> Creating a new scripted module will <em>save the rule</em> before
        launching the script editor.</small>
    </f7-block-footer>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'time'">
    <f7-list>
      <f7-list-item radio
                    :checked="timeEventType === 'dayOfWeek' ? true : null"
                    name="timeEventType"
                    title="the current day of the week is"
                    @click="updateTimeEventType('dayOfWeek')" />
      <f7-list-item radio
                    :checked="timeEventType === 'timeOfDay' ? true : null"
                    name="timeEventType"
                    title="inside a time range"
                    @click="updateTimeEventType('timeOfDay')" />
      <f7-list-item radio
                    :checked="timeEventType === 'interval' ? true : null"
                    name="timeEventType"
                    title="a minimum interval is met"
                    @click="updateTimeEventType('interval')" />
    </f7-list>
    <config-sheet v-if="currentModuleType"
                  :key="currentModule.id"
                  :parameterGroups="[]"
                  :parameters="currentModuleType.configDescriptions"
                  :configuration="currentModule.configuration"
                  @updated="dirty = true" />
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'ephemeris'">
    <f7-list>
      <f7-list-item radio
                    :checked="ephemerisEventType === 'weekdays' ? true : null"
                    name="EphemerisEventType"
                    title="it's a weekday"
                    @click="updateEphemerisEventType('weekdays')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'weekends' ? true : null"
                    name="EphemerisEventType"
                    title="it's the weekend"
                    @click="updateEphemerisEventType('weekends')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'holidays' ? true : null"
                    name="EphemerisEventType"
                    title="it's a holiday"
                    @click="updateEphemerisEventType('holidays')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'notHolidays' ? true : null"
                    name="EphemerisEventType"
                    title="it's not a holiday"
                    @click="updateEphemerisEventType('notHolidays')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'dayset' ? true : null"
                    name="EphemerisEventType"
                    title="today is in a specific dayset"
                    @click="updateEphemerisEventType('dayset')" />
    </f7-list>
    <f7-block-footer class="padding-horizontal">
      Remember to configure Ephemeris in Settings before using these conditions.
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
import { nextTick } from 'vue'

import ModuleWizard from './module-wizard-mixin'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  mixins: [ModuleWizard],
  props: {
    'currentModule': Object,
    'currentModuleType': Object,
    'moduleTypes': Object,
    f7router: Object
  },
  components: {
    ItemPicker,
    ConfigSheet
  },
  emits: ['show-advanced', 'type-selece', 'start-script'],
  data () {
    return {
      category: '',
      itemEventType: 'state',
      thingEventType: 'triggerChannelFired',
      timeEventType: 'cron',
      ephemerisEventType: 'weekdays',
      languages: [],
      operators: [
        { value: '=', label: 'is equal to' },
        { value: '!=', label: 'is different than' },
        { value: '>', label: 'is greater than' },
        { value: '>=', label: 'is greater or equal to' },
        { value: '<', label: 'is less than' },
        { value: '<=', label: 'is less or equal to' }
      ]
    }
  },
  methods: {
    chooseItemCategory () {
      this.openModelPicker()
    },
    chooseScriptCategory () {
      this.category = 'script'
      let moduleType = this.moduleTypes.find((t) => t.uid === 'script.ScriptCondition')
      if (moduleType) {
        this.languages = moduleType.configDescriptions.find((c) => c.name === 'type').options.map((l) => {
          return {
            contentType: l.value,
            name: l.label.split(' (')[0],
            version: l.label.split(' (')[1].replace(')', '')
          }
        })
      }
    },
    chooseTimeCategory () {
      this.category = 'time'
      this.updateTimeEventType('dayOfWeek')
    },
    chooseEphemerisCategory () {
      this.category = 'ephemeris'
      this.updateEphemerisEventType('weekdays')
    },
    updateItemEventType (type) {
      this.itemEventType = type
      switch (type) {
        case 'command':
          this.$emit('type-selece', 'core.ItemCommandTrigger')
          break
        case 'updated':
          this.$emit('type-selece', 'core.ItemStateUpdateTrigger')
          break
        case 'changed':
          this.$emit('type-selece', 'core.ItemStateChangeTrigger')
          break
      }
    },
    updateTimeEventType (type) {
      this.timeEventType = type
      switch (type) {
        case 'dayOfWeek':
          this.$emit('type-selece', 'timer.DayOfWeekCondition')
          break
        case 'timeOfDay':
          this.$emit('type-selece', 'core.TimeOfDayCondition')
          break
        case 'interval':
          this.$emit('type-selece', 'timer.IntervalCondition')
          break
      }
    },
    updateEphemerisEventType (type) {
      this.ephemerisEventType = type
      switch (type) {
        case 'weekdays':
          this.$emit('type-selece', 'ephemeris.WeekdayCondition')
          break
        case 'weekends':
          this.$emit('type-selece', 'ephemeris.WeekendCondition')
          break
        case 'holidays':
          this.$emit('type-selece', 'ephemeris.HolidayCondition')
          break
        case 'notHolidays':
          this.$emit('type-selece', 'ephemeris.NotHolidayCondition')
          break
        case 'dayset':
          this.$emit('type-selece', 'ephemeris.DaysetCondition')
          break
      }
    },
    scriptLanguagePicked (value) {
      this.$emit('type-selece', 'script.ScriptCondition')
      nextTick(() => {
        this.$emit('start-script', value)
      })
    },
    itemPicked (value) {
      this.category = 'item'
      this.currentItem = value
      this.currentModule.configuration.itemName = value.name
      this.currentModule.configuration.operator = '='
      this.$emit('type-selece', 'core.ItemStateCondition')
    }
  }
}
</script>
