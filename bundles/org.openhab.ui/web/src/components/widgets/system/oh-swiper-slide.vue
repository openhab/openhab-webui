<template>
  <f7-swiper-slide class="oh-swiper-slide" :class="{ 'edit-mode': context.editmode }">
    <f7-menu v-if="context.editmode" class="configure-layout-menu padding-horizontal">
      <f7-menu-item style="margin-left: auto" icon-f7="rectangle_on_rectangle" dropdown>
        <f7-menu-dropdown right>
        <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent)" href="#" text="Configure Widget"></f7-menu-dropdown-item>
        <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
        <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
        <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut"></f7-menu-dropdown-item>
        <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy"></f7-menu-dropdown-item>
        <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
        <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Before"></f7-menu-dropdown-item>
        <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move After"></f7-menu-dropdown-item>
        <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
        <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Slide"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <generic-widget-component class="slide" :context="context" />
  </f7-swiper-slide>
</template>

<style lang="stylus">
.oh-swiper-slide
  &.edit-mode
    min-height 300px
    .slide
      border-color rgba(142, 142, 147, 0.5)
      border-width 2px
      border-style dotted
</style>

<script>

import mixin from '../widget-mixin'

export default {
  mixins: [mixin]
}
</script>
