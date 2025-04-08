<template>
  <oh-list-item :context="context">
    <div slot="after">
      <generic-widget-component :context="childContext(afterComponent)" v-on="$listeners" />
    </div>
  </oh-list-item>
</template>

<script>
import mixin from '../../widget-mixin'
import OhListItem from './oh-list-item.vue'
import { OhMediaBrowserItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin],
  widget: OhMediaBrowserItemDefinition,
  computed: {
    afterComponent () {
      return {
        component: 'oh-media-browser-controls',
        config: this.config
      }
    }
  }
}
</script>
