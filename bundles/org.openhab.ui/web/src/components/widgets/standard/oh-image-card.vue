<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content :padding="false" class="oh-image-card">
      <f7-list v-if="config.action" class="image-link">
        <f7-list-item class="oh-image-clickable" link="#" no-chevron @click="performAction">
          <oh-image slot="content-start" :context="childContext(context.component)" />
        </f7-list-item>
      </f7-list>
      <oh-image v-else :context="childContext(context.component)" />
    </f7-card-content>
    <oh-card-footer v-if="config.footer" :texts="config.footer" />
  </f7-card>
</template>

<style lang="stylus">
.oh-image-clickable
  --f7-list-item-padding-horizontal: 0px
.oh-image-card
  .oh-image
    margin-top 5px
    margin-left 5px
    margin-right 5px
    width calc(100% - 10px)
  .image-link
    .item-inner
      display none
    .oh-image
      margin-bottom 5px
</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import OhImage from '../system/oh-image.vue'
import OhCardFooter from '../system/oh-card-footer.vue'
import { OhImageCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhImage,
    OhCardFooter
  },
  widget: OhImageCardDefinition
}
</script>
