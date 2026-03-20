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
      @input="updateValue($event.target.value)"
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
      <cronexpression-editor v-if="popupOpen" :model-value="value" @update:model-value="updateValue" v-model:opened="popupOpen" />
    </teleport>
  </ul>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { theme } from 'framework7-vue'
import { toString } from 'cronstrue'
import { validate } from './cronexpression-editor.utils'

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
      inputEl: null
    }
  },
  computed: {
    translation () {
      try {
        return toString(this.value, { use24HourTimeFormat: true })
      } catch (err) {
        return err
      }
    }
  },
  methods: {
    updateValue (value) {
      if(!this.inputEl) {
        this.inputEl = this.$refs.input?.$el?.querySelector('input')
      }
      const errorMessage = validate(value)
      this.inputEl.setCustomValidity(errorMessage)
      this.$emit('input', value)
      this.$emit('update:value', value)
    },
    openPopup () {
      this.popupOpen = true
    },
  }
}
</script>
