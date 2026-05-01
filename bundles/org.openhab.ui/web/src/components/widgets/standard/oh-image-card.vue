<template>
  <oh-card :context="context" :content-class="['oh-image-card', 'no-padding']">
    <template #content-root>
      <f7-card-content
        :style="config.contentStyle"
        :class="[...(Array.isArray(config.contentClass) ? config.contentClass : []), 'oh-image-card', 'no-padding']">
        <f7-list v-if="hasAction" class="image-link">
          <f7-list-item class="oh-image-clickable" link="#" no-chevron @click="performAction">
            <template #content-start>
              <oh-image :context="cardChildContext(context.component)" />
            </template>
          </f7-list-item>
        </f7-list>
        <oh-image v-else :context="cardChildContext(context.component)" />
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
  .list
    margin 0 !important
</style>

<script>
import { computed } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhImage from '../system/oh-image.vue'
import { OhImageCardDefinition } from '@/assets/definitions/widgets/standard/cards'
import { useWidgetAction } from '@/components/widgets/useWidgetAction.ts'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhImage
  },
  widget: OhImageCardDefinition,
  setup(props) {
    const context = computed(() => props.context)
    const { config, cardChildContext, hasAction, evaluateExpression } = useWidgetContext(context)
    const { performAction } = useWidgetAction(context, config, evaluateExpression)
    return { config, cardChildContext, hasAction, performAction }
  }
}
</script>
