<template>
  <iframe class="oh-webframe" v-bind="config" :style="{ height: config.height || '300px' }" />
</template>

<style lang="stylus">
.oh-webframe
  width 100%
  border none
</style>

<script>
import { OhWebFrameDefinition } from '@/assets/definitions/widgets/system'
import { useWidgetContext } from '@/components/widgets/useWidgetContext';

export default {
  widget: OhWebFrameDefinition,
  props: {
    context: Object
  },
  setup(props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  }
}
</script>
