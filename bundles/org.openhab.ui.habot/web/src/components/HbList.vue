<template>
  <q-list :link="model.config.link" v-if="model.slots" :separator="!this.model.config.noseparator" :striped="this.model.config.striped"
      :class="{'highlight-and-fade': this.model.highlight}">
    <component :is="component.component" v-for="(component, idx) in model.slots.items" :model="component" :link="model.config.link" :key="'list-item-' + idx" />
  </q-list>
</template>

<script>

export default {
  name: 'HbList',
  props: ['model'],
  data () {
    return {
      link: this.model.link
    }
  },
  beforeCreate () {
    this.$options.components.HbCollapsible = require('./HbCollapsible.vue').default
    this.$options.components.HbListItem = require('./HbListItem.vue').default
    this.$options.components.HbListHeader = require('./HbListHeader.vue').default
    this.$options.components.HbListSeparator = require('./HbListSeparator.vue').default
  }
}
</script>
