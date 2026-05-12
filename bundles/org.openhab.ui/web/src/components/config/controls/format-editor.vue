<template>
  <f7-list-item
    :title="title"
    class="format-editor-item"
    :disabled="!editable"
    @pointerdown="editable && !isFormatEditing && startFormatEditing()"
    @click="editable && !isFormatEditing && startFormatEditing()">
    <template #after>
      <div
        v-show="!editable || !isFormatEditing"
        class="format-editor-collapsed"
        :tabindex="editable && !isFormatEditing ? 0 : -1"
        @focus="editable && startFormatEditing()">
        <div :style="formatCollapsedStyle">{{ formatDisplayValue }}</div>
        <button
          v-if="showCompactClearButton"
          type="button"
          tabindex="-1"
          class="format-editor-clear-button"
          aria-label="Clear format"
          @pointerdown.stop.prevent
          @click.stop.prevent="clearFormat">
          delete_round_ios
        </button>
      </div>
      <div v-show="editable && isFormatEditing" class="format-editor-inline" @click.stop>
        <div class="format-editor-pickers">
          <transformation-service-picker
            :class="['format-inline-picker', { 'format-inline-empty': !formatModel.service }]"
            :tabindex="editable && isFormatEditing ? 0 : -1"
            title="SERVICE"
            :value="formatModel.service"
            :no-chevron="true"
            @input="updateFormatService" />
          <span class="format-editor-token">(</span>
          <transformation-picker
            :class="['format-inline-picker', { 'format-inline-empty': !formatModel.transformation }]"
            :tabindex="editable && formatModel.service && isFormatEditing ? 0 : -1"
            title="transformation"
            :service="formatModel.service"
            :disabled="!formatModel.service"
            :allow-inline="true"
            :no-chevron="true"
            :value="formatModel.transformation"
            @input="updateFormatTransformation" />
          <span class="format-editor-token">):</span>
        </div>
        <div class="format-editor-java-row">
          <java-format-input
            ref="javaFormat"
            class="format-editor-input format-editor-java"
            placeholder="%.1f %unit%"
            :value="formatModel.javaFormat"
            :tabindex="editable && isFormatEditing ? 0 : -1"
            @input="updateFormatJava"
            @validation-message="javaFormatValidationMessage = $event" />
        </div>
        <div v-if="javaFormatValidationMessage" class="format-editor-error">{{ javaFormatValidationMessage }}</div>
      </div>
    </template>
  </f7-list-item>
</template>

<style lang="stylus">
.format-editor-item
  .item-content
    align-items flex-start
    width 100%
  .item-inner
    align-items flex-start
  .item-after
    flex 1 1 0
    min-width 0

.format-editor-inline
  width 100%
  color var(--f7-input-text-color)

.format-editor-collapsed
  display flex
  align-items center
  width 100%

.format-editor-clear-button
  appearance none
  background transparent
  border none
  padding 0
  cursor pointer
  width var(--f7-input-clear-button-size, 14px)
  height var(--f7-input-clear-button-size, 14px)
  margin-left auto
  margin-right 0
  display flex
  align-items center
  justify-content center
  flex-shrink 0
  color rgba(0, 0, 0, 0.45)
  font-family 'framework7-core-icons'
  font-weight 400
  font-style normal
  text-transform none
  -webkit-font-smoothing antialiased
  font-size calc(var(--f7-input-clear-button-size, 14px) / (14 / 10))
  line-height 1.4

.format-editor-pickers
  select
    tabindex -1
  display grid
  grid-template-columns 20% auto minmax(0, 1fr) auto
  gap 5px
  padding-left 0
  align-items baseline
  justify-content start
  min-width 0
  .item-inner
    padding 0 !important
    .item-title
      flex-shrink 0
      width auto
      white-space nowrap
    .item-after
      padding 0

.format-editor-token
  font-weight 600
  white-space nowrap

.format-editor-java-row
  min-width 0

.format-inline-picker
  min-width 0
  width 100%
  margin 0
  padding 0 !important
  .item-content
    min-height 0
    padding-left 0
    .item-inner
      min-height 0
      .item-title
        width auto
        max-width none
      .item-after
        max-width 100%
        min-width 0
        text-align left
        overflow hidden
        text-overflow ellipsis

.format-inline-picker.format-inline-empty
  .item-title,
  .item-after
    color var(--f7-input-placeholder-color, var(--f7-list-item-footer-text-color))

.format-inline-picker:not(.format-inline-empty)
  .item-title
    display none
  .item-after
    color var(--f7-input-text-color)

.format-editor-input
  min-width 0
  width 100%

.format-editor-java
  min-width 0

.format-editor-error
  width 100%
  color var(--f7-input-error-text-color)
  font-size var(--f7-input-info-font-size)
</style>

<script>
import { nextTick } from 'vue'
import JavaFormatInput from '@/components/config/controls/java-format-input.vue'
import TransformationPicker from '@/components/config/controls/transformation-picker.vue'
import TransformationServicePicker from '@/components/config/controls/transformation-service-picker.vue'

export default {
  components: {
    JavaFormatInput,
    TransformationPicker,
    TransformationServicePicker
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    editable: Boolean,
    title: {
      type: String,
      default: 'Format'
    }
  },
  emits: ['input'],
  data() {
    return {
      isFormatEditing: false,
      javaFormatValidationMessage: '',
      formatModel: {
        service: '',
        transformation: '',
        javaFormat: ''
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(nextValue) {
        if (this.isFormatEditing) {
          return
        }
        this.formatModel = this.parseFormatString(nextValue)
      }
    }
  },
  methods: {
    isFormatPickerOverlayOpen() {
      return !!document.querySelector(
        '.smart-select-popup.modal-in, .sheet-modal.modal-in.smart-select-sheet, .popover.modal-in.smart-select-popover'
      )
    },
    parseFormatString(format) {
      const text = (format || '').trim()
      if (!text) {
        return { service: '', transformation: '', javaFormat: '' }
      }

      const openParen = text.indexOf('(')
      const closeParenWithColon = openParen > 0 ? text.indexOf('):', openParen + 1) : -1
      if (openParen > 0 && closeParenWithColon > openParen) {
        const service = text.slice(0, openParen)
        const transformation = text.slice(openParen + 1, closeParenWithColon)
        const javaFormat = text.slice(closeParenWithColon + 2)
        if (/^[A-Za-z0-9_]+$/.test(service)) {
          return { service, transformation, javaFormat }
        }
      }

      return { service: '', transformation: '', javaFormat: text }
    },
    buildFormatString(model) {
      const service = (model.service || '').trim()
      const transformation = (model.transformation || '').trim()
      const javaFormat = model.javaFormat || ''

      if (!service || !transformation) {
        return javaFormat
      }
      return `${service}(${transformation}):${javaFormat || '%s'}`
    },
    startFormatEditing() {
      this.isFormatEditing = true
      this.formatModel = this.parseFormatString(this.value)
      this.javaFormatValidationMessage = ''

      // for this component only, after the DOM has updated/expanded.
      nextTick(() => {
        const firstField = this.$el.querySelector('.format-editor-input, .format-inline-picker')
        if (firstField) {
          firstField.focus()
        }
      })
    },
    stopFormatEditing() {
      this.isFormatEditing = false
      this.formatModel = this.parseFormatString(this.value)
      this.javaFormatValidationMessage = ''
    },
    onFocusOut(event) {
      if (!this.isFormatEditing) {
        return
      }
      // relatedTarget is null when focus is lost due to a DOM mutation (e.g.
      // the collapsed div being removed when startFormatEditing runs). Ignore
      // these synthetic blur events to avoid collapsing mid open-transition.
      const relatedTarget = event.relatedTarget
      if (!relatedTarget) {
        return
      }
      if (this.isFormatPickerOverlayOpen()) {
        return
      }
      if (this.$el.contains(relatedTarget)) {
        return
      }
      this.stopFormatEditing()
    },
    applyFormatModel() {
      this.$emit('input', this.buildFormatString(this.formatModel))
    },
    updateFormatService(value) {
      const nextService = (value || '').trim()
      const previousService = (this.formatModel.service || '').trim()
      this.formatModel.service = nextService
      if (!nextService || nextService !== previousService) {
        this.formatModel.transformation = ''
      }
      this.applyFormatModel()
    },
    updateFormatTransformation(value) {
      this.formatModel.transformation = value || ''
      this.applyFormatModel()
    },
    updateFormatJava(value) {
      this.formatModel.javaFormat = value || ''
      this.applyFormatModel()
    },
    clearFormat() {
      this.javaFormatValidationMessage = ''
      this.formatModel = { service: '', transformation: '', javaFormat: '' }
      this.$emit('input', '')
    },
    onDocumentPointerDown(event) {
      if (!this.isFormatEditing) {
        return
      }
      if (this.isFormatPickerOverlayOpen()) {
        return
      }
      const target = event.target instanceof Element ? event.target : event.target?.parentElement
      if (target?.closest('.format-editor-item')) {
        return
      }
      this.stopFormatEditing()
    }
  },
  computed: {
    showCompactClearButton() {
      return !!this.editable && !this.isFormatEditing && !!(this.value || '').trim()
    },
    formatDisplayValue() {
      const service = (this.formatModel?.service || '').trim()
      const transformation = this.formatModel?.transformation || ''
      const javaFormat = this.formatModel?.javaFormat || ''
      if (service) {
        return `${service}(${transformation}):${javaFormat}`
      }
      return this.value || this.title
    },
    formatCollapsedStyle() {
      const isEmpty = !this.value
      return {
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'left',
        color: isEmpty ? 'var(--f7-input-placeholder-color)' : 'var(--f7-input-text-color)'
      }
    }
  },
  mounted() {
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true)
    this.$el.addEventListener('focusout', this.onFocusOut)
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true)
    this.$el.removeEventListener('focusout', this.onFocusOut)
  }
}
</script>
