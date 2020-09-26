<template>
  <generic-widget-component v-if="widgetContext" :context="widgetContext" />
</template>

<script>
import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'

export default {
  props: ['item', 'context'],
  data () {
    return {
      vars: {}
    }
  },
  computed: {
    widgetContext () {
      if (!this.item) return

      let ctx = {
        component: itemDefaultStandaloneComponent(this.item),
        store: this.context.store,
        vars: this.vars
      }

      return ctx
    }
  }
}
</script>
