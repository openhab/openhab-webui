<template>
  <oh-list-item :context="context">
    <div slot="after">
      {{context.store[config.item].displayState || context.store[config.item].state}}
    </div>
  </oh-list-item>
</template>

<script>
import mixin from '../../widget-mixin'
import { actionGroup, actionProps, actionsMixin } from '../../widget-actions'
import OhListItem from './oh-list-item.vue'

export default {
  components: {
    OhListItem
  },
  mixins: [mixin, actionsMixin],
  widget: {
    name: 'oh-label-item',
    label: 'Label List Item',
    description: 'Display the state of an item in a list',
    props: {
      parameterGroups: [
        actionGroup(null, 'Action to perform when the element is clicked')
      ],
      parameters: [
        ...actionProps(),
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
          description: 'Item to display'
        }
      ]
    }
  }
}
</script>
