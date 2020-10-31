<template>
  <ul>
      <f7-list-input
        ref="input"
        :floating-label="$theme.md"
        :label="configDescription.label"
        :name="configDescription.name"
        :value="formattedValue"
        :autocomplete="autoCompleteOptions ? 'off' : ''"
        :pattern="configDescription.pattern"
        :required="configDescription.required" validate
        :clear-button="!configDescription.required && configDescription.context !== 'password'"
        @input="updateValue"
        :type="controlType">
        <div v-if="configDescription.context === 'password'" class="padding-left" slot="content-end">
          <f7-link class="margin" color="gray" slot="content-end" @click="showPassword = !showPassword"><f7-icon size="20" :f7="(showPassword) ? 'eye_slash_fill' : 'eye_fill'" /></f7-link>
        </div>
      </f7-list-input>
  </ul>
</template>

<script>
export default {
  props: ['configDescription', 'value'],
  computed: {
    controlType () {
      if (this.configDescription.context === 'password' && !this.showPassword) return 'password'
      if (this.configDescription.multiple) return 'textarea'
      return 'text'
    },
    formattedValue () {
      if (this.configDescription.multiple) return this.value.join('\n')
      return this.value
    }
  },
  data () {
    return {
      autoCompleteOptions: null,
      showPassword: false
    }
  },
  mounted () {
    if (this.configDescription.options && this.configDescription.options.length > 0) {
      const options = this.configDescription.options.map((o) => {
        return {
          id: o.value,
          text: (o.label) ? (o.value !== o.label) ? `${o.label} (${o.value})` : o.label : o.value
        }
      })
      const inputControl = this.$refs.input
      if (!inputControl || !inputControl.$el) return
      const inputElement = this.$$(inputControl.$el).find('input')
      this.autoCompleteOptions = this.$f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        requestSourceOnOpen: true,
        source (query, render) {
          render(options.filter((o) => o.text.toLowerCase().indexOf(query.toLowerCase()) >= 0))
        }
      })
    }
  },
  beforeDestroy () {
    if (this.autoCompleteOptions) {
      this.$f7.autocomplete.destroy(this.autoCompleteOptions)
    }
  },
  methods: {
    updateValue (event) {
      const value = (this.configDescription.multiple) ? event.target.value.split('\n') : event.target.value
      this.$emit('input', value)
    }
  }
}
</script>
