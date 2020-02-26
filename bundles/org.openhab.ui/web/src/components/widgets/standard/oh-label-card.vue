<template>
  <f7-card>
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center">
      <h2 v-if="context.store[config.item]">{{context.store[config.item].displayState || context.store[config.item].state}}</h2>
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<script>
import mixin from '../widget-mixin'

export default {
  mixins: [mixin],
  widget: {
    name: 'oh-label-card',
    label: 'Simple label',
    description: 'Display the state of an item in a card',
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
          description: 'Item to display'
        },
        {
          name: 'footer',
          label: 'Footer text',
          type: 'TEXT',
          description: 'Footer of the card'
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

<style>

</style>
