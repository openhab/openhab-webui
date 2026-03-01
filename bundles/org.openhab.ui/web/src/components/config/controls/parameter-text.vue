<template>
  <ul v-if="multiple" ref="inputs">
    <f7-block-header class="no-margin">
      <div class="margin-horizontal item-label" style="padding-top: var(--f7-list-item-padding-vertical); color: var(--f7-text-color)">
        {{ configDescription.label }}
      </div>
    </f7-block-header>
    <f7-list-input
      v-for="(v, idx) in values"
      no-hairline
      :key="idx"
      :type="controlType"
      :pattern="pattern"
      :error-message="errorMessage"
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
      :pattern="pattern"
      :error-message="errorMessage"
      :autocomplete="options ? 'off' : ''"
      :clear-button="false"
      @input:notempty="addValue"
      @focus="gotFocus"
      :placeholder="configDescription.placeholder" />
  </ul>
  <ul v-else>
    <f7-list-input
      ref="input"
      :floating-label="theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :autocomplete="options ? 'off' : ''"
      :placeholder="configDescription.placeholder"
      :pattern="pattern"
      :error-message="(configDescription.context === 'network-address' && softInvalid && !disableValidation) ? '' : errorMessage"
      :error-message-force="configDescription.context === 'network-address' ? (softInvalid && !disableValidation) : false"
      :required="configDescription.required"
      :validate="configDescription.context !== 'network-address'"
      :validate-on-blur="false"
      :clear-button="!configDescription.required && configDescription.context !== 'password'"
      @input="updateValue"
      @change="updateValue"
      @focus="onFocus"
      :readonly="readOnly || configDescription.readOnly"
      :type="controlType">
      <template #content-end>
        <div v-if="configDescription.context === 'password'" class="padding-left">
          <f7-link class="margin" color="gray" @click="showPassword = !showPassword">
            <f7-icon size="20" :f7="(showPassword) ? 'eye_slash_fill' : 'eye_fill'" />
          </f7-link>
        </div>
      </template>
      <template v-if="softInvalid && !disableValidation" #error-message>
        <div>
          <span class="text-color-red">{{ NETWORK_ADDRESS_WARNING_TEXT }}</span>
          <span @mousedown.prevent="disableValidation = true; validateSoft(value)" class="link" style="margin-left: 6px;">Use anyway</span>
        </div>
      </template>
    </f7-list-input>
  </ul>
</template>

<script>
const NETWORK_ADDRESS_WARNING_TEXT = `⚠ This is not a standard URL, IP address, or host name.`

import { f7, theme } from 'framework7-vue'
import { nextTick } from 'vue'
import * as Pattern from './validation-pattern.ts'

export default {
  props: {
    readOnly: Boolean,
    configDescription: Object,
    value: [String, Array]
  },
  emits: ['input'],
  setup () {
    return { theme, NETWORK_ADDRESS_WARNING_TEXT }
  },
  computed: {
    controlType () {
      if (this.configDescription.context === 'password' && !this.showPassword) return 'password'
      if (this.configDescription.context === 'email') return 'email'
      if (this.configDescription.context === 'telephone') return 'tel'
      if (this.configDescription.context === 'color') return 'color'
      return 'text'
    },
    errorMessage() {
      const ctx = this.configDescription.context;
      if (ctx === 'mac-address') {
        return 'Please enter a valid MAC address (e.g., AA:BB:CC:DD:EE:FF or AABB.CCDD.EEFF).';
      }
      if (ctx === 'url') {
        return 'Please enter a valid URL.';
      }
      // if (ctx === 'ip-address') {
      //  return 'Please enter a valid IP address (e.g., 127.0.0.1 or 2001:db8::1).'
      // }
      if (ctx === 'email') {
        return 'Please enter a valid email address.';
      }
      // Return a generic message if context is not specific
      return 'The entered value is invalid.';
    },
    pattern () {
      const ctx = this.configDescription.context;
      if (ctx === 'mac-address') {
        return Pattern.MacAddress;
      }
      // if (ctx === 'ip-address') {
      //  return Pattern.IpAddress;
      // }
      if (ctx === 'url') {
        return Pattern.FullUrl;
      }
      return this.configDescription.pattern
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
  watch: {
    value(newVal) {
      if (!this.multiple) {
        this.disableValidation = false
        this.validateSoft(newVal || '')
      }
    }
  },
  data () {
    return {
      autoCompleteOptions: null,
      showPassword: false,
      values: [], // Used for multiple values parameters only
      suspendEvents: false,
      softInvalid: false,
      disableValidation: false,
    }
  },
  created () {
    this.setValues()
    this.validateSoft(this.value)
  },
  mounted () {
    if (!this.multiple && this.options) {
      const inputControl = this.$refs.input
      if (!inputControl || !inputControl.$el) return
      const inputElement = this.$$(inputControl.$el).find('input')
      const options = this.options
      this.autoCompleteOptions = f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        requestSourceOnOpen: true,
        source (query, render) {
          render(query ? options.filter((o) => o.text.toLowerCase().includes(query.toLowerCase())) : options)
        }
      })
    }
    this.f7.on('modalClosed', () => {
      this.validateSoft(this.value || '')
    })
  },
  beforeUnmount () {
    this.f7.off('modalClosed')
    this.destroyAutoCompleteOptions()
  },
  methods: {
    onFocus() {
      this.validateSoft(this.value || '')
    },
    updateValue (event) {
      if (this.multiple) return
      this.$emit('input', event.target.value)
    },
    async validateSoft (value) {
      if (this.configDescription.context === 'network-address') {
        const inputEl = this.$refs.input?.$el?.querySelector('input')
        if (this.disableValidation) {
          this.softInvalid = false
          if (inputEl) inputEl.setCustomValidity('')
          return
        }
        const isInvalid = !Pattern.NetworkAddressCompiled.test(value)
        if (this.softInvalid && isInvalid) {
          this.softInvalid = false
          if (inputEl) inputEl.setCustomValidity('')
          await nextTick()
        }
        this.softInvalid = isInvalid
        await nextTick()
        if (inputEl) inputEl.setCustomValidity(isInvalid && !this.disableValidation ? this.NETWORK_ADDRESS_WARNING_TEXT : '')
      }
    },
    updateValueIdx (idx, event) {
      if (!this.multiple || idx < 0 || !this.values || idx >= this.values.length) return
      const newValues = [...this.values]
      newValues[idx] = event.target.value
      this.values = newValues
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
      this.values = newValues
      this.emitValues()

      nextTick(() => {
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
      this.values = newValues
      this.emitValues()
      nextTick(() => {
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
        this.values = result
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
      this.autoCompleteOptions = f7.autocomplete.create({
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
        f7.autocomplete.destroy(this.autoCompleteOptions)
      }
      this.autoCompleteOptions = null
    }
  }
}
</script>
