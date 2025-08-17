<template>
  <div>
    <rule-general-settings v-if="createMode || isScriptRule"
                           :ready="true"
                           :rule="rule"
                           :createMode="createMode"
                           :inScriptEditor="true"
                           style="margin-bottom: -15px" />
    <f7-block class="block-narrow" style="margin-top: 0">
      <f7-col v-if="!createMode && languages">
        <f7-list inline-labels style="margin-top: 0">
          <template v-if="module && !isScriptRule">
            <f7-list-input :label="scriptType + ' Title'"
                           type="text"
                           :value="moduleTitle"
                           :placeholder="sugModuleTitle"
                           @input="$set(module, 'label', $event.target.value)"
                           :disabled="!editable"
                           :clear-button="editable" />
            <f7-list-input label="Description"
                           type="text"
                           :value="moduleDescription"
                           :placeholder="sugModuleDescription"
                           @input="$set(module, 'description', $event.target.value)"
                           :disabled="!editable"
                           :clear-button="editable" />
          </template>
          <f7-list-item title="Scripting Language"
                        class="aligned-smart-select"
                        :disabled="!editable"
                        :key="mode"
                        smart-select
                        :smart-select-params="{openIn: 'sheet', closeOnSelect: true}">
            <select @change="$emit('newLanguage', $event.target.value)">
              <option v-if="!languages.map(l => l.contentType).includes(mode)"
                      :key="mode"
                      :value="mode"
                      selected="true">
                {{ mode ? mode + ' (not installed)' : 'Unknown' }}
              </option>
              <option v-for="language in languages"
                      :key="language.contentType"
                      :value="language.contentType"
                      :selected="language.contentType === mode">
                {{ language.name }} ({{ language.version }})
              </option>
            </select>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
  </div>
</template>

<script>
import RuleGeneralSettings from '@/components/rule/rule-general-settings.vue'
import ModuleDescriptionSuggestions from '../module-description-suggestions'

export default {
  mixins: [ModuleDescriptionSuggestions],
  props: ['rule', 'module', 'moduleType', 'createMode', 'isScriptRule', 'languages', 'mode'],
  emits: ['newLanguage'],
  components: {
    RuleGeneralSettings
  },
  computed: {
    moduleTitle () {
      return this.editable || this.module?.label ? this.module.label : this.sugModuleTitle
    },
    sugModuleTitle () {
      return this.suggestedModuleTitle(this.module, this.moduleType)
    },
    moduleDescription () {
      return this.editable || this.module?.description ? this.module.description : this.sugModuleDescription
    },
    sugModuleDescription () {
      return this.suggestedModuleDescription(this.module, this.moduleType)
    },
    editable () {
      return this.createMode || (this.rule && this.rule.editable)
    },
    scriptType () {
      switch (this.module.type) {
        case 'script.ScriptAction':
        case 'jsr223.ScriptedAction':
          return 'Action'
        case 'script.ScriptCondition':
        case 'jsr223.ScriptedCondition':
          return 'Condition'
        case 'script.ScriptTrigger':
        case 'jsr223.ScriptedTrigger':
          return 'Trigger'
        default:
          return 'Module'
      }
    }
  }
}
</script>
