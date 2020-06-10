<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center" :style="{ height: config.vertical ? '10em' : undefined }">
      <oh-rollershutter :class="{ vertical: config.vertical }" :context="context" @command="onCommand" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.rollershutter-controls
  .button
    text-overflow clip
  &.vertical
    transform rotate(90deg)
    transform-origin center
  .icon
    margin-bottom 2px
    margin-left 2px

</style>

<script>
import mixin from '../widget-mixin'
import OhRollershutter from '../system/oh-rollershutter.vue'

export default {
  mixins: [mixin],
  components: {
    OhRollershutter
  },
  widget: {
    name: 'oh-rollershutter-card',
    label: 'Rollershutter Card',
    description: 'Display a rollershutter control in a card',
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
          name: 'vertical',
          label: 'Vertical',
          type: 'BOOLEAN',
          description: 'Vertical arrangement'
        },
        {
          name: 'dirIconsStyle',
          label: 'Direction Icons Style',
          type: 'TEXT',
          limitToOptions: true,
          options: [
            'arrowtriangle_{dir}',
            'arrowtriangle_{dir}_fill',
            'arrowtriangle_{dir}_circle',
            'arrowtriangle_{dir}_circle_fill',
            'arrowtriangle_{dir}_square',
            'arrowtriangle_{dir}_square_fill',
            'chevron_{dir}',
            'chevron_{dir}_2',
            'chevron_compact_{dir}_2',
            'chevron_{dir}_fill',
            'chevron_{dir}_circle',
            'chevron_{dir}_circle_fill',
            'chevron_{dir}_square',
            'chevron_{dir}_square_fill',
            'arrow_{dir}',
            'arrow_{dir}_2',
            'arrow_{dir}_fill',
            'arrow_{dir}_circle',
            'arrow_{dir}_circle_fill',
            'arrow_{dir}_square',
            'arrow_{dir}_square_fill',
            'arrow_{dir}_to_line',
            'arrow_{dir}_to_line_alt'
          ].map((o) => { return { value: o, label: o } })
        },
        {
          name: 'stopIconStyle',
          label: 'Stop Icon Style',
          type: 'TEXT',
          limitToOptions: true,
          options: [
            'stop',
            'stop_fill',
            'stop_circle',
            'stop_circle_fill',
            'multiply',
            'multiply_fill',
            'multiply_circle',
            'multiply_circle_fill'
          ].map((o) => { return { value: o, label: o } })
        },
        {
          name: 'stateInCenter',
          label: 'State in Center',
          type: 'BOOLEAN',
          description: 'Display state value'
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
