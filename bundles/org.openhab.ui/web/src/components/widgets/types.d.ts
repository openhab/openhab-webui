import type { TrackedItems } from '@/js/stores/useStatesStore'

type WidgetConfig = any
type WidgetProps = Record<string, any>
type WidgetPropDefinitions = any

interface WidgetComponent {
  component?: string,
  config?: WidgetConfig,
  props?: WidgetPropDefinitions,
  slots?: Record<string, Array<any>>
}

interface WidgetContext {
  component: WidgetComponent,
  config?: WidgetConfig,
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
