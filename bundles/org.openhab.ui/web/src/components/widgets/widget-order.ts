import * as api from '@/api'

interface ItemWithModelPath extends api.EnrichedItem {
  modelPath: ItemWithModelPath[]
}

export function compareItems(i1: api.EnrichedItem | ItemWithModelPath, i2: api.EnrichedItem | ItemWithModelPath) {
  const isLocationContext =
    i1.metadata &&
    i1.metadata.semantics &&
    typeof i1.metadata.semantics.value === 'string' &&
    i1.metadata.semantics.value.indexOf('Location') === 0 &&
    i2.metadata &&
    i2.metadata.semantics &&
    typeof i2.metadata.semantics.value === 'string' &&
    i2.metadata.semantics.value.indexOf('Location') === 0

  // Compare widgetOrder
  const order1 = i1.metadata && i1.metadata.widgetOrder ? parseFloat(i1.metadata.widgetOrder.value as string) : Infinity
  const order2 = i2.metadata && i2.metadata.widgetOrder ? parseFloat(i2.metadata.widgetOrder.value as string) : Infinity
  const widgetOrder = order1 !== order2 ? (order1 < order2 ? -1 : 1) : 0

  // Unless comparing Location Items simply return the order based on widgetOrder metadata if determined
  if (!isLocationContext && widgetOrder !== 0) return widgetOrder

  // Compare ancestors in Model (starting at the top level)
  const modelOrder = compareParents(i1, i2)
  if (modelOrder !== 0) return modelOrder
  if (widgetOrder !== 0) return widgetOrder // For Locations Items, own-item widgetOrder only used to compare Items sharing the same parent location

  // Compare label/name
  const nameOrLabel1 = i1.label || i1.name
  const nameOrLabel2 = i2.label || i2.name
  return nameOrLabel1.localeCompare(nameOrLabel2)
}

// Compares items based on widgetOrder or lexicographical order of their ancestors in Model (starting at the top level)
// Returns 0 if both items are siblings.
export function compareParents(i1: api.EnrichedItem | ItemWithModelPath, i2: api.EnrichedItem | ItemWithModelPath) {
  let modelOrder = 0
  if ('modelPath' in i1 && 'modelPath' in i2) {
    const minDepth = Math.min(i1.modelPath.length, i2.modelPath.length) // Compare shortest path
    for (let d = 0; d < minDepth; d++) {
      if (i1.modelPath[d] === i2.modelPath[d]) continue

      // widgetOrder comparison...
      const order1 =
        i1.modelPath[d].metadata && i1.modelPath[d].metadata!.widgetOrder
          ? (i1.modelPath[d].metadata!.widgetOrder.value as number)
          : Infinity
      const order2 =
        i2.modelPath[d].metadata && i2.modelPath[d].metadata!.widgetOrder
          ? (i2.modelPath[d].metadata!.widgetOrder.value as number)
          : Infinity
      if (order1 !== order2) {
        modelOrder = order1 < order2 ? -1 : 1
        break
      }

      // ... or lexicographical comparison
      const nameOrLabel1 = i1.modelPath[d].label || i1.modelPath[d].name
      const nameOrLabel2 = i2.modelPath[d].label || i2.modelPath[d].name
      modelOrder = nameOrLabel1.localeCompare(nameOrLabel2)
      if (modelOrder !== 0) break
    }

    // A parent compares greater than its children
    if (modelOrder === 0 && i1.modelPath.length !== i2.modelPath.length) modelOrder = i1.modelPath.length < i2.modelPath.length ? -1 : 1
  }
  return modelOrder
}

export function compareRules(r1: api.EnrichedRule, r2: api.EnrichedRule) {
  if (!r1.name || !r2.name) return r2.name ? 1 : 0
  return r1.name.localeCompare(r2.name)
}
