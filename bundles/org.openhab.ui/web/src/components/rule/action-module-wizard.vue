<template>
  <f7-block v-if="!category">
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseItemCategory">
          <f7-icon size="35" f7="square_on_circle" class="margin" />
          Item<br />Action
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseScriptCategory">
          <f7-icon size="35" f7="doc_plaintext" class="margin" />
          Run<br />Script
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-row class="margin-bottom">
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseRulesCategory">
          <f7-icon size="35" f7="wand_stars" class="margin" />
          Other<br />Rules
        </f7-link>
      </f7-col>
      <f7-col class="elevation-2 elevation-hover-6 elevation-pressed-1 triggertype-big-button" width="50">
        <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="chooseMediaCategory">
          <f7-icon size="35" f7="music_note_list" class="margin" />
          Audio &amp;<br />Voice
        </f7-link>
      </f7-col>
    </f7-row>
    <f7-list>
      <f7-list-button title="Show All" color="blue" @click="$emit('showAdvanced')"></f7-list-button>
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'item'">
    <f7-list>
      <item-picker :value="currentModule.configuration.itemName" title="Item" @input="(val) => $set(currentModule.configuration, 'itemName', val)" />
    </f7-list>
    <f7-list>
      <f7-list-input
        label="Command to send"
        name="command"
        type="text"
        :value="currentModule.configuration.state"
        @blur="(evt) => $set(currentModule.configuration, 'command', evt.target.value)"
        />
    </f7-list>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'script'">
    <f7-block-title class="padding-horizontal">Run a script</f7-block-title>
    <f7-list media-list>
      <f7-list-item media-item
        title="Design with Blockly"
        footer="Beginner-friendly tool to build scripts visually by assembling blocks"
        link="" @click="scriptLanguagePicked('blockly')">
        <img src="res/img/blockly.svg" height="32" width="32" slot="media" />
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal">or choose the scripting language:</f7-block-footer>
    <f7-list media-list>
      <f7-list-item media-item v-for="language in languages" :key="language.contentType"
        :title="language.name" :after="language.version" :footer="language.contentType" link="" @click="scriptLanguagePicked(language.contentType)">
        <span slot="media" class="item-initial">{{language.name[0]}}</span>
      </f7-list-item>
    </f7-list>
    <f7-block-footer class="padding-horizontal margin-bottom"><small><strong>Note:</strong> Creating a new scripted module will <em>save the rule</em> before launching the script editor.</small></f7-block-footer>
  </f7-block>
  <f7-block class="no-margin no-padding" v-else-if="category === 'rules'">
    <f7-list>
      <f7-list-item radio :checked="rulesEventType === 'run'" name="rulesEventType" title="run rule(s)" @click="updateRulesEventType('run')" />
      <f7-list-item radio :checked="rulesEventType === 'enable'" name="rulesEventType" title="enable or disable rule(s)" @click="updateRulesEventType('enable')" />
    </f7-list>
    <config-sheet v-if="currentModuleType" :key="currentModule.id"
      :parameterGroups="[]"
      :parameters="currentModuleType.configDescriptions"
      :configuration="currentModule.configuration"
      @updated="dirty = true"
    />
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
      @updated="dirty = true"
    />
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
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'
import ItemPicker from '@/components/config/controls/item-picker.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
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
      languages: []
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
          this.$emit('typeSelect', 'core.ItemCommandAction')
          break
      }
    },
    updateRulesEventType (type) {
      this.rulesEventType = type
      switch (type) {
        case 'run':
          this.$emit('typeSelect', 'core.RunRuleAction')
          break
        case 'enable':
          this.$emit('typeSelect', 'core.RuleEnablementAction')
          break
      }
    },
    updateMediaEventType (type) {
      this.mediaEventType = type
      switch (type) {
        case 'say':
          this.$emit('typeSelect', 'media.SayAction')
          break
        case 'play':
          this.$emit('typeSelect', 'media.PlayAction')
          break
      }
    },
    scriptLanguagePicked (value) {
      this.$emit('startScript', value)
    },
    itemPicked (value) {
      this.category = 'item'
      this.$set(this.currentModule.configuration, 'itemName', value.name)
      this.$emit('typeSelect', 'core.ItemCommandAction')
    },
    openModelPicker () {
      const popup = {
        component: ModelPickerPopup
      }

      this.$f7router.navigate({
        url: 'pick-from-model',
        route: {
          path: 'pick-from-model',
          popup
        }
      }, {
        props: {
          multiple: false
        }
      })

      this.$f7.once('itemsPicked', this.itemPicked)
      this.$f7.once('modelPickerClosed', () => {
        this.$f7.off('itemsPicked', this.itemPicked)
      })
    }
  }
}
</script>
