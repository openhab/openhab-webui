<template>
  <ul>
    <f7-list-item
      :title="configDescription.label">
      <f7-button slot="after"
                 v-if="$device.desktop"
                 @click="openPopup(true)"
                 icon-material="fullscreen" />
      <f7-button slot="after" @click="openPopup(false)">
        Edit script
      </f7-button>
    </f7-list-item>
  </ul>
</template>

<script>
import ScriptEditorPopup from './script-editor-popup.vue'

export default {
  props: {
    configDescription: Object,
    configuration: Object,
    value: String
  },
  emits: ['input'],
  data () {
    return {
    }
  },
  methods: {
    updateCode (code) {
      this.$emit('input', code)
    },
    openPopup (fullscreen) {
      this.fullscreen = fullscreen

      const popup = {
        component: ScriptEditorPopup
      }

      this.$f7router.navigate({
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

      this.$f7.once('scriptEditorUpdate', this.updateCode)
      this.$f7.once('scriptEditorClosed', () => {
        this.$f7.off('scriptEditorUpdate', this.updateCode)
      })
    }
  }
}
</script>
