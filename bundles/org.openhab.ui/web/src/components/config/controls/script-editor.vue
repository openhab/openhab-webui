<template>
  <codemirror :value="value" @input="onCmCodeChange" ref="cm" class="code-editor-fit" :options="cmOptions" @ready="onCmReady" />
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
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/groovy/groovy.js'
import 'codemirror/mode/jinja2/jinja2.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/properties/properties.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/ruby/ruby.js'
import 'codemirror/mode/shell/shell.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/yaml/yaml.js'

// theme css
import 'codemirror/theme/gruvbox-dark.css'

import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'

// for autocomplete
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/anyword-hint.js'
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
import infer from 'tern/lib/infer'

// import 'tern/lib/signal.js'
// import * as Tern from 'tern/lib/tern.js'
// import 'tern/lib/def.js'
// import 'tern/lib/comment.js'
// import 'tern/lib/infer.js'
// import 'tern/plugin/doc_comment.js'

import EcmascriptDefs from 'tern/defs/ecmascript.json'
import NashornDefs from '@/assets/nashorn-tern-defs.json'
import OpenhabJsDefs from '@/assets/openhab-js-tern-defs.json'

import componentsHint from '../editor/hint-components'
import rulesHint from '../editor/hint-rules'
import thingsHint from '../editor/hint-things'
import pythonHint from '../editor/hint-python'

// Adapted from https://github.com/lkcampbell/brackets-indent-guides (MIT)
let indentGuidesOverlay = {
  token: function (stream, state) {
    let char = '',
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
  props: ['value', 'mode', 'hintContext', 'ternAutocompletionHook', 'readOnly'],
  data () {
    return {
      code: this.value,
      itemsCache: [],
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: this.translateMode(this.mode),
        theme: (this.$f7.data.themeOptions.dark === 'dark') ? 'gruvbox-dark' : 'default',
        lineNumbers: true,
        line: true,
        readOnly: this.readOnly,
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
    translateMode (mode) {
      // Translations required for some special modes used in MainUI
      // See https://codemirror.net/5/mode/index.html for supported language names & MIME types
      if (!mode) return mode
      if (mode.indexOf('yaml') >= 0) return 'text/x-yaml'
      if (mode.indexOf('jinja') >= 0) return 'text/jinja2'
      if (mode.indexOf('application/javascript') === 0 || mode === 'js') return 'text/javascript'
      if (mode === 'application/vnd.openhab.dsl.rule') return 'text/x-java'
      if (mode === 'py') return 'text/x-python'
      if (mode === 'rb') return 'text/x-ruby'
      return mode
    },
    ternComplete (file, query) {
      let pos = tern.resolvePos(file, query.end)
      let lit = infer.findExpressionAround(file.ast, null, pos, file.scope, 'Literal')
      if (!lit || !lit.node) return
      let call = infer.findExpressionAround(file.ast, null, lit.node.start - 2, file.scope)
      if (!call || !call.node) return
      if (call.node.type !== 'MemberExpression' || (!call.node.object && !call.node.property)) return
      if ((call.node.object.name === 'events' && call.node.property.name === 'postUpdate') ||
      (call.node.object.name === 'events' && call.node.property.name === 'sendCommand') ||
      (call.node.object.name === 'itemRegistry' && call.node.property.name === 'getItem') ||
      (call.node.object.name === 'ir' && call.node.property.name === 'getItem') ||
      (call.node.object.name === 'items' && call.node.property.name === 'getItem')) {
        console.debug('Completing item names!')

        let before = lit.node.value.slice(0, pos - lit.node.start - 1)
        let matches = []
        this.itemsCache.sort((a, b) => a.name.localeCompare(b.name)).forEach((item) => {
          if (item.name.length > before.length && item.name.toLowerCase().indexOf(before.toLowerCase()) >= 0) {
            if (query.types || query.docs || query.urls || query.origins) {
              let rec = {
                name: JSON.stringify(item.name),
                displayName: item.name,
                doc: (item.label ? item.label + ' ' : '') + '[' + item.type + ']'
              }
              matches.push(rec)
              if (query.types) rec.type = 'string'
              if (query.origins) rec.origin = item.name
            }
          }
        })

        return {
          start: tern.outputPos(query, file, lit.node.start),
          end: tern.outputPos(query, file, pos + (file.text.charAt(pos) === file.text.charAt(lit.node.start) ? 1 : 0)),
          isProperty: false,
          completions: matches
        }
      }
    },
    onCmReady (cm) {
      const self = this
      let extraKeys = {}
      if (this.mode.indexOf('application/javascript') === 0) {
        window.tern = tern
        if (this.ternAutocompletionHook) {
          tern.registerPlugin('openhab-tern-hook', (server, options) => {
            server.mod.completeStrings = {
              maxLen: (options && options.maxLength) || 15,
              seen: Object.create(null)
            }
            server.on('completion', this.ternComplete)
          })
          this.$oh.api.get('/rest/items').then((data) => { this.$set(this, 'itemsCache', data) })
        }
        const server = new _CodeMirror.TernServer({
          defs: (this.mode.indexOf('version=ECMAScript-5.1') > 0) ? [EcmascriptDefs, NashornDefs] : [EcmascriptDefs, OpenhabJsDefs],
          plugins: (this.ternAutocompletionHook) ? { 'openhab-tern-hook': {} } : undefined,
          ecmaVersion: (this.mode.indexOf('version=ECMAScript-5.1') > 0) ? 5 : 6
        })
        extraKeys = {
          'Ctrl-Space': function (cm) { server.complete(cm) },
          'Ctrl-Q': function (cm) { server.showDocs(cm) },
          '\'.\'': function (cm) {
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
          '\'.\'': autocomplete,
          '\'=\'': autocomplete,
          'Space': autocomplete,
          '\'@\'': autocomplete
        }
        cm.state.$oh = this.$oh
        cm.state.originalMode = this.mode
        if (this.hintContext) cm.state.hintContext = Object.assign({}, this.hintContext)
        cm.setOption('hintOptions', {
          closeOnUnfocus: false,
          completeSingle: self.mode && self.mode.indexOf('yaml') > 0,
          hint (cm, option) {
            if (self.mode.indexOf('application/vnd.openhab.uicomponent') === 0) {
              return componentsHint(cm, option, self.mode)
            } else if (self.mode === 'application/vnd.openhab.rule+yaml') {
              return rulesHint(cm, option, self.mode)
            } else if (self.mode === 'application/vnd.openhab.thing+yaml') {
              return thingsHint(cm, option, self.mode)
            } else if (self.mode === 'application/python') {
              return pythonHint(cm, option, self.mode)
            } else {
              return _CodeMirror.hint.anyword(cm, option, self.mode)
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
  }
}
</script>
