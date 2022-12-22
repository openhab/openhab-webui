<template>
  <f7-block v-if="!ready" class="block-narrow">
    <f7-col v-if="createMode || isScriptRule">
      <f7-list class="no-margin" inline-labels no-hairlines-md>
        <f7-list-input label="Unique ID" type="text" placeholder="Required" :value="rule.uid" required validate
                       :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                       pattern="[A-Za-z0-9_\-]+" error-message="Required. A-Z,a-z,0-9,_,- only"
                       @input="rule.uid = $event.target.value" :clear-button="createMode" />
        <f7-list-input label="Name" type="text" placeholder="Required" :value="rule.name" required validate
                       @input="rule.name = $event.target.value" clear-button />
        <f7-list-input label="Description" type="text" :value="rule.description"
                       @input="rule.description = $event.target.value" clear-button />
      </f7-list>
    </f7-col>
    <f7-col v-if="createMode || isScriptRule">
      <f7-block-title>Tags</f7-block-title>
      <tag-input :item="rule" :disabled="false" :inScriptEditor="true" />
    </f7-col>
    <f7-col v-if="!createMode && languages">
      <f7-block-title>Scripting Language</f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item radio radio-icon="start"
                      :value="mode" :checked="mode === language.contentType" @change="$emit('newLanguage', language.contentType)"
                      v-for="language in languages" :key="language.contentType"
                      :title="language.name" :after="language.version" :footer="language.contentType" />
      </f7-list>
    </f7-col>
  </f7-block>
</template>

<script>
import TagInput from '@/components/tags/tag-input.vue'

export default {
  props: ['rule', 'createMode', 'ready', 'isScriptRule', 'languages', 'mode'],
  emits: ['newLanguage'],
  components: {
    TagInput
  }
}
</script>
