import type { TrackedItems } from '@/js/stores/useStatesStore'
import type { WidgetComponent, UIComponentConfig } from '@/types/openhab'

export interface WidgetContext {
  component: WidgetComponent,
  config: UIComponentConfig,
  /**
   * oh-context constants
   */
  const?: Record<string, any>,
  ctxVars?: any,
  editmode?: boolean,
  /**
   * oh-context functions
   */
  fn?: Record<string, function>,
  /**
   * oh-repeater loop variables
   */
  loop?: Record<string, any>,
  props: WidgetProps,
  store: TrackedItems,
  /**
   * variable.ts variable scope
   */
  varScope?: string,
  vars?: any
}
