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
    <ul v-if="context.component.slots && context.component.slots.default">
      <template v-for="(slotComponent, idx) in context.component.slots.default" :key="idx">
        <div v-if="context.editmode" style="display: flex; align-items: center;">
          <f7-menu v-if="context.editmode">
            <f7-menu-item icon-f7="list_bullet" class="margin-left configure-layout-menu" dropdown>
              <f7-menu-dropdown>
                <f7-menu-dropdown-item
                  @click="context.editmode.configureWidget(context.component.slots.default[idx], context)"
                  href="#"
                  text="Configure Item" />
                <f7-menu-dropdown-item
                  @click="context.editmode.editWidgetCode(context.component.slots.default[idx], context)"
                  href="#"
                  text="Edit YAML" />
                <f7-menu-dropdown-item
                  v-if="context.parent.component.config.accordionList"
                  @click="context.editmode.editWidgetCode(context.component.slots.default[idx], context, 'accordion')"
                  href="#"
                  text="Edit Accordion Code" />
                <f7-menu-dropdown-item divider />
                <f7-menu-dropdown-item
                  @click="context.editmode.cutWidget(context.component.slots.default[idx], context)"
                  href="#"
                  text="Cut" />
                <f7-menu-dropdown-item
                  @click="context.editmode.copyWidget(context.component.slots.default[idx], context)"
                  href="#"
                  text="Copy" />
                <f7-menu-dropdown-item v-if="idx > 0 || idx < context.component.slots.default.length - 1" divider />
                <f7-menu-dropdown-item
                  v-if="idx > 0"
                  @click="context.editmode.moveWidgetUp(context.component.slots.default[idx], context)"
                  href="#"
                  text="Move Up" />
                <f7-menu-dropdown-item
                  v-if="idx < context.component.slots.default.length - 1"
                  @click="context.editmode.moveWidgetDown(context.component.slots.default[idx], context)"
                  href="#"
                  text="Move Down" />
                <f7-menu-dropdown-item divider />
                <f7-menu-dropdown-item
                  @click="context.editmode.removeWidget(context.component.slots.default[idx], context)"
                  href="#"
                  text="Remove Item" />
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
import mixin from '../widget-mixin'
import { OhListDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhListDefinition
}
</script>
