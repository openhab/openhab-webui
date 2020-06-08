<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center">
      <oh-colorpicker :context="context" @command="onCommand" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
</style>

<script>
import mixin from '../widget-mixin'
import OhColorpicker from '../system/oh-colorpicker.vue'

export default {
  mixins: [mixin],
  components: {
    OhColorpicker
  },
  widget: {
    name: 'oh-colorpicker-card',
    label: 'Color Picker Card',
    description: 'Display a color picker in a card',
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
          name: 'color',
          label: 'Color',
          type: 'TEXT',
          description: 'Color of the control'
        },
        {
          name: 'footer',
          label: 'Footer text',
          type: 'TEXT',
          description: 'Footer of the card'
        },
        {
          name: 'modules',
          label: 'Modules',
          type: 'TEXT',
          description: 'Modules to display',
          multiple: true,
          limitToOptions: true,
          options: [
            { value: 'wheel', label: 'Color wheel' },
            { value: 'sb-spectrum', label: 'Saturation/brightness spectrum' },
            { value: 'hue-slider', label: 'Hue slider' },
            { value: 'hs-spectrum', label: 'Hue/saturation spectrum' },
            { value: 'brightness-slider', label: 'Brightness spectrum' },
            { value: 'rgb-sliders', label: 'RGB sliders' },
            { value: 'hsb-sliders', label: 'HSB sliders' },
            { value: 'rgb-bars', label: 'RGB bars' },
            { value: 'palette', label: 'Palette' },
            { value: 'current-color', label: 'Current color' },
            { value: 'initial-current-colors', label: 'Initial current colors' }
          ]
        }
      ]
    }
  },
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
