<template>
  <f7-popup :id="popupId"
            class="editor-popup"
            :tablet-fullscreen="fullscreen"
            @popup:opened="() => showEditor = true"
            @popup:closed="popupClosed">
    <f7-page class="code-editor-content">
      <f7-navbar :title="title">
        <f7-nav-right>
          <f7-link class="popup-close" @click="update">
            Close
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <editor v-if="showEditor" v-model="code" :mode="mode || ''" />
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.code-editor-content
  background white
</style>

<script>
export default {
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ './script-editor.vue')
  },
  props: {
    title: String,
    value: String,
    mode: String,
    opened: Boolean,
    fullscreen: Boolean,
    popupId: String
  },
  data () {
    return {
      code: this.value,
      showEditor: false
    }
  },
  methods: {
    popupClosed () {
      this.$f7.emit('scriptEditorClosed')
      this.showEditor = false
    },
    update () {
      this.$f7.emit('scriptEditorUpdate', this.code)
    }
  }
}
</script>
