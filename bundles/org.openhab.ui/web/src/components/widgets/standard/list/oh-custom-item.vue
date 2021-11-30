<template>
  <oh-list-item :context="context" class="custom-listitem">
    <div slot="content">
      <generic-widget-component v-if="context.component.slots && context.component.slots.content && context.component.slots.content.length"
                                :context="childContext(context.component.slots.content[0])" v-on="$listeners" />
    </div>
  </oh-list-item>
</template>

<script>
import mixin from '../../widget-mixin'
import { actionsMixin } from '../../widget-actions'
import OhListItem from './oh-list-item.vue'
import { OhCustomItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin, actionsMixin],
  widget: OhCustomItemDefinition
}
</script>
