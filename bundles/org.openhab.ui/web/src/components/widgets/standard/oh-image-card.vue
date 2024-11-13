<template>
  <oh-card :context="context" :content-class="['oh-image-card', 'no-padding']">
    <template #content-root>
      <f7-card-content :style="config.contentStyle" :class="[ ...(Array.isArray(config.contentClass) ? config.contentClass : []), 'oh-image-card', (config.action ? '' : 'no-padding')]">
        <f7-list v-if="config.action" class="image-link">
          <f7-list-item class="oh-image-clickable" link="#" no-chevron @click="performAction">
            <oh-image slot="content-start" :context="childContext(context.component)" />
          </f7-list-item>
        </f7-list>
        <oh-image v-else :context="childContext(context.component)" />
      </f7-card-content>
    </template>
  </oh-card>
</template>

<style lang="stylus">
.oh-image-card-clickable
  --f7-list-item-padding-horizontal: 0px
.oh-image-card
  .oh-image
    margin-top 5px
    margin-left 5px
    margin-right 5px
    width calc(100% - 10px)
  .image-link
    .item-content
      padding 0
    .item-inner
      display none
    .oh-image
      margin-bottom 5px
</style>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import { actionsMixin } from '../widget-actions'
import OhImage from '../system/oh-image.vue'
import { OhImageCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhCard,
    OhImage
  },
  widget: OhImageCardDefinition
}
</script>
