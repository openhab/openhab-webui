<template>
  <div class="item-picker-container">
    <f7-list-item :title="label || 'Item'"
                  :after="displayValue"
                  link
                  :disabled="disabled ? true : null"
                  :textColor="textColor"
                  class="item-picker"
                  :no-chevron="false"
                  @click="openPopup">
      <template #media>
        <f7-button v-if="!noModelPicker"
                   :icon-color="color"
                   :icon-aurora="aurora"
                   :icon-ios="ios"
                   :icon-md="md"
                   :tooltip="$t('dialogs.itemPicker.tooltip.pickFromModel')"
                   @click="pickFromModel" />
        <f7-icon v-else-if="!hideIcon"
                 :color="color"
                 :aurora="aurora"
                 :ios="ios"
                 :md="md" />
      </template>
    </f7-list-item>

    <f7-popup v-model:opened="popupOpen">
      <f7-page>
        <f7-navbar :title="label || $t('dialogs.itemPicker.popup.title')">
          <f7-nav-right>
            <f7-link @click="popupOpen = false">
              Close
            </f7-link>
          </f7-nav-right>
        </f7-navbar>

        <f7-searchbar
          search-container=".item-list"
          search-in=".item-inner"
          :placeholder="$t('dialogs.search.items')">
          <template #inner-start>
            <f7-button v-if="filterToggle"
                       :icon-f7="filtered ? 'funnel_fill' : 'funnel'"
                       icon-size="24px"
                       :icon-color="color"
                       :tooltip="filtered ? this.$t('dialogs.search.items.tooltip.filtered') : this.$t('dialogs.search.items.tooltip.unfiltered')"
                       @click="toggleFilter" />
          </template>
        </f7-searchbar>

        <f7-list v-if="multiple" class="item-list">
          <f7-list-item v-for="item in preparedItems"
                        :key="item.name"
                        checkbox
                        :checked="selectedValue?.includes(item.name)"
                        @change="selectItem(item)">
            {{ item.label ? item.label + ' (' + item.name + ')' : item.name }}
          </f7-list-item>
        </f7-list>
        <f7-list v-else class="item-list">
          <f7-list-item radio
                        :name="radioGroupName"
                        :checked="selectedValue === null"
                        @change="selectItem(null)" />
          <f7-list-item v-for="item in preparedItems"
                        :key="item.name"
                        radio
                        :name="radioGroupName"
                        :checked="selectedValue === item.name"
                        @change="selectItem(item)">
            {{ item.label ? item.label + ' (' + item.name + ')' : item.name }}
          </f7-list-item>
        </f7-list>
      </f7-page>
    </f7-popup>
  </div>
</template>

<style lang="stylus">
.item-picker-container
  .item-content
    padding-left calc(var(--f7-list-item-padding-horizontal)/2 + var(--f7-safe-area-left))
  .item-media
    padding 0
  .item-inner:after
    display none
</style>

<script>
import { f7 } from 'framework7-vue'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

export default {
  props: {
    label: String,
    name: String,
    value: [String, Array],
    items: Array,
    multiple: Boolean,
    filterType: [String, Array],
    filterGroupType: [String, Array],
    filterTag: [String, Array],
    required: Boolean,
    editableOnly: Boolean,
    disabled: Boolean,
    setValueText: {
      type: Boolean,
      default: true
    },
    noModelPicker: Boolean,
    filterToggle: Boolean,
    iconColor: String,
    auroraIcon: String,
    iosIcon: String,
    mdIcon: String,
    textColor: String,
    hideIcon: Boolean
  },
  emits: ['input', 'item-selected'],
  data () {
    return {
      popupOpen: false,
      preparedItems: [],
      unfilteredItems: [],
      filteredItems: [],
      aurora: !this.hideIcon ? (this.auroraIcon || 'f7:list_bullet_indent') : undefined,
      ios: !this.hideIcon ? (this.iosIcon || 'f7:list_bullet_indent') : undefined,
      md: !this.hideIcon ? (this.mdIcon || 'f7:list_bullet_indent') : undefined,
      color: this.iconColor || undefined,
      filtered: true,
      radioGroupName: `item-picker-${Math.random().toString(36).slice(2, 11)}`,
      selectedValue: this.multiple ? Array.isArray(this.value) ? [...this.value] : [] : this.value ?? null
    }
  },
  computed: {
    displayValue () {
      if (!this.setValueText) return ''
      if (this.multiple) {
        return Array.isArray(this.value) ? this.value.join(', ') : ''
      } else {
        const v = this.value
        const item = this.unfilteredItems.find((i) => i.name === v)
        return item ? item.label || item.name : ''
      }
    }
  },
  watch: {
    value (newVal) {
      this.selectedValue = this.multiple ? Array.isArray(newVal) ? [...newVal] : [] : newVal ?? null
    }
  },
  created () {
    if (this.items && this.items.length) {
      this.sortAndFilterItems(this.items)
    } else {
      const params = new URLSearchParams({
        staticDataOnly: 'true'
      })
      if (this.filterTag?.length) {
        params.set('tags', Array.isArray(this.filterTag) ? this.filterTag.join(',') : this.filterTag)
      }
      this.$oh.api.get(`/rest/items?${params}`).then((items) => {
        this.sortAndFilterItems(items)
      })
    }
  },
  methods: {
    sortAndFilterItems (items) {
      this.unfilteredItems = items
      if (this.filterToggle) {
        this.unfilteredItems.sort((a, b) => {
          const labelA = a.label || a.name
          const labelB = b.label || b.name
          return labelA.localeCompare(labelB)
        })
      }
      this.filteredItems = this.unfilteredItems
      if (this.editableOnly) {
        this.filteredItems = this.filteredItems.filter((i) => i.editable)
      }
      if (this.filterGroupType?.length) {
        if (Array.isArray(this.filterGroupType)) {
          this.filteredItems = this.filterGroupItems(this.filteredItems, this.filterGroupType)
        } else {
          this.filteredItems = this.filterGroupItems(this.filteredItems, [this.filterGroupType])
        }
      } else if (this.filterType?.length) {
        if (Array.isArray(this.filterType)) {
          this.filteredItems = this.filterItems(this.filteredItems, this.filterType)
        } else {
          this.filteredItems = this.filterItems(this.filteredItems, [this.filterType])
        }
      }
      this.filteredItems.sort((a, b) => {
        const labelA = a.label || a.name
        const labelB = b.label || b.name
        return labelA.localeCompare(labelB)
      })
      this.preparedItems = this.filteredItems
    },
    filterGroupItems (items, filterGroupType) {
      let tempItems = []
      filterGroupType.forEach((f) => {
        tempItems.push(...items.filter((i) => {
          if (i.type !== 'Group') return false
          if (f === i.groupType) return true
          if (f.split(':', 1)[0] === i.groupType) return true
          if (!f.includes(':') && f === i.groupType?.split(':', 1)[0]) return true
          return false
        }))
      })
      return tempItems
    },
    filterItems (items, filterType) {
      let tempItems = []
      filterType.forEach((f) => {
        tempItems.push(...items.filter((i) => {
          if (f === i.type) return true
          if (f.split(':', 1)[0] === i.type) return true
          if (!f.includes(':') && f === i.type.split(':', 1)[0]) return true
          if (i.type === 'Group') {
            if (f === i.groupType) return true
            if (f.split(':', 1)[0] === i.groupType) return true
            if (!f.includes(':') && f === i.groupType?.split(':', 1)[0]) return true
          }
          return false
        }))
      })
      return tempItems
    },
    toggleFilter () {
      this.filtered = !this.filtered
      this.preparedItems = this.filtered ? this.filteredItems : this.unfilteredItems
    },
    openPopup () {
      this.popupOpen = true
    },
    selectItem (item) {
      if (this.multiple) {
        const idx = this.selectedValue.indexOf(item.name)
        if (idx >= 0) this.selectedValue.splice(idx, 1)
        else this.selectedValue.push(item.name)
        this.$emit('input', this.selectedValue)
      } else {
        this.selectedValue = item ? item.name : null
        this.$emit('input', this.selectedValue)
        this.$emit('item-selected', item)
        this.popupOpen = false
      }
    },
    updateFromModelPicker (value) {
      if (this.multiple) {
        this.$emit('input', value.map((i) => i.name))
      } else {
        this.$emit('input', value.name)
        this.$emit('item-selected', value)
      }
    },
    pickFromModel (evt) {
      evt.cancelBubble = true
      const popup = {
        component: ModelPickerPopup
      }

      f7.views.main.router.navigate({
        url: 'pick-from-model',
        route: {
          path: 'pick-from-model',
          popup
        }
      }, {
        props: {
          value: this.value,
          multiple: this.multiple,
          allowEmpty: true,
          popupTitle: this.label,
          groupsOnly: this.filterType && this.filterType === 'Group',
          editableOnly: this.editableOnly
        }
      })

      f7.once('itemsPicked', this.updateFromModelPicker)
      f7.once('modelPickerClosed', () => {
        f7.off('itemsPicked', this.updateFromModelPicker)
      })
    }
  }
}
</script>
