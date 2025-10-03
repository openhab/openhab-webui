<template>
  <oh-list-item :context="context">
    <template #after>
      <div>
        <generic-widget-component v-bind="$attrs" :context="childContext(afterComponent)" />
      </div>
    </template>
  </oh-list-item>
</template>

<script>
import mixin from '../../widget-mixin'
import OhListItem from './oh-list-item.vue'
import { OhRollershutterItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin],
  widget: OhRollershutterItemDefinition,
  computed: {
    afterComponent () {
      return {
        component: 'oh-rollershutter',
        config: this.config
      }
    }
  }
}
</script>
