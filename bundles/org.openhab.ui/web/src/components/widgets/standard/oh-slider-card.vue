<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center" :class="{ 'slider-card-vertical': config.vertical }">
      <oh-slider :context="childContext(context.component)" :class="{ 'slider-card-vertical': config.vertical }" @command="onCommand" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.slider-card-vertical
  height 300px
</style>

<script>
import mixin from '../widget-mixin'
import OhSlider from '../system/oh-slider.vue'

export default {
  mixins: [mixin],
  components: {
    OhSlider
  },
  widget: {
    name: 'oh-slider-card',
    label: 'Slider Card',
    description: 'Display a slider in a card',
    props: {
      parameters: [
        {
          name: 'title',
          label: 'Title',
          type: 'TEXT',
          description: 'Title of the card'
        },
        {
          name: 'item',
          label: 'Item',
          type: 'TEXT',
          context: 'item',
          description: 'Item to control'
        },
        {
          name: 'footer',
          label: 'Footer text',
          type: 'TEXT',
          description: 'Footer of the card'
        },
        {
          name: 'color',
          label: 'Color',
          type: 'TEXT',
          description: 'Color of the control'
        },
        {
          name: 'vertical',
          label: 'Vertical slider',
          type: 'BOOLEAN',
          description: 'Display the slider vertically'
        },
        {
          name: 'label',
          label: 'Label on slider',
          type: 'BOOLEAN',
          description: 'Display a label on the slider'
        },
        {
          name: 'scale',
          label: 'Scale on slider',
          type: 'BOOLEAN',
          description: 'Display a scale on the slider'
        }
      ]
    }
  }
}
</script>
