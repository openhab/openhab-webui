<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content>
      <f7-list>
        <f7-list-item>
          <div class="display-block">
            <div class="no-padding no-margin font-weight-normal">{{this.context.store[config.artistItem].state}}</div>
            <h3 class="no-padding no-margin">{{this.context.store[config.trackItem].state}}</h3>
          </div>
        </f7-list-item>
      </f7-list>
    </f7-card-content>
    <f7-card-footer class="display-flex justify-content-center">
      <oh-player-controls :context="childContext(context.component)" @command="onCommand" />
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.slider-card-vertical
  height 300px
</style>

<script>
import mixin from '../widget-mixin'
import OhPlayerControls from '../system/oh-player-controls.vue'

export default {
  mixins: [mixin],
  components: {
    OhPlayerControls
  },
  widget: {
    name: 'oh-player-card',
    label: 'Simple player',
    description: 'Display player controls in a card',
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
          description: 'Item to control (player)'
        },
        {
          name: 'footer',
          label: 'Footer text',
          type: 'TEXT',
          description: 'Footer of the card'
        },
        {
          name: 'artistItem',
          label: 'Artist Item',
          type: 'TEXT',
          context: 'item',
          description: 'Item holding the artist name'
        },
        {
          name: 'trackItem',
          label: 'Track Item',
          type: 'TEXT',
          context: 'item',
          description: 'Item holding the track name'
        }
      ]
    }
  }
}
</script>
