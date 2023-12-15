<template>
  <div>
    <f7-list>
      <f7-list-input ref="input" type="textarea" :floating-label="$theme.md" :label="'Custom Rules'" name="custom-rules"
                     :value="customRules" @input="updateValue" />
      <f7-block-footer class="param-description" slot="after-list">
        <small>Enter each rule on a separate line. Available placeholders: $name$, $cmd$ and $*$.</small>
      </f7-block-footer>
    </f7-list>
    <f7-list>
      <f7-list-item checkbox :checked="isForced" @change="updateForcedConfig" title="Is Forced">
        <small>Force send command without check current item state.</small>
      </f7-list-item>
      <f7-list-item checkbox :checked="isSilent" @change="updateSilentConfig" title="Is Silent">
        <small>Disable success confirmation message.</small>
      </f7-list-item>
      <f7-list-item checkbox :checked="isTemplate" @change="updateTemplateConfig" title="Is Template">
        <small>Target similar items instead of the current one.</small>
      </f7-list-item>
      <f7-block-footer class="param-description" slot="after-list">
        <small>Flags for modifying rule behavior.</small>
      </f7-block-footer>
    </f7-list>
  </div>
</template>

<script>
export default {
  props: ['itemName', 'metadata', 'namespace'],
  computed: {
    customRules () {
      if (!this.metadata.value) return []
      return this.metadata.value.split('\n').map((s) => s.trim()).join('\n')
    },
    isSilent () {
      return this.metadata.config?.['isSilent'] ?? false
    },
    isForced () {
      return this.metadata.config?.['isForced'] ?? false
    },
    isTemplate () {
      return this.metadata.config?.['isTemplate'] ?? false
    }
  },
  methods: {
    updateValue (ev) {
      this.metadata.value = ev.target.value.split('\n').map((s) => s.trim()).join('\n')
    },
    updateSilentConfig (ev) {
      const config = this.metadata.config ?? (this.metadata.config = {})
      config.isSilent = ev.target.checked
    },
    updateForcedConfig (ev) {
      const config = this.metadata.config ?? (this.metadata.config = {})
      config.isForced = ev.target.checked
    },
    updateTemplateConfig (ev) {
      const config = this.metadata.config ?? (this.metadata.config = {})
      config.isTemplate = ev.target.checked
    }
  }
}
</script>
