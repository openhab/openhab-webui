<template>
  <q-list-header :inset="this.model.config.inset" :class="{'highlight-and-fade': this.model.highlight}">{{label}}</q-list-header>
</template>

<script>
export default {
  name: 'HbListHeader',
  props: ['model'],
  asyncComputed: {
    label: {
      get () {
        return this.$expr(this.model.config.label)
      }
    }
  }
}
</script>
