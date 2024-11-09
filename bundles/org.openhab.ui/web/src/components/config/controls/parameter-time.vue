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
    <div slot="content-end" class="display-flex justify-content-center">
      <div ref="picker" />
    </div>
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

    const cols = [
      // Hours
      {
        values: (function () {
          let arr = []
          for (let i = 0; i <= 23; i++) { arr.push(i < 10 ? `0${i}` : i) }
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
          let arr = []
          for (let i = 0; i <= 59; i++) { arr.push(i < 10 ? `0${i}` : i) }
          return arr
        })()
      }
    ]
    if (this.hasSeconds) {
      cols.push(
        // Divider
        {
          divider: true,
          content: ':'
        },
        // Seconds
        {
          values: (() => {
            let arr = []
            for (let i = 0; i <= 59; i = i + this.configDescription.stepsize % 60) { arr.push(i < 10 ? `0${i}` : i) }
            return arr
          })()
        })
    }

    this.$nextTick(() => {
      this.picker = this.$f7.picker.create({
        containerEl: containerControl,
        inputEl: inputElement,
        toolbar: false,
        inputReadOnly: false,
        rotateEffect: true,
        value: (self.value && self.value.indexOf(':') >= 0) ? self.value.split(':') : (self.hasSeconds ? ['00', '00', '00'] : ['00', '00']),
        formatValue: function (values, displayValues) {
          if (self.hasSeconds) return values[0] + ':' + values[1] + ':' + values[2]
          return values[0] + ':' + values[1]
        },
        cols,
        on: {
          change: function (picker, values, displayValues) {
            if (self.hasSeconds) {
              self.$emit('input', displayValues[0] + ':' + displayValues[1] + ':' + displayValues[2])
            } else {
              self.$emit('input', displayValues[0] + ':' + displayValues[1])
            }
          }
        }
      })
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
  computed: {
    hasSeconds () {
      return this.configDescription.stepsize !== undefined && this.configDescription.stepsize % 60 !== 0
    }
  },
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
