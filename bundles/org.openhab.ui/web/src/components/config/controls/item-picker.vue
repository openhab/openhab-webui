<template>
  <div class="item-picker-container">
    <f7-list-item v-if="ready"
                  :title="label || 'Item'"
                  smart-select
                  :smart-select-params="smartSelectParams"
                  :disabled="disabled ? true : null"
                  :textColor="textColor"
                  ref="smartSelect"
                  class="item-picker">
      <select :name="name"
              :multiple="multiple"
              @change="select"
              :required="required">
        <option v-if="!multiple" value="" />
        <option v-for="item in preparedItems"
                :value="item.name"
                :key="item.name"
                :selected="(multiple) ? Array.isArray(value) && value.indexOf(item.name) >= 0 : value === item.name">
          {{ item.label ? item.label + ' (' + item.name + ')' : item.name }}
        </option>
      </select>
      <template #media>
        <f7-button v-if="!noModelPicker"
                   :icon-color="color"
                   :icon-aurora="aurora"
                   :icon-ios="ios"
                   :icon-md="md"
                   @click="pickFromModel" />
        <f7-icon v-else-if="!hideIcon"
                 :color="color"
                 :aurora="aurora"
                 :ios="ios"
                 :md="md" />
      </template>
    </f7-list-item>
    <!-- for placeholder purposes before items are loaded -->
    <f7-list-item v-else
                  link
                  :title="label"
                  disabled
                  no-chevron>
      <template #media>
        <f7-button v-if="!noModelPicker"
                   :icon-color="color"
                   :icon-aurora="aurora"
                   :icon-ios="ios"
                   :icon-md="md"
                   @click="pickFromModel" />
        <f7-icon v-else
                 :color="color"
                 :aurora="aurora"
                 :ios="ios"
                 :md="md" />
      </template>
    </f7-list-item>
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
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

export default {
  props: {
    label: String,
    name: String,
    value: [String, Array],
    items: Array,
    multiple: Boolean,
    filterType: [String, Array],
    required: Boolean,
    editableOnly: Boolean,
    disabled: Boolean,
    setValueText: Boolean,
    noModelPicker: Boolean,
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
      ready: false,
      preparedItems: [],
      aurora: !this.hideIcon ? (this.auroraIcon || 'f7:list_bullet_indent') : undefined,
      ios: !this.hideIcon ? (this.iosIcon || 'f7:list_bullet_indent') : undefined,
      md: !this.hideIcon ? (this.mdIcon || 'f7:list_bullet_indent') : undefined,
      color: this.iconColor || undefined,
      smartSelectParams: {
        view: f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.$t('dialogs.search.items'),
        virtualList: true,
        virtualListHeight: (theme.aurora) ? 32 : undefined
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    if (this.setValueText) this.smartSelectParams.setValueText = this.setValueText
    if (!this.items || !this.items.length) {
      this.$oh.api.get('/rest/items?staticDataOnly=true').then((items) => {
        this.sortAndFilterItems(items)
      })
    } else {
      this.sortAndFilterItems(this.items)
    }
  },
  methods: {
    sortAndFilterItems (items) {
      this.preparedItems = items.sort((a, b) => {
        const labelA = a.label || a.name
        const labelB = b.label || b.name
        return labelA.localeCompare(labelB)
      })
      if (this.filterType && this.filterType.length) {
        if (Array.isArray(this.filterType)) {
          this.preparedItems = this.preparedItems.filter((i) => this.filterType.includes(i.type.split(':', 1)[0]) || (i.type === 'Group' && this.filterType.includes(i.groupType)))
        } else {
          this.preparedItems = this.preparedItems.filter((i) => i.type === this.filterType || (i.type === 'Group' && this.filterType.includes(i.groupType)))
        }
      }
      if (this.editableOnly) {
        this.preparedItems = this.preparedItems.filter((i) => i.editable)
      }
      this.ready = true
    },
    select (e) {
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.$el.children[0].f7SmartSelect.getValue()
      this.$emit('input', value)
      if (!this.multiple) this.$emit('item-selected', this.preparedItems.find((i) => i.name === value))
    },
    updateFromModelPicker (value) {
      if (this.multiple) {
        this.$emit('input', value.map((i) => i.name))
      } else {
        this.$emit('input', value.name)
        this.$emit('item-selected', value)
      }
      this.ready = false
      nextTick(() => { this.ready = true })
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
