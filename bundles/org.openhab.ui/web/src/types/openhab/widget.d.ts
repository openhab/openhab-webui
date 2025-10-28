export interface WidgetParameter {
  context?: string
  description?: string
  label?: string
  name: string
  required?: boolean
  type?: string
  groupName?: string
  default?: string
  advanced?: boolean
}

export interface WidgetParameterGroup {
  name: string
  label?: string
  description?: string
}

export interface WidgetProps {
  parameters?: WidgetParameter[]
  parameterGroups?: WidgetParameterGroup[]
}

export interface WidgetConfig {
  [key: string]: any
}

export interface WidgetSlotComponent {
  component: string
  config?: { [key: string]: any }
  slots?: WidgetSlots
}

export interface WidgetSlots {
  [slotName: string]: WidgetSlotComponent[] | WidgetSlotComponent | undefined
}

export interface Widget {
  uid: string
  tags?: string[]
  props: WidgetProps
  timestamp?: string
  component: string
  config?: WidgetConfig
  slots?: WidgetSlots
}