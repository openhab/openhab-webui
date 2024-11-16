<template>
  <oh-card :context="context">
    <template #content-root>
      <f7-card-content ref="cardContent" @click.native="performAction" @taphold.native="onTaphold($event)" @contextmenu.native="onContextMenu($event)" :class="['label-card-content', (config.vertical ? 'vertical-arrangement' : ''), ...(Array.isArray(config.contentClass) ? config.contentClass : [])]" :style="{ background: config.background, ...config.contentStyle }">
        <oh-trend v-if="config.trendItem" :key="'trend' + config.item" class="trend" :width="($refs.cardContent) ? $refs.cardContent.$el.clientWidth : 0" :context="context" />
        <f7-list>
          <f7-list-item :link="config.action ? true : false" no-chevron>
            <oh-icon slot="media" v-if="config.icon" :icon="config.icon" :height="config.iconSize || 32" :width="config.iconSize || 32" :state="(config.item && config.iconUseState) ? context.store[config.item].state : null" :color="config.iconColor" />
            <div v-if="config.label || config.item" :class="config.class">
              <span :style="{ 'font-size': config.fontSize || '24px', 'font-weight': config.fontWeight || 'normal' }">
                {{ label }}
              </span>
            </div>
          </f7-list-item>
        </f7-list>
        <!-- <f7-link class="label-link" v-if="config.action">{{context.store[config.item].displayState || context.store[config.item].state}}</f7-link> -->
        <!-- <h2>{{context.store[config.item].displayState || context.store[config.item].state}}</h2> -->
      </f7-card-content>
    </template>
  </oh-card>
</template>

<style lang="stylus">
.label-card-content
  .item-content
    padding 1rem
  &.vertical-arrangement
    .item-content
      flex-direction column
      padding-left 0
      padding-right 0
  .item-inner
    padding 0 !important
    justify-content center !important
    text-align center
    --f7-list-item-media-margin 0
  .trend
    position absolute
    left 0
    top 0
    width 100%
    height 100%
    opacity 0.2
</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhTrend from '../system/oh-trend'
import { OhLabelCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhCard,
    OhTrend
  },
  widget: OhLabelCardDefinition,
  computed: {
    label () {
      return this.config.label || this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
    }
  }
}
</script>
