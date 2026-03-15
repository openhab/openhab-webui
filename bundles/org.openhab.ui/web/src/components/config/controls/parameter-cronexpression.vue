<template>
  <ul>
    <f7-list-input
      :floating-label="theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :required="configDescription.required"
      validate
      :clear-button="!configDescription.required"
      @input="(evt) => updateValue(evt.target.value)"
      :error-message-force="exprError"
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

    <cronexpression-editor
      v-if="popupOpen"
      :model-value="value"
      @update:modelValue="updateValue"
      v-model:opened="popupOpen" />
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
  emits: ['input'],
  setup () {
    return { theme }
  },
  data () {
    return {
      popupOpen: false
    }
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    },
    openPopup () {
      this.popupOpen = true
    }
  },
  computed: {
    translation () {
      try {
        const ret = toString(this.value, {
          use24HourTimeFormat: true,
          dayOfWeekStartIndexZero: false
        })
        return ret
      } catch (err) {
        return err
      }
    },
    exprError () {
      return this.translation.indexOf('Error:') === 0
    }
  }
}
</script>
