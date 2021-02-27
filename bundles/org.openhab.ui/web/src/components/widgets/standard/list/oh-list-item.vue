<template>
  <f7-list-button v-if="config.listButton && !context.editmode" :title="config.title || 'Action'" :color="config.color || 'blue'" @click="performAction" />
  <f7-list-item divider :title="config.title" v-else-if="config.divider && !context.editmode" />
  <f7-list-item v-else v-bind="config" :divider="config.divider && !context.editmode"
                :media-item="context.parent.component.config.mediaList && !config.divider"
                :badge="(config.divider) ? 'Divider' : (config.listButton) ? 'List button' : config.badge"
                :accordion-item="context.component.slots && context.component.slots.accordion && !config.divider && !context.editmode"
                :link="(config.action !== undefined && config.action !== '' && !context.editmode) ? true : undefined"
                @click="performAction"
  >
    <f7-menu v-if="context.editmode" slot="content-start" class="configure-layout-menu">
      <f7-menu-item icon-f7="list_bullet" dropdown>
        <f7-menu-dropdown>
          <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent)" href="#" text="Configure Item" />
          <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML" />
          <f7-menu-dropdown-item v-if="context.parent.component.config.accordionList" @click="context.editmode.editWidgetCode(context.component, context.parent, 'accordion')" href="#" text="Edit Accordion Code" />
          <f7-menu-dropdown-item divider />
          <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut" />
          <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy" />
          <f7-menu-dropdown-item divider />
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Up" />
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Down" />
          <f7-menu-dropdown-item divider />
          <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Item" />
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <slot name="inner" #inner />
    <slot name="after" #after />
    <slot name="content" #content />
    <slot name="root-end" #root-end />
    <slot name="footer" #footer />
    <generic-widget-component slot="after" v-if="context.component.slots && context.component.slots.after && context.component.slots.after.length"
                              :context="childContext(context.component.slots.after[0])" v-on="$listeners"
    />
    <f7-accordion-content v-if="context.parent.component.config.accordionList && !context.editmode">
      <generic-widget-component v-if="context.component.slots && context.component.slots.accordion && context.component.slots.accordion.length"
                                :context="childContext(context.component.slots.accordion[0])" v-on="$listeners"
      />
      <!-- <oh-placeholder-widget v-else-if="context.editmode" class="oh-column-item placeholder" @click="context.editmode.addWidget(context.component, null, context.parent, 'accordion')" /> -->
    </f7-accordion-content>
    <oh-icon slot="media" v-if="config.icon && config.icon.indexOf('oh:') === 0" :icon="config.icon.substring(3)" height="32" width="32" :state="(config.item && config.iconUseState) ? context.store[config.item].state : null" />
    <f7-icon slot="media" v-else-if="config.icon" :ios="config.icon" :md="config.icon" :aurora="config.icon" :size="32" :color="config.iconColor" />
    <span slot="media" v-else-if="config.fallbackIconToInitial && config.title && context.parent.component.config && context.parent.component.config.mediaList" class="item-initial">{{ config.title[0].toUpperCase() }}</span>
  </f7-list-item>
</template>

<script>
import mixin from '../../widget-mixin'
import { actionsMixin } from '../../widget-actions'
import { OhListItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  name: 'oh-list-item',
  mixins: [mixin, actionsMixin],
  widget: OhListItemDefinition
}
</script>
