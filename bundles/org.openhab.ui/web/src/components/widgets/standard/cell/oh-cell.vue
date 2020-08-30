<template>
  <f7-card ref="card" :expandable="true" class="card-prevent-open oh-cell" @card:open="cellOpen" @card:closed="cellClose">
    <div v-show="!opened" style="position: absolute; top: 0; bottom: 0; width: 100%; opacity: 0.5" :class="(!opened && config.on) ? ['bg-color-' + config.color] : []" />
    <f7-card-content ref="cell" class="cell-contents">
      <f7-card-header class="cell-button card-opened-fade-out no-padding" v-show="!opened">
        <f7-list media-list>
          <f7-list-item media-item :title="config.title" :subtitle="config.subtitle" :footer="config.footer">
            <div slot="header" class="button-header display-flex">
              <f7-icon :f7="config.buttonIcon || 'lightbulb'" size="20"></f7-icon>
              <span class="header-text">{{config.header}}</span>
              <f7-badge v-if="config.headerBadge" color="config.headerBadgeColor">{{config.headerBadge}}</f7-badge>
            </div>
          </f7-list-item>
        </f7-list>
      </f7-card-header>
      <f7-link class="card-opened-fade-in card-close cell-close-button float-right" color="gray" icon-size="30" icon-f7="multiply_circle_fill" />
      <f7-card-header class="cell-expanded-header display-flex flex-direction-column">
        <div class="text-align-center">Title</div>
      </f7-card-header>
    </f7-card-content>
  </f7-card>
</template>

<style lang="stylus">
.oh-cell
  --f7-card-expandable-tablet-border-radius 2px
  height 120px
  min-height 120px
  max-height 120px
  touch-action none
  user-select none
  .cell-contents
    height 100%
    width 100%
    .cell-button
      cursor pointer
      .item-content
        padding 0
        .item-inner
          padding 0
      .button-header
        padding-bottom 0.3rem
        line-height 20px
        .header-text
          margin-left 5px
    .cell-close-button
      margin-top var(--f7-safe-area-top)
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
  data () {
    return {
      opened: false
    }
  },
  mounted () {
    this.$$(this.$refs.card.$el).on('click', (ev) => { this.openCell() })
    this.$$(this.$refs.card.$el).on('taphold', (ev) => { this.openCell() })
  },
  beforeDestroy () {
    this.$$(this.$refs.card.$el).off('click')
    this.$$(this.$refs.card.$el).off('taphold')
  },
  methods: {
    clicked (ev) {
      console.dir(ev)
      debugger
    },
    openCell () {
      if (this.context.editmode) return
      this.$f7.card.open(this.$refs.card.$el)
    },
    cellOpen () {
      this.opened = true
    },
    cellClose () {
      this.opened = false
    }
  }
}
</script>
