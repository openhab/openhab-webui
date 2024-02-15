<template>
  <div>
    <f7-block v-if="ready" class="block-narrow">
      <f7-col>
        <f7-list inline-labels no-hairlines-md>
          <f7-list-input label="Unique ID" type="text" placeholder="Required" :value="rule.uid" required validate
                         :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                         pattern="[A-Za-z0-9_\-]+" error-message="Required. A-Z,a-z,0-9,_,- only"
                         @input="rule.uid = $event.target.value" :clear-button="createMode" />
          <f7-list-input label="Name" type="text" placeholder="Required" :value="rule.name" required validate
                         :disabled="!editable" @input="rule.name = $event.target.value" :clear-button="editable" />
          <f7-list-input label="Description" type="text" :value="rule.description"
                         :disabled="!editable" @input="rule.description = $event.target.value" :clear-button="editable" />
        </f7-list>
        <f7-list inline-labels no-hairlines-md>
          <tag-input v-if="!createMode || !hasRuleTemplate" title="Tags" :item="rule" :disabled="!editable" :showSemanticTags="true" :inScriptEditor="inScriptEditor" :inSceneEditor="inSceneEditor" />
        </f7-list>
      </f7-col>
    </f7-block>

    <!-- skeletons for not ready-->
    <f7-block v-else class="block-narrow">
      <f7-col class="skeleton-text skeleton-effect-blink">
        <f7-list inline-labels no-hairlines-md>
          <f7-list-input label="Unique ID" type="text" placeholder="Required" value="_______" required validate
                         :disabled="true" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                         @input="rule.uid = $event.target.value" :clear-button="createMode" />
          <f7-list-input label="Name" type="text" placeholder="Required" required validate
                         :disabled="true" @input="rule.name = $event.target.value" :clear-button="editable" />
          <f7-list-input label="Description" type="text" value="__ _____ ___ __ ___"
                         :disabled="true" @input="rule.description = $event.target.value" :clear-button="editable" />
        </f7-list>
        <f7-list inline-labels no-hairlines-md>
          <tag-input v-if="!createMode || !hasRuleTemplate" :item="rule" :disabled="!editable" :showSemanticTags="true" :inScriptEditor="inScriptEditor" :inSceneEditor="inSceneEditor" />
        </f7-list>
      </f7-col>
    </f7-block>
  </div>
</template>

<script>
import TagInput from '@/components/tags/tag-input.vue'

export default {
  props: ['rule', 'ready', 'createMode', 'hasRuleTemplate', 'inScriptEditor', 'inSceneEditor'],
  components: {
    TagInput
  },
  computed: {
    editable () {
      return this.createMode || (this.rule && this.rule.editable)
    }
  },
  methods: {
    isScriptTag (tag) {
      if (this.inScriptEditor !== true) return false
      if (tag === 'Script') return true
    },
    isSceneTag (tag) {
      if (this.inSceneEditor !== true) return false
      if (tag === 'Scene') return true
    }
  }
}
</script>
