<template>
  <iframe class="oh-webframe" v-bind="config" :style="{ height: config.height || '300px' }" />
</template>

<style lang="stylus">
.oh-webframe
  width 100%
  border none
</style>

<script>
import mixin from '../widget-mixin'
import { OhWebFrameDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhWebFrameDefinition
}
</script>
