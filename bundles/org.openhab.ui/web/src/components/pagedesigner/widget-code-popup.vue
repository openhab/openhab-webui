<template>
  <f7-popup ref="widgetCode" class="widgetcode-popup" close-on-escape
    :opened="opened" @popup:open="widgetCodeOpened" @popup:closed="widgetCodeClosed">
    <f7-page v-if="component && opened">
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
        </f7-nav-left>
        <f7-nav-title>Edit Widget Code</f7-nav-title>
        <f7-nav-right>
          <f7-link @click="updateWidgetCode">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <editor class="page-code-editor" mode="text/x-yaml" :value="code" @input="(value) => code = value" />
      <pre class="yaml-message padding-horizontal" :class="[widgetYamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{widgetYamlError}}</pre>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.widgetcode-popup
  .page-code-editor.vue-codemirror
    display block
    top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
    height calc(80% - 2*var(--f7-navbar-height))
    width 100%
  .yaml-message
    display block
    position absolute
    top 80%
    white-space pre-wrap
</style>

<script>
import YAML from 'yaml'

export default {
  props: ['opened', 'component'],
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue')
  },
  data () {
    return {
      code: ''
    }
  },
  computed: {
    widgetYamlError () {
      try {
        YAML.parse(this.code, { prettyErrors: true })
        return 'OK'
      } catch (e) {
        return e
      }
    }
  },
  methods: {
    widgetCodeOpened () {
      this.code = YAML.stringify(this.component)
    },
    widgetCodeClosed () {
      this.$emit('closed')
    },
    updateWidgetCode () {
      this.$emit('update', this.code)
    }
  }
}
</script>
