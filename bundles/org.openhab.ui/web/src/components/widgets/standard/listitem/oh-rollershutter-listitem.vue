<template>
  <oh-listitem :context="context">
    <div slot="after">
      <generic-widget-component :context="childContext(afterComponent)" v-on="$listeners" />
    </div>
  </oh-listitem>
</template>

<script>
import mixin from '../../widget-mixin'
import OhListitem from '../../system/oh-listitem.vue'

export default {
  components: {
    OhListitem
  },
  mixins: [mixin],
  widget: {
    name: 'oh-rollershutter-listitem',
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
