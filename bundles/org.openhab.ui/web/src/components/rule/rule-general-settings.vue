<template>
  <div>
    <f7-block v-if="ready" class="block-narrow">
      <f7-col>
        <f7-list inline-labels no-hairlines-md>
          <f7-list-input
            ref="ruleUid"
            :label="`${type} UID`"
            type="text"
            :placeholder="`A unique identifier for the ${type.toLowerCase()}`"
            :value="rule.uid || ''"
            required
            :validate="editable"
            :disabled="!createMode ? true : null"
            :info="createMode ? 'Required. Note: cannot be changed after the creation' : ''"
            input-id="input"
            :pattern="uidPattern"
            error-message="Invalid rule UID. It can't contain '/', '\' or have leading or trailing whitespace"
            @input="rule.uid = $event.target.value || undefined"
            :clear-button="createMode">
            <template #inner>
              <f7-link
                v-if="createMode && !uidValid"
                icon-f7="hammer_fill"
                style="margin-top: 4px; margin-left: 4px; margin-bottom: auto"
                tooltip="Fix UID"
                @click="normalizeUid()" />
            </template>
          </f7-list-input>
          <f7-list-input v-if="!createMode && templateName" label="Template" type="text" :value="templateName" disabled />
          <f7-list-input
            label="Label"
            type="text"
            :placeholder="`${type} label for display purposes`"
            :info="createMode ? 'Required' : ''"
            :value="rule.name || ''"
            required
            validate
            :disabled="!editable ? true : null"
            @input="rule.name = $event.target.value || undefined"
            :clear-button="editable" />
          <f7-list-input
            label="Description"
            type="text"
            :value="rule.description || ''"
            :disabled="!editable ? true : null"
            @input="rule.description = $event.target.value || undefined"
            :clear-button="editable" />
        </f7-list>
        <f7-list inline-labels no-hairlines-md>
          <div>
            <tag-input
              v-if="!stubMode"
              title="Tags"
              :item="rule"
              :disabled="!editable ? true : null"
              :showSemanticTags="true"
              :inScriptEditor="inScriptEditor"
              :inSceneEditor="inSceneEditor" />
          </div>
        </f7-list>
      </f7-col>
    </f7-block>

    <!-- skeletons for not ready-->
    <f7-block v-else class="block-narrow">
      <f7-col class="skeleton-text skeleton-effect-blink">
        <f7-list inline-labels no-hairlines-md>
          <f7-list-input
            :label="`${type} UID`"
            type="text"
            placeholder="Required"
            value="_______"
            required
            :validate="editable"
            :disabled="true"
            :info="createMode ? 'Note: cannot be changed after the creation' : ''"
            :clear-button="createMode" />
          <f7-list-input label="Name" type="text" placeholder="Required" required validate :disabled="true" :clear-button="editable" />
          <f7-list-input label="Description" type="text" value="__ _____ ___ __ ___" :disabled="true" :clear-button="editable" />
        </f7-list>
        <f7-list inline-labels no-hairlines-md>
          <f7-list-group>
            <tag-input
              v-if="!stubMode"
              :item="rule"
              :disabled="!editable ? true : null"
              :showSemanticTags="true"
              :inScriptEditor="inScriptEditor"
              :inSceneEditor="inSceneEditor" />
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>
  </div>
</template>

<script>
import TagInput from '@/components/tags/tag-input.vue'
import { RULE_UID_PATTERN } from '@/js/openhab/uid.ts'

const UID_REGEX = new RegExp('^' + RULE_UID_PATTERN + '$')

export default {
  props: {
    // This component intentionally edits the shared rule object in place.
    rule: Object,
    ready: Boolean,
    createMode: Boolean,
    stubMode: Boolean,
    templateName: String,
    inScriptEditor: Boolean,
    inSceneEditor: Boolean
  },
  components: {
    TagInput
  },
  data() {
    return {
      uidPattern: RULE_UID_PATTERN
    }
  },
  computed: {
    editable() {
      return this.createMode || (this.rule && this.rule.editable)
    },
    type() {
      if (this.inScriptEditor) return 'Script'
      if (this.inSceneEditor) return 'Scene'
      return 'Rule'
    },
    uidValid() {
      if (!this.rule || !this.rule.uid) return false
      return UID_REGEX.test(this.rule.uid)
    }
  },
  methods: {
    normalizeUid() {
      this.rule.uid = this.rule.uid.trim().replace(/\/|\\/g, '_')
    }
  }
}
</script>
