<template>
  <oh-list-item :context="context">
    <template #after>
      <div class="display-flex">
        <generic-widget-component v-bind="$attrs" :context="childContext(colorPickerComponent)" />
        <generic-widget-component v-bind="$attrs" class="margin-left" :context="childContext(switchComponent)" />
      </div>
    </template>
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
