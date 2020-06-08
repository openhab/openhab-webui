<template>
  <oh-listitem :context="context">
    <div slot="after">
      {{context.store[config.item].displayState || context.store[config.item].state}}
    </div>
  </oh-listitem>
</template>

<script>
import mixin from '../../widget-mixin'
import { actionGroup, actionProps, actionsMixin } from '../../widget-actions'
import OhListitem from '../../system/oh-listitem.vue'

export default {
  name: 'oh-label-listitem',
  components: {
    OhListitem
  },
  mixins: [mixin, actionsMixin],
  widget: {
    name: 'oh-label-listitem',
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
