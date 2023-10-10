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
          <option v-for="t in types.ItemTypes" :key="t" :value="t" :selected="t === item.type.split(':')[0]">
            {{ t }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item v-if="dimensions.length && item.type && !hideType && item.type.startsWith('Number')" title="Dimension" type="text" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
        <select name="select-dimension" @change="setDimension($event.target.value)">
          <option key="Number" value="Number" :selected="item.type === 'Number'" />
          <option v-for="(d, i) in dimensions" :key="d.name" :value="i" :selected="'Number:' + d.name === item.type">
            {{ d.label }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-input v-if="!hideType && item.type && item.type.startsWith('Number:') && createMode" label="Unit" type="text" :value="item.unit"
                     info="All processed values are internally normalized to the specified unit. The normalized value is used to propagate the value to external integrations (e.g. persistence, REST API, WebSocket) so these values will always have the specified unit and scale."
                     @input="item.unit = $event.target.value" clear-button />
      <f7-list-input v-if="!hideCategory" ref="category" label="Category" autocomplete="off" type="text" placeholder="temperature, firstfloor..." :value="item.category"
                     @input="item.category = $event.target.value" clear-button>
        <div slot="root-end" style="margin-left: calc(35% + 8px)">
          <oh-icon :icon="item.category" :state="(createMode) ? null : item.state" height="32" width="32" />
        </div>
      </f7-list-input>
    </f7-list>
    <semantics-picker v-if="!hideSemantics" :item="item" :same-class-only="true" :hide-type="true" :hide-none="forceSemantics" />
    <f7-list inline-labels accordion-list no-hairline-md>
      <f7-list-item accordion-item title="Non-Semantic Tags" :after="numberOfTags">
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
import * as types from '@/assets/item-types.js'
import { Categories } from '@/assets/categories.js'

import ItemMixin from '@/components/item/item-mixin'
import uomMixin from '@/components/item/uom-mixin'

export default {
  mixins: [ItemMixin, uomMixin],
  props: ['item', 'items', 'createMode', 'hideCategory', 'hideType', 'hideSemantics', 'forceSemantics'],
  components: {
    SemanticsPicker,
    TagInput
  },
  data () {
    return {
      types,
      categoryInputId: '',
      categoryAutocomplete: null,
      nameErrorMessage: ''
    }
  },
  computed: {
    numberOfTags () {
      return this.getNonSemanticTags(this.item).length
    }
  },
  methods: {
    setDimension (index) {
      if (index === 'Number') {
        this.$set(this.item, 'type', 'Number')
        return
      }
      const dimension = this.dimensions[index]
      this.$set(this.item, 'type', 'Number:' + dimension.name)
      this.$set(this.item, 'unit', dimension.systemUnit)
    },
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
