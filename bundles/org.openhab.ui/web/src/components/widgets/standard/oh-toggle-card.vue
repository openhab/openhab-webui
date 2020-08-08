<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center" style="height: calc(2 * var(--f7-toggle-width))">
      <oh-toggle class="large-vertical-toggle" :context="context" @command="onCommand" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.large-vertical-toggle
  transform scale(2) rotate(-90deg)
  transform-origin center
</style>

<script>
import mixin from '../widget-mixin'
import OhToggle from '../system/oh-toggle.vue'
import { OhToggleCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhToggle
  },
  widget: OhToggleCardDefinition,
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
