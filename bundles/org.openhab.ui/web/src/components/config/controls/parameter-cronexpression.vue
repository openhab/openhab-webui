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
          <f7-button @click="openPopup">
            <f7-icon f7="calendar" /> Build
          </f7-button>
        </div>
      </template>
      <template #info>
        <div>
          {{ translation }}
        </div>
      </template>
    </f7-list-input>
  </ul>
</template>

<script>
import { toString } from 'cronstrue'
import { f7, theme } from 'framework7-vue'

export default {
  props: {
    configDescription: Object,
    value: String
  },
  emits: ['input'],
  setup () {
    return { theme }
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
    },
    openPopup () {
      import(/* webpackChunkName: "cronexpression-editor" */ '@/components/config/controls/cronexpression-editor.vue').then((c) => {
        const popup = {
          component: c.default
        }

        f7.views.main.router.navigate({
          url: 'cron-edit',
          route: {
            path: 'cron-edit',
            popup
          }
        }, {
          props: {
            value: this.value
          }
        })

        f7.once('cronEditorUpdate', this.updateValue)
        f7.once('cronEditorClosed', () => {
          f7.off('cronEditorUpdate', this.updateValue)
        })
      })
    }
  },
  computed: {
    translation () {
      try {
        const ret = toString(this.value, {
          use24HourTimeFormat: true
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
