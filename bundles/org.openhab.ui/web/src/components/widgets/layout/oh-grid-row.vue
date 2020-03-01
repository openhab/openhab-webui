<template>
  <div>
    <hr v-if="context.editmode" style="opacity: 0.5; border-top: 1px #777 dashed" />
    <div width="100%">
      <f7-menu v-if="context.editmode" class="configure-layout-menu margin-bottom padding-horizontal">
        <f7-menu-item @click="context.editmode.addWidget(context.component, 'oh-grid-col')" icon-f7="plus" text="Add Column" />
        <f7-menu-item style="margin-left: auto" icon-f7="square_split_1x2" dropdown>
          <f7-menu-dropdown right>
          <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-col'" @click="context.editmode.pasteWidget(context.component, context.parent)" href="#" text="Paste"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Up"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Down"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Row"></f7-menu-dropdown-item>
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
    </div>
    <f7-row>
      <oh-grid-col v-for="(component, idx) in context.component.slots.default"
        :key="idx"
        :context="childContext(component)"
        v-on="$listeners"
      ></oh-grid-col>
      <f7-block-title v-if="config.title"></f7-block-title>
    </f7-row>
    <!-- <f7-row v-if="context.editmode">
      <f7-col class="display-flex justify-content-left">
        <f7-button color="blue" text="Add column" icon-f7="rectangle_split_3x1" @click="$emit('add-widget', context.component, 'oh-grid-col')"></f7-button>
      </f7-col>
    </f7-row> -->
  </div>
</template>

<style>

</style>

<script>
import mixin from '../widget-mixin'
import OhGridCol from './oh-grid-col.vue'

export default {
  mixins: [mixin],
  components: {
    OhGridCol
  },
  widget: {
    name: 'oh-grid-rown',
    label: 'Layout Grid Row',
    description: 'A row in a grid layout',
    props: {
    }
  }
}
</script>
