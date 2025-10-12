<template>
  <f7-swiper v-bind="config" observer observe-parents>
    <!-- renders slides added through the add slide component below -->
    <f7-swiper-slide
      v-for="(slide, idx) in slides"
      :key="'editmode-' + idx"
      class="oh-swiper-slide"
      :class="{ 'edit-mode': context.editmode }">
      <f7-menu v-if="context.editmode" class="configure-layout-menu padding-horizontal">
        <f7-menu-item style="margin-left: auto" icon-f7="rectangle_on_rectangle" dropdown>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item
              @click="childContext(slide).editmode.configureWidget(childContext(slide).component, childContext(slide).parent)"
              href="#"
              text="Configure Widget" />
            <f7-menu-dropdown-item
              @click="childContext(slide).editmode.editWidgetCode(childContext(slide).component, childContext(slide).parent)"
              href="#"
              text="Edit YAML" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item
              @click="childContext(slide).editmode.cutWidget(childContext(slide).component, childContext(slide).parent)"
              href="#"
              text="Cut" />
            <f7-menu-dropdown-item
              @click="childContext(slide).editmode.copyWidget(childContext(slide).component, childContext(slide).parent)"
              href="#"
              text="Copy" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item
              @click="childContext(slide).editmode.moveWidgetUp(childContext(slide).component, childContext(slide).parent)"
              href="#"
              text="Move Before" />
            <f7-menu-dropdown-item
              @click="childContext(slide).editmode.moveWidgetDown(childContext(slide).component, childContext(slide).parent)"
              href="#"
              text="Move After" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item
              @click="childContext(slide).editmode.removeWidget(context.component, context.parent)"
              href="#"
              text="Remove Slide" />
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
      <generic-widget-component class="slide" :context="childContext(slide)" />
    </f7-swiper-slide>

    <!-- renders slides defined in the slides slot -->
    <template
      v-if="context.component.slots && context.component.slots.slides && Array.isArray(context.component.slots.slides)">
      <f7-swiper-slide v-for="(slide, idx) in context.component.slots.slides" :key="idx">
        <generic-widget-component v-bind="$attrs" :context="childContext(slide)" />
      </f7-swiper-slide>
    </template>

    <!-- TODO-V3.1: Refactor oh-repeater logic to a mixin so we can replicate oh-repeater's handling here directly??? -->
    <!-- special rendering for oh-repeater so its children properly render directly inside f7-swiper-slide -->
    <generic-widget-component
      v-for="(repeater, idx) in repeater"
      :key="'gwc-repeater-' + idx"
      :context="childContext(repeater)" />

    <!-- add slide component to add slides in the page editor -->
    <f7-swiper-slide v-if="context.editmode">
      <oh-placeholder-widget
        @click="context.editmode.addWidget(context.component, null, context.parent)" />
    </f7-swiper-slide>
  </f7-swiper>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import mixin from '@/components/widgets/widget-mixin'
import { OhSwiperDefinition } from '@/assets/definitions/widgets/system'
import OhPlaceholderWidget from '@/components/widgets/layout/oh-placeholder-widget.vue'

export default {
  mixins: [mixin],
  components: {
    // without the async import, we define a circular reference
    GenericWidgetComponent: defineAsyncComponent(() => import('../generic-widget-component.vue')),
    OhPlaceholderWidget
  },
  widget: OhSwiperDefinition,
  computed: {
    slides () {
      if (!this.context.component.slots || !this.context.component.slots.default) return []
      return this.context.component.slots.default.filter((c) => c.component !== 'oh-repeater')
    },
    repeater () {
      if (!this.context.component.slots || !this.context.component.slots.default) return []
      return this.context.component.slots.default.filter((c) => c.component === 'oh-repeater')
    }
  }
}
</script>
