<template>
  <f7-swiper v-bind="config">
    <oh-swiper-slide :context="childContext(slide)" v-for="(slide, idx) in slides" :key="idx" v-on="$listeners" />
    <f7-swiper-slide v-if="context.editmode">
      <oh-placeholder-widget @click="context.editmode.addWidget(context.component, null, context.parent)" />
    </f7-swiper-slide>
    <!-- <f7-menu v-if="context.editmode" slot="before-list" class="configure-layout-menu margin-vertical padding-left">
      <f7-menu-item @click="context.editmode.addWidget(context.component, 'oh-list-item')" icon-f7="plus" />
      <f7-menu-item style="margin-left: auto" icon-f7="square_list" dropdown>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent, 'oh-list')" href="#" text="Configure List"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.clipboardtype" divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.clipboardtype" @click="context.editmode.pasteWidget(context.component, context.parent)" href="#" text="Paste Item"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu> -->
  </f7-swiper>
</template>

<script>

import mixin from '../widget-mixin'

import OhSwiperSlide from './oh-swiper-slide.vue'
import OhPlaceholderWidget from '../layout/oh-placeholder-widget.vue'

export default {
  mixins: [mixin],
  components: {
    OhSwiperSlide,
    OhPlaceholderWidget
  },
  widget: {
    name: 'oh-swiper',
    label: 'Swiper',
    description: 'Allows to swipe slides',
    props: {
      parameters: [
        {
          name: 'pagination',
          label: 'Pagination',
          type: 'BOOLEAN',
          description: 'Enable pagination'
        },
        {
          name: 'navigation',
          label: 'Navigation',
          type: 'BOOLEAN',
          description: 'Enable navigation'
        },
        {
          name: 'scrollbar',
          label: 'Scrollbar',
          type: 'BOOLEAN',
          description: 'Enable scrollbar'
        }
      ]
    }
  },
  computed: {
    slides () {
      if (!this.context.component.slots || !this.context.component.slots.default) return []
      return this.context.component.slots.default
    }
  }
}
</script>
