<template>
  <div>
    <rule-general-settings v-if="createMode || isScriptRule" :ready="true" :rule="rule" :createMode="createMode" :inScriptEditor="true" />
    <f7-block class="block-narrow">
      <f7-col v-if="!createMode && languages">
        <f7-block-title>Scripting Language</f7-block-title>
        <f7-list media-list>
          <f7-list-item media-item radio radio-icon="start" :disabled="!editable"
                        :value="mode" :checked="mode === language.contentType" @change="$emit('newLanguage', language.contentType)"
                        v-for="language in languages" :key="language.contentType"
                        :title="language.name" :after="language.version" :footer="language.contentType" />
        </f7-list>
      </f7-col>
    </f7-block>
  </div>
</template>

<script>
import RuleGeneralSettings from '@/components/rule/rule-general-settings.vue'

export default {
  props: ['rule', 'createMode', 'isScriptRule', 'languages', 'mode'],
  emits: ['newLanguage'],
  components: {
    RuleGeneralSettings
  },
  computed: {
    editable () {
      return this.createMode || (this.rule && this.rule.editable)
    }
  }
}
</script>
