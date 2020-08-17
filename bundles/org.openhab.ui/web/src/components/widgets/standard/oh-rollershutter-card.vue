<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center" :style="{ height: config.vertical ? '10em' : undefined }">
      <oh-rollershutter :class="{ vertical: config.vertical }" :context="context" @command="onCommand" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.rollershutter-controls
  .button
    text-overflow clip
  &.vertical
    transform rotate(90deg)
    transform-origin center
  .icon
    margin-bottom 2px
    margin-left 2px

</style>

<script>
import mixin from '../widget-mixin'
import OhRollershutter from '../system/oh-rollershutter.vue'
import { OhRollershutterCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhRollershutter
  },
  widget: OhRollershutterCardDefinition,
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
