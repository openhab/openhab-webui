import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { addOSGiService } from './utils.js'

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
    let utilityCode = [`function ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_}() { /* error! */ }`]
    if (library.slots.utilities) {
      const utilityComponent = library.slots.utilities.find(c => c.config && c.config.name === utilityName)
      if (!utilityComponent) {
      } else {
        switch (utilityComponent.component) {
          case 'UtilityFrameworkService':
            return addOSGiService(utilityName, utilityComponent.config.serviceClass)
          case 'UtilityJavaType':
            utilityCode = `var ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_} = Java.type('${utilityComponent.config.javaClass}');`
            break
          default:
            utilityCode = utilityComponent.config.code.replace('{{name}}', javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_)
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

    return javascriptGenerator.provideFunction_(utilityName, utilityCode.split('\n'))
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
          const order = placeholderOption ? javascriptGenerator['ORDER_' + placeholderOption.replace('ORDER_', '')] : javascriptGenerator.ORDER_NONE
          context.inputs[placeholderName] = javascriptGenerator.valueToCode(block, placeholderName, order)
          return code.replace(placeholder, context.inputs[placeholderName])
        case 'utility':
          if (!context.utilities[placeholderName]) {
            context.utilities[placeholderName] = provideUtility(placeholderName)
          }
          return code.replace(placeholder, context.utilities[placeholderName])
        case 'temp_name':
          if (!context.uniqueIdentifiers[placeholderName]) {
            const realm = placeholderOption ? Blockly.Variables[placeholderOption] : Blockly.Variables.NAME_TYPE
            context.uniqueIdentifiers[placeholderName] = javascriptGenerator.variableDB_.getDistinctName(placeholderName, realm)
          }
          return code.replace(placeholder, context.uniqueIdentifiers[placeholderName])
        case 'statements':
          if (!context.statements[placeholderName]) {
            context.statements[placeholderName] = javascriptGenerator.statementToCode(block, placeholderName)
          }
          return code.replace(placeholder, context.statements[placeholderName].replace(/^ {2}/, '').trim())
        default:
          return code.replace(placeholder, `/* Invalid placeholder type ${placeholderType}! */`)
      }
    }
  }

  if (!codeComponent || !codeComponent.config || !codeComponent.config.template) {
    if (block.outputConnection) {
      return [`/* missing implementation for value block ${blockTypeId} */`, javascriptGenerator.ORDER_NONE]
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
    const order = codeComponent.config.order ? javascriptGenerator[codeComponent.config.order] : javascriptGenerator.ORDER_NONE
    return [code, order]
  } else {
    return code
  }
}

export const defineLibraryToolboxCategory = (library, f7) => (workspace) => {
  let category = []
  if (library && library.slots && library.slots.blocks) {
    library.slots.blocks.forEach((libraryBlock) => {
      let xml = ''
      switch (libraryBlock.component) {
        case 'BlockType':
          xml = `<block type="${library.uid}_${libraryBlock.config.type}">`
          if (libraryBlock.slots && libraryBlock.slots.toolbox) {
            libraryBlock.slots.toolbox.forEach((b) => {
              switch (b.component) {
                case 'PresetInput':
                  xml += `<value name="${b.config.name}">`
                  xml += (b.config.shadow) ? '<shadow ' : '<block '
                  xml += 'type="' + b.config.type + '">'
                  if (b.config.fields) {
                    for (const fieldName in b.config.fields) {
                      xml += `<field name="${fieldName}">${b.config.fields[fieldName]}</field>`
                    }
                  }
                  xml += (b.config.shadow) ? '</shadow>' : '</block>'
                  xml += '</value>'
                  break
                case 'PresetField':
                  xml += `<field name="${b.config.name}">${b.config.value}</field>`
                  break
                default:
                  console.warn('unknown toolbox component type')
              }
            })
          }
          xml += '</block>'
          break
        case 'BlockAssembly':
          xml += libraryBlock.config.blockXml
          break
        case 'Separator':
          xml += `<sep ${libraryBlock.config.gap ? 'gap="' + libraryBlock.config.gap + '"' : ''}/>`
          break
        default:
          console.warn('unknown toolbox component type')
      }

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

        javascriptGenerator[blockTypeId] = generateCodeForBlock
      })
    }
  })
}
