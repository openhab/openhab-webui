<template>
  <codemirror ref="cm" class="code-editor-fit" :model-value="value" :extensions="extensions" @ready="onCmReady" @change="onCmCodeChange" />
</template>

<style lang="stylus">
.code-editor-fit
  position relative
  width 100%
  height 100%
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
    // Display the close button in the search form in upper right corner, not full width
    .cm-panel.cm-search [name=close]
      width unset
</style>

<script setup lang="ts">
import { computed, shallowRef, watch, type ShallowRef } from 'vue'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

// codemirror core
import { Codemirror } from 'vue-codemirror'
import { keymap, tooltips, EditorView, type KeyBinding } from '@codemirror/view'
import { EditorState, EditorSelection, Prec, Compartment, type Extension } from '@codemirror/state'
import { defaultKeymap, historyKeymap, indentMore } from '@codemirror/commands'
import { codeFolding, getIndentUnit } from '@codemirror/language'
import { closeBrackets } from '@codemirror/autocomplete'

import { languageCompartmentExtension } from '../editor/editor-languages'
import type { ExtendedEditorView, HintContext } from '../editor/types'

// other extensions
import { indentationMarkers } from '@replit/codemirror-indentation-markers'
import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark'

const uiOptionsStore = useUIOptionsStore()

const KEYMAP : KeyBinding[] = [
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

const props = defineProps<{
  value: string | undefined
  mode: string
  hintContext?: HintContext
  readOnly?: boolean
}>()

const emit = defineEmits<{
  input: [newCode: string]
  save: []
}>()

const cmView : ShallowRef<ExtendedEditorView | null> = shallowRef(null)

const dynamicCompartment = new Compartment()
const languageCompartment = new Compartment()
const asyncCompartment = new Compartment()

const dynamicExtensions = computed((): Extension[] => {
  const extensions : Extension[] = []

  if (uiOptionsStore.darkMode === 'dark') {
    extensions.push(gruvboxDark)
  }

  extensions.push(EditorState.readOnly.of(props.readOnly))

  return extensions
})

const extensions = [
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
  }),
  dynamicCompartment.of(dynamicExtensions.value),
  languageCompartment.of(languageCompartmentExtension(props.mode || '', !props.readOnly)),
  asyncCompartment.of([])
]

watch(dynamicExtensions, (newExtensions) => {
  if (cmView.value) {
    cmView.value.dispatch({
      effects: dynamicCompartment.reconfigure(newExtensions)
    })
  }
})

watch(() => props.mode, (newMode) => {
  if (!cmView.value || !newMode) return
  const extensions = languageCompartmentExtension(newMode)
  cmView.value.dispatch({
    effects: languageCompartment.reconfigure(extensions)
    })
})

function onCmReady ({ view }: { view: EditorView }) {
  const extendedView = view as ExtendedEditorView
  extendedView.originalMode = props.mode

  if (props.hintContext) extendedView.hintContext = Object.assign({}, props.hintContext)
  cmView.value = extendedView

  loadAsyncCompartmentExtensions(view)
}

function onCmCodeChange (newCode : string) {
  emit('input', newCode)
}

async function loadAsyncCompartmentExtensions (cmView: EditorView) {
  if (uiOptionsStore.codeMirrorSettings.vimMode) {
    const { Vim, vim } = await import('@replit/codemirror-vim').catch(() => {
      console.error('Failed to load Vim mode for CodeMirror')
      return { Vim: null, vim: null }
    })
    if (!Vim || !vim) return

    Vim.defineEx('write', 'w', () => {
      emit('save')
    })

    cmView.dispatch({
      effects: asyncCompartment.reconfigure([Prec.high(vim())])
    })
  }
}
</script>
