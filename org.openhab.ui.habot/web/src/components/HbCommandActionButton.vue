<template>
  <q-btn flat :label="label" :icon="this.model.config.icon" :disabled="disabled" :text-color="textColor" @click="sendCmd()"
    :class="{'highlight-and-fade': this.model.highlight}">
  </q-btn>
</template>

<script>
export default {
  name: 'HbCommandActionButton',
  props: ['model'],
  data () {
    return {
      showAnalyzer: false
    }
  },
  methods: {
    sendCmd () {
      this.$store.dispatch('items/sendCmd')(this.model.config.item, this.command)
    }
  },
  asyncComputed: {
    label () {
      return this.$expr(this.model.config.label)
    },
    disabled () {
      return (this.model.config.disabled) ? this.$expr('=' + this.model.config.disabled) : false
    },
    textColor () {
      return this.$expr(this.model.config.textColor)
    },
    command () {
      return this.$expr(this.model.config.textColor)
    }
  }
}
</script>
