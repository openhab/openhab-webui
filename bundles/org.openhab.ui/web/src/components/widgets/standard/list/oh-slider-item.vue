<template>
  <oh-list-item :context="context" class="slider-listitem">
    <div slot="footer" class="padding">
      <generic-widget-component :context="childContext(sliderComponent)" v-on="$listeners" />
    </div>
  </oh-list-item>
</template>

<style lang="stylus">
.slider-listitem
  .item-title
    width 100%
    .item-footer
      height inherit
</style>

<script>
import mixin from '../../widget-mixin'
import OhListItem from './oh-list-item.vue'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin],
  widget: {
    name: 'oh-slider-item',
    label: 'Slider List Item',
    description: 'Display a slider in a list',
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
    sliderComponent () {
      return {
        component: 'oh-slider',
        config: this.config
      }
    }
  }
}
</script>
