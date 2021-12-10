import Blockly from 'blockly'
import { addOSGiService } from './utils'

const generateCodeForBlock = (block) => {
  const blockTypeId = block.openhab.blockTypeId
  const definition = block.openhab.definition
  const library = block.openhab.library
  const codeComponent = (definition.slots && definition.slots.code && definition.slots.code[0]) ? definition.slots.code[0] : null

  const context = {
    fields: {},
    inputs: {},
    statements: {},
    utilities: {},
    uniqueIdentifiers: {}
  }

  const provideUtility = (utilityName) => {
    let utilityCode = [`function ${Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_}() { /* error! */ }`]
    if (library.slots.utilities) {
      const utilityComponent = library.slots.utilities.find(c => c.config && c.config.name === utilityName)
      if (!utilityComponent) {
      } else {
        switch (utilityComponent.component) {
          case 'UtilityFrameworkService':
            return addOSGiService(utilityName, utilityComponent.config.serviceClass)
          case 'UtilityJavaType':
            utilityCode = `var ${Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_} = Java.type('${utilityComponent.config.javaClass}');`
            break
          default:
            utilityCode = utilityComponent.config.code.replace('{{name}}', Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_)
            // process additional utilities if referenced in the function code
            while (/(\{\{[A-Za-z0-9_]+\}\})/gm.test(utilityCode)) {
              const match = /(\{\{[A-Za-z0-9_:]+\}\})/gm.exec(utilityCode)
              const referencedUtility = match[0].replace('{{', '').replace('}}', '')
              if (!context.utilities[referencedUtility]) {
                // BEWARE - risk of infinite recursion
                context.utilities[referencedUtility] = provideUtility(referencedUtility)
              }
              utilityCode = utilityCode.replace(match[0], context.utilities[referencedUtility])
            }
        }
      }
    }

    return Blockly.JavaScript.provideFunction_(utilityName, utilityCode.split('\n'))
  }

  const processPlaceholder = (code, placeholder) => {
    const placeholderFields = placeholder.replace('{{', '').replace('}}', '').split(':').map((f) => f.trim())
    if (placeholderFields.length >= 2) {
      const [placeholderType, placeholderName, placeholderOption] = placeholderFields
      switch (placeholderType) {
        case 'field':
          context.fields[placeholderName] = block.getFieldValue(placeholderName)
          return code.replace(placeholder, context.fields[placeholderName])
        case 'input':
          const order = placeholderOption ? Blockly.JavaScript['ORDER_' + placeholderOption.replace('ORDER_', '')] : Blockly.JavaScript.ORDER_NONE
          context.inputs[placeholderName] = Blockly.JavaScript.valueToCode(block, placeholderName, order)
          return code.replace(placeholder, context.inputs[placeholderName])
        case 'utility':
          if (!context.utilities[placeholderName]) {
            context.utilities[placeholderName] = provideUtility(placeholderName)
          }
          return code.replace(placeholder, context.utilities[placeholderName])
        case 'temp_name':
          if (!context.uniqueIdentifiers[placeholderName]) {
            const realm = placeholderOption ? Blockly.Variables[placeholderOption] : Blockly.Variables.NAME_TYPE
            context.uniqueIdentifiers[placeholderName] = Blockly.JavaScript.variableDB_.getDistinctName(placeholderName, realm)
          }
          return code.replace(placeholder, context.uniqueIdentifiers[placeholderName])
        case 'statements':
          if (!context.statements[placeholderName]) {
            context.statements[placeholderName] = Blockly.JavaScript.statementToCode(block, placeholderName)
          }
          return code.replace(placeholder, context.statements[placeholderName].replace(/^ {2}/, '').trim())
        default:
          return code.replace(placeholder, `/* Invalid placeholder type ${placeholderType}! */`)
      }
    }
  }

  if (!codeComponent || !codeComponent.config || !codeComponent.config.template) {
    if (block.outputConnection) {
      return [`/* missing implementation for value block ${blockTypeId} */`, Blockly.JavaScript.ORDER_NONE]
    } else {
      return `/* missing implementation for statement block ${blockTypeId} */\n`
    }
  }

  const template = codeComponent.config.template
  let code = template

  while (/(\{\{[A-Za-z0-9_:]+\}\})/gm.test(code)) {
    const match = /(\{\{[A-Za-z0-9_:]+\}\})/gm.exec(code)
    code = processPlaceholder(code, match[0])
  }

  if (block.outputConnection) {
    const order = codeComponent.config.order ? Blockly.JavaScript[codeComponent.config.order] : Blockly.JavaScript.ORDER_NONE
    return [code, order]
  } else {
    return code
  }
}

export const defineLibraryToolboxCategory = (library, f7) => (workspace) => {
  let category = []
  if (library && library.slots && library.slots.blocks) {
    library.slots.blocks.forEach((blockTypeDefinition) => {
      const xml = `<block type="${library.uid}_${blockTypeDefinition.config.type}" />`
      const block = Blockly.Xml.textToDom(xml)
      category.push(block)
    })
  }

  return category
}

export const defineLibraries = (libraryDefinitions) => {
  libraryDefinitions.forEach((library) => {
    if (library.slots && library.slots.blocks) {
      library.slots.blocks.forEach((block) => {
        const blockTypeId = library.uid + '_' + block.config.type
        Blockly.Blocks[blockTypeId] = {
          init: function () {
            this.jsonInit(block.config)
          },
          openhab: {
            blockTypeId: blockTypeId,
            library: library,
            definition: block
          }
        }

        Blockly.JavaScript[blockTypeId] = generateCodeForBlock
      })
    }
  })
}
