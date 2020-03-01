<template>
  <f7-list v-bind="config">
    <f7-menu v-if="context.editmode" slot="before-list" class="configure-layout-menu margin-vertical padding-left">
      <f7-menu-item @click="context.editmode.addWidget(context.component, 'oh-list-item')" icon-f7="plus" />
      <f7-menu-item style="margin-left: auto" icon-f7="square_list" dropdown>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent, 'oh-list')" href="#" text="Configure List"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.clipboardtype" divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.clipboardtype" @click="context.editmode.pasteWidget(context.component, context.parent)" href="#" text="Paste Item"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <ul v-if="context.component.slots && context.component.slots.default">
      <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.default" :key="idx" v-on="$listeners" />
    </ul>
  </f7-list>
</template>

<script>
import mixin from '../widget-mixin'

export default {
  mixins: [mixin],
  widget: {
    name: 'oh-list',
    label: 'List',
    description: 'A list of vertically arranged items',
    props: {
      parameters: [
        {
          name: 'simpleList',
          label: 'Simple list',
          type: 'BOOLEAN',
          description: 'Use for simple lists'
        },
        {
          name: 'mediaList',
          label: 'Media List',
          type: 'BOOLEAN',
          description: 'Use for list with rich list items with icons'
        },
        {
          name: 'accordionList',
          label: 'Accordion List',
          type: 'BOOLEAN',
          description: 'Use for lists with accordion (collapsible) items'
        }
      ]
    }
  }
}
</script>
