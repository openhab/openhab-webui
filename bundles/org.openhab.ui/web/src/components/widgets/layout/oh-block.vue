<template>
  <div>
    <hr v-if="context.editmode" />
    <f7-block class="oh-block" :style="{ 'z-index': 100 - context.parent.component.slots.default.indexOf(context.component) }">
      <f7-block-title v-if="context.component.config.title">{{context.component.config.title}}</f7-block-title>
      <f7-menu v-if="context.editmode" class="configure-layout-menu padding-bottom">
        <f7-menu-item @click="context.editmode.addWidget(context.component, 'oh-grid-row')" icon-f7="plus" text="Add Row" />
        <f7-menu-item style="margin-left: auto" icon-f7="square_split_2x2" dropdown>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent)" href="#" text="Configure Block"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <!-- <f7-menu-dropdown-item @click="context.editmode.(context.component, context.parent)" href="#" text="Cut"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.(context.component, context.parent)" href="#" text="Copy"></f7-menu-dropdown-item> -->
            <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" @click="context.editmode.pasteWidget(context.component, context.parent)" href="#" text="Paste"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item v-if="context.clipboardtype === 'oh-grid-row'" divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Up"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Down"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
            <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Block"></f7-menu-dropdown-item>
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
      <oh-grid-row v-for="(component, idx) in context.component.slots.default"
        :key="idx"
        :context="childContext(component)"
        v-on="$listeners"
      ></oh-grid-row>
    </f7-block>
  </div>
</template>

<style lang="stylus">
.oh-block
  z-index 10
</style>

<script>
import mixin from '../widget-mixin'
import OhGridRow from './oh-grid-row'

export default {
  mixins: [mixin],
  components: {
    OhGridRow
  },
  widget: {
    name: 'oh-block',
    label: 'Layout Grid Block',
    description: 'A block in a grid layout',
    props: {
      parameters: [
        {
          name: 'title',
          label: 'Title',
          type: 'TEXT',
          description: 'Title of the block, displayed above it'
        }
      ]
    }
  }
}
</script>
