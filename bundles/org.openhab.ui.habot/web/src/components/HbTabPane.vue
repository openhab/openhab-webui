<template>
  <q-tab-pane :name="this.model.config.name" :class="{'highlight-and-fade': this.model.highlight}">
    <component :is="component.component" v-for="(component, idx) in this.model.slots.main" :model="component" :key="'tabpane-main-' + idx" :name="'tabpane-main-' + idx" keep-alive />
  </q-tab-pane>
</template>

<script>
import HbComponents from './index'

export default {
  name: 'HbTabPane',
  props: ['model'],
  components: {
    ...HbComponents
  }
}
</script>
