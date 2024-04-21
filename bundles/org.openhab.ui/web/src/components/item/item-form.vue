<template>
  <div v-if="item" class="quick-link-form no-padding">
    <f7-list inline-labels no-hairlines-md>
      <f7-list-group>
        <f7-list-input label="Name" type="text" placeholder="A unique identifier for the Item." :value="item.name"
                       :disabled="!createMode" :info="(createMode) ? 'Required. Note: cannot be changed after the creation' : ''"
                       required :error-message="nameErrorMessage" :error-message-force="!!nameErrorMessage"
                       @input="item.name = $event.target.value" :clear-button="createMode" />
        <f7-list-input label="Label" type="text" placeholder="Item label for display purposes" :value="item.label"
                       @input="item.label = $event.target.value" :disabled="!editable" :clear-button="editable" />
      </f7-list-group>
      <f7-list-group v-if="!hideType" v-show="itemType">
        <!-- Type -->
        <f7-list-item title="Type" class="aligned-smart-select" :disabled="!editable" :key="'type-' + itemType" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
          <select name="select-type" @change="itemType = $event.target.value">
            <option v-for="t in types.ItemTypes" :key="t" :value="t" :selected="t === itemType">
              {{ t }}
            </option>
          </select>
        </f7-list-item>
        <!-- Dimensions -->
        <f7-list-item v-if="dimensions.length && itemType === 'Number'" title="Dimension" class="aligned-smart-select" :disabled="!editable" :key="'dimension-' + itemDimension" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
          <select name="select-dimension" @change="itemDimension = $event.target.value">
            <option key="" value="" :selected="itemDimension === ''" />
            <option v-for="d in dimensions" :key="d.name" :value="d.name" :selected="d.name === itemDimension">
              {{ d.label }}
            </option>
          </select>
        </f7-list-item>
        <!-- (Internal) Unit & State Description -->
        <!-- Use v-show instead of v-if, because otherwise the autocomplete for unit cannot be initialized -->
        <f7-list-input v-show="itemDimension && dimensionsReady"
                       ref="unit"
                       label="Unit"
                       type="text"
                       :info="(createMode) ? 'Type a valid unit for the dimension or select from the proposed units. Used internally, for persistence and external systems. Is independent from state visualization in the UI, which is defined through the state description pattern.' : ''"
                       :disabled="!editable"
                       :value="itemDimension ? itemUnit : ''"
                       @change="itemUnit = $event.target.value" />
        <f7-list-input v-show="itemDimension"
                       label="State Description Pattern"
                       type="text"
                       :info="(createMode) ? 'Pattern or transformation applied to the state for display purposes. Only saved if you change the pre-filled default value.' : 'Pattern can only be changed from the state description metadata page after Item creation!'"
                       :disabled="!createMode"
                       :value="stateDescriptionPattern"
                       @input="stateDescriptionPattern = $event.target.value"
                       :clear-button="createMode" />

        <!-- Group Item Form -->
        <group-form ref="groupForm" v-if="itemType === 'Group'" :item="item" :createMode="createMode" />
      </f7-list-group>
      <f7-list-group v-if="!hideCategory">
        <f7-list-input ref="category" label="Category" autocomplete="off" type="text" placeholder="temperature, firstfloor..." :value="itemCategory"
                       @input="itemCategory = $event.target.value" :disabled="!editable" :clear-button="editable">
          <div slot="root-end" style="margin-left: calc(35% + 14px)">
            <oh-icon :icon="itemCategory" :state="(createMode) ? null : item.state" height="32" width="32" />
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
  props: ['item', 'items', 'createMode', 'hideCategory', 'hideType', 'hideSemantics', 'forceSemantics', 'unitHint', 'stateDescription'],
  components: {
    SemanticsPicker,
    ItemPicker,
    GroupForm,
    TagInput
  },
  data () {
    return {
      types,
      unitAutocomplete: null,
      categoryAutocomplete: null,
      oldItemType: !this.createMode ? this.item.type.split(':')[0] : '',
      oldItemDimension: (!this.createMode && this.item.type.split(':').length > 1) ? this.item.type.split(':')[1] : '',
      oldItemUnit: !this.createMode ? (this.item.unitSymbol || '') : ''
    }
  },
  watch: {
    dimensionsReady (newValue, oldValue) {
      if (oldValue === false && newValue === true) this.initializeAutocompleteUnit()
    }
  },
  computed: {
    editable () {
      return this.createMode || (this.item && this.item.editable)
    },
    numberOfGroups () {
      return this.item.groupNames?.length.toString() || '0'
    },
    itemType: {
      get () {
        return this.item.type.split(':')[0]
      },
      set (newType) {
        this.$set(this.item, 'type', newType)
      }
    },
    itemDimension: {
      get () {
        const parts = this.item.type.split(':')
        return parts.length > 1 ? parts[1] : ''
      },
      set (newDimension) {
        if (!newDimension) {
          this.$set(this.item, 'type', 'Number')
          return
        }
        const dimension = this.dimensions.find((d) => d.name === newDimension)
        this.$set(this.item, 'type', 'Number:' + dimension.name)
        this.itemUnit = (this.unitHint ? this.unitHint : this.getUnitHint(dimension.name))
      }
    },
    itemUnit: {
      get () {
        return this.unit
      },
      set (newUnit) {
        this.$set(this.item, 'unit', newUnit)
      }
    },
    itemCategory: {
      get () {
        return this.item.category || ''
      },
      set (newCategory) {
        this.$set(this.item, 'category', newCategory)
      }
    },
    nameErrorMessage () {
      return this.validateItemName(this.item.name)
    },
    stateDescriptionPattern: {
      get () {
        if (this.item.stateDescriptionPattern) return this.item.stateDescriptionPattern
        return this.item.metadata?.stateDescription?.config.pattern || this.stateDescription || (this.createMode ? '%.0f %unit%' : '')
      },
      set (newPattern) {
        this.$set(this.item, 'stateDescriptionPattern', newPattern)
      }
    }
  },
  methods: {
    typeChanged () {
      if (this.$refs.groupForm && this.$refs.groupForm.typeChanged()) return true
      if (!this.oldItemType) return false
      return this.oldItemType !== this.itemType
    },
    dimensionChanged () {
      if (this.$refs.groupForm && this.$refs.groupForm.dimensionChanged()) return true
      if (!this.oldItemDimension) return false
      return this.oldItemDimension !== this.dimension
    },
    unitChanged () {
      if (this.$refs.groupForm && this.$refs.groupForm.unitChanged()) return true
      return this.oldItemUnit && this.item.unit && this.oldItemUnit !== this.item.unit
    },
    revertChange () {
      if (this.itemType === 'Group') {
        this.$refs.groupForm.revertChange()
        return
      }
      if (!this.oldItemDimension) {
        this.$set(this.item, 'type', this.oldItemType)
        this.$set(this.item, 'unit', '')
      } else {
        this.$set(this.item, 'type', this.oldItemType + ':' + this.oldItemDimension)
        this.$set(this.item, 'unit', this.oldItemUnit)
      }
    },
    initializeAutocompleteUnit () {
      if (this.hideType) return
      const self = this
      const unitControl = this.$refs.unit
      if (!unitControl || !unitControl.$el) return
      const inputElement = this.$$(unitControl.$el).find('input')
      this.unitAutocomplete = this.$f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        dropdownPlaceholderText: self.itemDimension ? self.getUnitHint(self.itemDimension) : '',
        source (query, render) {
          if (!self.itemDimension) {
            render([])
          }
          // item.unit can be set to unitHint from channel type, make sure it is at beginning of list
          let curatedUnits = self.itemDimension ? self.getUnitList(self.itemDimension) : []
          if (self.item.unit) {
            curatedUnits = [...new Set([self.item.unit].concat(curatedUnits))]
          }
          let allUnits = self.itemDimension ? self.getFullUnitList(self.itemDimension) : []
          if (!query || !query.length) {
          // Render curated list by default
            render(curatedUnits)
          } else {
            let units = curatedUnits.filter(u => u.indexOf(query) >= 0)
            if (units.length) {
              // Show full curated list if in curated list
              render(curatedUnits)
            } else {
              // If no match filter on full list
              render(allUnits.filter(u => u.indexOf(query) >= 0))
            }
          }
        }
      })
    },
    initializeAutocompleteCategory () {
      if (this.hideCategory) return
      const categoryControl = this.$refs.category
      if (!categoryControl || !categoryControl.$el) return
      const inputElement = this.$$(categoryControl.$el).find('input')
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
    this.initializeAutocompleteCategory()
    if (this.dimensionsReady) this.initializeAutocompleteUnit()
    if (this.createMode && this.stateDescription && (this.stateDescription !== this.item.stateDescriptionPattern)) {
      // If there is a state description from the channel type that is different from the default,
      // set it as the item state description
      this.item.stateDescriptionPattern = this.stateDescription
    }
  },
  beforeDestroy () {
    if (this.unitAutocomplete) {
      this.$f7.autocomplete.destroy(this.unitAutocomplete)
      this.unitAutocomplete = null
    }
    if (this.categoryAutocomplete) {
      this.$f7.autocomplete.destroy(this.categoryAutocomplete)
      this.categoryAutocomplete = null
    }
  }
}
</script>
