<template>
  <codemirror
    ref="cm"
    class="code-editor-fit"
    :model-value="value"
    :extensions="extensions"
    @ready="onCmReady"
    @change="onCmCodeChange" />
</template>

<style lang="stylus">
.code-editor-fit
  position relative
  width 100%
  height calc(100vh - var(--f7-navbar-height) - var(--f7-tabbar-height, 48px))
  display flex !important

  .cm-editor
    height 100%
    width 100%

    .cm-completionIcon
      border-radius 50%
      padding 0
      width 16px
      height 16px
      line-height 16px
      background #999
      color #fff
      font-size 12px
      font-weight 700
      opacity 0.95
      margin 1px 6px

    .cm-completionIcon::before
      line-height 16px !important

    .cm-completionIcon-boolean::before
      content "B"
    .cm-completionIcon-number::before
      content "1"
    .cm-completionIcon-string::before
      content "S"
    .cm-completionIcon-object::before
      content "O"
    .cm-completionIcon-object
      background #77c
    .cm-completionIcon-array::before
      content "A"
    .cm-completionIcon-array
      background #c66
    .cm-completionIcon-item::before
      content "I"
    .cm-completionIcon-groupitem::before
      content "G"
    .cm-completionIcon-item,
    .cm-completionIcon-groupitem
      background #3ab
    .cm-completionIcon-unknown::before
      content "?"
    .cm-completionIcon-function
      background #7c7
    .cm-completionIcon-unknown
      background #4bb

    // This affects the buttons in the search form
    .cm-button
      width auto
</style>

<script>
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { mapStores } from 'pinia'

// codemirror core
import { Codemirror } from 'vue-codemirror'
import { keymap, tooltips } from '@codemirror/view'
import { EditorState, EditorSelection } from '@codemirror/state'
import { defaultKeymap, historyKeymap, indentMore } from '@codemirror/commands'
import { StreamLanguage, getIndentUnit, codeFolding } from '@codemirror/language'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'

// for linting
import { linter, lintGutter } from '@codemirror/lint'
import YAML from 'yaml'
import * as eslint from 'eslint-linter-browserify'
import globals from 'globals'

// other extensions
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark'

// languages
import { javascript, esLint } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { groovy } from '@codemirror/legacy-modes/mode/groovy'
import { ruby } from '@codemirror/legacy-modes/mode/ruby'
import { java } from '@codemirror/lang-java'
import { xml } from '@codemirror/lang-xml'
import { yaml } from '@codemirror/lang-yaml'
import { jinja2 } from '@codemirror/legacy-modes/mode/jinja2'
import { properties } from '@codemirror/legacy-modes/mode/properties'
import { shell } from '@codemirror/legacy-modes/mode/shell'

// OH-specific CompletionSources
import javascriptAutocompletions from '../editor/hint-javascript'
import componentsHint from '../editor/hint-components'
import rulesHint from '../editor/hint-rules'
// TODO-V3.1 This will again be changed when the backend YAML support is added
// postpone migration until after?
// import itemsHint from '../editor/hint-items';
// import thingsHint from '../editor/hint-things';

const KEYMAP = [
  {
    // The default indentWithTab will indent the line regardless of the cursor position.
    // This overrides this behavior so when you're at the beginning of the line, it would indent the line
    // but when in the middle or end of line, it inserts spaces
    key: 'Tab',
    run: ({ state, dispatch }) => {
      const { from, to } = state.selection.main
      const line = state.doc.lineAt(from)
      const col = from - line.from
      const beforeCursor = line.text.slice(0, col)

      // If at the beginning of the line (ignoring whitespace), indent the line
      if (/^\s*$/.test(beforeCursor)) {
        return indentMore({ state, dispatch })
      }

      // Otherwise, insert spaces to reach the next multiple of indent size
      const indentLength = getIndentUnit(state)
      const nextTabStop = Math.ceil((col + 1) / indentLength) * indentLength
      const spacesToInsert = nextTabStop - col
      const spaces = ' '.repeat(spacesToInsert)

      dispatch(
        state.update({
          changes: { from, to, insert: spaces },
          selection: EditorSelection.cursor(from + spaces.length),
          scrollIntoView: true
        })
      )
      return true
    }
  }
]

const STANDARD_EXTENSIONS = [
  keymap.of([...defaultKeymap, ...historyKeymap, ...KEYMAP]),
  closeBrackets(),
  codeFolding(),
  indentationMarkers({
    hideFirstIndent: true,
    activeThickness: 2
  }),
  tooltips({
    // This prevents the lint tooltip from going outside the editor and getting clipped
    tooltipSpace: (view) => view.contentDOM.getBoundingClientRect()
  })
]

export default {
  components: {
    Codemirror
  },
  props: {
    value: String,
    mode: String,
    hintContext: Object,
    ternAutocompletionHook: Boolean,
    readOnly: Boolean
  },
  emits: ['input'],
  data () {
    return {
      code: this.value,
      autocompletion: null
    }
  },
  beforeUnmount () {
    if (this.codemirror && this.codemirror.closeHint) {
      this.codemirror.closeHint()
    }
  },
  methods: {
    /**
     * Provides the CodeMirror language for the given mode.
     * Thereby, this method handles the mapping of the mode to the language for scripts, transformations, etc.
     *
     * @param {string} mode
     * @return {StreamLanguage<unknown>|LanguageSupport|null}
     */
    languageExtension (mode) {
      switch (true) {
        case mode.includes('yaml'):
          return yaml()

        case mode === 'dsl':
        case mode === 'application/vnd.openhab.dsl.rule':
          return java()

        case mode === 'js':
        case mode.startsWith('application/javascript'):
          return javascript()

        case mode === 'py':
        case mode === 'py2':
        case mode === 'py3':
        case mode.startsWith('application/x-python'):
          return python()

        case mode === 'rb':
        case mode === 'application/x-ruby':
          return StreamLanguage.define(ruby)

        case mode === 'groovy':
        case mode === 'application/x-groovy':
          return StreamLanguage.define(groovy)

        case mode === 'map':
        case mode === 'scale':
          return StreamLanguage.define(properties)

        case mode === 'exec':
          return StreamLanguage.define(shell)

        case mode === 'jinja':
          return StreamLanguage.define(jinja2)

        case mode === 'xslt':
          return xml()

        default:
          console.log('Unsupported editor mode:', mode)
          return null
      }
    },
    autocompletionExtension (mode) {
      if (!mode) {
        return null
      }

      const activateOnCompletion = () => true

      switch (true) {
        case mode.startsWith('application/vnd.openhab.uicomponent'):
          return autocompletion({ activateOnCompletion, override: [ componentsHint ] })

        case mode === 'application/vnd.openhab.rule+yaml':
          return autocompletion({ activateOnCompletion, override: [ rulesHint ] })

          // TODO-V3.1 Wait for https://github.com/openhab/openhab-webui/pull/3180
          // case mode === 'application/vnd.openhab.thing+yaml':
          //   return autocompletion({ activateOnCompletion, override: [ thingsHint ] })

          // case mode === 'application/vnd.openhab.item+yaml':
          //   return autocompletion({ activateOnCompletion, override: [ itemsHint ] })

        case mode === 'js':
        case mode.startsWith('application/javascript'):
          return javascriptAutocompletions(mode)

        // CodeMirror supports autocompletion for python by default
        default:
          return autocompletion()
      }
    },
    linterExtension (mode) {
      if (this.readOnly) return null
      switch (true) {
        case mode.includes('yaml'):
          return linter((view) => {
            const parsed = YAML.parseDocument(view.state.doc.toString())
            return parsed.errors.map((e) => {
              return {
                from: e.pos[0],
                to: e.pos[1],
                message: e.message,
                severity: e.name === 'YAMLParseError' ? 'error' : 'warning'
              }
            })
          })

        case mode === 'js':
        case mode.startsWith('application/javascript'):
          const config = {
            // eslint configuration
            languageOptions: {
              globals: { ...globals.node },
              parserOptions: { ecmaVersion: 2024, sourceType: 'module' }
            },
            rules: {
              semi: 'off' // allow both with and without semicolons
            }
          }
          return linter(esLint(new eslint.Linter(), config))
      }
    },
    onCmReady (cm) {
      cm.view.$oh = this.$oh
      cm.view.originalMode = this.mode
      if (this.hintContext) cm.view.hintContext = Object.assign({}, this.hintContext)
    },
    onCmCodeChange (newCode) {
      this.$emit('input', newCode)
    }
  },
  computed: {
    extensions () {
      const linter = this.linterExtension(this.mode)

      let autocompletions = this.autocompletionExtension(this.mode)
      autocompletions = Array.isArray(autocompletions) ? autocompletions : [autocompletions]

      const extensions = [
        ...STANDARD_EXTENSIONS,
        EditorState.readOnly.of(this.readOnly),
        this.languageExtension(this.mode),
        ...autocompletions,
        linter,
        linter && lintGutter(),
        useUIOptionsStore().getDarkMode() === 'dark' ? gruvboxDark : null
      ].filter((ext) => ext)

      return extensions
    },
    codemirror () {
      return this.$refs.cm.codemirror
    },
    ...mapStores(useUIOptionsStore)
  }
}
</script>
