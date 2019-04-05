<template>
<q-collapsible :group="model.config.group" :sparse="model.config.sparse" :dense="model.config.dense" :indent="model.config.indent" separator
  :class="{'highlight-and-fade': this.model.highlight}">
  <template slot="header">
    <q-item-main>
      <q-item-tile label>{{label}}</q-item-tile>
      <q-item-tile v-if="model.config.sublabel" class="item-subtitle" sublabel>{{sublabel}}</q-item-tile>
    </q-item-main>
  </template>
  <div v-if="model.slots && model.slots.main">
    <component :is="component.component" v-for="(component, idx) in model.slots.main" :model="component" :key="'collapsible-' + idx" />
  </div>
</q-collapsible>
</template>

<style lang="stylus" scoped>
.item-subtitle
  font-size 14px !important
  color rgba(0,0,0,0.4) !important
.big-value
  font-weight 300
  color black
  font-size 150%
</style>

<script>
export default {
  name: 'HbCollapsible',
  props: ['model'],
  data () {
    return {
      config: this.model.config
    }
  },
  created () {
  },
  asyncComputed: {
    label: {
      get () {
        return this.$expr(this.model.config.label)
      }
    },
    sublabel: {
      get () {
        return this.$expr(this.model.config.sublabel)
      }
    }
  }
}
</script>
