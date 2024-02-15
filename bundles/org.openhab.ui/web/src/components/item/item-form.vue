<template>
  <div v-if="item" class="quick-link-form no-padding">
    <f7-list inline-labels no-hairlines-md>
      <f7-list-group>
        <f7-list-input label="Name" type="text" placeholder="Required" :value="item.name"
                       :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                       required :error-message="nameErrorMessage" :error-message-force="!!nameErrorMessage"
                       @input="onNameInput" :clear-button="createMode" />
        <f7-list-input label="Label" type="text" placeholder="Label" :value="item.label"
                       @input="item.label = $event.target.value" :disabled="!editable" :clear-button="editable" />
      </f7-list-group>
      <f7-list-group v-if="itemType && !hideType">
        <!-- Type -->
        <f7-list-item v-if="itemType && !hideType" title="Type" :disabled="!editable" :key="'type-' + itemType" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
          <select name="select-type" @change="item.type = $event.target.value">
            <option v-for="t in types.ItemTypes" :key="t" :value="t" :selected="t === itemType">
              {{ t }}
            </option>
          </select>
        </f7-list-item>
        <!-- Dimensions -->
        <f7-list-item v-if="dimensions.length && !hideType && itemType === 'Number'" title="Dimension" :disabled="!editable" :key="'dimension-' + itemDimension" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
          <select name="select-dimension" @change="setDimension($event.target.value)">
            <option key="" value="Number" :selected="itemDimension === ''" />
            <option v-for="d in dimensions" :key="d.name" :value="d.name" :selected="d.name === itemDimension">
              {{ d.label }}
            </option>
          </select>
        </f7-list-item>
        <!-- (Internal) Unit & State Description -->
        <!-- Use v-show instead of v-if, because otherwise the autocomplete for category would take over the unit -->
        <f7-list-input v-show="itemDimension && createMode"
                       label="Unit"
                       type="text"
                       info="Used internally, for persistence and external systems. It is independent from the state visualization in the UI, which is defined through the state description."
                       :disabled="!editable"
                       :value="item.unit"
                       @input="item.unit = $event.target.value"
                       :clear-button="editable" />
        <f7-list-input v-show="itemDimension && createMode"
                       label="State Description Pattern"
                       type="text"
                       info="Pattern or transformation applied to the state for display purposes. Only saved if you change the pre-filled default value."
                       :disabled="!editable"
                       :value="item.stateDescriptionPattern"
                       @input="item.stateDescriptionPattern = $event.target.value"
                       :clear-button="editable" />

        <!-- Group Item Form -->
        <group-form v-if="itemType === 'Group'" :item="item" :createMode="createMode" />
      </f7-list-group>
      <f7-list-group v-if="!hideCategory">
        <f7-list-input ref="category" label="Category" autocomplete="off" type="text" placeholder="temperature, firstfloor..." :value="item.category"
                       @input="item.category = $event.target.value" :disabled="!editable" :clear-button="editable">
          <div slot="root-end" style="margin-left: calc(35% + 14px)">
            <oh-icon :icon="item.category" :state="(createMode) ? null : item.state" height="32" width="32" />
          </div>
        </f7-list-input>
      </f7-list-group>
    </f7-list>
    <semantics-picker v-if="!hideSemantics" :item="item" :same-class-only="true" :hide-type="true" :hide-none="forceSemantics" :createMode="createMode" :key="'semantics-' + item.tags.toString()" />
    <f7-list inline-labels no-hairline-md>
      <tag-input title="Non-Semantic Tags" :disabled="!editable" :item="item" />
    </f7-list>
    <f7-list inline-labels no-hairline-md>
      <f7-list-item title="Parent Groups" :badge="numberOfGroups" />
      <!-- make it cosmetically similar to the non-semantic tags above -->
      <f7-list-item v-if="numberOfGroups > 0">
        <div slot="inner">
          <f7-chip v-for="group in item.groupNames" :key="group" :text="group" :deleteable="editable" @delete="deleteGroup" media-bg-color="blue" style="margin-right: 6px">
            <f7-icon slot="media" ios="f7:folder_fill" md="material:folder" aurora="f7:folder_fill" />
          </f7-chip>
        </div>
      </f7-list-item>
      <item-picker v-if="editable" title="Select" :value="item.groupNames" :items="items" @input="(value) => this.item.groupNames = value" :multiple="true" filterType="Group" :set-value-text="false" />
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
import ItemPicker from '@/components/config/controls/item-picker.vue'
import GroupForm from '@/components/item/group-form.vue'
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
    ItemPicker,
    GroupForm,
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
    editable () {
      return this.createMode || (this.item && this.item.editable)
    },
    numberOfGroups () {
      return this.item.groupNames?.length.toString() || '0'
    },
    itemType () {
      return this.item.type.split(':')[0]
    },
    itemDimension () {
      const parts = this.item.type.split(':')
      return parts.length > 1 ? parts[1] : ''
    }
  },
  watch: {
    // Required for pre-filling unit and state description pattern fields in "Add Items from Thing" functionality
    dimensions () {
      if (this.createMode && this.item.type && this.item.type.startsWith('Number:')) {
        this.setDimension(this.item.type.split(':')[1])
      }
    }
  },
  methods: {
    setDimension (newDimension) {
      if (!newDimension) {
        this.$set(this.item, 'type', 'Number')
        return
      }
      const dimension = this.dimensions.find((d) => d.name === newDimension)
      this.$set(this.item, 'type', 'Number:' + dimension.name)
      this.$set(this.item, 'unit', dimension.systemUnit)
      this.$set(this.item, 'stateDescriptionPattern', `%.0f ${dimension.systemUnit}`)
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
      this.$set(this, 'nameErrorMessage', this.validateItemName(this.item.name))
    },
    deleteGroup (event) {
      const group = event.target.previousSibling.innerText
      const groupIndex = this.item.groupNames.indexOf(group)
      if (groupIndex >= 0) {
        this.item.groupNames.splice(groupIndex, 1)
      }
    }
  },
  mounted () {
    if (!this.item) return
    if (!this.item.category) this.$set(this.item, 'category', '')
    if (!this.item.groupNames) this.$set(this.item, 'groupNames', [])
    if (this.createMode) {
      if (!this.items) this.items = []
      this.$set(this, 'nameErrorMessage', this.validateItemName(this.item.name))
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
