<template>
  <f7-list v-bind="config" :title="null" class="oh-list">
    <template #before-list>
      <f7-menu v-if="context.editmode" class="configure-layout-menu margin-vertical padding-left">
        <f7-menu-item @click="context.editmode.addWidget(context.component)" icon-f7="plus" />
        <f7-menu-item v-if="context.clipboardtype" style="margin-left: auto" icon-f7="square_list" dropdown>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item @click="context.editmode.pasteWidget(context.component, context.parent)" href="#" text="Paste Item" />
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
    </template>
    <ul v-if="defaultSlots.length > 0">
      <template v-for="(slotComponent, idx) in defaultSlots" :key="idx">
        <div v-if="context.editmode" style="display: flex; align-items: center;">
          <f7-menu v-if="context.editmode">
            <f7-menu-item icon-f7="list_bullet" class="margin-left configure-layout-menu" dropdown>
              <f7-menu-dropdown>
                <f7-menu-dropdown-item
                  @click="context.editmode.configureWidget(defaultSlots[idx], context)"
                  href="#"
                  text="Configure Item" />
                <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(defaultSlots[idx], context)" href="#" text="Edit YAML" />
                <f7-menu-dropdown-item
                  v-if="context.parent.component.config.accordionList"
                  @click="context.editmode.editWidgetCode(defaultSlots[idx], context, 'accordion')"
                  href="#"
                  text="Edit Accordion Code" />
                <f7-menu-dropdown-item divider />
                <f7-menu-dropdown-item @click="context.editmode.cutWidget(defaultSlots[idx], context)" href="#" text="Cut" />
                <f7-menu-dropdown-item @click="context.editmode.copyWidget(defaultSlots[idx], context)" href="#" text="Copy" />
                <f7-menu-dropdown-item v-if="idx > 0 || idx < defaultSlots.length - 1" divider />
                <f7-menu-dropdown-item
                  v-if="idx > 0"
                  @click="context.editmode.moveWidgetUp(defaultSlots[idx], context)"
                  href="#"
                  text="Move Up" />
                <f7-menu-dropdown-item
                  v-if="idx < defaultSlots.length - 1"
                  @click="context.editmode.moveWidgetDown(defaultSlots[idx], context)"
                  href="#"
                  text="Move Down" />
                <f7-menu-dropdown-item divider />
                <f7-menu-dropdown-item @click="context.editmode.removeWidget(defaultSlots[idx], context)" href="#" text="Remove Item" />
              </f7-menu-dropdown>
            </f7-menu-item>
          </f7-menu>
          <generic-widget-component :context="childContext(slotComponent)" class="list-item" />
        </div>
        <generic-widget-component v-else :context="childContext(slotComponent)" />
      </template>
    </ul>
  </f7-list>
</template>

<style lang="stylus">
.oh-list
  .list-item
    flex-grow 1
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
</style>

<script>
import { OhListDefinition } from '@/assets/definitions/widgets/system'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'

export default {
  props: {
    context: Object
  },
  widget: OhListDefinition,
  setup (props) {
    const { config, childContext, defaultSlots } = useWidgetContext(props.context)
    return { config, childContext, defaultSlots }
  }
}
</script>
