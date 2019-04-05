<template>
  <q-timeline>
    <q-timeline-entry v-for="(component, idx) in model.slots.main" :key="'timeline-' + idx"
      :title="component.config.title"
      :subtitle="component.config.subtitle">
    </q-timeline-entry>
  </q-timeline>
</template>

<style lang="stylus" scoped>
.q-timeline h6
  font-size 20px
</style>

<script>
import HbComponents from 'components/index'

export default {
  name: 'HbTimeline',
  props: ['model'],
  components: HbComponents
}
</script>
