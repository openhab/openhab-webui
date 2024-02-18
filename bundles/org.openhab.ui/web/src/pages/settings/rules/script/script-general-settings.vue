<template>
  <div>
    <rule-general-settings v-if="createMode || isScriptRule" :ready="true" :rule="rule" :createMode="createMode" :inScriptEditor="true" />
    <f7-block class="block-narrow">
      <f7-col v-if="!createMode && languages">
        <f7-list inline-labels>
          <template v-if="module && !isScriptRule">
            <f7-list-input :label="scriptType + ' Title'" type="text" :value="module.label" :placeholder="suggestedModuleTitle(module, moduleType)" @input="module.label = $event.target.value" :disabled="!editable" :clear-button="editable" />
            <f7-list-input label="Description" type="text" :value="module.description" :placeholder="suggestedModuleDescription(module, moduleType)" @input="module.description = $event.target.value" :disabled="!editable" :clear-button="editable" />
          </template>
          <f7-list-item title="Scripting Language" class="aligned-smart-select" :disabled="!editable" :key="mode" smart-select :smart-select-params="{openIn: 'sheet', closeOnSelect: true}">
            <select @change="$emit('newLanguage', $event.target.value)">
              <option v-for="language in languages" :key="language.contentType" :value="language.contentType" :selected="language.contentType === mode">
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
  props: ['rule', 'module', 'moduleType', 'moduleTypes', 'createMode', 'isScriptRule', 'languages', 'mode'],
  emits: ['newLanguage'],
  components: {
    RuleGeneralSettings
  },
  computed: {
    editable () {
      return this.createMode || (this.rule && this.rule.editable)
    },
    scriptType () {
      switch (this.module.type) {
        case 'script.ScriptAction':
        case 'script.ScriptCondition':
          return this.module.type.slice('script.Script'.length)
        default:
          return 'Module'
      }
    }
  }
}
</script>
