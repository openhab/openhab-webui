<template>
  <oh-listitem :context="context" class="slider-listitem">
    <div slot="footer" class="padding">
      <generic-widget-component :context="childContext(sliderComponent)" v-on="$listeners" />
    </div>
  </oh-listitem>
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
import OhListitem from '../../system/oh-listitem.vue'

export default {
  components: {
    OhListitem
  },
  mixins: [mixin],
  widget: {
    name: 'oh-slider-listitem',
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
