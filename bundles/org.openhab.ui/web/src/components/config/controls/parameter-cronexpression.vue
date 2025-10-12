<template>
  <ul>
    <f7-list-input
      :floating-label="$theme.md"
      :label="configDescription.label"
      :name="configDescription.name"
      :value="value"
      :required="configDescription.required"
      validate
      :clear-button="!configDescription.required"
      @input="(evt) => updateValue(evt.target.value)"
      :error-message-force="exprError"
      type="text">
      <div class="padding-left" slot="content-end">
        <f7-button slot="content-end" @click="openPopup">
          <f7-icon f7="calendar" /> Build
        </f7-button>
      </div>
      <div slot="info">
        {{ translation }}
      </div>
    </f7-list-input>
  </ul>
</template>

<script>
import cronstrue from 'cronstrue'

export default {
  props: {
    configDescription: Object,
    value: String
  },
  emits: ['input'],
  data () {
    return {}
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

        this.$f7router.navigate({
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

        this.$f7.once('cronEditorUpdate', this.updateValue)
        this.$f7.once('cronEditorClosed', () => {
          this.$f7.off('cronEditorUpdate', this.updateValue)
        })
      })
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
