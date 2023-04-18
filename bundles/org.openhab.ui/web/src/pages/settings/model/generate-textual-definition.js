import Semantics from '@/assets/semantics'
import utils from '@/js/openhab/utils'

/**
 * Generate a textual definition for the items provided by the "add from thing" page,
 * for expert users who prefer to edit their items that way
 */
export default (thing, channelTypes, newEquipmentItem, parentGroupsForEquipment, parentGroupsForPoints) => {
  const channelTypesMap = new Map(channelTypes.map(ct => [ct.UID, ct]))

  let def = ''
  if (newEquipmentItem && newEquipmentItem.name) {
    def += `// Equipment representing thing:\n// ${thing.UID}\n`
    def += `// (${thing.label})\n\n`

    def += `Group ${newEquipmentItem.name} "${newEquipmentItem.label}" `
    if (newEquipmentItem.category) def += `<${newEquipmentItem.category}> `
    if (parentGroupsForEquipment.length) def += `(${parentGroupsForEquipment.join(', ')}) `
    if (newEquipmentItem.tags.length) def += `[${newEquipmentItem.tags.map((t) => `"${t}"`).join(', ')}] `
    def = def.trim() + '\n\n'
  }

  let lines = []
  for (const channel of thing.channels) {
    if (channel.kind !== 'STATE') continue
    const channelType = channelTypesMap.get(channel.channelTypeUID)
    let newItemName = (newEquipmentItem) ? newEquipmentItem.name : utils.normalizeLabel(thing.label)
    newItemName += '_'
    let suffix = channel.label || channel.id
    if (thing.channels.filter((c) => c.label === suffix || (c.channelTypeUID && channelTypesMap[c.channelTypeUID] && channelTypesMap[c.channelTypeUID].label === suffix)).length > 1) {
      suffix = channel.id.replace('#', '_').replace(/(^\w{1})|(_+\w{1})/g, letter => letter.toUpperCase())
    }
    newItemName += utils.normalizeLabel(suffix)
    const defaultTags = (channel.defaultTags.length > 0) ? channel.defaultTags : channelType.tags
    const newItem = {
      channel: channel,
      channelType: channelType,
      name: newItemName,
      label: channel.label || channelType.label,
      groupNames: parentGroupsForPoints,
      category: (channelType) ? channelType.category : '',
      type: channel.itemType,
      tags: (defaultTags.find((t) => Semantics.Points.indexOf(t) >= 0)) ? defaultTags : [...defaultTags, 'Point']
    }

    let line = []
    line.push(newItem.type)
    line.push(newItem.name)
    line.push(`"${newItem.label}"`)
    if (channelType.advanced) line[0] = '// ' + line[0] // comment the advanced channels by default
    line.push((newItem.category) ? `<${newItem.category}>` : '')
    line.push((newItem.groupNames.length) ? `(${newItem.groupNames.join(', ')})` : '')
    line.push((newItem.tags.length) ? `[${newItem.tags.map((t) => `"${t}"`).join(', ')}] ` : '')
    line.push(`{ channel="${channel.uid}" }`)
    lines.push(line)
  }

  if (!lines.length) return def

  let columnsWidths = []
  for (let c = 0; c < lines[0].length; c++) {
    columnsWidths.push(Math.max(...lines.map((l) => l[c].length)) + 1)
  }

  def += '// Points:\n\n'
  lines.forEach((l) => {
    for (let c = 0; c < l.length; c++) {
      def += l[c] + ' '.repeat(columnsWidths[c] - l[c].length)
    }
    def += '\n'
  })

  return def
}
