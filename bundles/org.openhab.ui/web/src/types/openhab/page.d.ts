/**
 * User-provided configuration for a UI component.
 */
export type UIComponentConfig = Record<string, any>

/**
 * Property definitions for a UI component.
 * Those describe the configuration parameters that can be passed to the component.
 */
export interface UIComponentProps {
  parameters: any[]
  parameterGroups: any[]
}

/**
 * UI components have slots, in which other UI components can be placed.
 */
export type UIComponentSlots = Record<string, UIComponent[]>

/**
 * A UI component as returned by the GET `/rest/ui/components` REST endpoint.
 *
 * UI components are the building blocks of pages.
 * They can be of different types, such as pages, widgets, `oh-*` and `f7-*` components, and HTML elements.
 * Due to their dynamic type nature, most of their properties are not always defined.
 */
export interface UIComponent {
  component: string, // always provided, required for rendering
  config: UIComponentConfig, // always provided, even if empty
  props?: UIComponentProps,
  slots?: UIComponentSlots,
  tags?: string[],
  timestamp?: string,
  uid?: string
}

/**
 * Marker interface for widgets.
 * Widgets are user-created components that can be placed in pages and widgets.
 */
export interface WidgetComponent extends UIComponent {}

/**
 * Marker interface for pages.
 * Pages are the top-level UI components and contain the widgets that are rendered in the UI.
 * They are created by the user.
 */
export interface Page extends UIComponent {}
