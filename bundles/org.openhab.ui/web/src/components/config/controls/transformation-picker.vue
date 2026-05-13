<template>
  <ul class="transformation-picker-container">
    <f7-list-item
      v-if="ready"
      :title="showPlaceholder ? title || 'Transformation' : undefined"
      smart-select
      :smart-select-params="smartSelectParams"
      ref="smartSelect"
      @smartselect:opened="onSmartSelectOpened"
      @smartselect:closed="onSmartSelectClosed"
      :no-chevron="noChevron"
      :disabled="disabled">
      <select :name="name" @change="select" :required="required">
        <option value="" />
        <option
          v-if="allowInline && showInlineDefinitionOption"
          :value="inlineDefinition"
          :selected="selectedTransformationValue === inlineDefinition ? true : null">
          {{ inlineDefinition }}
        </option>
        <option
          v-for="transformation in transformations"
          :value="transformation.uid"
          :key="transformation.uid"
          :selected="selectedTransformationValue === transformation.uid ? true : null">
          {{ transformation.label ? transformation.label : transformation.uid }}
        </option>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before transformations are loaded -->
    <f7-list-item
      v-show="!ready"
      link
      :title="showPlaceholder ? title : undefined"
      :after="!showPlaceholder ? value : undefined"
      :no-chevron="noChevron" />
  </ul>
</template>

<style lang="stylus">
.transformation-picker-container
  .item-inner:after
    display none
</style>

<script>
import { f7 } from 'framework7-vue'
import { nextTick } from 'vue'

export default {
  props: {
    title: String,
    name: String,
    value: String,
    required: Boolean,
    service: String,
    filterType: Array,
    openOnReady: Boolean,
    disabled: Boolean,
    allowInline: Boolean,
    noChevron: Boolean,
    showPlaceholder: {
      type: Boolean,
      default: true
    }
  },
  emits: ['input'],
  data() {
    return {
      ready: false,
      transformations: [],
      allTransformations: [],
      searchbarInputEl: null,
      onSearchbarKeydownBound: null,
      selectedValueOnOpen: '',
      committedInlineValue: '',
      inlineDefinitionSearchValue: '',
      smartSelectParams: {
        view: f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.allowInline
          ? `${this.$t('dialogs.searchOrCreate.transformation')}`
          : this.$t('dialogs.search.transformation')
      }
    }
  },
  watch: {
    allowInline(value) {
      this.smartSelectParams.searchbarPlaceholder = value
        ? `${this.$t('dialogs.searchOrCreate.transformation')}`
        : this.$t('dialogs.search.transformation')
    },
    service() {
      if (!this.ready) return
      this.transformations = this.filterTransformations(this.allTransformations)
    },
    value(newValue) {
      const nextValue = (newValue || '').trim()
      if (!nextValue) {
        this.committedInlineValue = ''
        return
      }

      const isKnownTransformation = this.transformations.some((t) => t.uid === nextValue)
      this.committedInlineValue = isKnownTransformation ? '' : nextValue
    }
  },
  computed: {
    selectedTransformationValue() {
      return (this.value || this.committedInlineValue || '').trim()
    },
    inlineDefinition() {
      if (!this.allowInline) return ''
      if (this.inlineDefinitionSearchValue) {
        return this.inlineDefinitionSearchValue
      }
      if (this.committedInlineValue) {
        return this.committedInlineValue
      }
      if (this.value && !this.transformations.some((t) => t.uid === this.value)) {
        return this.value
      }
      return ''
    },
    showInlineDefinitionOption() {
      return !!this.inlineDefinition && !this.transformations.some((t) => t.uid === this.inlineDefinition)
    }
  },
  created() {
    this.smartSelectParams.closeOnSelect = true
    this.$oh.api.get('/rest/transformations').then((data) => {
      this.allTransformations = data
      this.transformations = this.filterTransformations(data)
      if (this.filterType && this.transformations.length < 5) {
        this.smartSelectParams.openIn = 'sheet'
        this.smartSelectParams.searchbar = false
      }
      this.ready = true
      if (this.openOnReady) {
        nextTick(() => {
          this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
        })
      }
    })
  },
  beforeUnmount() {
    this.removeSearchbarListener()
  },
  methods: {
    getCurrentSelectValue() {
      const selectEl = this.$refs.smartSelect?.$el?.querySelector?.('select')
      return (selectEl?.value || '').trim()
    },
    commitInlineValue(value) {
      const committedValue = (value || '').trim()
      if (!committedValue) return

      this.committedInlineValue = committedValue
      this.inlineDefinitionSearchValue = committedValue
      this.$emit('input', committedValue)

      const smartSelect = this.$refs.smartSelect?.$el?.children?.[0]?.f7SmartSelect
      if (smartSelect && typeof smartSelect.setValue === 'function') {
        smartSelect.setValue(committedValue)
      }
    },
    filterTransformations(data) {
      return data
        .filter((t) => (this.service ? t.type.toUpperCase() === this.service.toUpperCase() : true))
        .filter((t) => !this.filterType || this.filterType.indexOf(t.type) >= 0)
        .sort((a, b) => {
          const labelA = a.label || a.uid
          const labelB = b.label || b.uid
          return labelA.localeCompare(labelB)
        })
    },
    onSmartSelectOpened() {
      if (!this.allowInline) return
      const smartSelect = this.$refs.smartSelect?.$el?.children?.[0]?.f7SmartSelect
      const containerEl = smartSelect?.$containerEl?.[0]
      if (!containerEl) return
      const inputEl = containerEl.querySelector('.searchbar input[type="search"], .searchbar input')
      if (!inputEl) return

      this.removeSearchbarListener()
      this.searchbarInputEl = inputEl
      this.searchbarInputEl.addEventListener('input', this.onSearchbarInput)
      this.onSearchbarKeydownBound = (event) => this.onSearchbarKeydown(event)
      this.searchbarInputEl.addEventListener('keydown', this.onSearchbarKeydownBound)
      this.searchbarInputEl.setAttribute('placeholder', this.smartSelectParams.searchbarPlaceholder)
      this.selectedValueOnOpen = this.getCurrentSelectValue() || this.selectedTransformationValue
      this.inlineDefinitionSearchValue = inputEl.value || ''
    },
    onSmartSelectClosed() {
      if (!this.allowInline) return
      const typedValue = (this.searchbarInputEl?.value || this.inlineDefinitionSearchValue || '').trim()
      const currentSelectedValue = this.getCurrentSelectValue()
      if (typedValue && currentSelectedValue === this.selectedValueOnOpen) {
        this.commitInlineValue(typedValue)
      }

      this.removeSearchbarListener()
      this.selectedValueOnOpen = ''
      this.inlineDefinitionSearchValue = ''
    },
    removeSearchbarListener() {
      if (!this.searchbarInputEl) return
      this.searchbarInputEl.removeEventListener('input', this.onSearchbarInput)
      if (this.onSearchbarKeydownBound) {
        this.searchbarInputEl.removeEventListener('keydown', this.onSearchbarKeydownBound)
      }
      this.searchbarInputEl = null
      this.onSearchbarKeydownBound = null
    },
    onSearchbarInput(event) {
      if (!this.allowInline) return
      this.inlineDefinitionSearchValue = event.target.value || ''
    },
    onSearchbarKeydown(event) {
      if (!this.allowInline) return
      if (event.key !== 'Enter') return

      const value = (event.target?.value || '').trim()
      if (!value) return

      event.preventDefault()
      this.commitInlineValue(value)

      const smartSelect = this.$refs.smartSelect?.$el?.children?.[0]?.f7SmartSelect
      if (smartSelect && typeof smartSelect.close === 'function') {
        smartSelect.close()
      }
    },
    open() {
      this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
    },
    select(e) {
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      const selectedValue = e.target.value || ''
      const isKnownTransformation = this.transformations.some((t) => t.uid === selectedValue)
      this.committedInlineValue = isKnownTransformation ? '' : selectedValue
      this.$emit('input', selectedValue)
    }
  }
}
</script>
