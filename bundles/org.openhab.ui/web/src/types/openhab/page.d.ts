export interface PageProps {
  parameters: any[]
  parameterGroups: any[]
}

export interface PageConfig {
  [key: string]: any
}

export interface PageSlotComponent {
  component: string
  config?: { [key: string]: any }
  slots?: { [slotName: string]: PageSlotComponent[] }
}

export interface PageSlots {
  [slotName: string]: PageSlotComponent[]
}

export interface Page {
  uid: string
  tags: string[]
  props: PageProps
  timestamp: string
  component: string
  config: PageConfig
  slots: PageSlots
}