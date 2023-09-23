<template>
  <div v-if="item" class="quick-link-form no-padding">
    <f7-list inline-labels no-hairlines-md>
      <f7-list-input label="Name" type="text" placeholder="Required" :value="item.name"
                     :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                     required :error-message="nameErrorMessage" :error-message-force="!!nameErrorMessage"
                     @input="onNameInput" :clear-button="createMode" />
      <f7-list-input label="Label" type="text" placeholder="Label" :value="item.label"
                     @input="item.label = $event.target.value" clear-button />
      <f7-list-item v-if="item.type && !hideType" title="Type" type="text" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
        <select name="select-type" @change="item.type = $event.target.value">
          <optgroup label="Basic Types">
            <option v-for="type in types.ItemTypes" :key="type" :value="type" :selected="type === item.type">
              {{ type }}
            </option>
          </optgroup>
          <optgroup label="Numbers with Dimensions">
            <option v-for="dimension in types.Dimensions" :key="dimension" :value="'Number:' + dimension" :selected="item.type === 'Number:' + dimension">
              {{ 'Number:' + dimension }}
            </option>
          </optgroup>
        </select>
      </f7-list-item>
      <f7-list-input v-if="!hideCategory" ref="category" label="Category" autocomplete="off" type="text" placeholder="temperature, firstfloor..." :value="item.category"
                     @input="item.category = $event.target.value" clear-button>
        <div slot="root-end" style="margin-left: calc(35% + 8px)">
          <oh-icon :icon="item.category" :state="(createMode) ? null : item.state" height="32" width="32" />
        </div>
      </f7-list-input>
    </f7-list>
    <semantics-picker v-if="!hideSemantics" :item="item" :same-class-only="true" :hide-type="true" :hide-none="forceSemantics" />
    <f7-list inline-labels accordion-list no-hairline-md>
      <f7-list-item accordion-item title="Tags" :after="numberOfTags">
        <f7-accordion-content>
          <tag-input :item="item" />
        </f7-accordion-content>
      </f7-list-item>
    </f7-list>
  </div>
</template>

<style lang="stylus">
.quick-link-form
  .item-inner
    display inherit !important
  .item-title
    font-weight inherit !important
</style>

<script>
import SemanticsPicker from '@/components/tags/semantics-picker.vue'
import TagInput from '@/components/tags/tag-input.vue'
import * as Types from '@/assets/item-types.js'
import { Categories } from '@/assets/categories.js'

export default {
  props: ['item', 'items', 'createMode', 'hideCategory', 'hideType', 'hideSemantics', 'forceSemantics'],
  components: {
    SemanticsPicker,
    TagInput
  },
  data () {
    return {
      types: Types,
      categoryInputId: '',
      categoryAutocomplete: null,
      nameErrorMessage: ''
    }
  },
  computed: {
    numberOfTags () {
      if (!this.item.tags) return 0
      let tagsNonS = this.item.tags
      if (this.item.metadata && this.item.metadata.semantics) {
        tagsNonS = this.item.tags.filter((t) =>
          t !== this.item.metadata.semantics.value.split('_').pop() &&
          t !== ((this.item.metadata.semantics.config && this.item.metadata.semantics.config.relatesTo) ? this.item.metadata.semantics.config.relatesTo.split('_').pop() : '')
        )
      }
      return tagsNonS.length
    }
  },
  methods: {
    initializeAutocomplete (inputElement) {
      this.categoryAutocomplete = this.$f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        source (query, render) {
          if (!query || !query.length) {
            render([])
          } else {
            render(Categories.filter((c) => c.toLowerCase().indexOf(query.toLowerCase()) >= 0))
          }
        }
      })
    },
    onNameInput (event) {
      this.item.name = event.target.value
      this.validateName(this.item.name)
    },
    validateName (name) {
      let oldError = this.nameErrorMessage
      if (!/^[A-Za-z0-9_]+$/.test(name)) {
        this.nameErrorMessage = 'Required. A-Z,a-z,0-9,_ only'
      } else if (this.items.some(item => item.name === name)) {
        this.nameErrorMessage = 'An Item with this name already exists'
      } else {
        this.nameErrorMessage = ''
      }
      if (oldError !== this.nameErrorMessage) this.$emit('valid', !this.nameErrorMessage)
    }
  },
  mounted () {
    if (!this.item) return
    if (!this.item.category) this.$set(this.item, 'category', '')
    if (this.createMode) {
      if (!this.items) this.items = []
      this.validateName(this.item.name)
    }
    const categoryControl = this.$refs.category
    if (!categoryControl || !categoryControl.$el) return
    const inputElement = this.$$(categoryControl.$el).find('input')
    this.initializeAutocomplete(inputElement)
  },
  beforeDestroy () {
    if (this.categoryAutocomplete) {
      this.$f7.autocomplete.destroy(this.categoryAutocomplete)
    }
  }
}
</script>
