<template>
  <div class="oh-json" :class="{ 'oh-json--editing': isEditing }">
    <div class="oh-json__frame">
      <div v-if="showToolbar" class="oh-json__toolbar">
        <div class="oh-json__toolbar-main">
          <button
            v-if="!isEditing"
            class="button button-small button-fill oh-json__button oh-json__button--primary"
            :disabled="!config.item"
            @click="enterEditMode">
            Edit
          </button>
          <button
            v-else
            class="button button-small button-fill oh-json__button oh-json__button--primary"
            :disabled="!canUpdate"
            @click="updateValue">
            Update
          </button>

          <button
            v-if="isEditing"
            class="button button-small button-outline oh-json__button oh-json__button--ghost"
            :class="{ 'button-active': formatMode === 'compact' }"
            :disabled="!canToggleFormat"
            @click="toggleFormatting">
            {{ formatMode === 'format' ? 'Format' : 'Compact' }}
          </button>
        </div>

        <div class="oh-json__toolbar-meta">
          <span class="oh-json__badge" :class="parseError ? 'oh-json__badge--error' : 'oh-json__badge--valid'">
            {{ statusLabel }}
          </span>
          <span v-if="dirty" class="oh-json__meta">Modified</span>
          <span v-if="externalUpdatePending" class="oh-json__meta oh-json__meta--warning">Remote update pending</span>
        </div>
      </div>

      <div class="oh-json__editor-shell" :class="{ 'oh-json__editor-shell--error': parseError }" :style="editorShellStyle">
        <editor
          class="oh-json__editor"
          mode="json"
          :value="editorValue"
          :readOnly="!isEditing"
          @input="onEditorInput"
          @save="updateValue" />
      </div>
    </div>

    <div v-if="parseError" class="oh-json__message oh-json__message--error">
      {{ parseError }}
    </div>
    <div v-else-if="externalUpdatePending" class="oh-json__message oh-json__message--warning">
      The item state changed remotely while you were editing.
    </div>
  </div>
</template>

<style lang="stylus">
.oh-json
  width 100%
  display flex
  flex-direction column
  gap 8px

  &__frame
    width 100%
    overflow hidden
    border-radius 10px
    border 1px solid rgba(15, 23, 42, 0.14)
    background linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(241, 245, 249, 0.98) 100%)
    box-shadow inset 0 1px 0 rgba(255, 255, 255, 0.7)

  &__toolbar
    display flex
    align-items center
    justify-content space-between
    gap 12px
    min-height 44px
    padding 8px 12px
    border-bottom 1px solid rgba(15, 23, 42, 0.1)
    background linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(226, 232, 240, 0.55) 100%)
    backdrop-filter blur(6px)
    flex-wrap nowrap

  &__toolbar-main
    display flex
    align-items center
    gap 8px
    flex 0 0 auto

  &__toolbar-meta
    display flex
    align-items center
    justify-content flex-end
    gap 8px
    flex 1 1 auto
    min-width 0
    overflow hidden
    white-space nowrap

  &__button
    min-width auto !important
    width auto !important
    height 30px
    padding 0 12px
    border-radius 8px
    font-size 12px
    font-weight 700
    letter-spacing 0.03em
    text-transform uppercase
    box-shadow none

    &--primary
      background #ea580c
      border-color #ea580c
      color #fff

    &--ghost
      background rgba(255, 255, 255, 0.72)
      border-color rgba(234, 88, 12, 0.55)
      color #c2410c

  &__badge
    display inline-flex
    align-items center
    padding 4px 10px
    border-radius 999px
    font-size 12px
    font-weight 700
    background rgba(20, 184, 166, 0.12)
    border 1px solid rgba(13, 148, 136, 0.14)
    color #0f766e
    flex 0 0 auto

    &--error
      background rgba(220, 38, 38, 0.1)
      border-color rgba(220, 38, 38, 0.18)
      color #b91c1c

  &__meta
    font-size 12px
    color rgba(15, 23, 42, 0.7)
    text-overflow ellipsis
    overflow hidden

    &--warning
      color #b45309

  &__editor-shell
    width 100%
    min-height 220px
    background #f8fafc

    &--error
      box-shadow inset 0 0 0 1px rgba(220, 38, 38, 0.22)

  &__editor
    width 100%
    height 100%

    .code-editor-fit
      background transparent

    :deep(.cm-editor)
      background #f8fafc
      color #0f172a

    :deep(.cm-scroller)
      font-family "Consolas", "SFMono-Regular", "Liberation Mono", monospace
      font-size 14px
      line-height 1.45

    :deep(.cm-gutters)
      background #f1f5f9
      border-right 1px solid rgba(148, 163, 184, 0.22)
      color #64748b

    :deep(.cm-activeLine)
      background rgba(14, 165, 233, 0.08)

    :deep(.cm-activeLineGutter)
      background rgba(14, 165, 233, 0.08)

    :deep(.cm-focused)
      outline none

    :deep(.cm-content)
      caret-color #ea580c

    :deep(.cm-selectionBackground)
      background rgba(234, 88, 12, 0.18) !important

  &__message
    font-size 12px
    line-height 1.4
    padding 0 2px

    &--error
      color #b91c1c

    &--warning
      color #b45309

  .button-active
    background #c2410c
    color #fff
    border-color #c2410c
</style>

<script>
import { f7 } from 'framework7-vue'
import { defineAsyncComponent } from 'vue'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhJsonDefinition } from '@/assets/definitions/widgets/system'

export default {
  props: {
    context: Object
  },
  widget: OhJsonDefinition,
  components: {
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'))
  },
  setup (props) {
    const { config } = useWidgetContext(props.context)
    const statesStore = useStatesStore()
    return { config, statesStore }
  },
  data () {
    return {
      editorValue: '',
      lastSyncedValue: '',
      parseError: null,
      parsedValue: null,
      dirty: false,
      externalUpdatePending: false,
      isEditing: false,
      formatMode: 'format'
    }
  },
  computed: {
    itemState () {
      if (!this.config.item || !this.context?.store?.[this.config.item]) return ''
      return this.context.store[this.config.item].state || ''
    },
    showToolbar () {
      return this.config.showToolbar !== false
    },
    canToggleFormat () {
      return !this.parseError && this.editorValue.trim().length > 0
    },
    canUpdate () {
      return this.isEditing && !this.parseError && this.editorValue.trim().length > 0 && !!this.config.item
    },
    statusLabel () {
      if (!this.editorValue.trim()) return 'Empty'
      if (this.parseError) return 'Invalid JSON'
      if (Array.isArray(this.parsedValue)) return 'Array'
      if (this.parsedValue === null) return 'Null'
      return typeof this.parsedValue === 'object' ? 'Object' : typeof this.parsedValue
    },
    editorShellStyle () {
      return {
        height: this.config.height || '320px'
      }
    }
  },
  watch: {
    itemState: {
      immediate: true,
      handler (value) {
        this.syncFromState(value)
      }
    }
  },
  methods: {
    normalizeJson (value, spacing = 2) {
      if (value === null || value === undefined) return ''
      if (typeof value !== 'string') return JSON.stringify(value, null, spacing)
      if (!value.trim()) return ''

      try {
        return JSON.stringify(JSON.parse(value), null, spacing)
      } catch {
        return value
      }
    },
    syncFromState (value) {
      const spacing = this.formatMode === 'compact' ? 0 : 2
      const normalized = this.normalizeJson(value, spacing)
      const canReplaceEditor = !this.isEditing || !this.dirty || this.editorValue === this.lastSyncedValue
      this.lastSyncedValue = normalized

      if (canReplaceEditor) {
        this.editorValue = normalized
        this.dirty = false
        this.externalUpdatePending = false
        this.validateEditorValue(normalized)
      } else if (normalized !== this.editorValue) {
        this.externalUpdatePending = true
      }
    },
    validateEditorValue (value) {
      if (!value.trim()) {
        this.parsedValue = null
        this.parseError = null
        return
      }

      try {
        this.parsedValue = JSON.parse(value)
        this.parseError = null
      } catch (e) {
        this.parsedValue = null
        this.parseError = e instanceof Error ? e.message : String(e)
      }
    },
    onEditorInput (value) {
      this.editorValue = value
      this.dirty = value !== this.lastSyncedValue
      if (!this.dirty) this.externalUpdatePending = false
      this.validateEditorValue(value)
    },
    enterEditMode () {
      if (!this.config.item || this.config.readOnly === true) return
      this.isEditing = true
    },
    toggleFormatting () {
      if (!this.canToggleFormat) return
      this.formatMode = this.formatMode === 'format' ? 'compact' : 'format'
      const spacing = this.formatMode === 'compact' ? 0 : 2
      this.editorValue = this.normalizeJson(this.editorValue, spacing)
      this.onEditorInput(this.editorValue)
      this.lastSyncedValue = this.normalizeJson(this.itemState, spacing)
      this.dirty = this.editorValue !== this.lastSyncedValue
    },
    async updateValue () {
      if (!this.canUpdate) return

      try {
        console.log('Sending JSON command to item', this.config.item, 'with value', this.parsedValue)
        await this.statesStore.sendCommand(this.config.item, this.editorValue)
        this.lastSyncedValue = this.editorValue
        this.dirty = false
        this.externalUpdatePending = false
        this.isEditing = false

        f7.toast.create({
          text: 'JSON command sent',
          destroyOnClose: true,
          closeTimeout: 1800
        }).open()
      } catch (e) {
        f7.toast.create({
          text: 'Failed to send JSON command: ' + (e instanceof Error ? e.message : String(e)),
          destroyOnClose: true,
          closeTimeout: 2500
        }).open()
      }
    }
  }
}
</script>

