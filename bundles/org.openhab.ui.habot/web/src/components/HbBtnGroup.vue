<template>
  <q-btn-group :flat="this.model.config.flat" :rounded="this.model.config.rounded" :outline="this.model.config.outline" :push="this.model.config.push"
      :class="{'highlight-and-fade': this.model.config.highlight}">
    <hb-btn v-for="(component, idx) in this.model.slots.buttons" :model="component" :key="'btngroup-' + idx" />
  </q-btn-group>
</template>

<script>
import HbBtn from 'components/HbBtn.vue'
export default {
  name: 'HbBtnGroup',
  props: ['model'],
  components: {
    HbBtn
  }
}
</script>
