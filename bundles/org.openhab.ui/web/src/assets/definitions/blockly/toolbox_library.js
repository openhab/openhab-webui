import Blockly from 'blockly'

export default (definition, f7) => (workspace) => {
  let category = []
  if (definition && definition.slots && definition.slots.blocks) {
    definition.slots.blocks.forEach((blockTypeDefinition) => {
      const xml = `<block type="${blockTypeDefinition.config.type}" />`
      const block = Blockly.Xml.textToDom(xml)
      category.push(block)
    })
  }

  return category
}
