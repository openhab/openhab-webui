<template>
  <oh-list-item :context="context">
    <div slot="after">
      <generic-widget-component :context="childContext(afterComponent)" v-on="$listeners" />
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
    name: 'oh-rollershutter-item',
    label: 'RollerShutter List Item',
    description: 'Display rollershutter controls in a list',
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
    afterComponent () {
      return {
        component: 'oh-rollershutter',
        config: this.config
      }
    }
  }
}
</script>
