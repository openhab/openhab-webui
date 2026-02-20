import type { TrackedItems } from '@/js/stores/useStatesStore'
import * as api from '@/api'

export interface WidgetContext {
  component: api.UiComponent
  config: Record<string, any>
  /**
   * oh-context constants
   */
  const?: Record<string, any>
  ctxVars?: Record<string, Record<string, any>>
  editmode?: boolean
  /**
   * oh-context functions
   */
  fn?: Record<string, () => unknown>
  /**
   * oh-repeater loop variables
   */
  loop?: Record<string, any>
  props: Record<string, any>
  store: TrackedItems
  /**
   * variable.ts variable scope
   */
  varScope?: string
  vars?: Record<string, any>
}
