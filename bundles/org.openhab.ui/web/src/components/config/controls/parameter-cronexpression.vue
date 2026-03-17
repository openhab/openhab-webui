<template>
  <ul>
    <f7-list-input
      :floating-label="theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :required="configDescription.required"
      :clear-button="!configDescription.required"
      :error-message="errorMessage"
      :error-message-force="!!errorMessage"
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
import { toString } from 'cronstrue'
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
      errorMessage: ''
    }
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
      this.$emit('update:value', value)
    },
    openPopup () {
      this.popupOpen = true
    }
  },
  computed: {
    translation () {
      try {
        const _value = this.value || ''
        const parsed = _value.trim().split(/[ ]+/);

        if (parsed.length < 6) {
          throw new Error('Error: Cron expression must have at least 6 fields (seconds, minutes, hours, day of month, month, day of week, [year])')
        }

        const ret = toString(_value, {
          use24HourTimeFormat: true,
          dayOfWeekStartIndexZero: false
        })
        this.errorMessage = ''
        return ret
      } catch (err) {
        this.errorMessage = err && err.message ? err.message : String(err)
        return ''
      }
    }
  }
}
</script>
