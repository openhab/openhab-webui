<template>
  <oh-list-item :context="context">
    <template #after>
      <div v-if="config.after === undefined && (context.store[config.item].displayState || context.store[config.item].state !== 'NULL')">
        {{ context.store[config.item].displayState || context.store[config.item].state }}
      </div>
    </template>
  </oh-list-item>
</template>

<script>
import mixin from '../../widget-mixin'
import { actionsMixin } from '../../widget-actions'
import OhListItem from './oh-list-item.vue'
import { OhLabelItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin, actionsMixin],
  widget: OhLabelItemDefinition
}
</script>
