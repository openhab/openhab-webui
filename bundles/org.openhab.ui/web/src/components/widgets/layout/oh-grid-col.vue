<template>
  <f7-col v-bind="config" v-if="visible" class="oh-col">
    <div width="100%" v-if="context.editmode">
      <f7-menu class="configure-layout-menu padding-horizontal">
        <f7-menu-item style="margin-left: auto" icon-f7="rectangle_split_3x1" dropdown>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0"
                                   @click="context.editmode.configureWidget(context.component.slots.default[0], context)"
                                   href="#"
                                   text="Configure Widget" />
            <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0"
                                   @click="context.editmode.editWidgetCode(context.component.slots.default[0], context)"
                                   href="#"
                                   text="Edit YAML" />
            <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent)" href="#" text="Column Options" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut" />
            <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Left" />
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Right" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Widget" />
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
    </div>
    <oh-placeholder-widget v-if="context.editmode && !context.component.slots.default.length"
                           @click="context.editmode.addWidget(context.component, null, context.parent)" />
    <generic-widget-component v-else-if="context.component.slots.default.length"
                              :context="childContext(context.component.slots.default[0])"
                              @command="onCommand" />
  </f7-col>
</template>

<script>
import mixin from '../widget-mixin'
import OhPlaceholderWidget from './oh-placeholder-widget.vue'

import { OhGridColDefinition } from '@/assets/definitions/widgets/layout/index'

export default {
  mixins: [mixin],
  components: {
    OhPlaceholderWidget
  },
  widget: OhGridColDefinition
}
</script>
