<template>
  <trigger-channel-picker :title="configDescription.label"
                          :value="value"
                          @input="updateValue"
                          :multiple="configDescription.multiple"
                          :required="configDescription.required" />
</template>

<script>
import TriggerChannelPicker from './triggerchannel-picker.vue'

export default {
  props: ['configDescription', 'value'],
  components: {
    TriggerChannelPicker
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    }
  }
}
</script>
