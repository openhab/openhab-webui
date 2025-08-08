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
      <f7-list-button title="Show All" color="blue" @click="$emit('showAdvanced')" />
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'item'">
    <f7-list>
      <item-picker :value="currentModule.configuration.itemName" title="Item" @input="(val) => $set(currentModule.configuration, 'itemName', val)" />
    </f7-list>
    <f7-list>
      <f7-list-item radio
                    v-for="operator in operators"
                    :key="operator.value"
                    :title="operator.label"
                    name="itemStateOperator"
                    :checked="currentModule.configuration.operator === operator.value"
                    @click="$set(currentModule.configuration, 'operator', operator.value)" />
      <f7-list-input
        label="State"
        name="itemState"
        type="text"
        :value="currentModule.configuration.state"
        @blur="(evt) => $set(currentModule.configuration, 'state', evt.target.value)" />
    </f7-list>
    <f7-list v-if="stateSuggestions.length">
      <f7-list-item radio
                    :checked="currentModule.configuration.state === suggestion.value"
                    v-for="suggestion in stateSuggestions"
                    :key="suggestion.value"
                    :title="suggestion.label"
                    @click="$set(currentModule.configuration, 'state', suggestion.value)" />
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
        <img src="@/images/blockly.svg"
             height="32"
             width="32"
             slot="media">
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-vertical">
      or choose the scripting language:
    </f7-block-footer>
    <f7-list media-list>
      <f7-list-item media-item
                    v-for="language in languages"
                    :key="language.contentType"
                    :title="language.name"
                    :after="language.version"
                    :footer="language.contentType"
                    link=""
                    @click="scriptLanguagePicked(language.contentType)">
        <span slot="media" class="item-initial">{{ language.name[0] }}</span>
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-bottom">
      <small><strong>Note:</strong> Creating a new scripted module will <em>save the rule</em> before launching the script editor.</small>
    </f7-block-footer>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'time'">
    <f7-list>
      <f7-list-item radio
                    :checked="timeEventType === 'dayOfWeek'"
                    name="timeEventType"
                    title="the current day of the week is"
                    @click="updateTimeEventType('dayOfWeek')" />
      <f7-list-item radio
                    :checked="timeEventType === 'timeOfDay'"
                    name="timeEventType"
                    title="inside a time range"
                    @click="updateTimeEventType('timeOfDay')" />
      <f7-list-item radio
                    :checked="timeEventType === 'interval'"
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
                    :checked="ephemerisEventType === 'weekdays'"
                    name="EphemerisEventType"
                    title="it's a weekday"
                    @click="updateEphemerisEventType('weekdays')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'weekends'"
                    name="EphemerisEventType"
                    title="it's the weekend"
                    @click="updateEphemerisEventType('weekends')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'holidays'"
                    name="EphemerisEventType"
                    title="it's a holiday"
                    @click="updateEphemerisEventType('holidays')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'notHolidays'"
                    name="EphemerisEventType"
                    title="it's not a holiday"
                    @click="updateEphemerisEventType('notHolidays')" />
      <f7-list-item radio
                    :checked="ephemerisEventType === 'dayset'"
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
import ModuleWizard from './module-wizard-mixin'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  mixins: [ModuleWizard],
  props: ['currentModule', 'currentModuleType', 'moduleTypes'],
  components: {
    ItemPicker,
    ConfigSheet
  },
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
        this.$set(this, 'languages', moduleType.configDescriptions.find((c) => c.name === 'type').options.map((l) => {
          return {
            contentType: l.value,
            name: l.label.split(' (')[0],
            version: l.label.split(' (')[1].replace(')', '')
          }
        }))
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
          this.$emit('typeSelect', 'core.ItemCommandTrigger')
          break
        case 'updated':
          this.$emit('typeSelect', 'core.ItemStateUpdateTrigger')
          break
        case 'changed':
          this.$emit('typeSelect', 'core.ItemStateChangeTrigger')
          break
      }
    },
    updateTimeEventType (type) {
      this.timeEventType = type
      switch (type) {
        case 'dayOfWeek':
          this.$emit('typeSelect', 'timer.DayOfWeekCondition')
          break
        case 'timeOfDay':
          this.$emit('typeSelect', 'core.TimeOfDayCondition')
          break
        case 'interval':
          this.$emit('typeSelect', 'timer.IntervalCondition')
          break
      }
    },
    updateEphemerisEventType (type) {
      this.ephemerisEventType = type
      switch (type) {
        case 'weekdays':
          this.$emit('typeSelect', 'ephemeris.WeekdayCondition')
          break
        case 'weekends':
          this.$emit('typeSelect', 'ephemeris.WeekendCondition')
          break
        case 'holidays':
          this.$emit('typeSelect', 'ephemeris.HolidayCondition')
          break
        case 'notHolidays':
          this.$emit('typeSelect', 'ephemeris.NotHolidayCondition')
          break
        case 'dayset':
          this.$emit('typeSelect', 'ephemeris.DaysetCondition')
          break
      }
    },
    scriptLanguagePicked (value) {
      this.$emit('typeSelect', 'script.ScriptCondition')
      this.$nextTick(() => {
        this.$emit('startScript', value)
      })
    },
    itemPicked (value) {
      this.category = 'item'
      this.currentItem = value
      this.$set(this.currentModule.configuration, 'itemName', value.name)
      this.$set(this.currentModule.configuration, 'operator', '=')
      this.$emit('typeSelect', 'core.ItemStateCondition')
    }
  }
}
</script>
