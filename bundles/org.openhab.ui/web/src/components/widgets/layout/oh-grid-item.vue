<template>
  <grid-item v-if="visible"
             v-bind="$attrs"
             class="oh-grid-item card no-margin"
             @moved="movedEvent"
             @resized="resizedEvent"
             dragAllowFrom=".drag-handle">
    <template v-if="context.editmode">
      <f7-link :popover-open="'.item-popover-' + _uid" class="configure-item-menu">
        <f7-icon f7="gear_alt" />
      </f7-link>
      <f7-popover :class="'item-popover-' + _uid"
                  ref="popover"
                  :backdrop="false"
                  :style="{ width: context.component.slots.default.length > 0 ? '208px' : '76px' }"
                  :animate="false">
        <div class="display-flex margin justify-content-center">
          <f7-link v-if="context.component.slots.default.length > 0"
                   href="#"
                   class="text-color-blue display-flex flex-direction-column margin-right"
                   :popover-close="'.item-popover-' + _uid"
                   @click="($refs.popover.f7Popover.close(false), context.editmode.configureWidget(context.component.slots.default[0], context))"
                   icon-f7="square_pencil">
            Configure
          </f7-link>
          <f7-link v-if="context.component.slots.default.length > 0"
                   href="#"
                   class="text-color-blue display-flex flex-direction-column margin-right"
                   :popover-close="'.item-popover-' + _uid"
                   @click="$refs.popover.f7Popover.close(false); context.editmode.editWidgetCode(context.component.slots.default[0], context)"
                   icon-f7="doc_text">
            YAML
          </f7-link>
          <f7-link href="#"
                   class="text-color-red display-flex flex-direction-column"
                   @click="$refs.popover.f7Popover.close(false); context.editmode.removeWidget(context.component, context.parent, 'grid')"
                   icon-f7="trash">
            Remove
          </f7-link>
        </div>
      </f7-popover>
    </template>
    <oh-placeholder-widget v-if="context.editmode && !context.component.slots.default.length"
                           @click="context.editmode.addWidget(context.component, null, context.parent)"
                           class="oh-grid-item-content" />
    <generic-widget-component v-else-if="context.component.slots.default.length"
                              @command="onCommand"
                              class="oh-grid-item-content"
                              :context="childContext(context.component.slots.default[0])"
                              :style="{ overflow: context.editmode ? 'visible' : 'hidden' }" />

    <f7-icon v-if="context.editmode" class="drag-handle" f7="move" />
  </grid-item>
</template>

<style lang="stylus">
.oh-grid-item
  // TODO: revise
  touch-action none
  transition all 0s ease 0s !important

  .oh-grid-item-content
    width 100%                // use full width and
    height 100%               // height of item
    margin 0                  // without any margin
    box-sizing border-box     // include padding
    touch-action manipulation

    &.card
      display flex            // use flexbox to distribute card elements
      flex-direction column   // from top to bottom
      .card-content           // with content centered
        margin-top auto       // independent of presence
        margin-bottom auto    // of header or footer

        // oh-swiper-card
        .swiper-container .placeholder-widget
          margin 0
          height 100%
          width 100%
        .oh-swiper-slide.edit-mode
          min-height 0

      // oh-image-card
      .oh-image-card, .oh-gauge-card
        flex 1
        overflow hidden
        *
          height 100%

        .oh-image
          object-fit contain
          height calc(100% - 10px)

  .placeholder-widget a
    height 100%
    padding 0
    display flex

  .vue-resizable-handle       // replace default handle by gray handle
    width 30px
    height 30px
    background-image url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNnB4IiBoZWlnaHQ9IjZweCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6I2ZmZmZmZjAwIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA2IDYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTYgNmgtNnYtMS44aDQuMnYtNC4yaDEuOHoiIGZpbGw9IiM4ZThlOTMiLz48L3N2Zz4=')
    z-index 10000             // always on top
    touch-action none
  .configure-item-menu
    position absolute
    top 0px
    right 0px
    padding 2px
    color gray
    z-index 10000
    i
      font-size 18px
      height 30px
      width 30px
      text-align right
  .drag-handle                // show drag handle on upper left corner
    font-size 15px !important
    width 30px
    height 30px
    text-align left
    position absolute !important
    top 0px
    left 0px
    padding 2px
    color gray
    z-index 10000
    touch-action none
  .configure-grid-menu        // show menu icon on upper right corner
    position absolute
    top 2px
    right 2px
    .menu-inner
      padding 0px
    .menu-inner:after
      width 0px
[class*="item-popover-"]      // nicer popover list icons
  --f7-popover-border-radius 12px
  --f7-popover-box-shadow 0 3px 14px rgb(0 0 0 / 40%)
</style>

<script>
import { defineAsyncComponent } from 'vue'

import mixin from '../widget-mixin'
import OhPlaceholderWidget from '../layout/oh-placeholder-widget.vue'

export default {
  mixins: [mixin],
  components: {
    'grid-item': defineAsyncComponent(() => import('grid-layout-plus').then((mod) => mod.GridItem)),
    OhPlaceholderWidget
  },
  methods: {
    movedEvent (i, newX, newY) {
      this.context.component.config.x = newX
      this.context.component.config.y = newY
    },
    resizedEvent (i, newH, newW, newHPx, newWPx) {
      this.context.component.config.w = newW
      this.context.component.config.h = newH
    }
  }
}
</script>
