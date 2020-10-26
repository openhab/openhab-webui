<template>
  <f7-popup ref="modulePopup" class="moduleconfig-popup" @popupClosed="moduleConfigClosed">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
        </f7-nav-left>
        <f7-nav-title v-if="ruleModule && ruleModule.new">{{sectionLabels[currentSection][1]}}</f7-nav-title>
        <f7-nav-title v-else>Edit module</f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="currentRuleModuleType" @click="updateModuleConfig">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block v-if="ruleModule" class="no-margin no-padding">
        <f7-col class="margin-top">
          <f7-list inline-labels no-hairlines-md class="no-margin">
            <f7-list-input type="text" :placeholder="moduleTitleSuggestion" :value="ruleModule.label" required
                          @input="ruleModule.label = $event.target.value" clear-button>
            </f7-list-input>
            <f7-list-input type="text" :placeholder="moduleDescriptionSuggestion" :value="ruleModule.description"
                          @input="ruleModule.description = $event.target.value" clear-button>
            </f7-list-input>
          </f7-list>
        </f7-col>
        <f7-block-footer class="no-margin padding-left"><small>Tip: leave fields blank to set automatically to the suggested name and description. <f7-link @click="ruleModule.label = null; ruleModule.description = null">Clear</f7-link></small></f7-block-footer>

        <f7-block-title>Type of {{currentSection.replace(/.$/, '')}}</f7-block-title>
        <f7-list v-if="!currentRuleModuleType">
          <ul v-for="(mt, scope) in groupedModuleTypes(currentSection)" :key="scope">
            <f7-list-item divider :title="scope" />
            <f7-list-item radio v-for="moduleType in mt"
              :value="moduleType.uid"
              @change="setModuleType(moduleType)"
              :checked="ruleModule.type === moduleType.uid"
              :key="moduleType.uid" :title="moduleType.label" name="module-type"></f7-list-item>
          </ul>
        </f7-list>
        <f7-list v-else>
          <f7-list-item :title="sectionLabels[currentSection][0]" ref="ruleModuleTypeSmartSelect" smart-select :smart-select-params="{ view: $f7.views.main, openIn: 'popup', closeOnSelect: true }">
            <select name="ruleModuleType"
              @change="setModuleType(moduleTypes[currentSection].find((t) => t.uid === $refs.ruleModuleTypeSmartSelect.f7SmartSelect.getValue()))">
              <optgroup v-for="(mt, scope) in groupedModuleTypes(currentSection)" :key="scope" :label="scope">
                <option v-for="moduleType in mt"
                  :value="moduleType.uid" :key="moduleType.uid" :selected="currentRuleModuleType.uid === moduleType.uid">
                  {{moduleType.label}}
                </option>
              </optgroup>
            </select>
          </f7-list-item>
        </f7-list>
        <f7-block-title v-if="ruleModule && currentRuleModuleType" style="margin-bottom: calc(var(--f7-block-title-margin-bottom) - var(--f7-list-margin-vertical))">Configuration</f7-block-title>
        <f7-col v-if="ruleModule && currentRuleModuleType">
          <config-sheet :key="currentSection + ruleModule.id"
            ref="parameters"
            :parameterGroups="[]"
            :parameters="currentRuleModuleType.configDescriptions"
            :configuration="ruleModule.configuration"
            @updated="dirty = true"
          />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

import ModuleDescriptionSuggestions from './module-description-suggestions'

export default {
  mixins: [ModuleDescriptionSuggestions],
  components: {
    ConfigSheet
  },
  props: ['rule', 'ruleModule', 'ruleModuleType', 'moduleTypes', 'currentSection'],
  data () {
    return {
      currentRuleModuleType: this.ruleModuleType,
      sectionLabels: {
        triggers: ['When', 'Add Trigger'],
        actions: ['Then', 'Add Action'],
        conditions: ['But only if', 'Add Condition']
      }
    }
  },
  methods: {
    setModuleType (moduleType) {
      this.ruleModule.type = moduleType.uid
      this.$set(this, 'currentRuleModuleType', moduleType)
      this.$set(this.ruleModule, 'configuration', {})
      this.ruleModule.label = this.ruleModule.description = ''
    },
    moduleConfigClosed () {
      this.$f7.emit('ruleModuleConfigClosed')
    },
    updateModuleConfig () {
      if (!this.$refs.parameters.isValid()) {
        this.$f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }
      this.$f7.emit('ruleModuleConfigUpdate', this.ruleModule)
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
  }
}
</script>
