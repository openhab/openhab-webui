<template>
  <ul>
    <f7-list-item
      :title="configDescription.label"
      smart-select
      :smart-select-params="smartSelectParams"
      ref="itemRef">
      <select :name="configDescription.name"
              @change="updateValue"
              :multiple="configDescription.multiple"
              :required="configDescription.required">
        <option v-if="!configDescription.required && !configDescription.multiple" :value="undefined" :selected="value === null || value === undefined" />
        <option v-for="(day, idx) in values"
                :value="day"
                :key="day"
                :selected="isSelected(day) ? true : null">
          {{ labels[idx] }}
        </option>
      </select>
    </f7-list-item>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { f7 } from 'framework7-vue'

import type { ConfigDescriptionParameter } from '@/components/config/config-descriptions.d.ts'

const props = defineProps<{
  configDescription: ConfigDescriptionParameter;
  value?: string | string[] | null;
}>()

const emit = defineEmits<{
  (e: 'input', value: any): void;
}>()

const labels = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const values = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12'
]

const itemRef = ref<any>(null)

const smartSelectParams = {
  view: f7 ? f7.view.main : null,
  openIn: 'popover',
  closeOnSelect: !props.configDescription.multiple
}

const updateValue = () => {
  const el = itemRef.value?.$el

  if (el && el.children[0]) {
    // injected by Framework7 into the DOM node
    const selectEl = el.children[0] as any

    if (selectEl.f7SmartSelect) {
      const val = selectEl.f7SmartSelect.getValue()
      emit('input', val)
    }
  }
}

const isSelected = (option: string) => {
  if (props.value === null || props.value === undefined) return false

  if (!props.configDescription.multiple) {
    return props.value === option
  } else {
    return props.value && props.value.indexOf(option) >= 0
  }
}
</script>
