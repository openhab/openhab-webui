export default (model, type, page) => {
  if (!model || !model[type]) return []
  const cardOrder =
    page && page.slots && page.slots[type] && page.slots[type][0] && page.slots[type][0].config && page.slots[type][0].config.cardOrder
      ? page.slots[type][0].config.cardOrder
      : []
  const elements = [...model[type]].map((e) => {
    const item = { ...e }
    if (item.separator) return item
    const card =
      page && page.slots && page.slots[type] && page.slots[type][0] && page.slots[type][0].slots && page.slots[type][0].slots[item.key]
        ? page.slots[type][0].slots[item.key][0]
        : null
    if (card) item.card = card
    return item
  })
  let groups = []
  let currentGroup = []
  for (const orderKey of cardOrder) {
    if (orderKey.separator) {
      if (currentGroup.length) groups.push(currentGroup)
      currentGroup = []
      currentGroup.push(orderKey)
    } else {
      const idx = elements.findIndex((c) => c.key === orderKey)
      if (idx >= 0) {
        currentGroup.push(elements[idx])
        elements.splice(idx, 1)
      }
    }
  }
  if (currentGroup.length) groups.push(currentGroup)
  groups.push([...elements])
  return groups
}
