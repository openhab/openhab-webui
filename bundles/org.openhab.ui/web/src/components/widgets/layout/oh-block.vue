<template>
  <f7-block
    v-if="visible"
    class="oh-block"
    :class="scopedCssUid"
    :style="{ 'z-index': (context.editmode) ? 100 - context.parent?.component.slots.default.indexOf(context.component) : 'auto !important', ...config.style }">
    <hr v-if="context.editmode" />
    <f7-block-title v-if="config.title">
      {{ config.title }}
    </f7-block-title>
    <f7-menu v-if="context.editmode" class="configure-layout-menu padding-bottom">
      <f7-menu-item @click="context.editmode.addWidget(context.component, 'oh-grid-row')" icon-f7="plus" text="Add Row" />
      <f7-menu-item @click="context.editmode.addWidget(context.component, 'oh-grid-cells')" icon-f7="plus" text="Add Cells" />
      <f7-menu-item style="margin-left: auto" icon-f7="rectangle_grid_1x2" dropdown>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item
            @click="context.editmode.configureWidget(context.component, context.parent)"
            href="#"
            text="Configure Block" />
          <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML" />
          <f7-menu-dropdown-item divider />
          <!-- <f7-menu-dropdown-item @click="context.editmode.(context.component, context.parent)" href="#" text="Cut"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.(context.component, context.parent)" href="#" text="Copy"></f7-menu-dropdown-item> -->
          <f7-menu-dropdown-item
            v-if="context.clipboardtype === 'oh-grid-row' || context.clipboardtype === 'oh-grid-cells'"
            @click="context.editmode.pasteWidget(context.component, context.parent)"
            href="#"
            text="Paste" />
          <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row' || context.clipboardtype === 'oh-grid-cells'" divider />
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Up" />
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Down" />
          <f7-menu-dropdown-item divider />
          <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Block" />
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <component
      :is="component.component"
      v-for="(component, idx) in context.component.slots?.default"
      :key="idx"
      :context="childContext(component)" />
  </f7-block>
</template>

<style lang="stylus">
.oh-block
  z-index 10
</style>

<script setup lang="ts">
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import type { WidgetContext } from '@/components/widgets/types'
import { OhBlockDescription } from '@/assets/definitions/widgets/layout'

defineOptions({
  widget: OhBlockDescription
})

const props = defineProps<{
  context: WidgetContext
}>()

const { config, childContext, scopedCssUid, visible } = useWidgetContext(props.context)
</script>
