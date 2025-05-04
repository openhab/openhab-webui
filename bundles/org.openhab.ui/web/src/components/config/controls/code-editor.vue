<template>
  <f7-block class="editor">
    <f7-icon v-if="readOnly" f7="lock" class="float-right margin"
             style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray" :tooltip="readOnlyMsg" />
    <editor class="thing-code-editor"
            :mode="editorMode"
            :value="code"
            :hint-context="hintContext"
            :read-only="readOnly"
            @input="onEditorInput" />
    <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->
    <f7-toolbar bottom>
      <f7-segmented>
        <f7-button outline small v-for="type in Object.keys(mediaTypes)" :key="type" :active="codeType === type" @click="switchCodeType(type)">
          {{ type }}
        </f7-button>
      </f7-segmented>
    </f7-toolbar>
  </f7-block>
</template>

<style lang="stylus">
.editor
  position absolute
  top calc(var(--f7-tabbar-height))
  height calc(100% - 2*var(--f7-navbar-height))
  width 100%
  margin 0!important

  .thing-code-editor.vue-codemirror
    top 0

  .toolbar-bottom
    position absolute
    .segmented
      .button
        width 5em

</style>

<script>
import FileDefinition from '@/pages/settings/file-definition-mixin'

export default {
  mixins: [FileDefinition],
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  // objectType is the type of the object, e.g. 'items', 'things'. This corresponds to the yaml element name.
  props: ['object', 'objectType', 'objectId', 'hintContext', 'readOnly', 'readOnlyMsg'],
  // @updated event is emitted when the code has been parsed back into an object
  //          as a result of calling the parseCode() method
  //          NOT when the user is just typing in the editor
  //          The parsed object is passed as the argument.
  // @changed event is emitted when the code is changed in the editor
  //          The code editor's dirty status is passed as a boolean argument.
  emits: ['changed', 'updated'],
  beforeMount () {
    switch (this.objectType) {
      case 'items':
        this.mediaTypes = { YAML: this.MediaType.YAML, DSL: this.MediaType.ITEM_DSL }
        break
      case 'things':
        this.mediaTypes = { YAML: this.MediaType.YAML, DSL: this.MediaType.THING_DSL }
        break
      default:
        this.mediaTypes = { YAML: this.MediaType.YAML }
    }
  },
  data () {
    return {
      // the first key in the mediaTypes object is the default codeType (e.g. YAML)
      codeType: localStorage.getItem('openhab.ui:codeViewer.type') || Object.keys(this.mediaTypes)[0],
      code: null,
      originalCode: null,
      displayCodeSwitcher: false,
      dirty: false,
      yamlVersion: null
    }
  },
  computed: {
    editorMode () {
      if (this.codeType === 'DSL') {
        return 'text/x-java'
      }
      switch (this.objectType) {
        case 'items':
          return 'application/vnd.openhab.item+yaml'
        case 'things':
          return 'application/vnd.openhab.thing+yaml'
        default:
          return 'application/yaml'
      }
    }
  },
  methods: {
    /**
     * Generate code from object property
     *
     * Called from the parent component to update the code from object
     *
     * @param {string} codeType - Optional. The type of code to generate (e.g. YAML, DSL)
     * @param {function} onSuccessCallback - Optional. A callback function to call when the code has been generated
     */
    generateCode (codeType, onSuccessCallback) {
      codeType ||= this.codeType
      const mediaType = this.mediaTypes[codeType]
      const payload = {}
      payload[this.objectType] = [this.object]
      this.$oh.api.postPlain('/rest/file-format/create', JSON.stringify(payload), null, 'application/json', { accept: mediaType })
        .then((code) => {
          if (codeType === 'YAML') {
            // skip version:, things: / items: and UID: lines, and unindent lines
            code = code.split('\n')
            this.yamlVersion = code[0]
            code = code.slice(3).map(line => line.replace(/^\s{4}/, '')).join('\n')
          }
          this.code = code
          this.originalCode = code.repeat(1) // duplicate the string
          this.dirty = false
          if (onSuccessCallback) {
            onSuccessCallback()
          }
        })
        .catch((err) => {
          this.$f7.dialog.alert(`Error creating ${codeType}: ${err}`).open()
        })
    },
    /**
     * Parse code back into an object
     *
     * Called from the parent component to update the object from code.
     * The resulting object is emitted in an {update} event.
     *
     * @param {function} onSuccessCallback - Optional. A callback function to call when the code has been parsed
     */
    parseCode (onSuccessCallback) {
      const mediaType = this.mediaTypes[this.codeType]
      let payload = this.code
      if (this.codeType === 'YAML') {
        const indentedCode = payload.split('\n').map(line => '    ' + line).join('\n')
        payload = `${this.yamlVersion}\n${this.objectType}:\n  ${this.objectId}:\n${indentedCode}`
      }
      this.$oh.api.postPlain('/rest/file-format/parse', payload, null, mediaType, { accept: 'application/json' })
        .then((data) => {
          let object = JSON.parse(data)
          object = object[this.objectType]
          if (object?.length > 0) {
            this.$emit('updated', object[0])
            if (onSuccessCallback) {
              onSuccessCallback()
            }
          } else {
            this.$f7.dialog.alert(`Error parsing ${this.codeType}: no ${this.objectType} found`).open()
          }
        })
        .catch((err) => {
          this.$f7.dialog.alert(`Error parsing ${this.codeType}: ${err}`).open()
        })
    },
    onEditorInput (value) {
      this.code = value
      this.dirty = this.code !== this.originalCode
      this.$emit('changed', this.dirty)
    },
    switchCodeType (type) {
      if (this.codeType === type) return
      if (this.readOnly || !this.dirty) {
        this.generateCode(type, () => {
          localStorage.setItem('openhab.ui:codeViewer.type', type)
          this.codeType = type
        })
      } else {
        this.parseCode((object) => {
          this.generateCode(type, () => {
            localStorage.setItem('openhab.ui:codeViewer.type', type)
            this.codeType = type
          })
        })
      }
    }
  }
}

</script>
