<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content class="padding">
      <oh-input class="input-card-content" :context="childContext(context.component)" @command="onCommand" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">

.input-card-content
  width calc(100% - 2*var(--f7-card-content-padding)) !important
  .input-field
    font-size 1.2rem
</style>

<script>
import mixin from '../widget-mixin'
import OhInput from '../system/oh-input.vue'
import { OhInputCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhInput
  },
  widget: OhInputCardDefinition
}
</script>
