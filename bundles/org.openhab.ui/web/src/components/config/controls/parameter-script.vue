<template>
  <ul>
      <f7-list-item
         :title="configDescription.label">
        <f7-button slot="after" v-if="$device.desktop" @click="openPopup(true)" icon-material="fullscreen"></f7-button>
        <f7-button slot="after" @click="openPopup(false)">Edit script</f7-button>
        <!-- <f7-button slot="after" v-if="$device.desktop" @click="fullscreenCodeEditorOpened = true">Fullscreen</f7-button> -->
        <script-editor-popup v-if="!fullscreen" :title="configDescription.label" :popup-id="`config-${configDescription.name}-window`" :fullscreen="false" :value="value" :opened="codeEditorOpened" @closed="popupClosed"></script-editor-popup>
        <script-editor-popup v-else :title="configDescription.label" :popup-id="`config-${configDescription.name}-fullscreen`" :fullscreen="true" :value="value" :opened="codeEditorOpened" @closed="popupClosed"></script-editor-popup>
      </f7-list-item>
  </ul>
</template>

<script>
const ScriptEditorPopup = () => import('./script-editor-popup.vue')

export default {
  props: ['configDescription', 'value'],
  components: {
    ScriptEditorPopup
  },
  data () {
    return {
      codeEditorOpened: false,
      fullscreenCodeEditorOpened: false,
      fullscreen: false
    }
  },
  methods: {
    popupClosed (code) {
      this.codeEditorOpened = false
      this.fullScreenCodeEditorOpened = false
      this.$emit('input', code)
    },
    openPopup (fullscreen) {
      this.fullscreen = fullscreen
      this.$nextTick(() => { this.codeEditorOpened = true })
    }
  }
}
</script>
