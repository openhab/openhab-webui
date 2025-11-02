<template>
  <f7-card v-if="visible"
           expandable
           ref="card"
           class="model-card"
           :class="type + '-card'"
           :animate="uiOptionsStore.disableExpandableCardAnimation ? false : true"
           card-tablet-fullscreen
           @card:opened="cardOpening"
           @card:closed="cardClosed">
    <f7-card-content :padding="false">
      <div :class="(!backgroundImageUrl) ? `bg-color-${color}` : undefined" :style="{ height: `calc(var(--f7-safe-area-top) + ${headerHeight})` }">
        <f7-card-header :text-color="config.invertText ? 'black' : 'white'" class="display-block card-header" :style="{ height: `calc(var(--f7-safe-area-top) + ${headerHeight})` }">
          <img v-if="config.backgroundImage"
               class="card-background lazy"
               :src="backgroundImageUrl"
               :style="config.backgroundImageStyle">
          <slot name="header">
            <div v-if="context && context.component.slots && context.component.slots.header">
              <generic-widget-component :context="childContext(slotComponent)"
                                        v-for="(slotComponent, idx) in context.component.slots.header"
                                        :key="'header-' + idx" />
            </div>
            <div v-else>
              <div class="title">
                {{ title }}
              </div>
              <div v-if="subtitle" class="subtitle">
                <small>{{ subtitle || '&nbsp;' }}</small>
              </div>
            </div>
          </slot>
          <slot name="glance" />
        </f7-card-header>
        <f7-link
          card-close
          color="white"
          class="card-opened-fade-in card-close-button"
          icon-f7="multiply_circle_fill" />
      </div>
      <div v-if="opened">
        <slot />
      </div>
    </f7-card-content>
  </f7-card>
</template>

<style lang="stylus">
.model-card
  --card-offset calc(40px + var(--f7-safe-area-left) + var(--f7-safe-area-right))
  --card-width calc(100% - var(--f7-safe-area-left) - var(--f7-safe-area-right) - 40px)
  .card-close-button
    position absolute
    top calc(16px + var(--f7-safe-area-top))
    right calc(var(--f7-card-content-padding-horizontal) + var(--f7-safe-area-right))
  .media-list
    margin-top 0 !important
  &.invert-text
  .card-background
    position absolute
    left 0
    top 0
    width 100%
    height 100%
    object-fit cover
    object-position center
    z-index -1
    background-color #ccc
    transform translateX(calc(-1*var(--card-offset)/2))
  &.card-opening, &.card-opened
    .card-header
      padding-top calc(var(--f7-card-header-padding-vertical) + var(--f7-safe-area-top))
  &.card-opening, &.card-closing, &.card-transitioning
    transition-duration 300ms
  &.card-opening
    .card-content, .card-header
      transition-duration 350ms
  &.card-closing
    .card-content, .card-header
      transition-duration 400ms
  &.card-opening, &.card-opened, &.card-closing
    .card-background
      transition-duration 400ms
  &.card-opening, &.card-opened
    .card-background
      transform translateX(0)

  .title
    max-width calc(340px - 2*var(--f7-card-header-padding-horizontal))
  .subtitle
    max-width calc(340px - 2*var(--f7-card-header-padding-horizontal))
    font-weight normal
    font-size normal
    line-height 0.7
@media (min-width: 768px)
  .model-card
    --card-offset calc(675px - 200px + var(--f7-safe-area-left) + var(--f7-safe-area-right))
</style>

<script>
import { mapStores } from 'pinia'
import CardMixin from './card-mixin'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export default {
  mixins: [CardMixin],
  props: {
    headerHeight: [String, Number]
  },
  computed: {
    ...mapStores(useUIOptionsStore)
  },
  asyncComputed: {
    backgroundImageUrl () {
      if (this.config.backgroundImage) {
        return this.$oh.media.getImage(this.config.backgroundImage)
      } else {
        return Promise.resolve(null)
      }
    }
  }
}
</script>
