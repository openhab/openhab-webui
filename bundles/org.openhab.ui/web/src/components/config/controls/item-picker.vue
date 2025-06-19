<template>
  <ul class="item-picker-container">
    <f7-list-item :title="title" :disabled="disabled" smart-select :smart-select-params="smartSelectParams" :textColor="textColor" v-if="ready" ref="smartSelect" class="item-picker">
      <select :name="name" :multiple="multiple" @change="select" :required="required">
        <option value="" v-if="!multiple" />
        <option v-for="item in preparedItems" :value="item.name" :key="item.name" :selected="(multiple) ? Array.isArray(value) && value.indexOf(item.name) >= 0 : value === item.name">
          {{ item.label ? item.label + ' (' + item.name + ')' : item.name }}
        </option>
      </select>
      <f7-button v-if="!noModelPicker" slot="media" :icon-color="color" :icon-aurora="aurora" :icon-ios="ios" :icon-md="md" @click.native="pickFromModel" />
      <f7-icon v-else slot="media" :color="color" :aurora="aurora" :ios="ios" :md="md" />
    </f7-list-item>
    <!-- for placeholder purposes before items are loaded -->
    <f7-list-item link v-show="!ready" :title="title" disabled no-chevron>
      <f7-button v-if="!noModelPicker" slot="media" :icon-color="color" :icon-aurora="aurora" :icon-ios="ios" :icon-md="md" @click.native="pickFromModel" />
      <f7-icon v-else slot="media" :color="color" :aurora="aurora" :ios="ios" :md="md" />
    </f7-list-item>
  </ul>
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
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

export default {
  props: ['title', 'name', 'value', 'items', 'multiple', 'filterType', 'required', 'editableOnly', 'disabled', 'setValueText', 'noModelPicker',
    'iconColor', 'auroraIcon', 'iosIcon', 'mdIcon', 'textColor', 'hideIcon'],
  data () {
    return {
      ready: false,
      preparedItems: [],
      aurora: !this.hideIcon ? (this.auroraIcon || 'f7:list_bullet_indent') : undefined,
      ios: !this.hideIcon ? (this.iosIcon || 'f7:list_bullet_indent') : undefined,
      md: !this.hideIcon ? (this.mdIcon || 'f7:list_bullet_indent') : undefined,
      color: this.iconColor || undefined,
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.$t('dialogs.search.items'),
        virtualList: true,
        virtualListHeight: (this.$theme.aurora) ? 32 : undefined
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    if (this.setValueText === false) this.smartSelectParams.setValueText = false
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
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.f7SmartSelect.getValue()
      this.$emit('input', value)
      if (!this.multiple) this.$emit('itemSelected', this.preparedItems.find((i) => i.name === value))
    },
    updateFromModelPicker (value) {
      if (this.multiple) {
        this.$emit('input', value.map((i) => i.name))
      } else {
        this.$emit('input', value.name)
        this.$emit('itemSelected', value)
      }
      this.ready = false
      this.$nextTick(() => { this.ready = true })
    },
    pickFromModel (evt) {
      evt.cancelBubble = true
      const popup = {
        component: ModelPickerPopup
      }

      this.$f7router.navigate({
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
          popupTitle: this.title,
          groupsOnly: this.filterType && this.filterType === 'Group',
          editableOnly: this.editableOnly
        }
      })

      this.$f7.once('itemsPicked', this.updateFromModelPicker)
      this.$f7.once('modelPickerClosed', () => {
        this.$f7.off('itemsPicked', this.updateFromModelPicker)
      })
    }
  }
}
</script>
