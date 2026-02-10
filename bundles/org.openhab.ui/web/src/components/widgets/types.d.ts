import type { TrackedItems } from '@/js/stores/useStatesStore'
import type { WidgetComponent, UIComponentConfig } from '@/types/openhab'

// TODO - improve typescript of functions in EditMode
export interface EditMode {
  addWidget: (...args: any[]) => any
  configureWidget: (...args: any[]) => any
  configureSlot: (...args: any[]) => any
  editWidgetCode: (...args: any[]) => any
  cutWidget: (...args: any[]) => any
  copyWidget: (...args: any[]) => any
  pasteWidget: (...args: any[]) => any
  moveWidgetUp: (...args: any[]) => any
  moveWidgetDown: (...args: any[]) => any
  sendWidgetToBack: (...args: any[]) => any
  bringWidgetToFront: (...args: any[]) => any
  removeWidget: (...args: any[]) => any
}
export interface WidgetContext {
  component: WidgetComponent
  config: UIComponentConfig
  /**
   * oh-context constants
   */
  const?: Record<string, any>
  ctxVars?: any
  editmode?: EditMode
  /**
   * oh-context functions
   */
  fn?: Record<string, function>
  /**
   * oh-repeater loop variables
   */
  loop?: Record<string, any>
  props: WidgetProps
  store: TrackedItems | null
  /**
   * variable.ts variable scope
   */
  varScope?: string
  vars?: any

  modalConfig?: UIComponentConfig
  clipboardtype?: string | null

  parent: WidgetContext | null
}
