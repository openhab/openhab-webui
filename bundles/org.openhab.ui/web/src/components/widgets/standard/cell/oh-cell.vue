<template>
  <f7-card ref="card" :expandable="true" class="card-prevent-open oh-cell"
      :swipeToClose="!(noSwipeToClose || config.swipeToClose === false)"
      :animate="(config.animate === false || $f7.data.themeOptions.expandableCardAnimation === 'disabled') ? false : undefined"
      @card:open="cellOpen" @card:opened="cellOpened" @card:close="cellClose" @card:closed="cellClosed">
    <div class="cell-background" :class="[(config.color) ? 'bg-color-' + config.color : '', { 'on': config.on }, { 'card-opened-fade-out': !config.keepColorWhenOpened }]" />
    <f7-link v-show="!opened && !transitioning && hasExpandedControls && !$f7.support.touch && config.action" icon-f7="ellipsis_circle" icon-size="30" @click.native="openCell" class="float-right cell-open-button card-opened-fade-out no-ripple" />
    <f7-card-content ref="cell" class="cell-contents">
      <f7-card-header class="cell-button card-opened-fade-out no-padding" v-show="!opened">
        <f7-list media-list>
          <f7-list-item media-item :title="config.title" :subtitle="config.subtitle" :footer="config.footer">
            <div slot="header" class="button-header display-flex">
              <f7-icon class="header-icon" v-if="config.buttonIcon" :f7="config.buttonIcon" size="20"></f7-icon>
              <span class="header-text">{{header}}</span>
              <f7-badge v-if="config.headerBadge" color="config.headerBadgeColor">{{config.headerBadge}}</f7-badge>
            </div>
          </f7-list-item>
        </f7-list>
      </f7-card-header>
      <f7-link class="card-opened-fade-in cell-close-button float-right" icon-size="30" icon-f7="multiply_circle_fill" @click.native="closeCell" />
      <f7-card-header v-if="opened" class="cell-expanded-header card-opened-fade-in display-flex flex-direction-column">
        <div class="text-align-center">{{config.title}}</div>
        <div class="text-align-center text-color-gray">{{config.subtitle}}</div>
        <div class="text-align-center text-color-gray"><small>{{config.footer}}</small></div>
      </f7-card-header>
      <div v-if="opened" class="cell-expanded-contents card-opened-fade-in display-flex flex-direction-column align-items-center">
        <slot>
          <div v-if="context.component.slots && context.component.slots.default">
            <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.default" :key="'default-' + idx" @command="onCommand" />
          </div>
        </slot>
      </div>
    </f7-card-content>
  </f7-card>
</template>

<style lang="stylus">
.oh-cell
  --f7-card-expandable-tablet-border-radius 2px
  height 120px
  min-height 120px
  max-height 120px
  // margin 4px !important
  user-select none
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
</style>

<script>
import mixin from '../../widget-mixin'
import { actionsMixin } from '../../widget-actions'
import { OhCellDefinition } from '@/assets/definitions/widgets/standard/cells'

export default {
  mixins: [mixin, actionsMixin],
  widget: OhCellDefinition,
  props: ['noSwipeToClose'],
  data () {
    return {
      transitioning: false,
      opened: false
    }
  },
  mounted () {
    this.$$(this.$refs.card.$el).on('click', this.click)
    this.$$(this.$refs.card.$el).on('dblclick', this.openCell)
    this.$$(this.$refs.card.$el).on('contextmenu', this.openCell)
  },
  beforeDestroy () {
    this.$$(this.$refs.card.$el).off('click')
    this.$$(this.$refs.card.$el).off('taphold')
    this.$$(this.$refs.card.$el).off('contextmenu')
  },
  computed: {
    header () {
      if (this.config.header) return this.config.header
      if (this.config.item && this.config.stateAsHeader) {
        return this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
      }
      return null
    },
    hasExpandedControls () {
      return this.context.component.component !== 'oh-cell' ||
        (this.context.component.slots && this.context.component.slots.default && this.context.component.slots.default.length > 0)
    }
  },
  methods: {
    click (evt) {
      if (evt.target && evt.target.parentElement &&
        (this.$$(evt.target.parentElement).hasClass('cell-open-button') ||
        this.$$(evt.target.parentElement).hasClass('cell-close-button'))) {
        return
      }
      if (this.opened) return
      if (this.config.action) {
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
      this.$f7.card.open(this.$refs.card.$el)
      return false
    },
    closeCell () {
      if (this.context.editmode) return
      setTimeout(() => { this.$f7.card.close(this.$refs.card.$el) }, 100)
    },
    cellOpen () {
      this.transitioning = true
    },
    cellOpened () {
      this.transitioning = false
      this.opened = true
    },
    cellClose () {
      this.transitioning = true
      this.opened = false
    },
    cellClosed () {
      this.transitioning = false
    }
  }
}
</script>
