<template>
  <ul>
    <f7-list-input
      ref="input"
      :floating-label="theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :required="configDescription.required"
      :value="value"
      @input="updateValue($event.target.value)"
      :clear-button="!configDescription.required"
      type="text">
      <template #content-end>
        <div class="padding-left">
          <f7-button @click="openPopup"> <f7-icon f7="calendar" /> Build </f7-button>
        </div>
      </template>
      <template #info>
        <div>
          {{ translation }}
        </div>
      </template>
    </f7-list-input>

    <teleport to="body">
      <cronexpression-editor v-if="popupOpen" :model-value="value" @update:modelValue="updateValue" v-model:opened="popupOpen" />
    </teleport>
  </ul>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { theme } from 'framework7-vue'

export default {
  components: {
    CronexpressionEditor: defineAsyncComponent(() => import(/* webpackChunkName: "cronexpression-editor" */ '@/components/config/controls/cronexpression-editor.vue'))
  },
  props: {
    configDescription: Object,
    value: String
  },
  emits: ['input', 'update:value'],
  setup () {
    return { theme }
  },
  data () {
    return {
      popupOpen: false,
      translation: '',
      inputEl: null
    }
  },
  methods: {
    updateValue (value) {
      if(!this.inputEl) {
        this.inputEl = this.$refs.input?.$el?.querySelector('input')
      }
      const errorMessage = this.validate(value)
      this.inputEl.setCustomValidity(errorMessage)
      this.$emit('input', value)
      this.$emit('update:value', value)
    },
    openPopup () {
      this.popupOpen = true
    },
    validate(value) {
      const trimmed = value.trim()
      const specialCases = [
        '@annually', '@yearly', '@monthly', '@weekly', '@daily', '@hourly', '@reboot'
      ]
      if (trimmed.startsWith('@')) {
        if (specialCases.includes(trimmed.toLowerCase())) {
          return ''
        } else {
          return 'Invalid special cron expression'
        }
      } else {
        const fields = trimmed.split(/\s+/)
        if (fields.length != 6 && fields.length != 7) {
          return 'Cron expression must have 6 or 7 fields'
        } else {
          const regex = /^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?|(\(\d+-\d+\)(\/\d+)?|\(\d+\/\d+\)?|\(\d+-\d+\/\d+\)?|\/\d+)?|W?) ?){6,7})/;
          if (!regex.test(trimmed)) {
            return 'Invalid cron expression format'
          } else {
            return ''

          }
        }
      }

    }
  }
}
</script>
