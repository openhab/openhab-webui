<template>
  <q-chips-input :value="val" color="secondary" @input="$emit('input', $event)"></q-chips-input>
</template>

<script>
export default {
  name: 'ConfigTextArray',
  props: ['value', 'multiple'],
  computed: {
    val: {
      get () {
        return (!this.value) ? [] : this.value
      },
      set (val) {
        this.value = val
      }
    }
  }
}
</script>
