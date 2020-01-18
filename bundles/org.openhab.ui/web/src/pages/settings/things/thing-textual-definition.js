export default function (thing, thingType) {
  if (!thing.UID || !thingType.UID) return ''

  let definition = ''

  if (thing.bridgeUID) {
    definition +=
      '# Attention: This Thing is provided by a Bridge (' +
      thing.bridgeUID +
      ').' +
      '\n# You can also include it within the Bridge block and remove' +
      '\n# the reference between parentheses to the bridge below.\n\n'
  }

  definition += '# Thing definition (put in a .things file):\n\n'

  definition += thingType.bridge ? 'Bridge' : 'Thing'
  definition += ' ' + thing.UID
  definition += ' ' + JSON.stringify(thing.label)
  if (thing.location) { definition += ' @ ' + JSON.stringify(thing.location) }
  if (thing.bridgeUID) definition += ' (' + thing.bridgeUID + ')'
  definition += ' [ '
  let parameters = []
  for (let parameter in thing.configuration) {
    if (!Array.isArray(thing.configuration[parameter])) {
      parameters.push(
        parameter +
          '=' +
          JSON.stringify(thing.configuration[parameter])
      )
    }
  }
  definition += parameters.join(', ') + ' ]'

  // TODO: for bridges, handle things related to that bridge

  let itemDefinitions = []
  for (let channel of thing.channels) {
    if (!channel.itemType) continue

    let itemDefinition = ''
    itemDefinition += channel.itemType
    itemDefinition +=
      ' ' +
      thing.label.replace(/[^0-9a-z]/gi, '') +
      '_' +
      channel.id.replace(/[^0-9a-z]/gi, '')
    itemDefinition += ' "' + channel.label + '"'
    itemDefinition += ' {channel=' + JSON.stringify(channel.uid) + '}'
    itemDefinitions.push(itemDefinition)
  }
  if (itemDefinitions.length) {
    definition += '\n\n\n# Item definitions (put in a .items file):\n\n'
    definition += itemDefinitions.join('\n')
  }

  definition +=
    '\n\n# END ' + thing.UID + ' - ' + thing.label + '\n\n'

  return definition
}
