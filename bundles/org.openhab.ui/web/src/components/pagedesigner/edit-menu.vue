<template>
  <f7-menu-item :text="text" :icon-f7="iconF7" dropdown>
    <f7-menu-dropdown :right="right">
      <f7-menu-dropdown-item @click="context.editmode.configureWidget(component, context)" href="#" :text="configureLabel || 'Configure'" />
      <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(component, context)" href="#" text="Edit YAML" />
      <f7-menu-dropdown-item divider />
      <f7-menu-dropdown-item @click="context.editmode.cutWidget(component, context, parentSlot)" href="#" text="Cut" />
      <f7-menu-dropdown-item @click="context.editmode.copyWidget(component, context, parentSlot)" href="#" text="Copy" />
      <f7-menu-dropdown-item divider />
      <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(component, context, parentSlot)" href="#" text="Move Up" />
      <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(component, context, parentSlot)" href="#" text="Move Down" />
      <f7-menu-dropdown-item divider />
      <f7-menu-dropdown-item @click="context.editmode.removeWidget(component, context, parentSlot)" href="#" :text="removeLabel || 'Remove'" />
    </f7-menu-dropdown>
  </f7-menu-item>
</template>

<script>
export default {
  props: {
    context: Object,
    component: Object,
    page: Object,
    right: Boolean,
    text: String,
    iconF7: String,
    configureLabel: String,
    removeLabel: String,
    parentSlot: String
  }
}
</script>
