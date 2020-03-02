<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content :class="{ 'slider-card-vertical': config.vertical }">
      <oh-list :context="childContext(context.component)" v-on="$listeners" />
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
import OhList from '../system/oh-list.vue'

export default {
  mixins: [mixin],
  components: {
    OhList
  },
  widget: {
    name: 'oh-list-card',
    label: 'List card',
    description: 'Display a list in a card',
    props: {
      parameters: [
        {
          name: 'title',
          label: 'Title',
          type: 'TEXT',
          description: 'Title of the card'
        },
        {
          name: 'footer',
          label: 'Footer text',
          type: 'TEXT',
          description: 'Footer of the card'
        }
      ]
    }
  }
}
</script>
