import Blockly from 'blockly'
import { addOSGiService } from './utils'
import { WidgetDefinition, pt, pb, pn } from '../widgets/helpers.js'

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

        Blockly.JavaScript[blockTypeId] = generateCodeForBlock
      })
    }
  })
}

// Block libraries components definitions, for hinting in the editor

export const BlockLibrariesComponentDefinitions = {
  BlockLibraryDefinition: () => new WidgetDefinition('BlockLibrary', 'Block Library', 'Root component of a block library.')
    .params([
      pt('name', 'Name', 'The display name of the block library (used as the category label in the toolbox).')
    ]),

  BlockTypeDefinition: () => new WidgetDefinition('BlockType', 'Block Type', 'Defines a new block type to generate custom code. ' +
   'The config is explained in <a target="_blank" class="external" href="https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks#json">the Blockly docs</a> ' +
   'and can mostly be created easily (JSON to convert to YAML) using the <a target="_blank" class="external" href="https://developers.google.com/blockly/guides/create-custom-blocks/blockly-developer-tools">Blockly Developer Tools</a>.')
    .params([
      pt('type', 'Type', 'The identifier for the new type. The actual full identifier will be {block library id}_{type}.'),
      pb('inputsInline', 'Inputs Inline', 'Force inputs to be inline or not; optional (automatic if not set). The user can override this setting for individual blocks.'),
      pt('previousStatement', 'Previous Statement Type', 'The type of the previous statement. If not set (even to an empty string), the block will not have a top connector. Contrary to the what the docs and the Developer Tools do, please DON\'T use null in this property'),
      pt('nextStatement', 'Next Statement Type', 'The type of the next statement. If not set (even to an empty string), the block will not have a bottom connector. Contrary to the what the docs and the Developer Tools do, please DON\'T use null in this property'),
      pt('output', 'Output Type', 'The type of the block output. If not set (even to an empty string), the block will not have a left connector. Contrary to the what the docs and the Developer Tools do, please DON\'T use null in this property'),
      pt('message0', 'Message', 'A pattern for the first message. Add the args0 to specify the nature of the placeholders in the message. Use further messages/args properties (i.e. message1/args1 etc.) when appropriate.'),
      pt('colour', 'Color', 'The default color of the block. Use a hue value from 0-360 (preferred) or a #rrggbb value. If unset the block will be black.'),
      pt('tooltip', 'Tooltip', 'What appears in the tooltip shown when the user hovers over the block.'),
      pt('helpUrl', 'Help URL', 'A help URL relevant for this block.')
    ]),

  BlockCodeTemplateDefinition: () => new WidgetDefinition('BlockCodeTemplate', 'Block Code Template', 'Defines the templated code for the parent BlockType.  Can use placeholders like: <ul><li><code>{{field:fieldName}}</code></li><li>{{input:inputName[:order]}}</li><li>{{temp_name:varName[:realm]}}</li><li>{{utility:utilityName}}</li><li>{{statements:statementsName}}</li></ul>')
    .params([
      pt('template', 'Template', 'The template for the generated code of the parent block type.')
    ]),

  PresetInputDefinition: () => new WidgetDefinition('PresetInput', 'Preset Input', 'Defines a new preset for an input of a BlockType.')
    .params([
      pt('name', 'Name', 'The name of the input in the parent block type this preset input is for.'),
      pt('type', 'Type', 'The block type to use for this preset.'),
      pt('fields', 'Type', 'A map of fields values for the preset block type.'),
      pb('shadow', 'Shadow', 'Whether this is a shadow input or not.')
    ]),

  PresetFieldDefinition: () => new WidgetDefinition('PresetField', 'Preset Field', 'Defines a new preset for an field of a BlockType.')
    .params([
      pt('name', 'Name', 'The name of the field in the parent block type this preset input is for.'),
      pt('value', 'Value', 'The value to set as a preset for this field.')
    ]),

  BlockAssemblyDefinition: () => new WidgetDefinition('BlockAssembly', 'Block Assembly', 'Defines a new assembly of existing block types to display in the toolbox.')
    .params([
      pt('blockXml', 'Block Assembly XML', 'The XML to generate the block assembly. Use the XML syntax described in  <a target="_blank" class="external" href="https://developers.google.com/blockly/guides/configure/web/toolbox#preset_blocks">the Blockly docs</a>.')
    ]),

  SeparatorDefinition: () => new WidgetDefinition('Separator', 'Separator', 'Defines a separator between blocks in the toolbox.')
    .params([
      pn('gap', 'Gap', 'Gap in pixels for the separator.')
    ]),

  UtilityFunction: () => new WidgetDefinition('UtilityFunction', 'Utility Function', 'Defines a function that will be injected once per script when needed by a block.')
    .params([
      pt('name', 'Name', 'The desired name of the function. Can be something else if there is a name collision, for instance an user variable with the same name.'),
      pt('code', 'Code', 'The code of the function. Use {{name}} to replace with the actual name, and {{utilityName}} to inject and use the name of another utility.')
    ]),

  UtilityJavaType: () => new WidgetDefinition('UtilityJavaType', 'Java Type Utility', 'Defines a variable to a Java type that will be injected once per script when needed by a block.')
    .params([
      pt('name', 'Name', 'The desired name of the variable. Can be something else if there is a name collision, for instance an user variable with the same name.'),
      pt('javaClass', 'Java Class', 'The desired Java class.')
    ]),

  UtilityFrameworkService: () => new WidgetDefinition('UtilityFrameworkService', 'Framework Service Utility', 'Defines a variable to the instance of a OSGi framework service that will be injected once per script when needed by a block.')
    .params([
      pt('name', 'Name', 'The desired name of the variable. Can be something else if there is a name collision, for instance an user variable with the same name.'),
      pt('serviceClass', 'Service Class', 'The class of the desired framework service.')
    ])
}
