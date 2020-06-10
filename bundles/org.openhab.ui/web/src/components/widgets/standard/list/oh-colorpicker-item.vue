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

export default {
  components: {
    OhListItem
  },
  mixins: [mixin],
  widget: {
    name: 'oh-colorpicker-item',
    label: 'Color Picker List Item',
    description: 'Display a color picker in a list',
    props: {
      parameterGroups: [],
      parameters: [
        {
          name: 'title',
          label: 'Title',
          type: 'TEXT',
          description: 'Title of the list item'
        },
        {
          name: 'item',
          label: 'Item',
          type: 'TEXT',
          context: 'item',
          description: 'Item to control'
        }
      ]
    }
  },
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
