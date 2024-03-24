<template>
  <f7-popup ref="modulePopup" class="moduleconfig-popup" :close-by-backdrop-click="false" @popupClosed="moduleConfigClosed">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="onBackClicked" />
        </f7-nav-left>
        <f7-nav-title v-if="ruleModule && ruleModule.new">
          Add {{ SectionLabels[currentSection][1] }}
        </f7-nav-title>
        <f7-nav-title v-else>
          Edit {{ SectionLabels[currentSection][1] }}
        </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="currentRuleModuleType" @click="updateModuleConfig">
            Save
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block v-if="ruleModule" class="no-margin no-padding">
        <f7-col v-if="!currentRuleModuleType" class="margin-top">
          <f7-list inline-labels no-hairlines-md class="no-margin">
            <f7-list-input type="text" :placeholder="moduleTitleSuggestion" :value="ruleModule.label" required
                           @input="ruleModule.label = $event.target.value" clear-button />
            <f7-list-input type="text" :placeholder="moduleDescriptionSuggestion" :value="ruleModule.description"
                           @input="ruleModule.description = $event.target.value" clear-button />
          </f7-list>
        </f7-col>
        <!-- <f7-block-footer class="no-margin padding-left"><small>Tip: leave fields blank to set automatically to the suggested name and description. <f7-link @click="ruleModule.label = null; ruleModule.description = null">Clear</f7-link></small></f7-block-footer> -->

        <!-- module type picker -->
        <div v-if="ruleModule.new">
          <f7-block-title class="no-margin padding-horizontal margin-vertical" v-if="!advancedTypePicker" medium>
            {{ SectionLabels[currentSection][0] }}
          </f7-block-title>
          <f7-list v-if="advancedTypePicker && !ruleModule.type">
            <ul v-for="(mt, scope) in groupedModuleTypes(currentSection)" :key="scope">
              <f7-list-item divider :title="scope" />
              <f7-list-item radio v-for="moduleType in mt"
                            :value="moduleType.uid"
                            @change="setModuleType(moduleType)"
                            :checked="ruleModule.type === moduleType.uid"
                            :key="moduleType.uid" :title="moduleType.label" name="module-type" />
            </ul>
          </f7-list>
          <trigger-module-wizard v-else-if="!advancedTypePicker && currentSection === 'triggers'" :current-module="ruleModule" :current-module-type="currentRuleModuleType" @typeSelect="setModuleType" @showAdvanced="advancedTypePicker = true" />
          <condition-module-wizard v-else-if="!advancedTypePicker && currentSection === 'conditions'" :current-module="ruleModule" :current-module-type="currentRuleModuleType" @typeSelect="setModuleType" @showAdvanced="advancedTypePicker = true" @startScript="startScripting" />
          <action-module-wizard v-else-if="!advancedTypePicker && currentSection === 'actions'" :current-module="ruleModule" :current-module-type="currentRuleModuleType" @typeSelect="setModuleType" @showAdvanced="advancedTypePicker = true" @startScript="startScripting" />
        </div>

        <!-- module configuration -->
        <f7-list v-if="ruleModule.type && (!ruleModule.new || advancedTypePicker)">
          <f7-list-item :title="SectionLabels[currentSection][0]" ref="ruleModuleTypeSmartSelect" smart-select :smart-select-params="{ view: $f7.views.main, openIn: 'popup', closeOnSelect: true }">
            <select name="ruleModuleType"
                    @change="setModuleType(moduleTypes[currentSection].find((t) => t.uid === $refs.ruleModuleTypeSmartSelect.f7SmartSelect.getValue()), true)">
              <optgroup v-for="(mt, scope) in groupedModuleTypes(currentSection)" :key="scope" :label="scope">
                <option v-for="moduleType in mt"
                        :value="moduleType.uid" :key="moduleType.uid" :selected="currentRuleModuleType.uid === moduleType.uid">
                  {{ moduleType.label }}
                </option>
              </optgroup>
            </select>
          </f7-list-item>
        </f7-list>
        <f7-block-title v-if="ruleModule && currentRuleModuleType && (!ruleModule.new || advancedTypePicker)" style="margin-bottom: calc(var(--f7-block-title-margin-bottom) - var(--f7-list-margin-vertical))">
          Configuration
        </f7-block-title>
        <f7-col v-if="ruleModule && currentRuleModuleType && (!ruleModule.new || advancedTypePicker)">
          <config-sheet v-if="!(ruleModule.configuration && ruleModule.configuration.blockSource)"
                        :key="currentSection + ruleModule.id"
                        ref="parameters"
                        :parameterGroups="[]"
                        :parameters="currentRuleModuleType.configDescriptions"
                        :configuration="ruleModule.configuration"
                        @updated="dirty = true" />
          <f7-block v-else>
            <f7-button @click="editBlockly" color="blue" outline fill>
              Edit Blockly
            </f7-button>
          </f7-block>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import DirtyMixin from '../dirty-mixin'
import ConfigSheet from '@/components/config/config-sheet.vue'
import TriggerModuleWizard from '@/components/rule/trigger-module-wizard.vue'
import ConditionModuleWizard from '@/components/rule/condition-module-wizard.vue'
import ActionModuleWizard from '@/components/rule/action-module-wizard.vue'
import ModuleDescriptionSuggestions from './module-description-suggestions'

export default {
  mixins: [ModuleDescriptionSuggestions, DirtyMixin],
  components: {
    TriggerModuleWizard,
    ConditionModuleWizard,
    ActionModuleWizard,
    ConfigSheet
  },
  props: ['rule', 'ruleModule', 'ruleModuleType', 'moduleTypes', 'currentSection'],
  data () {
    return {
      currentRuleModuleType: this.ruleModuleType,
      advancedTypePicker: false
    }
  },
  computed: {
    moduleTitleSuggestion () {
      if (!this.ruleModule || !this.currentRuleModuleType) return 'Title'
      return this.suggestedModuleTitle(this.ruleModule, this.currentRuleModuleType)
    },
    moduleDescriptionSuggestion () {
      if (!this.ruleModule || !this.currentRuleModuleType) return 'Description'
      return this.suggestedModuleDescription(this.ruleModule, this.currentRuleModuleType)
    }
  },
  watch: {
    ruleModule: {
      handler: function () {
        this.dirty = !fastDeepEqual(this.ruleModule, this.originalModule)
      },
      deep: true
    }
  },
  methods: {
    setModuleType (val, clearConfig) {
      const moduleType = (typeof val === 'string') ? this.moduleTypes[this.currentSection].find((t) => t.uid === val) : val
      this.ruleModule.type = moduleType.uid
      this.$set(this, 'currentRuleModuleType', moduleType)
      if (clearConfig) this.$set(this.ruleModule, 'configuration', {})
      this.ruleModule.label = this.ruleModule.description = ''
    },
    moduleConfigClosed () {
      this.$f7.emit('ruleModuleConfigClosed')
    },
    updateModuleConfig () {
      if (this.$refs.parameters && !this.$refs.parameters.isValid()) {
        this.$f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }
      this.$f7.emit('ruleModuleConfigUpdate', this.ruleModule)
      this.$refs.modulePopup.close()
    },
    editBlockly () {
      this.updateModuleConfig()
      this.$f7.views.main.router.navigate(`/settings/rules/${this.rule.uid}/script/${this.ruleModule.id}`)
    },
    startScripting (language) {
      const contentType = (language === 'blockly') ? 'application/javascript' : language
      this.$set(this.ruleModule.configuration, 'type', contentType)
      this.$set(this.ruleModule.configuration, 'script', '')
      if (language === 'blockly') {
        // initialize an empty blockly source
        this.$set(this.ruleModule.configuration, 'blockSource', '<xml xmlns="https://developers.google.com/blockly/xml"></xml>')
      }
      this.$f7.emit('editNewScript', this.ruleModule)
      this.$refs.modulePopup.close()
    },
    groupedModuleTypes (section) {
      const moduleTypes = this.moduleTypes[section].filter((t) => t.visibility === 'VISIBLE')
      let moduleTypesByScope = moduleTypes.reduce((prev, type, i, types) => {
        const scope = type.uid.split('.')[0]
        if (!prev[scope]) {
          prev[scope] = [type]
        } else {
          prev[scope] = [...prev[scope], type].sort((t1, t2) => t1.label.localeCompare(t2.label))
        }
        return prev
      }, {})
      return Object.keys(moduleTypesByScope).sort((s1, s2) => (s1 === 'core') ? -1 : (s2 === 'core') ? 1 : s1.localeCompare(s2))
        .reduce((prev, key) => {
          prev[key] = moduleTypesByScope[key]
          return prev
        }, {})
    },
    onBackClicked () {
      if (this.dirty) {
        this.confirmLeaveWithoutSaving(this.$refs.modulePopup.close)
      } else {
        this.$refs.modulePopup.close()
      }
    }
  },
  created () {
    this.SectionLabels = {
      triggers: ['When', 'Trigger'],
      actions: ['Then', 'Action'],
      conditions: ['But only if', 'Condition']
    }
  },
  mounted () {
    this.originalModule = cloneDeep(this.ruleModule)
  }
}
</script>
