<template>
  <div>
    <f7-menu v-if="context.editmode && context.clipboardtype" class="configure-layout-menu">
      <f7-menu-item style="margin-left: auto" icon-f7="rectangle_grid_3x2" dropdown>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item v-if="clipboardtype !== 'oh-block' && clipboardtype !== 'oh-grid-row' && clipboardtype !== 'oh-grid-col'" @click="$emit('paste-widget', context.component, context.parent)" href="#" text="Paste"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <magic-grid v-if="config.flavor === 'magic-grid'" class="oh-magic-grid" :gap="16" :maxColWidth="300" :animate="false">
      <template v-slot>
        <generic-widget-component class="magic-grid-item" :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.default" :key="idx" @command="onCommand" />
      </template>
    </magic-grid>
    <div v-else class="oh-columns-grid">
      <div v-for="(slotComponent, idx) in context.component.slots.default" :key="idx" class="oh-column-item">
        <f7-menu v-if="context.editmode" class="configure-layout-menu">
          <f7-menu-item style="margin-left: auto" icon-f7="slider_horizontal_below_rectangle" dropdown>
            <f7-menu-dropdown right>
            <f7-menu-dropdown-item @click="$emit('configure-widget', slotComponent, context)" href="#" text="Configure Widget"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="$emit('cut-widget', slotComponent, context)" href="#" text="Cut"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="$emit('copy-widget', slotComponent, context)" href="#" text="Copy"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="$emit('move-widget-up', slotComponent, context)" href="#" text="Move Up"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="$emit('move-widget-down', slotComponent, context)" href="#" text="Move Down"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="$emit('remove-widget', slotComponent, context)" href="#" text="Remove Widget"></f7-menu-dropdown-item>
            </f7-menu-dropdown>
          </f7-menu-item>
        </f7-menu>
        <generic-widget-component :context="childContext(slotComponent)" @command="onCommand" />
      </div>
      <oh-placeholder-widget v-if="context.editmode" class="oh-column-item placeholder" @click="$emit('add-widget', context.component, null, context.parent)" />

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

.oh-columns-grid
  columns auto 300px
  column-gap 0
  margin-left auto
  margin-right auto
  min-height 300px
  .oh-column-item
    width 100%
    display inline-block
    &.placeholder
      width calc(100% - 16px)

</style>
