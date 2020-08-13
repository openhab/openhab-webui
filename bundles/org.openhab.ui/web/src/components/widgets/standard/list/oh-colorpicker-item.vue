<template>
  <oh-list-item :context="context">
    <div slot="after" class="display-flex">
      <generic-widget-component :context="childContext(colorPickerComponent)" v-on="$listeners" />
      <generic-widget-component class="margin-left" :context="childContext(switchComponent)" v-on="$listeners" />
    </div>
  </oh-list-item>
</template>

<script>
import mixin from '../../widget-mixin'
import OhListItem from './oh-list-item.vue'
import { OhColorpickerItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin],
  widget: OhColorpickerItemDefinition,
  computed: {
    colorPickerComponent () {
      return {
        component: 'oh-colorpicker',
        config: Object.assign({}, this.config, {
          openIn: this.config.openIn || 'auto'
        })
      }
    },
    switchComponent () {
      return {
        component: 'oh-toggle',
        config: this.config
      }
    }
  }
}
</script>
