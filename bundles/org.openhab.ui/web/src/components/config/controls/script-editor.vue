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
// theme css
import 'codemirror/theme/ambiance.css'

import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'

// for autocomplete
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/tern/tern.js'
import 'codemirror/addon/tern/tern.css'

import tern from 'tern'

// import 'tern/lib/signal.js'
// import * as Tern from 'tern/lib/tern.js'
// import 'tern/lib/def.js'
// import 'tern/lib/comment.js'
// import 'tern/lib/infer.js'
// import 'tern/plugin/doc_comment.js'

import EcmascriptDefs from 'tern/defs/ecmascript.json'
import OpenhabDefs from '@/assets/openhab-tern-defs.json'

export default {
  components: {
    codemirror
  },
  props: ['value'],
  data () {
    return {
      code: this.value,
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'text/javascript',
        theme: (this.$f7.data.themeOptions.dark === 'dark') ? 'ambiance' : 'default',
        lineNumbers: true,
        line: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        viewportMargin: Infinity
      }
    }
  },
  methods: {
    ternComplete (file, query) {
      // debugger
    },
    onCmReady (cm) {
      window.tern = tern
      const server = new _CodeMirror.TernServer({
        defs: [EcmascriptDefs, OpenhabDefs],
        ecmaVersion: 5
      })
      cm.setOption('extraKeys', {
        'Ctrl-Space': function (cm) { server.complete(cm) },
        'Ctrl-Q': function (cm) { server.showDocs(cm) },
        "'.'": function (cm) {
          setTimeout(function () { server.complete(cm) }, 100)
          return _CodeMirror.Pass // tell CodeMirror we didn't handle the key
        }
      })
      cm.on('cursorActivity', function (cm) {
        server.updateArgHints(cm)
      })
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
