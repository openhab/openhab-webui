<template>
  <item-picker
    v-if="isItemField"
    class="attribute-details-item-picker"
    :style="style"
    tabindex="0"
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
    :size="1"
    tabindex="0"
    type="select"
    :value="value"
    :no-chevron="disabled"
    :disabled="disabled"
    @change="$emit('change', $event)">
    <option v-for="option in operatorOptions" :key="option" :value="option">{{ option }}</option>
  </f7-input>
  <f7-input
    v-else-if="isFieldObject"
    :style="style"
    :inputStyle="inputStyle"
    :size="computedSize"
    tabindex="0"
    :type="type"
    :min="min"
    :max="max"
    :placeholder="placeholder"
    :value="value"
    :disabled="disabled"
    validate
    @input="$emit('input', $event)"
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
    computedSize() {
      const valueLength = String(this.value ?? '').length
      return Math.max(1, valueLength)
    },
    operatorOptions() {
      return SITEMAP_OPERATOR_OPTIONS
    }
  }
}
</script>
