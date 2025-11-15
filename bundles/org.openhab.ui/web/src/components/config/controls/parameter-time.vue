<template>
  <ul>
    <f7-list-input
      ref="input"
      :floating-label="theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :required="configDescription.required"
      validate
      :clear-button="!configDescription.required"
      @input="updateValue">
      <template #content-end>
        <div class="display-flex justify-content-center">
          <div ref="picker" />
        </div>
      </template>
    </f7-list-input>
  </ul>
</template>

<script>
import { f7, theme } from 'framework7-vue'
import { nextTick } from 'vue'

export default {
  props: {
    configDescription: Object,
    value: String
  },
  emits: ['input'],
  setup () {
    return { theme }
  },
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
            let step = this.configDescription.step | this.configDescription.stepsize
            for (let i = 0; i <= 59; i = i + step % 60) { arr.push(i < 10 ? `0${i}` : i) }
            return arr
          })()
        })
    }

    nextTick(() => {
      this.picker = f7.picker.create({
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
  beforeUnmount () {
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
      let result = this.configDescription.step || this.configDescription.stepsize
      return result !== undefined && result % 60 !== 0
    }
  },
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>
