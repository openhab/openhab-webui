<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center">
      <oh-colorpicker :context="context" @command="onCommand" />
    </f7-card-content>
    <oh-card-footer v-if="config.footer" :texts="config.footer" />
  </f7-card>
</template>

<style lang="stylus">
</style>

<script>
import mixin from '../widget-mixin'
import OhColorpicker from '../system/oh-colorpicker.vue'
import OhCardFooter from '../system/oh-card-footer.vue'
import { OhColorpickerCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhColorpicker,
    OhCardFooter
  },
  widget: OhColorpickerCardDefinition,
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
