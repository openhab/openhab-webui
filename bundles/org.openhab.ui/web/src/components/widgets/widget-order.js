
export function compareItems (i1, i2) {
  const order1 = (i1.metadata && i1.metadata.widgetOrder) ? i1.metadata.widgetOrder.value : Infinity
  const order2 = (i2.metadata && i2.metadata.widgetOrder) ? i2.metadata.widgetOrder.value : Infinity
  if (order1 === order2) {
    const nameOrLabel1 = i1.label || i1.name
    const nameOrLabel2 = i2.label || i2.name
    return nameOrLabel1.localeCompare(nameOrLabel2)
  }
  return (order1 < order2) ? -1 : 1
}
