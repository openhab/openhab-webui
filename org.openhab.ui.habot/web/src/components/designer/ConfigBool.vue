<template>
  <q-checkbox :value="value" @input="$emit('input', $event)" color="secondary"></q-checkbox>
</template>

<script>
export default {
  name: 'ConfigBool',
  props: ['value']
}
</script>
