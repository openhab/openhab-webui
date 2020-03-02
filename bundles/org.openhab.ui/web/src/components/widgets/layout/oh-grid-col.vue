<template>
  <f7-col v-bind="config">
    <div width="100%">
      <f7-menu v-if="context.editmode" class="configure-layout-menu padding-horizontal">
        <f7-menu-item style="margin-left: auto" icon-f7="rectangle_split_3x1" dropdown>
          <f7-menu-dropdown right>
          <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0" @click="context.editmode.configureWidget(context.component.slots.default[0], context)" href="#" text="Configure Widget"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0" @click="context.editmode.editWidgetCode(context.component.slots.default[0], context)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent)" href="#" text="Column Options"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Left"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Right"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Widget"></f7-menu-dropdown-item>
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
    </div>
    <oh-placeholder-widget v-if="context.editmode && !context.component.slots.default.length" @click="context.editmode.addWidget(context.component, null, context.parent)" />
    <generic-widget-component v-else-if="context.component.slots.default.length" :context="childContext(context.component.slots.default[0])" @command="onCommand" />
  </f7-col>
</template>

<style>

</style>

<script>
import mixin from '../widget-mixin'
import OhPlaceholderWidget from './oh-placeholder-widget.vue'

const columnOptions = [5, 10, 15, 20, 25, 30, 33, 35, 40, 45,
  50, 55, 60, 65, 66, 70, 75, 80, 85, 90, 95, 100].map((c) => {
  return {
    value: c.toString(),
    label: `${c} %`
  }
})

export default {
  mixins: [mixin],
  components: {
    OhPlaceholderWidget
  },
  widget: {
    name: 'oh-grid-col',
    label: 'Layout Grid Column',
    description: 'A column in a grid layout',
    props: {
      parameters: [
        {
          name: 'width',
          label: 'Width',
          type: 'INTEGER',
          description: 'Standard width',
          options: columnOptions,
          limitToOptions: true
        },
        {
          name: 'xsmall',
          label: 'Width (XS)',
          type: 'INTEGER',
          description: 'Column width when app width >= 480px',
          options: columnOptions,
          limitToOptions: true
        },
        {
          name: 'small',
          label: 'Width (S)',
          type: 'INTEGER',
          description: 'Column width when app width >= 568px',
          options: columnOptions,
          limitToOptions: true
        },
        {
          name: 'medium',
          label: 'Width (M)',
          type: 'INTEGER',
          description: 'Column width when app width >= 1024px',
          options: columnOptions,
          limitToOptions: true
        },
        {
          name: 'large',
          label: 'Width (L)',
          type: 'INTEGER',
          description: 'Column width when app width >= 1024px',
          options: columnOptions,
          limitToOptions: true
        },
        {
          name: 'xlarge',
          label: 'Width (XL)',
          type: 'INTEGER',
          description: 'Column width when app width >= 1200px',
          options: columnOptions,
          limitToOptions: true
        }
      ]
    }
  }
}
</script>
