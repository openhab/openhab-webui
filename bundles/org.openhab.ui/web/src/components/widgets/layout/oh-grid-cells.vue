<template>
  <div>
    <hr v-if="context.editmode" style="opacity: 0.5; border-top: 1px #777 dashed">
    <div width="100%" v-if="context.editmode">
      <f7-menu class="configure-layout-menu padding-horizontal">
        <f7-menu-item style="margin-left: auto" icon-f7="rectangle_grid_2x2" dropdown>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut" />
            <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy" />
            <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-col'"
                                   @click="context.editmode.pasteWidget(context.component, context.parent)"
                                   href="#"
                                   text="Paste" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Up" />
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Down" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Cells" />
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
    </div>
    <MasonryGrid v-if="visible" :columns="config.cols || { default: 5, 1400: 4, 1280: 3, 576: 3, 480: 2 }">
      <MasonryGridItem v-for="(slotComponent, idx) in context.component.slots.default"
                       :key="idx"
                       class="oh-cell-container">
        <f7-menu v-if="context.editmode" class="configure-layout-menu margin-bottom">
          <f7-menu-item style="margin-left: auto"
                        icon-f7="slider_horizontal_below_rectangle"
                        dropdown
                        @menu:opened="dropdownMenuOpened = idx"
                        @menu:closed="dropdownMenuOpened = null">
            <f7-menu-dropdown right>
              <f7-menu-dropdown-item @click="context.editmode.configureWidget(slotComponent, context)" href="#" text="Configure Cell" />
              <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(slotComponent, context)" href="#" text="Edit YAML" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.cutWidget(slotComponent, context)" href="#" text="Cut" />
              <f7-menu-dropdown-item @click="context.editmode.copyWidget(slotComponent, context)" href="#" text="Copy" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(slotComponent, context)" href="#" text="Move Up" />
              <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(slotComponent, context)" href="#" text="Move Down" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="context.editmode.removeWidget(slotComponent, context)" href="#" text="Remove cell" />
            </f7-menu-dropdown>
          </f7-menu-item>
        </f7-menu>
        <generic-widget-component v-bind="$attrs" :context="childContext(slotComponent)" />
      </MasonryGridItem>
      <MasonryGridItem>
        <oh-placeholder-widget v-if="context.editmode"
                               class="cell-placeholder placeholder"
                               @click="context.editmode.addWidget(context.component, null, context.parent)" />
      </MasonryGridItem>
    </MasonryGrid>
  </div>
</template>

<style lang="stylus">
.oh-cell-container
  display block
  --oh-default-cell-tablet-width var(--f7-card-expandable-tablet-width)
  .configure-layout-menu
    position relative
    right 0
    top 10px
    z-index 1000
.cell-placeholder
  margin-top calc(var(--f7-menu-item-height) + var(--f7-card-expandable-margin-vertical)) !important
  height 120px
  margin-left 3px
  margin-right 3px
  width calc(100% - 6px)
  .button
    height 120px
    padding 35px
</style>

<script>
import mixin from '../widget-mixin'
import OhPlaceholderWidget from './oh-placeholder-widget.vue'
import { MasonryGrid, MasonryGridItem } from '../../../components/vue3-masonry-css'

export default {
  mixins: [mixin],
  components: {
    OhPlaceholderWidget,
    MasonryGrid,
    MasonryGridItem
  }
}
</script>
