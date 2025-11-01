<template>
  <f7-icon v-if="readOnly"
           f7="lock"
           class="float-right margin"
           style="opacity:0.5; z-index: 4000; user-select: none;"
           size="50"
           color="gray"
           :tooltip="readOnlyMsg" />

  <div class="code-editor">
    <editor ref="editor"
            :mode="editorMode"
            :value="code"
            :hint-context="hintContext"
            :read-only="readOnly"
            @input="onEditorInput" />
  </div>

  <f7-toolbar bottom>
    <f7-segmented>
      <f7-button v-for="type in Object.keys(mediaTypes)"
                 outline
                 small
                 :key="type"
                 :active="uiOptionsStore.codeEditorType === type"
                 @click="switchCodeType(type)">
        {{ type }}
      </f7-button>
    </f7-segmented>
    <f7-button @click="copy"
               icon-ios="f7:square_on_square"
               icon-aurora="f7:square_on_square"
               color="blue"
               class="copy display-flex flex-direction-row">
      &nbsp;Copy
    </f7-button>
    <f7-button v-if="!readOnly"
               @click="revertChanges"
               :disabled="!dirty"
               icon-ios="f7:arrow_2_circlepath"
               icon-aurora="f7:arrow_2_circlepath"
               color="red"
               class="reset display-flex flex-direction-row">
      &nbsp;Revert
    </f7-button>
  </f7-toolbar>

  <f7-popup ref="errors"
            id="code-errors"
            close-on-escape
            close-by-backdrop-click
            @popup:open="initializeMovablePopup($refs.errors, $refs.navbar)"
            @popup:closed="cleanupMovablePopup">
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
</template>

<style lang="stylus">
.code-editor
  position absolute
  top calc(var(--f7-navbar-height) + var(--f7-toolbar-height))
  bottom calc(var(--f7-navbar-height))
  width 100%

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
import { f7 } from 'framework7-vue'
import { mapStores } from 'pinia'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import Editor from '@/components/config/controls/script-editor.vue'

import MovablePopup from '@/pages/settings/movable-popup-mixin'
import copyToClipboard from '@/js/clipboard'

const MediaType = Object.freeze({
  YAML: 'application/yaml',
  THING_DSL: 'text/vnd.openhab.dsl.thing',
  ITEM_DSL: 'text/vnd.openhab.dsl.item',
  JSON: 'application/json'
})

const SupportedMediaTypes = {
  items: {
    YAML: MediaType.YAML,
    DSL: MediaType.ITEM_DSL
  },
  things: {
    YAML: MediaType.YAML,
    DSL: MediaType.THING_DSL
  }
}

const DefaultMediaTypes = {
  YAML: MediaType.YAML
}

export default {
  mixins: [MovablePopup],
  components: {
    Editor
  },
  props: {
    object: Object,
    objectType: String, // the type of the object, e.g. 'items', 'things' which corresponds to the yaml element name.
    objectId: String,
    hintContext: Object,
    readOnly: Boolean,
    readOnlyMsg: String
  },
  // @parsed  event is emitted when the code has been parsed back into an object
  //          as a result of calling the parseCode() method
  //          NOT when the user is just typing in the editor
  //          The parsed object is passed as the argument.
  // @changed event is emitted when the code is changed in the editor
  //          The code editor's dirty status is passed as a boolean argument.
  emits: ['changed', 'parsed'],
  data () {
    return {
      code: null,
      originalCode: null,
      displayCodeSwitcher: false,
      dirty: false,
      errors: null
    }
  },
  computed: {
    editorMode () {
      if (this.uiOptionsStore.codeEditorType === 'YAML') {
        switch (this.objectType) {
          case 'items':
            return 'application/vnd.openhab.item+yaml'
          case 'things':
            return 'application/vnd.openhab.thing+yaml'
        }
      }
      return this.mediaTypes[this.uiOptionsStore.codeEditorType]
    },
    mediaTypes () {
      return SupportedMediaTypes[this.objectType] || DefaultMediaTypes
    },
    ...mapStores(useUIOptionsStore)
  },
  watch: {
    dirty () {
      this.$emit('changed', this.dirty)
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
      codeType ||= this.uiOptionsStore.codeEditorType
      const sourceMediaType = MediaType.JSON
      const targetMediaType = this.mediaTypes[codeType]
      const payload = {}
      payload[this.objectType] = [this.object]
      this.$oh.api.postPlain('/rest/file-format/create', JSON.stringify(payload), null, sourceMediaType, { accept: targetMediaType })
        .then((code) => {
          this.code = code
          this.originalCode = code.repeat(1) // duplicate the string
          this.uiOptionsStore.codeEditorType = codeType
          if (onSuccessCallback) {
            onSuccessCallback()
          }
        })
        .catch((err) => {
          f7.dialog.alert(`Error creating ${codeType}: ${err}`).open()
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
    parseCode (onSuccessCallback, onFailureCallback) {
      const sourceMediaType = this.mediaTypes[this.uiOptionsStore.codeEditorType]
      const targetMediaType = MediaType.JSON
      this.$oh.api.request({
        method: 'POST',
        url: '/rest/file-format/parse',
        data: this.code,
        processData: false,
        contentType: sourceMediaType,
        headers: { accept: targetMediaType }
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
            if (onFailureCallback) {
              onFailureCallback()
            }
            f7.dialog.alert(`Error parsing ${this.uiOptionsStore.codeEditorType}: no ${this.objectType} found`).open()
          }
        })
        .catch((err) => {
          if (onFailureCallback) {
            onFailureCallback()
          }

          if (err.status === 400) {
            let errors = JSON.parse(err.xhr.response)
            const yamlErrors = errors.includes('while scanning a simple key')
            if (yamlErrors) {
              errors = null
              // show a toast message instead of the error popup
              // The codemirror editor will show the error in the editor
              f7.toast.create({
                text: 'YAML syntax error. Please check your code.',
                destroyOnClose: true,
                closeTimeout: 2000
              }).open()
            } else {
              // clean up the error message and turn it into an array to be displayed as a list
              errors = errors
                .replace(/^.*? to Yaml\w+DTO: /s, '')
                .split('\n')
                .map((line) => {
                  return line.replace(/^invalid thing.* (?=channel id)/, '')
                    .replace(/\s*\(class org\.openhab\.core.*?\)/, '')
                })
                .slice(0, 8) // limit to 8 lines
            }
            if (errors && errors.length > 0) {
              this.errors = errors
              f7.popup.open('#code-errors')
            }
          } else {
            f7.dialog.alert(`Error parsing ${this.uiOptionsStore.codeEditorType}: ${err.message || err.status}`).open()
          }
        })
    },
    onEditorInput (value) {
      this.code = value
      this.dirty = this.code !== this.originalCode
    },
    switchCodeType (type) {
      if (this.uiOptionsStore.codeEditorType === type) return

      if (this.readOnly || !this.dirty) {
        this.generateCode(type)
      } else {
        this.parseCode(() => {
          this.generateCode(type)
        })
      }
    },
    copy () {
      copyToClipboard(this.code, {
        onSuccess: () => {
          f7.toast.create({
            text: 'Code copied to clipboard',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
      })
    },
    revertChanges () {
      f7.dialog.confirm('Are you sure you want to revert the changes?', () => {
        this.code = this.originalCode.repeat(1) // duplicate the string
        this.dirty = false
        f7.toast.create({
          text: 'Code reverted to original',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    }
  }
}

</script>
