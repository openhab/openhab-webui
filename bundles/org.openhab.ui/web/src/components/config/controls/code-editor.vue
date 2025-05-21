<template>
  <f7-block class="code-editor">
    <f7-icon v-if="readOnly" f7="lock" class="float-right margin"
             style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray" :tooltip="readOnlyMsg" />
    <editor ref="editor"
            class="editor"
            :mode="editorMode"
            :value="code"
            :hint-context="hintContext"
            :read-only="readOnly"
            @input="onEditorInput" />

    <f7-popup ref="errors" id="code-errors" close-on-escape close-by-backdrop-click @popup:open="initializeMovablePopup($refs.errors, $refs.navbar)" @popup:closed="cleanupMovablePopup">
      <f7-page>
        <f7-navbar title="Parse Errors" ref="navbar">
          <f7-nav-right>
            <f7-link class="popup-close">
              Close
            </f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-list class="col wide error-list">
          <f7-list-item v-for="(error, idx) in errors" :key="idx" :title="error" />
        </f7-list>
      </f7-page>
    </f7-popup>

    <f7-toolbar bottom>
      <f7-segmented>
        <f7-button outline small v-for="type in Object.keys(mediaTypes)" :key="type" :active="codeType === type" @click="switchCodeType(type)">
          {{ type }}
        </f7-button>
      </f7-segmented>
      <f7-button @click="copyToClipboard" icon-ios="f7:square_on_square" icon-aurora="f7:square_on_square" color="blue" class="copy display-flex flex-direction-row">
        &nbsp;Copy
      </f7-button>
      <f7-button v-if="!readOnly" @click="revertChanges" :disabled="!dirty" icon-ios="f7:arrow_2_circlepath" icon-aurora="f7:arrow_2_circlepath" color="red" class="reset display-flex flex-direction-row">
        &nbsp;Revert
      </f7-button>
    </f7-toolbar>
  </f7-block>
</template>

<style lang="stylus">
.code-editor
  position absolute
  top calc(var(--f7-tabbar-height))
  height calc(100% - 2*var(--f7-navbar-height))
  width 100%
  margin 0!important

  .editor.vue-codemirror
    top 0

  .toolbar-bottom
    position absolute
    .toolbar-inner
      padding-left 8px
    .segmented
      .button
        width 5em

#code-errors
  .item-title
    white-space normal
</style>

<script>
import Framework7 from 'framework7/framework7-lite.esm.bundle.js'
import FileDefinition from '@/pages/settings/file-definition-mixin'
import MovablePopup from '@/pages/settings/movable-popup-mixin'

export default {
  mixins: [FileDefinition, MovablePopup],
  components: {
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  // objectType is the type of the object, e.g. 'items', 'things'. This must match the yaml element name.
  props: ['object', 'objectType', 'objectId', 'hintContext', 'readOnly', 'readOnlyMsg'],
  // @parsed  event is emitted when the code has been parsed back into an object
  //          as a result of calling the parseCode() method
  //          NOT when the user is just typing in the editor
  //          The parsed object is passed as the argument.
  // @changed event is emitted when the code is changed in the editor
  //          The code editor's dirty status is passed as a boolean argument.
  emits: ['changed', 'parsed'],
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
      codeType: localStorage.getItem('openhab.ui:codeViewer.type') || Object.keys(this.mediaTypes)[0],
      code: null,
      originalCode: null,
      displayCodeSwitcher: false,
      dirty: false,
      errors: null
    }
  },
  computed: {
    editorMode () {
      if (this.codeType === 'YAML') {
        switch (this.objectType) {
          case 'items':
            return 'application/vnd.openhab.item+yaml'
          case 'things':
            return 'application/vnd.openhab.thing+yaml'
        }
      }
      return this.mediaTypes[this.codeType]
    }
  },
  watch: {
    dirty: function () { this.$emit('changed', this.dirty) }
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
          this.code = code
          this.originalCode = code.repeat(1) // duplicate the string
          this.dirty = false
          this.codeType = codeType
          localStorage.setItem('openhab.ui:codeViewer.type', codeType)
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
      Framework7.request.promise({
        method: 'POST',
        url: '/rest/file-format/parse',
        data: this.code,
        processData: false,
        contentType: this.mediaTypes[this.codeType],
        headers: { accept: 'application/json' }
      })
        .then((data) => {
          let object = JSON.parse(data.data)
          object = object[this.objectType]
          if (object?.length > 0) {
            this.$emit('parsed', object[0])
            if (onSuccessCallback) {
              onSuccessCallback()
            }
          } else {
            this.$f7.dialog.alert(`Error parsing ${this.codeType}: no ${this.objectType} found`).open()
          }
        })
        .catch((err) => {
          if (err.status === 400) {
            let errors = JSON.parse(err.xhr.response)
            const yamlErrors = errors.includes('while scanning a simple key')
            if (yamlErrors) {
              errors = null
              // show a toast message instead of the error popup
              // The codemirror editor will show the error in the editor
              this.$f7.toast.create({
                text: 'YAML syntax error. Please check your code.',
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            } else {
              // clean up the error message and turn it into an array to be displayed as a list
              errors = errors
                .replace(/^.*? to Yaml\w+DTO: /s, '')
                .split('\n')
                .map(line => {
                  return line.replace(/^invalid thing.* (?=channel id)/, '')
                    .replace(/\s*\(class org\.openhab\.core.*?\)/, '')
                })
                .slice(0, 8) // limit to 8 lines
            }
            if (errors && errors.length > 0) {
              this.errors = errors
              this.$f7.popup.open('#code-errors')
            }
          } else {
            this.$f7.dialog.alert(`Error parsing ${this.codeType}: ${err.message || err.status}`).open()
          }
        })
    },
    onEditorInput (value) {
      this.code = value
      this.dirty = this.code !== this.originalCode
    },
    switchCodeType (type) {
      if (this.codeType === type) return

      if (this.readOnly || !this.dirty) {
        this.generateCode(type)
      } else {
        this.parseCode(() => {
          this.generateCode(type)
        })
      }
    },
    copyToClipboard () {
      this.$clipboard(this.code)
      this.$f7.toast.create({
        text: 'Code copied to clipboard',
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()
    },
    revertChanges () {
      this.$f7.dialog.confirm('Are you sure you want to revert the changes?', () => {
        this.code = this.originalCode.repeat(1) // duplicate the string
        this.dirty = false
        this.$f7.toast.create({
          text: 'Code reverted to original',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    }
  }
}

</script>
