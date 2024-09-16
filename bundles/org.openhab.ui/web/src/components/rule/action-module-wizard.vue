<template>
  <f7-block v-if="!category">
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseItemCategory">
          <f7-icon size="35" f7="square_on_circle" class="margin" />
          Item<br>Action
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseScriptCategory">
          <f7-icon size="35" f7="doc_plaintext" class="margin" />
          Inline<br>Script
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseRulesCategory">
          <f7-icon size="35" f7="wand_stars" class="margin" />
          Scenes, Scripts<br>& Rules
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseMediaCategory">
          <f7-icon size="35" f7="music_note_list" class="margin" />
          Audio &amp;<br>Voice
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-list>
      <f7-list-button title="Show All" color="blue" @click="$emit('showAdvanced')" />
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'item'">
    <f7-list>
      <f7-list-item radio :checked="itemEventType === 'command'" name="MediaEventType" title="send a command to" @click="updateItemEventType('command')" />
      <f7-list-item radio :checked="itemEventType === 'update'" name="MediaEventType" title="update the state of" @click="updateItemEventType('update')" />
    </f7-list>
    <f7-list>
      <item-picker :value="currentModule.configuration.itemName" title="Item" @input="(val) => $set(currentModule.configuration, 'itemName', val)" @itemSelected="(value) => { $set(this, 'currentItem', value); updateItemEventType('command') }" />
    </f7-list>
    <f7-list>
      <f7-list-input
        v-if="itemEventType === 'command'"
        label="Command to send"
        name="command"
        type="text"
        :value="currentModule.configuration.command"
        @blur="(evt) => $set(currentModule.configuration, 'command', evt.target.value)" />
      <f7-list-input
        v-else-if="itemEventType === 'update'"
        label="to state"
        name="state"
        type="text"
        :value="currentModule.configuration.state"
        @blur="(evt) => $set(currentModule.configuration, 'state', evt.target.value)" />
    </f7-list>
    <f7-list v-if="itemEventType === 'command' && commandSuggestions.length">
      <f7-list-item radio :checked="currentModule.configuration.command === suggestion.command" v-for="suggestion in commandSuggestions" :key="suggestion.command"
                    :title="suggestion.label" @click="$set(currentModule.configuration, 'command', suggestion.command)" />
    </f7-list>
    <!-- <f7-block v-if="itemEventType === 'command' && currentItem && (currentItem.type === 'Dimmer' || currentItem.type === 'Rollershutter' || (currentItem.type === 'Number' && currentItem.stateDescription && currentItem.stateDescription.minimum !== undefined))">
      <f7-range :value="currentModule.configuration.command" @range:changed="(val) => $set(currentModule.configuration, 'command', val)"
        :min="(currentItem.stateDescription && currentItem.stateDescription.minimum) ? currentItem.stateDescription.minimum : 0"
        :max="(currentItem.stateDescription && currentItem.stateDescription.maximum) ? currentItem.stateDescription.maximum : 100"
        :step="(currentItem.stateDescription && currentItem.stateDescription.step) ? currentItem.stateDescription.step : 1"
        :scale="true" :label="true" :scaleSubSteps="5" />
    </f7-block> -->
    <f7-list v-if="itemEventType === 'command' && currentItem && currentItem.type === 'Color'" media-list>
      <f7-list-input media-item type="colorpicker" label="Pick a color" :color-picker-params="{
                       targetEl: '#color-picker-value',
                       targetElSetBackgroundColor: true,
                       openIn: 'auto',
                       modules: ['hsb-sliders', 'wheel', 'palette'],
                       sliderValue: true,
                       sliderValueEditable: true,
                       sliderLabel: true,
                       formatValue: colorToCommand
                     }"
                     :value="commandToColor()"
                     @change="updateColorCommand">
        <i slot="media" style="width: 32px; height: 32px" class="icon demo-list-icon" id="color-picker-value" />
      </f7-list-input>
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'script'">
    <f7-block-title class="padding-horizontal">
      Run a script
    </f7-block-title>
    <f7-list media-list>
      <f7-list-item media-item
                    title="Design with Blockly"
                    text="A beginner-friendly way to build scripts visually by assembling blocks"
                    :footer="!isJSAvailable ? 'You need to install the JavaScript Scripting addon before you will be able to run' : undefined"
                    link="" @click="scriptLanguagePicked('blockly')">
        <img src="@/images/blockly.svg" height="32" width="32" slot="media">
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-vertical">
      or choose the scripting language:
    </f7-block-footer>
    <f7-list media-list>
      <f7-list-item media-item v-for="language in languages" :key="language.contentType"
                    :title="language.name" :after="language.version" :footer="language.contentType" link="" @click="scriptLanguagePicked(language.contentType)">
        <span slot="media" class="item-initial">{{ language.name[0] }}</span>
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-bottom">
      <small><strong>Note:</strong> Creating a new scripted module will <em>save the rule</em> before launching the script editor.</small>
    </f7-block-footer>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'rules'">
    <f7-list>
      <f7-list-item radio :checked="rulesEventType === 'run'" name="rulesEventType" title="run" @click="updateRulesEventType('run')" />
      <f7-list-item radio :checked="rulesEventType === 'enable'" name="rulesEventType" title="enable or disable" @click="updateRulesEventType('enable')" />
    </f7-list>
    <config-sheet v-if="currentModuleType" :key="currentModule.id"
                  :parameterGroups="[]"
                  :parameters="currentModuleType.configDescriptions"
                  :configuration="currentModule.configuration"
                  @updated="dirty = true" />
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'media'">
    <f7-list>
      <f7-list-item radio :checked="mediaEventType === 'say'" name="MediaEventType" title="say something" @click="updateMediaEventType('say')" />
      <f7-list-item radio :checked="mediaEventType === 'play'" name="MediaEventType" title="play an audio file" @click="updateMediaEventType('play')" />
    </f7-list>
    <config-sheet v-if="currentModuleType" :key="currentModule.id"
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
  props: ['currentModule', 'currentModuleType'],
  components: {
    ItemPicker,
    ConfigSheet
  },
  data () {
    return {
      category: '',
      itemEventType: 'command',
      rulesEventType: 'cron',
      mediaEventType: 'say',
      languages: [],
      currentItem: null
    }
  },
  computed: {
    commandSuggestions () {
      if (!this.currentItem || this.category !== 'item') return []
      let type = (this.currentItem.type === 'Group' && this.currentItem.groupType) ? this.currentItem.groupType : this.currentItem.type

      if (this.currentItem.commandDescription && this.currentItem.commandDescription.commandOptions) {
        return this.currentItem.commandDescription.commandOptions
      }
      if (type === 'Switch') {
        return ['ON', 'OFF'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Rollershutter') {
        return ['UP', 'DOWN', 'STOP'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Contact') {
        return ['UP', 'DOWN', 'STOP'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Color') {
        return ['ON', 'OFF'].map((c) => { return { command: c, label: c } })
      }

      return []
    }
  },
  methods: {
    chooseItemCategory () {
      this.openModelPicker()
    },
    chooseScriptCategory () {
      this.category = 'script'
      this.$emit('typeSelect', 'script.ScriptAction')
      this.$nextTick(() => {
        this.$set(this, 'languages', this.currentModuleType.configDescriptions
          .find((c) => c.name === 'type').options
          .map((l) => {
            return {
              contentType: l.value,
              name: l.label.split(' (')[0],
              version: l.label.split(' (')[1].replace(')', '')
            }
          }))
      })
    },
    chooseRulesCategory () {
      this.category = 'rules'
      this.updateRulesEventType('run')
    },
    chooseMediaCategory () {
      this.category = 'media'
      this.updateMediaEventType('say')
    },
    updateItemEventType (type) {
      this.itemEventType = type
      switch (type) {
        case 'command':
          this.$emit('typeSelect', 'core.ItemCommandAction', true)
          if (this.currentItem) this.$set(this.currentModule, 'configuration', Object.assign({}, { itemName: this.currentItem.name }))
          break
        case 'update':
          this.$emit('typeSelect', 'core.ItemStateUpdateAction', true)
          if (this.currentItem) this.$set(this.currentModule, 'configuration', Object.assign({}, { itemName: this.currentItem.name }))
          break
      }
    },
    updateRulesEventType (type) {
      this.rulesEventType = type
      switch (type) {
        case 'run':
          this.$emit('typeSelect', 'core.RunRuleAction', true)
          break
        case 'enable':
          this.$emit('typeSelect', 'core.RuleEnablementAction', true)
          break
      }
    },
    updateMediaEventType (type) {
      this.mediaEventType = type
      switch (type) {
        case 'say':
          this.$emit('typeSelect', 'media.SayAction', true)
          break
        case 'play':
          this.$emit('typeSelect', 'media.PlayAction', true)
          break
      }
    },
    updateColorCommand (evt) {
      this.$set(this.currentModule.configuration, 'command', evt.target.value)
    },
    commandToColor (evt) {
      if (!this.currentModule.configuration.command || this.currentModule.configuration.command.split(',').length !== 3) return null
      let color = this.currentModule.configuration.command.split(',')
      color[0] = parseInt(color[0])
      color[1] = color[1] / 100
      color[2] = color[2] / 100
      return { hsb: color }
    },
    colorToCommand (val) {
      let hsb = [...val.hsb]
      hsb[0] = Math.round(hsb[0]) % 360
      hsb[1] = Math.round(hsb[1] * 100)
      hsb[2] = Math.round(hsb[2] * 100)
      return hsb
      // this.$set(this.currentModule.configuration, 'command', hsb.join(','))
    },
    scriptLanguagePicked (value) {
      this.$emit('startScript', value)
    },
    itemPicked (value) {
      this.category = 'item'
      this.currentItem = value
      this.$set(this.currentModule.configuration, 'itemName', value.name)
      this.$emit('typeSelect', 'core.ItemCommandAction')
    }
  }
}
</script>
