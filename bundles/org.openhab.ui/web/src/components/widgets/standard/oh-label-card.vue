<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content ref="cardContent" @click.native="performAction" @taphold.native="onTaphold($event)" @contextmenu.native="onContextMenu($event)" class="label-card-content" :style="{ background: config.background }" :class="{ 'vertical-arrangement': config.vertical }">
      <oh-trend v-if="config.trendItem" :key="'trend' + config.item" class="trend" :width="($refs.cardContent) ? $refs.cardContent.$el.clientWidth : 0" :context="context" />
      <f7-list>
        <f7-list-item :link="config.action ? true : false" no-chevron>
          <oh-icon slot="media" v-if="config.icon" :icon="config.icon" :height="config.iconSize || 32" :width="config.iconSize || 32" :state="(config.item && config.iconUseState) ? context.store[config.item].state : null" :color="config.iconColor" />
          <div :class="config.class">
            <span :style="{ 'font-size': config.fontSize || '24px', 'font-weight': config.fontWeight || 'normal' }">
              {{ label }}
            </span>
          </div>
        </f7-list-item>
      </f7-list>
      <!-- <f7-link class="label-link" v-if="config.action">{{context.store[config.item].displayState || context.store[config.item].state}}</f7-link> -->
      <!-- <h2>{{context.store[config.item].displayState || context.store[config.item].state}}</h2> -->
    </f7-card-content>
    <f7-card-footer v-if="config.footer">
      {{ config.footer }}
    </f7-card-footer>
  </f7-card>
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
import { OhLabelCardDefinition } from '@/assets/definitions/widgets/standard/cards'

import OhTrend from '../system/oh-trend'

export default {
  mixins: [mixin, actionsMixin],
  components: {
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
