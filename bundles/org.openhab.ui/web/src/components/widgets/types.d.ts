import type { TrackedItems } from '@/js/stores/useStatesStore'
import { DefineComponent } from 'vue'
import * as api from '@/api'
import type { WidgetDefinition } from '@/assets/definitions/widgets'

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

export type VariableScopeName = `varScope-${string}`
type VariableName = string
type VariableValue = number | string | boolean | VariableArray | VariableObject | null
interface VariableArray extends Array<VariableValue> {}
export interface VariableObject extends Record<VariableName, VariableValue> {}
export interface ContextVarObj extends Record<VariableScopeName, VariableObject> {}

export interface WidgetContext {
  component: api.RootUiComponent | api.UiComponent
  config: Record<string, unknown>
  /**
   * oh-context constants
   */
  const?: Record<string, unknown>
  ctxVars?: ContextVarObj
  editmode?: EditMode
  /**
   * oh-context functions
   */
  fn?: Record<string, () => unknown>
  /**
   * oh-repeater loop variables
   */
  loop?: Record<string, unknown>
  props: Record<string, unknown>
  store: TrackedItems | null
  /**
   * variable.ts variable scope
   */
  varScope?: VariableScopeName
  vars?: VariableObject

  modalConfig?: Record<string, unknown>
  clipboardtype?: string | null

  parent: WidgetContext | null
}
interface OhComponent extends DefineComponent {
  widget: () => WidgetDefinition
}
