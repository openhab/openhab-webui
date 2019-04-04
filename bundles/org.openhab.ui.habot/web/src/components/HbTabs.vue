<template>
<q-tabs v-if="model.slots && model.slots.tabs && model.slots.tabpanes"
        :inverted="model.config.inverted" :align="model.config.align"
        :color="model.config.color" :glossy="model.config.glossy" :no-pane-border="model.config.noborder"
        :position="model.config.position" :class="{'highlight-and-fade': this.model.highlight}">
  <q-tab v-for="(component, idx) in model.slots.tabs" :key="'tab-' + idx" :name="component.config.name" :label="component.config.label" :default="idx === 0" slot="title"
    :class="{'highlight-and-fade': component.highlight}"/>
  <hb-tab-pane v-for="(tabpane, idx) in model.slots.tabpanes" :key="'tabpane-' + idx" :model="tabpane">
  </hb-tab-pane>
</q-tabs>
</template>

<style lang="stylus" scoped>
</style>

<script>
export default {
  name: 'HbTabs',
  props: ['model'],
  data () {
    return {
      config: this.model.config
    }
  },
  beforeCreate () {
    this.$options.components.HbTabPane = require('./HbTabPane.vue').default
  },
  created () {

  }
}
</script>
