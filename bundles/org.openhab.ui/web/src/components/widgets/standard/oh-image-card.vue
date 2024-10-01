<template>
  <oh-card :context="context" :content-class="['oh-image-card', 'no-padding']">
    <template #content>
      <oh-image class="oh-image" :context="childContext(context.component)" />
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
