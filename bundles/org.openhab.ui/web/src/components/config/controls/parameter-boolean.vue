<template>
  <ul>
      <f7-list-item :title="configDescription.label">
        <f7-toggle slot="after" :name="configDescription.name" :checked="actualValue" @toggle:change="updateValue"></f7-toggle>
      </f7-list-item>
  </ul>
</template>

<script>
export default {
  props: ['configDescription', 'value'],
  computed: {
    actualValue () {
      if (typeof (this.value) === 'string') {
        return this.value === 'true'
      }
      return this.value
    }
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
