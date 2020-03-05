<template>
  <div>
    <f7-menu v-if="context.editmode &&  context.clipboardtype !== 'oh-block' && context.clipboardtype !== 'oh-grid-row' && context.clipboardtype !== 'oh-grid-col'" class="configure-layout-menu">
      <f7-menu-item style="margin-left: auto" icon-f7="rectangle_grid_3x2" dropdown>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item @click="context.editmode.pasteWidget(context.component, context.parent)" href="#" text="Paste"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <magic-grid v-if="config.flavor === 'magic-grid'" class="oh-magic-grid" :gap="16" :maxColWidth="300" :animate="false">
      <template v-slot>
        <generic-widget-component class="magic-grid-item" :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.default" :key="idx" v-on="$listeners" />
      </template>
    </magic-grid>
    <div v-else class="oh-masonry">
      <div v-for="(slotComponent, idx) in context.component.slots.default" :key="idx" class="oh-masonry-item" :style="{ 'min-height': dropdownMenuOpened === idx ? 'calc(10 * var(--f7-menu-dropdown-item-height))' : undefined, 'z-index': 100 - context.component.slots.default.indexOf(slotComponent) }">
        <f7-menu v-if="context.editmode" class="configure-layout-menu">
          <f7-menu-item style="margin-left: auto" icon-f7="slider_horizontal_below_rectangle" dropdown @menu:opened="dropdownMenuOpened = idx" @menu:closed="dropdownMenuOpened = null">
            <f7-menu-dropdown right>
            <f7-menu-dropdown-item @click="context.editmode.configureWidget(slotComponent, context)" href="#" text="Configure Widget"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(slotComponent, context)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.cutWidget(slotComponent, context)" href="#" text="Cut"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.copyWidget(slotComponent, context)" href="#" text="Copy"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(slotComponent, context)" href="#" text="Move Up"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(slotComponent, context)" href="#" text="Move Down"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.removeWidget(slotComponent, context)" href="#" text="Remove Widget"></f7-menu-dropdown-item>
            </f7-menu-dropdown>
          </f7-menu-item>
        </f7-menu>
        <generic-widget-component :context="childContext(slotComponent)" v-on="$listeners" />
      </div>
      <oh-placeholder-widget v-if="context.editmode" class="oh-column-item placeholder" @click="context.editmode.addWidget(context.component, null, context.parent)" />
    </div>
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import OhPlaceholderWidget from './oh-placeholder-widget.vue'

export default {
  mixins: [mixin],
  components: {
    OhPlaceholderWidget
  },
  data () {
    return {
      dropdownMenuOpened: null
    }
  }
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

</style>
