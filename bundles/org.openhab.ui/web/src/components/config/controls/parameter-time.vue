<template>
  <ul>
      <f7-list-input
        ref="input"
        :floating-label="$theme.md"
        :label="configDescription.label"
        :name="configDescription.name"
        :value="value"
        :required="configDescription.required" validate
        :clear-button="!configDescription.required"
        @input="updateValue" />
        <div slot="content-end" ref="picker" />
  </ul>
</template>

<script>
export default {
  props: ['configDescription', 'value'],
  data () {
    return {
      picker: null
    }
  },
  mounted () {
    const self = this
    const inputControl = this.$refs.input
    const containerControl = this.$refs.picker
    if (!inputControl || !inputControl.$el || !containerControl) return
    const inputElement = this.$$(inputControl.$el).find('input')
    this.picker = this.$f7.picker.create({
      containerEl: containerControl,
      inputEl: inputElement,
      toolbar: false,
      inputReadOnly: false,
      rotateEffect: true,
      value: (self.value && self.value.indexOf(':') >= 0) ? self.value.split(':') : ['00', '00'],
      formatValue: function (values, displayValues) {
        return values[0] + ':' + values[1]
      },
      cols: [
        // Hours
        {
          values: (function () {
            var arr = []
            for (var i = 0; i <= 23; i++) { arr.push(i < 10 ? `0${i}` : i) }
            return arr
          })()
        },
        // Divider
        {
          divider: true,
          content: ':'
        },
        // Minutes
        {
          values: (function () {
            var arr = []
            for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? `0${i}` : i) }
            return arr
          })()
        }
      ],
      on: {
        change: function (picker, values, displayValues) {
          self.$emit('input', displayValues[0] + ':' + displayValues[1])
        }
      }
    })
  },
  beforeDestroy () {
    if (this.picker) {
      this.picker.destroy()
    }
  },
  watch: {
    value (val) {
      if (!val || val.indexOf(':') < 0 || !this.picker) return
      this.picker.setValue(val.split(':'))
    }
  },
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
