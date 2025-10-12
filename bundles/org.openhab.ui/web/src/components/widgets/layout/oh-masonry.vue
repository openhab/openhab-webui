<template>
  <div>
    <f7-menu v-if="context.editmode" class="configure-layout-menu margin-bottom">
      <f7-menu-item style="margin-left: auto" icon-f7="rectangle_grid_3x2" dropdown>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context)" href="#" text="Configure Masonry" />
          <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context)" href="#" text="Edit YAML" />
          <f7-menu-dropdown-item v-if="context.clipboardtype && context.clipboardtype !== 'oh-block' && context.clipboardtype !== 'oh-grid-row' && context.clipboardtype !== 'oh-grid-col'"
                                 @click="context.editmode.pasteWidget(context.component, context.parent)"
                                 href="#"
                                 text="Paste" />
          <f7-menu-dropdown-item divider />
          <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent, 'masonry')" href="#" text="Remove Masonry" />
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <div v-if="config.flavor === 'css-grid'" class="oh-masonry">
      <div v-for="(slotComponent, idx) in context.component.slots.default"
           :key="idx"
           class="oh-masonry-item"
           :style="{ 'min-height': dropdownMenuOpened === idx ? 'calc(10 * var(--f7-menu-dropdown-item-height))' : undefined, 'z-index': 100 - context.component.slots.default.indexOf(slotComponent) }">
        <f7-menu v-if="context.editmode" class="configure-layout-menu">
          <f7-menu-item style="margin-left: auto"
                        icon-f7="slider_horizontal_below_rectangle"
                        dropdown
                        @menu:opened="dropdownMenuOpened = idx"
                        @menu:closed="dropdownMenuOpened = null">
            <f7-menu-dropdown right>
              <f7-menu-dropdown-item @click="context.editmode.configureWidget(slotComponent, context)" href="#" text="Configure Widget" />
              <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(slotComponent, context)" href="#" text="Edit YAML" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.cutWidget(slotComponent, context)" href="#" text="Cut" />
              <f7-menu-dropdown-item @click="context.editmode.copyWidget(slotComponent, context)" href="#" text="Copy" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(slotComponent, context)" href="#" text="Move Up" />
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(slotComponent, context)" href="#" text="Move Down" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.removeWidget(slotComponent, context)" href="#" text="Remove Widget" />
            </f7-menu-dropdown>
          </f7-menu-item>
        </f7-menu>
        <generic-widget-component :context="childContext(slotComponent)" v-on="$listeners" />
      </div>
      <oh-placeholder-widget v-if="context.editmode"
                             class="oh-column-item placeholder"
                             @click="context.editmode.addWidget(context.component, null, context.parent)" />
    </div>
    <masonry v-else :cols="config.cols || {default: 5, 1400: 4, 1280: 3, 1023: 4, 768: 3, 576: 2, 480: 1}">
      <div v-for="(slotComponent, idx) in context.component.slots.default" :key="idx" class="oh-masonry-item">
        <f7-menu v-if="context.editmode" class="configure-layout-menu">
          <f7-menu-item style="margin-left: auto"
                        icon-f7="slider_horizontal_below_rectangle"
                        dropdown
                        @menu:opened="dropdownMenuOpened = idx"
                        @menu:closed="dropdownMenuOpened = null">
            <f7-menu-dropdown right>
              <f7-menu-dropdown-item @click="context.editmode.configureWidget(slotComponent, context)" href="#" text="Configure Widget" />
              <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(slotComponent, context)" href="#" text="Edit YAML" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.cutWidget(slotComponent, context)" href="#" text="Cut" />
              <f7-menu-dropdown-item @click="context.editmode.copyWidget(slotComponent, context)" href="#" text="Copy" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(slotComponent, context)" href="#" text="Move Up" />
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(slotComponent, context)" href="#" text="Move Down" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.removeWidget(slotComponent, context)" href="#" text="Remove Widget" />
            </f7-menu-dropdown>
          </f7-menu-item>
        </f7-menu>
        <generic-widget-component :context="childContext(slotComponent)" v-on="$listeners" />
      </div>
      <oh-placeholder-widget v-if="context.editmode" class="oh-column-item placeholder" @click="context.editmode.addWidget(context.component, null, context.parent)" />
    </masonry>
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import OhPlaceholderWidget from './oh-placeholder-widget.vue'
import { OhMasonryDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin],
  components: {
    OhPlaceholderWidget
  },
  data () {
    return {
      dropdownMenuOpened: null
    }
  },
  widget: OhMasonryDefinition
}
</script>

<style lang="stylus">
.oh-magic-grid
  // columns 6
  --oh-grid-gap: 16px
  margin-left calc(-1 * var(--oh-grid-gap))

.magic-grid-item
  width calc(100% - 2 * var(--oh-grid-gap))

.oh-masonry
  column-count 6
  column-width 300px
  column-gap 0
  margin-left auto
  margin-right auto
  min-height 300px
  .oh-masonry-item
    width 100%
    display inline-block
    .list
      z-index inherit
    &.placeholder
      width calc(100% - 16px)

.menu
  z-index 6000 !important
</style>
