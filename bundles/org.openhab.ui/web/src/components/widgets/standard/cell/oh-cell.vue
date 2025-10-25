<template>
  <f7-card ref="card"
           :expandable="true"
           class="card-prevent-open oh-cell"
           :swipeToClose="!(noSwipeToClose || config.swipeToClose === false)"
           :backdrop="config.backdrop === undefined || config.backdrop"
           :animate="(config.animate === false || uiOptionsStore.expandableCardAnimation === 'disabled') ? false : undefined"
           @card:open="cellOpen"
           @card:opened="cellOpened"
           @card:close="cellClose"
           @card:closed="cellClosed">
    <slot name="background">
      <div v-if="context.component.slots && context.component.slots.background">
        <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.background"
                                  :context="childContext(slotComponent)"
                                  :key="'background-' + idx"
                                  @command="onCommand" />
      </div>
      <oh-trend v-else-if="config.trendItem"
                :key="'trend' + config.item"
                class="trend card-opened-fade-out"
                :width="trendWidth"
                :context="context" />
      <div v-else class="cell-background" :class="[(config.color) ? 'bg-color-' + config.color : '', { on: isOn }, { 'card-opened-fade-out': !config.keepColorWhenOpened }]" />
    </slot>
    <f7-link v-show="!opened && hasExpandedControls && hasAction"
             icon-f7="ellipsis_vertical"
             icon-size="30"
             @click="openCell"
             class="float-right cell-open-button card-opened-fade-out no-ripple" />
    <f7-card-content ref="cell" class="cell-contents">
      <f7-card-header class="cell-button card-opened-fade-out no-padding" v-show="!opened">
        <slot name="header">
          <f7-list media-list>
            <div v-if="context.component.slots && context.component.slots.header">
              <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.header"
                                        :context="childContext(slotComponent)"
                                        :key="'header-' + idx"
                                        @command="onCommand" />
            </div>
            <f7-list-item v-else
                          media-item
                          :subtitle="config.subtitle"
                          :footer="config.footer">
              <template v-if="header" #header>
                <div class="button-header display-flex">
                  <oh-icon v-if="config.icon"
                           class="header-icon"
                           :icon="config.icon"
                           :color="config.iconColor"
                           width="20"
                           height="20" />
                  <span class="header-text">{{ header }}</span>
                  <f7-badge v-if="config.headerBadge" :color="config.headerBadgeColor">
                    {{ config.headerBadge }}
                  </f7-badge>
                </div>
              </template>
              <template v-if="config.title" #title>
                <div class="button-header display-flex">
                  <oh-icon v-if="!header && config.icon"
                           class="header-icon"
                           :icon="config.icon"
                           :color="config.iconColor"
                           width="20"
                           height="20" />
                  <span class="header-text">{{ config.title }}</span>
                  <f7-badge v-if="config.headerBadge" :color="config.headerBadgeColor">
                    {{ config.headerBadge }}
                  </f7-badge>
                </div>
              </template>
            </f7-list-item>
          </f7-list>
        </slot>
      </f7-card-header>
      <f7-link class="card-opened-fade-in cell-close-button float-right"
               icon-size="30"
               icon-f7="multiply_circle_fill"
               @click="closeCell" />
      <f7-card-header v-if="opened" class="cell-expanded-header card-opened-fade-in display-flex flex-direction-column">
        <div class="text-align-center cell-expanded-title">
          {{ config.title }}
        </div>
        <div class="text-align-center cell-expanded-subtitle">
          {{ config.subtitle }}
        </div>
        <div class="text-align-center cell-expanded-footer">
          {{ config.footer }}
        </div>
      </f7-card-header>
      <div v-if="opened" class="cell-expanded-contents card-opened-fade-in display-flex flex-direction-column align-items-center">
        <slot>
          <div v-if="context.component.slots && context.component.slots.default">
            <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.default"
                                      :context="childContext(slotComponent)"
                                      :key="'default-' + idx"
                                      @command="onCommand" />
          </div>
        </slot>
      </div>
    </f7-card-content>
  </f7-card>
</template>

<style lang="stylus">
.oh-cell
  --f7-card-expandable-tablet-border-radius 2px
  --f7-card-expandable-box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15)
  --f7-card-expandable-margin-horizontal 5px
  --f7-card-expandable-margin-vertical 10px
  height 120px
  min-height 120px
  max-height 120px
  // margin 4px !important
  user-select none
  .trend
    position absolute
    left 0
    top 0
    width 100%
    height 100%
    filter opacity(20%)
  .cell-background
    cursor pointer !important
    position absolute
    top 0
    bottom 0
    width 100%
    opacity 0
    &.on
      opacity 0.5
      transition-duration 0.25s
  .cell-open-button
    opacity 0.6
    margin 5px !important
  .cell-open-button, .cell-close-button
    margin-top var(--f7-safe-area-top)
    --f7-theme-color var(--f7-text-color)
  .cell-contents
    height 100%
    width 100%
    .cell-button
      cursor pointer !important
      position absolute
      .item-content
        padding 0
        .item-inner
          padding 0
      .button-header
        padding-bottom 0.3rem
        line-height 20px
        .header-icon
          margin-right 5px
    .cell-expanded-header
      margin-top calc(var(--f7-safe-area-top) + 2rem)
      font-weight 500
      .cell-expanded-subtitle
        font-size 20px
        opacity 0.7
        font-weight 600
      .cell-expanded-footer
        font-size 18px
        opacity 0.4
        font-weight 400
</style>

<script>
import { utils } from 'framework7'
import { f7 } from 'framework7-vue'
import { mapStores } from 'pinia'

import mixin from '../../widget-mixin'
import { actionsMixin } from '../../widget-actions'
import { OhCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhTrend from '../../system/oh-trend.vue'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhTrend
  },
  widget: OhCellDefinition,
  props: {
    noSwipeToClose: Boolean,
    state: String
  },
  data () {
    return {
      transitioning: false,
      opened: false,
      cardId: utils.id()
    }
  },
  mounted () {
    this.$$(this.$refs.card.$el).on('click', this.click)
    this.$$(this.$refs.card.$el).on('taphold', this.openCell)
    this.$$(this.$refs.card.$el).on('contextmenu', this.openCell)
    window.addEventListener('popstate', this.back)
  },
  beforeUnmount () {
    this.$$(this.$refs.card.$el).off('click')
    this.$$(this.$refs.card.$el).off('taphold')
    this.$$(this.$refs.card.$el).off('contextmenu')
    window.removeEventListener('popstate', this.back)
  },
  computed: {
    header () {
      if (this.config.header) return this.config.header
      if (this.config.item && this.config.stateAsHeader) {
        if (this.state) return this.state
        return this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
      }
      return null
    },
    hasExpandedControls () {
      return this.config.expandable !== false && (this.context.component.component !== 'oh-cell' ||
        (this.context.component.slots && this.context.component.slots.default && this.context.component.slots.default.length > 0))
    },
    isOn () {
      if (this.config.on !== undefined) return this.config.on
      if (this.config.item) {
        const itemState = this.context.store[this.config.item].state
        if (itemState === 'ON') return true
        if (itemState === 'OFF') return false
        const stateParts = itemState.split(',')
        if (stateParts.length === 3) {
          return (parseFloat(stateParts[2]) > 0)
        } else {
          if (!isNaN(parseFloat(stateParts[0]))) return parseFloat(stateParts[2]) > 0
        }
        return stateParts[0]
      }
      return false
    },
    trendWidth () {
      return this.$refs.cardContent ? this.$refs.cardContent.$el.clientWidth : 0
    },
    ...mapStores(useUIOptionsStore)
  },
  methods: {
    click (evt) {
      if (evt.target && evt.target.parentElement &&
        (this.$$(evt.target.parentElement).hasClass('cell-open-button') ||
        this.$$(evt.target.parentElement).hasClass('cell-close-button'))) {
        return
      }
      if (this.opened) return
      if (this.hasAction) {
        this.performAction()
      } else {
        this.openCell()
      }
      return false
    },
    openCell (evt) {
      if (evt && evt.preventDefault) evt.preventDefault()
      if (this.context.editmode) return false
      if (!this.hasExpandedControls) return false
      f7.card.open(this.$refs.card.$el)
      history.pushState({ cardId: this.cardId }, null, window.location.href.split('#cell=')[0] + '#' + f7.utils.serializeObject({ cell: this.cardId }))
      return false
    },
    closeCell () {
      if (this.context.editmode) return
      setTimeout(() => { f7.card.close(this.$refs.card.$el) }, 100)
    },
    cellOpen () {
      this.transitioning = true
    },
    cellOpened () {
      this.transitioning = false
      this.opened = true
    },
    cellClose () {
      if (history.state.cardId && history.state.cardId === this.cardId) history.back()
      this.transitioning = true
      this.opened = false
    },
    cellClosed () {
      this.transitioning = false
    },
    back (evt) {
      if (this.opened) this.closeCell()
    }
  }
}
</script>
