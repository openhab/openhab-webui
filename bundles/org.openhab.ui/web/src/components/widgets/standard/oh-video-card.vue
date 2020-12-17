<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content :padding="false" class="oh-video-card">
      <oh-video :context="childContext(context.component)" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
.oh-video-card
  min-height 150px
  border-radius var(--f7-card-border-radius)
  overflow: hidden
  .oh-video
    margin-top 5px
    margin-left 5px
    margin-right 5px
    width calc(100% - 10px)
</style>

<script>
import mixin from '../widget-mixin'
import OhVideo from '../system/oh-video.vue'
import { OhVideoCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhVideo
  },
  widget: OhVideoCardDefinition
}
</script>
