export interface Metadata {
  semantics?: { value: string }
  widgetOrder?: { value: string | number }
  [key: string]: any
}

export interface ModelPathItem {
  metadata?: Metadata
  label?: string
  name?: string
  [key: string]: any
}

export interface Item {
  metadata?: Metadata
  label?: string
  name?: string
  modelPath?: ModelPathItem[]
  [key: string]: any
}

export interface Rule {
  name: string
  [key: string]: any
}

/**
 * Compares two items for ordering in widgets.
 */
export function compareItems(i1: Item, i2: Item): number

/**
 * Compares two items based on their parent model paths.
 */
export function compareParents(i1: Item, i2: Item): number

/**
 * Compares two rules by name.
 */
export function compareRules(r1: Rule, r2: Rule): number
