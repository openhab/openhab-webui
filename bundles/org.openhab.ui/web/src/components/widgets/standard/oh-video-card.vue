<template>
  <oh-card :context="context" :content-class="['oh-video-card', 'no-padding']">
    <template #content>
      <oh-video :context="childContext(context.component)" />
    </template>
  </oh-card>
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
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhVideo from '../system/oh-video.vue'
import { OhVideoCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhVideo
  },
  widget: OhVideoCardDefinition
}
</script>
