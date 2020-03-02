<template>
  <f7-button v-bind="config" @clicked="performAction" />
</template>

<script>
import mixin from '../widget-mixin'
import { actionGroup, actionProps, actionsMixin } from '../widget-actions'

export default {
  mixins: [mixin, actionsMixin],
  widget: {
    name: 'oh-button',
    label: 'Button',
    description: 'A button performing an action on click',
    props: {
      parameterGroups: [
        actionGroup(null, 'Action to perform when the element is clicked')
      ],
      parameters: [
        ...actionProps()
      ]
    }
  }
}
</script>
