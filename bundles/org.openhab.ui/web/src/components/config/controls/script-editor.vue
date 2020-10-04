<template>
  <codemirror :value="value" @input="onCmCodeChange" ref="cm" class="code-editor-fit" :options="cmOptions" @ready="onCmReady"></codemirror>
</template>

<style lang="stylus">
.code-editor-fit
  position absolute
  left 0
  top var(--f7-navbar-height)
  height calc(100% - var(--f7-navbar-height))
  width 100%
  display flex
  background white
  align-items center
  justify-content center
  .CodeMirror
    height 100%
    width 100%

    .CodeMirror-line
      line-height 1.3

    .cm-lkcampbell-indent-guides:not(.CodeMirror-lint-mark-error)
      margin-top -5px
      background-repeat repeat-y
      background-image url("data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='1px' height='2px'><rect width='1' height='1' style='fill:%2377777777' /></svg>")
      position relative

.CodeMirror-hints
  z-index 999999
.CodeMirror-Tern-tooltip
  z-index 999998
  opacity 1 !important
  position absolute
.CodeMirror-lint-tooltip
  z-index 999998
  opacity 1 !important
  position absolute
</style>

<script>
// require component
import { codemirror } from 'vue-codemirror'
import _CodeMirror from 'codemirror'
// require styles
import 'codemirror/lib/codemirror.css'

// language js
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'

// theme css
import 'codemirror/theme/gruvbox-dark.css'

import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'

// for autocomplete
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/tern/tern.js'
import 'codemirror/addon/tern/tern.css'

// for folding
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'

// for linting
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/lint.css'
import YAML from 'yaml'

import tern from 'tern'

// import 'tern/lib/signal.js'
// import * as Tern from 'tern/lib/tern.js'
// import 'tern/lib/def.js'
// import 'tern/lib/comment.js'
// import 'tern/lib/infer.js'
// import 'tern/plugin/doc_comment.js'

import EcmascriptDefs from 'tern/defs/ecmascript.json'
import OpenhabDefs from '@/assets/openhab-tern-defs.json'

import componentsHint from '../editor/hint-components'
import rulesHint from '../editor/hint-rules'
import thingsHint from '../editor/hint-things'

// Adapted from https://github.com/lkcampbell/brackets-indent-guides (MIT)
var indentGuidesOverlay = {
  token: function (stream, state) {
    var char = '',
      colNum = 0,
      spaceUnits = 0,
      isTabStart = false

    char = stream.next()
    colNum = stream.column()

    if (colNum === 0) {
      return null
    }

    if (char === '\t') {
      return 'lkcampbell-indent-guides'
    }

    if (char !== ' ') {
      stream.skipToEnd()
      return null
    }

    spaceUnits = 2
    isTabStart = !(colNum % spaceUnits)

    if ((char === ' ') && (isTabStart)) {
      return 'lkcampbell-indent-guides'
    } else {
      return null
    }
  },
  flattenSpans: false
}

export default {
  components: {
    codemirror
  },
  props: ['value', 'mode', 'hintContext'],
  data () {
    return {
      code: this.value,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: ((this.mode && this.mode.indexOf('yaml')) ? 'text/x-yaml' : this.mode) || 'text/javascript',
        theme: (this.$f7.data.themeOptions.dark === 'dark') ? 'gruvbox-dark' : 'default',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        viewportMargin: Infinity,
        foldGutter: true,
        lint: false,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers']
      }
    }
  },
  beforeDestroy () {
    if (this.codemirror && this.codemirror.closeHint) {
      this.codemirror.closeHint()
    }
  },
  methods: {
    ternComplete (file, query) {
      // debugger
    },
    onCmReady (cm) {
      const self = this
      let extraKeys = {}
      if (!this.mode) {
        window.tern = tern
        const server = new _CodeMirror.TernServer({
          defs: [EcmascriptDefs, OpenhabDefs],
          ecmaVersion: 5
        })
        extraKeys = {
          'Ctrl-Space': function (cm) { server.complete(cm) },
          'Ctrl-Q': function (cm) { server.showDocs(cm) },
          "'.'": function (cm) {
            setTimeout(function () { server.complete(cm) }, 100)
            return _CodeMirror.Pass // tell CodeMirror we didn't handle the key
          }
        }
        cm.on('cursorActivity', function (cm) {
          server.updateArgHints(cm)
        })
      } else {
        const autocomplete = function (cm) {
          setTimeout(function () { _CodeMirror.commands.autocomplete(cm) }, 250)
          return _CodeMirror.Pass // tell CodeMirror we didn't handle the key
        }
        extraKeys = {
          'Ctrl-Space': 'autocomplete',
          "'.'": autocomplete,
          "'='": autocomplete,
          'Space': autocomplete
        }
        cm.state.$oh = this.$oh
        cm.state.originalMode = this.mode
        if (this.hintContext) cm.state.hintContext = Object.assign({}, this.hintContext)
        cm.setOption('hintOptions', {
          closeOnUnfocus: false,
          completeSingle: false,
          hint (cm, option) {
            if (self.mode.indexOf('application/vnd.openhab.uicomponent') === 0) {
              return componentsHint(cm, option, self.mode)
            } else if (self.mode === 'application/vnd.openhab.rule') {
              return rulesHint(cm, option, self.mode)
            } else if (self.mode === 'application/vnd.openhab.thing+yaml') {
              return thingsHint(cm, option, self.mode)
            }
          }
        })

        _CodeMirror.registerHelper('lint', 'yaml', function (text) {
          const found = []
          const parsed = YAML.parseDocument(text)
          if (parsed.errors.length > 0) {
            parsed.errors.forEach((e) => {
              const message = e.message
              e.makePretty()
              found.push({
                message: message,
                from: (e.linePos.end) ? { line: e.linePos.start.line - 1, ch: e.linePos.start.col - 1 } : undefined,
                to: (e.linePos.end) ? { line: e.linePos.end.line - 1, ch: e.linePos.end.col - 1 } : undefined
              })
            })
          }

          return found
        })

        this.cmOptions.gutters.push('CodeMirror-lint-markers')
        this.cmOptions.lint = true
      }
      extraKeys.Tab = function (cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection('add')
        } else {
          cm.replaceSelection(cm.getOption('indentWithTabs') ? '\t'
            : Array(cm.getOption('indentUnit') + 1).join(' '), 'end', '+input')
        }
      }
      extraKeys['Shift-Tab'] = 'indentLess'
      cm.setOption('extraKeys', extraKeys)
      cm.addOverlay(indentGuidesOverlay)
      cm.refresh()
    },
    onCmCodeChange (newCode) {
      this.$emit('input', newCode)
    }
  },
  computed: {
    codemirror () {
      return this.$refs.cm.codemirror
    }
  },
  mounted () {
    // console.log('codemirror ready: ', this.codemirror)
  }
}
</script>
