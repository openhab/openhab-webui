<template>
  <generic-widget-component v-if="widgetContext" :context="widgetContext" />
</template>

<script>
import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'

export default {
  props: {
    item: Object,
    context: Object,
    noBorder: Boolean
  },
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

      if (this.noBorder) {
        ctx.component.config.noBorder = true
        ctx.component.config.noShadow = true
      }

      return ctx
    }
  }
}
</script>
