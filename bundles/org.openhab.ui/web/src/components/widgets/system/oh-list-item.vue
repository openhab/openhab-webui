<template>
  <f7-list-button v-if="config.listButton && !context.editmode" :title="config.title || 'Action'" :color="config.color || 'blue'" @click="performAction" />
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
          <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent)" href="#" text="Configure Item"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.parent.component.config.accordionList" @click="context.editmode.editWidgetCode(context.component, context.parent, 'accordion')" href="#" text="Edit Accordion Code"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Up"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Down"></f7-menu-dropdown-item>
          <f7-menu-dropdown-item divider></f7-menu-dropdown-item>
          <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Item"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <f7-accordion-content v-if="context.parent.component.config.accordionList && !context.editmode">
      <generic-widget-component v-if="context.component.slots && context.component.slots.accordion && context.component.slots.accordion.length"
        :context="childContext(context.component.slots.accordion[0])" v-on="$listeners" />
      <!-- <oh-placeholder-widget v-else-if="context.editmode" class="oh-column-item placeholder" @click="context.editmode.addWidget(context.component, null, context.parent, 'accordion')" /> -->
    </f7-accordion-content>
    <oh-icon slot="media" v-if="config.icon && config.icon.indexOf('oh:') === 0" :icon="config.icon.substring(3)" height="32" width="32" />
    <f7-icon slot="media" v-else-if="config.icon" :ios="config.icon" :md="config.icon" :aurora="config.icon" :size="32" :color="config.iconColor" />
  </f7-list-item>
</template>

<script>
import mixin from '../widget-mixin'
import { actionGroup, actionProps, actionsMixin } from '../widget-actions'

export default {
  name: 'oh-list-item',
  mixins: [mixin, actionsMixin],
  widget: {
    name: 'oh-list-item',
    label: 'List Item',
    description: 'A list item',
    props: {
      parameterGroups: [
        actionGroup(null, 'Action to perform when the element is clicked'),
        {
          name: 'modifiers',
          label: 'Modifiers',
          description: 'Special simplified rendering for this item'
        }
      ],
      parameters: [
        ...actionProps(),
        {
          name: 'title',
          label: 'Title',
          type: 'TEXT'
        },
        {
          name: 'divider',
          groupName: 'modifiers',
          label: 'Divider',
          type: 'BOOLEAN',
          description: 'This item will be styled as a divider between sections. All other options except title will be ignored.'
        },
        {
          name: 'listButton',
          groupName: 'modifiers',
          label: 'List Button',
          type: 'BOOLEAN',
          description: 'This item will be styled as a list button (clickable link). All other options except title and color will be ignored.'
        },
        {
          name: 'subtitle',
          label: 'Subtitle',
          type: 'TEXT'
        },
        {
          name: 'text',
          label: 'Text',
          type: 'TEXT'
        },
        {
          name: 'after',
          label: 'After (either set this or a badge)',
          type: 'TEXT'
        },
        {
          name: 'badge',
          label: 'Badge',
          type: 'TEXT'
        },
        {
          name: 'badgeColor',
          label: 'Badge Color',
          type: 'TEXT'
        },
        {
          name: 'color',
          label: 'Color',
          type: 'TEXT',
          description: 'Color (for list buttons)',
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.listButton
          }
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'TEXT',
          description: 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>) or <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'
        },
        {
          name: 'iconColor',
          label: 'Icon Color',
          type: 'TEXT',
          description: 'Not applicable to openHAB icons'
        }
      ]
    }
  }
}
</script>
