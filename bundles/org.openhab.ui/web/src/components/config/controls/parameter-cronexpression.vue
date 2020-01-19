<template>
  <ul>
      <f7-list-input
        :floating-label="$theme.md"
        :label="configDescription.label"
        :name="configDescription.name"
        :value="value"
        :required="configDescription.required" validate
        :clear-button="!configDescription.required"
        @input="updateValue"
        :error-message-force="exprError"
        type="text">
        <div class="padding-left" slot="content-end">
          <f7-button slot="content-end" @click="popupOpened = true"><f7-icon f7="calendar" /> Build</f7-button>
        </div>
        <div slot="info">{{translation}}</div>
      </f7-list-input>
      <cron-editor :value="value" :opened="popupOpened" :popup-id="`config-${configDescription.name}-fullscreen`" @closed="popupOpened = false" @input="(value) => { $emit('input', value) }" />
  </ul>
</template>

<script>
import CronEditor from './cronexpression-editor.vue'
import cronstrue from 'cronstrue'

export default {
  props: ['configDescription', 'value'],
  components: {
    CronEditor
  },
  data () {
    return {
      popupOpened: false
    }
  },
  methods: {
    updateValue (event) {
      this.$emit('input', event.target.value)
    }
  },
  computed: {
    translation () {
      try {
        const ret = cronstrue.toString(this.value, {
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
