<template>
  <ul>
      <f7-list-input
        :floating-label="$theme.md"
        :label="configDescription.label"
        :name="configDescription.name"
        :value="value"
        :required="configDescription.required" validate
        :clear-button="!configDescription.required"
        @input="updateValue"
        type="text">
        <div class="padding-left" slot="content-end">
          <f7-button slot="content-end" @click="openMap"><f7-icon f7="placemark" /> Map</f7-button>
        </div>
      </f7-list-input>
  </ul>
</template>

<script>
// TODO: map
export default {
  props: ['configDescription', 'value'],
  components: {
  },
  data () {
    return {
      mapOpened: false
    }
  },
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    },
    openMap () {
      this.$f7.dialog.alert('Map location picker not implemented')
    }
  }
}
</script>
