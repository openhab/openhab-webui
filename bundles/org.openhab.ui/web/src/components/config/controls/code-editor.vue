<template>
  <div class="code-editor">
    <editor
      ref="editor"
      :mode="editorMode"
      :value="code"
      :hint-context="hintContext"
      :read-only="readOnly"
      :read-only-msg="readOnlyMsg"
      @input="onEditorInput"
      @save="$emit('save')" />
  </div>

  <f7-toolbar bottom :class="{ 'code-editor-toolbar': true, 'toolbar-narrow': $f7dim.width < 450 }">
    <div class="toolbar-options display-flex flex-direction-row">
      <f7-segmented>
        <f7-button
          v-for="type in Object.keys(mediaTypes)"
          outline
          small
          :key="type"
          :active="uiOptionsStore.codeEditorType === type"
          :tooltip="`Show code as ${type}`"
          @click="switchCodeType(type)">
          {{ type }}
        </f7-button>
      </f7-segmented>
      <f7-checkbox
        v-if="showShowAllCheckbox"
        class="opt-show-all display-flex text-color-blue"
        v-model:checked="isShowAll"
        @update:checked="switchShowAll">
        <span>Show all</span>
      </f7-checkbox>
    </div>
    <slot name="additional-panel-controls" />
    <f7-button
      @click="copy"
      icon-ios="f7:square_on_square"
      icon-aurora="f7:square_on_square"
      color="blue"
      tooltip="Copy code to clipboard"
      class="copy display-flex flex-direction-row">
      &nbsp;{{ $f7dim.width < 390 ? '' : 'Copy' }}
    </f7-button>
    <f7-button
      v-if="!readOnly"
      @click="revertChanges"
      :disabled="!dirty"
      icon-ios="f7:arrow_2_circlepath"
      icon-aurora="f7:arrow_2_circlepath"
      color="red"
      tooltip="Revert local changes to the code"
      class="reset display-flex flex-direction-row">
      &nbsp;{{ $f7dim.width < 390 ? '' : 'Revert' }}
    </f7-button>
  </f7-toolbar>

  <f7-popup
    ref="errors"
    class="code-editor-errors"
    close-on-escape
    close-by-backdrop-click
    @popup:open="initializeMovablePopup($refs.errors, $refs.navbar)"
    @popup:closed="cleanupMovablePopup">
    <f7-page>
      <f7-navbar title="Parse Errors" ref="navbar">
        <f7-nav-right>
          <f7-link class="popup-close"> Close </f7-link>
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
  bottom calc(var(--f7-toolbar-height))
  width 100%

.code-editor-toolbar
  position absolute
  .toolbar-inner
    padding-left 8px
    .toolbar-options
      align-items center
      gap 8px
      .opt-show-all
        flex-wrap nowrap
        align-items center
        flex-direction row
        span
          white-space nowrap
          padding-left 4px
  .segmented
    .button
      width 5em

.code-editor-toolbar.toolbar-narrow
  --f7-toolbar-height var(--f7-tabbar-labels-height);
  font-size var(--f7-tabbar-label-font-size)
  .toolbar-inner
    padding-left 5px
    .toolbar-options
      gap 6px
      .opt-show-all
        flex-wrap nowrap
        align-items center
        flex-direction column
        span
          padding-left 0
  .segmented
    .button
      width auto

.code-editor-errors
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
import { DefaultMediaTypes, MediaType, SupportedMediaTypes } from '@/assets/definitions/media-types.ts'
import { showToast } from '@/js/dialog-promises'

export default {
  mixins: [MovablePopup],
  components: {
    Editor
  },
  props: {
    object: Object,
    objectType: String, // the type of the object, e.g. 'items', 'things', 'rules' which corresponds to the yaml element name.
    objectId: String,
    hintContext: Object,
    readOnly: Boolean,
    readOnlyMsg: String,
    validMediaTypes: Array, // Optional list of media types to show. If not provided, all media types for the object type will be shown
    optShowAllMediaTypes: Array, // Optional list of media types that will show the "Show all" checkbox. If not provided, the checkbox will not be shown
    isObjectEmpty: Boolean, // Optional flag to indicate if the object is empty and can't be serialized.
    emptyMediaTypeTemplates: Object, // Optional map of media types to template objects that can be used for empty objects that can't be serialized
    postParseCallback: Function // Optional callback function that is called after parsing the code back into an object, which allow various states to be updated
  },
  // @parsed  event is emitted when the code has been parsed back into an object
  //          as a result of calling the parseCode() method
  //          NOT when the user is just typing in the editor
  //          The parsed object is passed as the argument.
  // @changed event is emitted when the code is changed in the editor
  //          The code editor's dirty status is passed as a boolean argument.
  emits: ['changed', 'parsed', 'save'],
  data() {
    return {
      code: null,
      originalCode: null,
      displayCodeSwitcher: false,
      dirty: false,
      errors: null,
      isShowAll: false
    }
  },
  computed: {
    editorMode() {
      const mode = this.mediaTypes[this.uiOptionsStore.codeEditorType]
      if (mode) return mode
      const keys = Object.keys(this.mediaTypes || {})
      if (keys.length > 0) return this.mediaTypes[keys[0]]
      return undefined
    },
    mediaTypes() {
      let result = SupportedMediaTypes[this.objectType] || DefaultMediaTypes
      if (!this.validMediaTypes || this.validMediaTypes.length === 0) {
        return result
      }
      result = Object.fromEntries(
        Object.entries(result).filter(([key, value]) => {
          return this.validMediaTypes.includes(value)
        })
      )
      return result
    },
    showShowAllCheckbox() {
      if (!this.optShowAllMediaTypes || this.optShowAllMediaTypes.length === 0) return false
      return this.optShowAllMediaTypes.includes(this.mediaTypes[this.uiOptionsStore.codeEditorType])
    },
    ...mapStores(useUIOptionsStore)
  },
  watch: {
    dirty() {
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
    generateCode(codeType, onSuccessCallback) {
      codeType ||= this.uiOptionsStore.codeEditorType
      const sourceMediaType = MediaType.JSON
      let targetMediaType = this.mediaTypes[codeType]
      if (this.isObjectEmpty && this.emptyMediaTypeTemplates) {
        const emptyTemplate = this.emptyMediaTypeTemplates[targetMediaType]
        if (emptyTemplate) {
          let emptyCode = typeof emptyTemplate === 'function' ? emptyTemplate() : emptyTemplate
          this.code = emptyCode
          this.originalCode = emptyCode
          this.dirty = false

          this.uiOptionsStore.codeEditorType = codeType
          if (onSuccessCallback) {
            onSuccessCallback()
          }
          return
        }
      }
      const ruleShowAll = targetMediaType === 'application/yaml+rule' && this.isShowAll
      targetMediaType = targetMediaType.split('+')[0] // remove the +thing, +item or +rule suffix, if present
      const params = new URLSearchParams()
      if (ruleShowAll) {
        params.set('ruleSerializationOption', 'INCLUDE_ALL')
      }
      const payload = {}
      payload[this.objectType] = [this.object]
      this.$oh.api
        .postPlain(
          `/rest/file-format/create${params.size ? '?' : ''}${params.toString()}`,
          JSON.stringify(payload),
          null,
          sourceMediaType,
          { accept: targetMediaType }
        )
        .then((code) => {
          // DSL returns different line endings on different platforms and CodeMirror normalizes everything to \n, leading to dirty flag set on load for Windows,
          // therefore normalize before loading in editor.
          this.code = code.replaceAll('\r\n', '\n').replaceAll('\r', '\n')
          this.originalCode = this.code
          this.dirty = false
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
     * The resulting object is emitted in a `parsed` event.
     *
     * @param {function} onSuccessCallback - Optional. A callback function to call when the code has been parsed
     * @param {function} onFailureCallback - Optional. A callback function to call when parsing fails or no object is found
     * @param {Object} params - Optional. Additional parameters for the parsing request
     * @returns A Promise
     */
    parseCode(onSuccessCallback, onFailureCallback, params = {}) {
      let sourceMediaType = this.mediaTypes[this.uiOptionsStore.codeEditorType]
      sourceMediaType = sourceMediaType.split('+')[0] // remove the +thing, +item or +rule suffix, if present
      const targetMediaType = MediaType.JSON
      return this.$oh.api
        .request({
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
            this.$emit('parsed', object[0], params)
            if (onSuccessCallback) {
              onSuccessCallback()
            }
            return Promise.resolve()
          } else {
            if (onFailureCallback) {
              onFailureCallback()
            }
            f7.dialog.alert(`Error parsing ${this.uiOptionsStore.codeEditorType}: no ${this.objectType} found`).open()
            return Promise.reject()
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
              showToast('YAML syntax error. Please check your code.')
            } else {
              // clean up the error message and turn it into an array to be displayed as a list
              errors = errors
                .replace(/^.*? to Yaml\w+DTO: /s, '')
                .split('\n')
                .map((line) => {
                  return line.replace(/^invalid thing.* (?=channel id)/, '').replace(/\s*\(class org\.openhab\.core.*?\)/, '')
                })
                .slice(0, 8) // limit to 8 lines
            }
            if (errors && errors.length > 0) {
              this.errors = errors
              f7.popup.open(this.$refs.errors.$el)
            }
          } else {
            f7.dialog.alert(`Error parsing ${this.uiOptionsStore.codeEditorType}: ${err.message || err.status}`).open()
          }
          return Promise.reject()
        })
    },
    onEditorInput(value) {
      this.code = value
      this.dirty = this.code !== this.originalCode
      this.$emit('changed', this.dirty)
    },
    switchCodeType(type) {
      if (this.uiOptionsStore.codeEditorType === type) return

      if (this.readOnly || !this.dirty) {
        this.generateCode(type)
      } else {
        this.parseCode(
          () => {
            if (this.postParseCallback) {
              const result = this.postParseCallback()
              if (result instanceof Promise) {
                result.then(() => {
                  if (!this.mediaTypes[type]) {
                    f7.dialog.alert(`The current object isn't compatible with ${type} format.`).open()
                    return
                  }
                  this.generateCode(type)
                })
              } else {
                if (!this.mediaTypes[type]) {
                  console.warn(`The current object isn't compatible with ${type} format. Aborting switch.`)
                  return
                }
                this.generateCode(type)
              }
            } else {
              this.generateCode(type)
            }
          },
          undefined,
          { editorType: this.uiOptionsStore.codeEditorType, showAll: this.isShowAll }
        )
      }
    },
    switchShowAll(checked) {
      if (this.readOnly || !this.dirty) {
        this.generateCode(this.uiOptionsStore.codeEditorType)
      } else {
        this.parseCode(
          () => {
            if (this.postParseCallback) {
              this.postParseCallback()
            }
            this.generateCode(this.uiOptionsStore.codeEditorType)
          },
          undefined,
          { editorType: this.uiOptionsStore.codeEditorType, showAll: !checked }
        )
      }
    },
    copy() {
      copyToClipboard(this.code, {
        onSuccess: () => {
          showToast('Code copied to clipboard')
        }
      })
    },
    revertChanges() {
      f7.dialog.confirm('Are you sure you want to revert the changes?', () => {
        this.code = this.originalCode
        this.dirty = false
        showToast('Code reverted to original')
      })
    }
  }
}
</script>
