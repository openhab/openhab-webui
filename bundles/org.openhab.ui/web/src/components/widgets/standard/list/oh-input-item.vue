<template>
  <oh-list-item :context="context" class="input-listitem">
    <template #footer>
      <div>
        <generic-widget-component :context="childContext(afterComponent)" />
      </div>
    </template>
  </oh-list-item>
</template>

<style lang="stylus">
.input-listitem
  .item-title
    width 100%
    .item-footer
      height inherit
</style>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhListItem from './oh-list-item.vue'
import { OhInputItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  props: {
    context: Object
  },
  widget: OhInputItemDefinition,
  setup (props) {
    const { config, childContext } = useWidgetContext(props.context)
    return { config, childContext }
  },
  computed: {
    afterComponent () {
      return {
        component: 'oh-input',
        config: this.config
      }
    }
  }
}
</script>
