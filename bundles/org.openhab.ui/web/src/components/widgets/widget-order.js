export function compareItems (i1, i2) {
  const isLocationContext = i1.metadata && i1.metadata.semantics && i1.metadata.semantics.value.indexOf('Location') === 0 &&
    i2.metadata && i2.metadata.semantics && i2.metadata.semantics.value.indexOf('Location') === 0

  // Compare widgetOrder
  const order1 = (i1.metadata && i1.metadata.widgetOrder) ? i1.metadata.widgetOrder.value : Infinity
  const order2 = (i2.metadata && i2.metadata.widgetOrder) ? i2.metadata.widgetOrder.value : Infinity
  const widgetOrder = (order1 !== order2) ? ((order1 < order2) ? -1 : 1) : 0

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
export function compareParents (i1, i2) {
  let modelOrder = 0
  if (i1.modelPath && i2.modelPath) {
    const minDepth = Math.min(i1.modelPath.length, i2.modelPath.length) // Compare shortest path
    for (let d = 0; d < minDepth; d++) {
      if (i1.modelPath[d] === i2.modelPath[d]) continue

      // widgetOrder comparison...
      const order1 = (i1.modelPath[d].metadata && i1.modelPath[d].metadata.widgetOrder) ? i1.modelPath[d].metadata.widgetOrder.value : Infinity
      const order2 = (i2.modelPath[d].metadata && i2.modelPath[d].metadata.widgetOrder) ? i2.modelPath[d].metadata.widgetOrder.value : Infinity
      if (order1 !== order2) {
        modelOrder = (order1 < order2) ? -1 : 1
        break
      }

      // ... or lexicographical comparison
      const nameOrLabel1 = i1.modelPath[d].label || i1.modelPath[d].name
      const nameOrLabel2 = i2.modelPath[d].label || i2.modelPath[d].name
      modelOrder = nameOrLabel1.localeCompare(nameOrLabel2)
      if (modelOrder !== 0) break
    }

    // A parent compares greater than its children
    if (modelOrder === 0 && (i1.modelPath.length !== i2.modelPath.length)) modelOrder = (i1.modelPath.length < i2.modelPath.length) ? -1 : 1
  }
  return modelOrder
}

export function compareRules (r1, r2) {
  return r1.name.localeCompare(r2.name)
}
