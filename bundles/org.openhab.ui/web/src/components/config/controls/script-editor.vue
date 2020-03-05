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

    .cm-lkcampbell-indent-guides
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

import tern from 'tern'

// import 'tern/lib/signal.js'
// import * as Tern from 'tern/lib/tern.js'
// import 'tern/lib/def.js'
// import 'tern/lib/comment.js'
// import 'tern/lib/infer.js'
// import 'tern/plugin/doc_comment.js'

import EcmascriptDefs from 'tern/defs/ecmascript.json'
import OpenhabDefs from '@/assets/openhab-tern-defs.json'

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
  props: ['value', 'mode'],
  data () {
    return {
      code: this.value,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: this.mode || 'text/javascript',
        theme: (this.$f7.data.themeOptions.dark === 'dark') ? 'gruvbox-dark' : 'default',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        viewportMargin: Infinity,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
      }
    }
  },
  methods: {
    ternComplete (file, query) {
      // debugger
    },
    onCmReady (cm) {
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
    console.log('codemirror ready: ', this.codemirror)
  }
}
</script>
