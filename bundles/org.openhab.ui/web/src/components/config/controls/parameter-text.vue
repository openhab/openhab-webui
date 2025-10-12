<template>
  <ul v-if="multiple" ref="inputs">
    <f7-block-header class="no-margin">
      <div class="margin-horizontal item-label"
           style="padding-top: var(--f7-list-item-padding-vertical); color: var(--f7-text-color)">
        {{ configDescription.label }}
      </div>
    </f7-block-header>
    <f7-list-input
      v-for="(v, idx) in values"
      no-hairline
      :key="idx"
      :type="controlType"
      :pattern="configDescription.pattern"
      :autocomplete="options ? 'off' : ''"
      :clear-button="true"
      @input:clear="removeValueIdx(idx)"
      @input="updateValueIdx(idx, $event)"
      @focus="gotFocus"
      :value="v" />
    <f7-list-input
      v-if="!configDescription.readOnly"
      ref="input"
      :type="controlType"
      :pattern="configDescription.pattern"
      :autocomplete="options ? 'off' : ''"
      :clear-button="false"
      @input:notempty="addValue"
      @focus="gotFocus"
      :placeholder="configDescription.placeholder" />
  </ul>
  <ul v-else>
    <f7-list-input
      ref="input"
      :floating-label="$theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :autocomplete="options ? 'off' : ''"
      :placeholder="configDescription.placeholder"
      :pattern="configDescription.pattern"
      :required="configDescription.required"
      validate
      :clear-button="!configDescription.required && configDescription.context !== 'password'"
      @input="updateValue"
      :readonly="configDescription.readOnly"
      :type="controlType">
      <div v-if="configDescription.context === 'password'" class="padding-left" slot="content-end">
        <f7-link class="margin"
                 color="gray"
                 slot="content-end"
                 @click="showPassword = !showPassword">
          <f7-icon size="20" :f7="(showPassword) ? 'eye_slash_fill' : 'eye_fill'" />
        </f7-link>
      </div>
    </f7-list-input>
  </ul>
</template>

<script>
export default {
  props: {
    configDescription: Object,
    value: [String, Array]
  },
  emits: ['input'],
  computed: {
    controlType () {
      if (this.configDescription.context === 'password' && !this.showPassword) return 'password'
      return 'text'
    },
    multiple () {
      return this.configDescription?.multiple
    },
    options () {
      if (this.configDescription?.options && this.configDescription.options.length > 0) {
        return this.configDescription.options.map((o) => {
          return {
            id: o.value,
            text: (o.label) ? (o.value !== o.label ? `${o.label} (${o.value})` : o.label) : o.value
          }
        })
      }
      return null
    }
  },
  data () {
    return {
      autoCompleteOptions: null,
      showPassword: false,
      values: [], // Used for multiple values parameters only
      suspendEvents: false
    }
  },
  created () {
    this.setValues()
  },
  mounted () {
    if (!this.multiple && this.options) {
      const inputControl = this.$refs.input
      if (!inputControl || !inputControl.$el) return
      const inputElement = this.$$(inputControl.$el).find('input')
      const options = this.options
      this.autoCompleteOptions = this.$f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        requestSourceOnOpen: true,
        source (query, render) {
          render(query ? options.filter((o) => o.text.toLowerCase().includes(query.toLowerCase())) : options)
        }
      })
    }
  },
  beforeDestroy () {
    this.destroyAutoCompleteOptions()
  },
  methods: {
    updateValue (event) {
      if (this.multiple) return
      this.$emit('input', event.target.value)
    },
    updateValueIdx (idx, event) {
      if (!this.multiple || idx < 0 || !this.values || idx >= this.values.length) return
      const newValues = [...this.values]
      newValues[idx] = event.target.value
      this.$set(this, 'values', newValues)
      this.emitValues()
    },
    addValue (event) {
      if (this.suspendEvents || !this.multiple || !event) {
        return
      }
      const v = event.target?.value
      if (!v) return
      let newValues = this.values.filter((val, idx) => val && this.values.indexOf(val) === idx)
      if (newValues.some((val) => val === v)) return
      newValues.push(v)
      this.suspendEvents = true
      this.$set(this, 'values', newValues)
      this.emitValues()

      this.$nextTick(() => {
        const inputControl = this.$refs.input
        if (inputControl && inputControl.$el) {
          const inputElements = this.$$(inputControl.$el).find('input')
          if (inputElements && inputElements.length > 0) {
            const inputElement = inputElements[0]
            inputElement.value = ''
            let prev = this.findAncestor(inputElement, 'li')?.previousElementSibling
            if (prev) {
              let prevInput = this.$$(prev).find('input')
              if (prevInput) {
                prevInput.focus()
              }
            }
          }
        }
        this.suspendEvents = false
      })
    },
    removeValueIdx (idx) {
      if (this.suspendEvents || !this.multiple || idx < 0 || !this.values || idx >= this.values.length) return
      let newValues = [...this.values]
      newValues.splice(idx, 1)
      this.suspendEvents = true
      this.$set(this, 'values', newValues)
      this.emitValues()
      this.$nextTick(() => {
        this.suspendEvents = false
      })
    },
    setValues () {
      if (this.multiple) {
        let result
        if (!this.value) {
          result = []
        } else if (Array.isArray(this.value)) {
          result = this.value
        } else {
          result = [this.value]
        }
        this.$set(this, 'values', result)
      }
    },
    emitValues () {
      this.$emit('input', this.values.filter((v, idx) => v && this.values.indexOf(v) === idx))
    },
    findAncestor (el, selector) {
      while ((el = el.parentElement) && !el.matches(selector));
      return el
    },
    gotFocus (event) {
      if (!event?.target || !this.options?.length) return
      if (this.autoCompleteOptions) {
        if (this.autoCompleteOptions.inputEl === event.target) return
        this.destroyAutoCompleteOptions()
      }
      const options = this.values?.length ? this.options.filter((o) => !this.values.some((v) => v.toLowerCase() === o.id.toLowerCase())) : this.options
      if (!options?.length) return
      this.autoCompleteOptions = this.$f7.autocomplete.create({
        inputEl: event.target,
        openIn: 'dropdown',
        requestSourceOnOpen: true,
        source (query, render) {
          render(query ? options.filter((o) => o.text.toLowerCase().includes(query.toLowerCase())) : options)
        }
      })
      this.autoCompleteOptions.open()
    },
    destroyAutoCompleteOptions () {
      if (this.autoCompleteOptions) {
        this.autoCompleteOptions.close()
        this.$f7.autocomplete.destroy(this.autoCompleteOptions)
      }
      this.autoCompleteOptions = null
    }
  }
}
</script>
