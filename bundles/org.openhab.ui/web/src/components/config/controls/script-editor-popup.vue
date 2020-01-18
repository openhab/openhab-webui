<template>
  <f7-popup :id="popupId" class="editor-popup" close-on-escape :tablet-fullscreen="fullscreen" @popup:opened="() => showEditor = true" @popup:closed="popupClosed" :opened="opened">
    <f7-page class="code-editor-content">
      <f7-navbar :title="title">
        <f7-nav-right>
          <f7-link :popup-close="(popupId) ? '#' + popupId : '.editor-popup'">Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <editor v-if="showEditor" v-model="code"></editor>
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
    'editor': () => import('./script-editor.vue')
  },
  props: ['title', 'value', 'opened', 'fullscreen', 'popupId'],
  data () {
    return {
      code: this.value,
      showEditor: false
    }
  },
  methods: {
    popupClosed () {
      this.showEditor = false
      this.$emit('closed', this.code)
    }
  }
}
</script>
