<template>
  <ul>
    <f7-list-item
      :title="configDescription.label">
      <template #after>
        <f7-button v-if="$device.desktop"
                   @click="openPopup(true)"
                   icon-material="fullscreen" />
        <f7-button @click="openPopup(false)">
          Edit script
        </f7-button>
      </template>
    </f7-list-item>
  </ul>
</template>

<script>
import ScriptEditorPopup from './script-editor-popup.vue'
import { f7 } from 'framework7-vue'

export default {
  props: {
    configDescription: Object,
    configuration: Object,
    value: String,
    f7router: Object
  },
  emits: ['input'],
  methods: {
    updateCode (code) {
      this.$emit('input', code)
    },
    openPopup (fullscreen) {
      this.fullscreen = fullscreen

      const popup = {
        component: ScriptEditorPopup
      }

      this.f7router.navigate({
        url: 'script-edit',
        route: {
          path: 'script-edit',
          popup
        }
      }, {
        props: {
          title: this.configDescription.label,
          // use the "type" parameter as the mode if found (for rule modules)
          mode: (this.configuration && this.configuration.type) ? this.configuration.type : '',
          fullscreen,
          value: this.value
        }
      })

      f7.once('scriptEditorUpdate', this.updateCode)
      f7.once('scriptEditorClosed', () => {
        f7.off('scriptEditorUpdate', this.updateCode)
      })
    }
  }
}
</script>
