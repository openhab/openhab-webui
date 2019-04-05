<template>
  <q-select :value="val" color="secondary" @input="$emit('input', $event)" :options="items" :multiple="multiple" filter clearable></q-select>
</template>

<script>
export default {
  name: 'ConfigItem',
  props: ['value', 'multiple'],
  data () {
    return {
      items: this.$store.state.items.items.map((item) => {
        return {
          value: item.name,
          label: item.name,
          sublabel: item.label,
          stamp: item.type
        }
      })
    }
  },
  computed: {
    val: {
      get () {
        return (!this.value && this.multiple) ? [] : this.value
      },
      set (val) {
        this.value = val
      }
    }
  }
}
</script>
