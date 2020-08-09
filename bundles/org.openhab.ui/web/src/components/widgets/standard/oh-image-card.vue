<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{config.title}}</div>
    </f7-card-header>
    <f7-card-content :padding="false" class="oh-image-card">
      <f7-list v-if="config.action">
        <f7-list-item class="oh-image-clickable" link="#" no-chevron @click="performAction">
          <oh-image slot="content-start" :context="childContext(context.component)" />
        </f7-list-item>
      </f7-list>
      <oh-image v-else :context="childContext(context.component)" />
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{config.footer}}
    </f7-card-footer>
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
</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import OhImage from '../system/oh-image.vue'
import { OhImageCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhImage
  },
  widget: OhImageCardDefinition
}
</script>
