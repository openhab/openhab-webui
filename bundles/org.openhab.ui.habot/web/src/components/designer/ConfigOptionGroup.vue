<template>
  <q-option-group :value="value" color="secondary" @input="$emit('input', $event)" :options="options"></q-option-group>
</template>

<script>
export default {
  name: 'ConfigOptionGroup',
  props: ['value', 'options']
}
</script>
