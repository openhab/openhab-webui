<template>
  <item-picker
    v-if="isItemField"
    class="attribute-details-item-picker"
    :style="style"
    :label="label"
    :value="value"
    :disabled="disabled"
    :showTitle="!value"
    :setValueText="true"
    noModelPicker
    hideIcon
    :textColor="textColor"
    @input="$emit('input', $event)" />
  <f7-input
    v-else-if="isOperatorField"
    :style="style"
    :inputStyle="inputStyle"
    type="select"
    :value="value"
    :disabled="disabled"
    @change="$emit('change', $event)">
    <option v-for="option in operatorOptions" :key="option" :value="option">{{ option }}</option>
  </f7-input>
  <f7-input
    v-else-if="isFieldObject"
    :style="style"
    :inputStyle="inputStyle"
    :type="type"
    :min="min"
    :max="max"
    :placeholder="placeholder"
    :value="value"
    :disabled="disabled"
    validate
    @change="$emit('change', $event)" />
  <div v-else :style="style">{{ field }}</div>
</template>

<script>
import { SITEMAP_OPERATOR_OPTIONS } from '@/components/pagedesigner/sitemap/sitemap-mixin'
import ItemPicker from '@/components/config/controls/item-picker.vue'

export default {
  components: {
    ItemPicker
  },
  props: {
    field: [String, Object],
    value: [String, Number],
    style: Object,
    inputStyle: Object,
    disabled: Boolean,
    type: String,
    min: [String, Number],
    max: [String, Number],
    placeholder: String,
    isItemField: Boolean,
    isOperatorField: Boolean,
    isFieldObject: Boolean,
    textColor: String
  },
  emits: ['change', 'input'],
  computed: {
    operatorOptions() {
      return SITEMAP_OPERATOR_OPTIONS
    }
  }
}
</script>

<style lang="stylus" scoped>
.attribute-details-item-picker
  .item-content
    padding-left 0 !important
  .item-media
    display none
  .sortable-handler
    display none
</style>
