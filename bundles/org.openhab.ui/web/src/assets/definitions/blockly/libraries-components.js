// Block libraries components definitions, for hinting in the editor
import { WidgetDefinition, pt, pb, pn } from '../widgets/helpers.js'

export const BlockLibrariesComponentDefinitions = {
  BlockLibraryDefinition: () =>
    new WidgetDefinition('BlockLibrary', 'Block Library', 'Root component of a block library.').params([
      pt('name', 'Name', 'The display name of the block library (used as the category label in the toolbox).')
    ]),

  BlockTypeDefinition: () =>
    new WidgetDefinition(
      'BlockType',
      'Block Type',
      'Defines a new block type to generate custom code. ' +
        'The config is explained in <a target="_blank" class="external" href="https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks#json">the Blockly docs</a> ' +
        'and can mostly be created easily (JSON to convert to YAML) using the <a target="_blank" class="external" href="https://developers.google.com/blockly/guides/create-custom-blocks/blockly-developer-tools">Blockly Developer Tools</a>.'
    ).params([
      pt('type', 'Type', 'The identifier for the new type. The actual full identifier will be {block library id}_{type}.'),
      pb(
        'inputsInline',
        'Inputs Inline',
        'Force inputs to be inline or not; optional (automatic if not set). The user can override this setting for individual blocks.'
      ),
      pt(
        'previousStatement',
        'Previous Statement Type',
        "The type of the previous statement. If not set (even to an empty string), the block will not have a top connector. Contrary to the what the docs and the Developer Tools do, please DON'T use null in this property"
      ),
      pt(
        'nextStatement',
        'Next Statement Type',
        "The type of the next statement. If not set (even to an empty string), the block will not have a bottom connector. Contrary to the what the docs and the Developer Tools do, please DON'T use null in this property"
      ),
      pt(
        'output',
        'Output Type',
        "The type of the block output. If not set (even to an empty string), the block will not have a left connector. Contrary to the what the docs and the Developer Tools do, please DON'T use null in this property"
      ),
      pt(
        'message0',
        'Message',
        'A pattern for the first message. Add the args0 to specify the nature of the placeholders in the message. Use further messages/args properties (i.e. message1/args1 etc.) when appropriate.'
      ),
      pt(
        'colour',
        'Color',
        'The default color of the block. Use a hue value from 0-360 (preferred) or a #rrggbb value. If unset the block will be black.'
      ),
      pt('tooltip', 'Tooltip', 'What appears in the tooltip shown when the user hovers over the block.'),
      pt('helpUrl', 'Help URL', 'A help URL relevant for this block.')
    ]),

  BlockCodeTemplateDefinition: () =>
    new WidgetDefinition(
      'BlockCodeTemplate',
      'Block Code Template',
      'Defines the templated code for the parent BlockType.  Can use placeholders like: <ul><li><code>{{field:fieldName}}</code></li><li>{{input:inputName[:order]}}</li><li>{{temp_name:varName[:realm]}}</li><li>{{utility:utilityName}}</li><li>{{statements:statementsName}}</li></ul>'
    ).params([pt('template', 'Template', 'The template for the generated code of the parent block type.')]),

  PresetInputDefinition: () =>
    new WidgetDefinition('PresetInput', 'Preset Input', 'Defines a new preset for an input of a BlockType.').params([
      pt('name', 'Name', 'The name of the input in the parent block type this preset input is for.'),
      pt('type', 'Type', 'The block type to use for this preset.'),
      pt('fields', 'Type', 'A map of fields values for the preset block type.'),
      pb('shadow', 'Shadow', 'Whether this is a shadow input or not.')
    ]),

  PresetFieldDefinition: () =>
    new WidgetDefinition('PresetField', 'Preset Field', 'Defines a new preset for an field of a BlockType.').params([
      pt('name', 'Name', 'The name of the field in the parent block type this preset input is for.'),
      pt('value', 'Value', 'The value to set as a preset for this field.')
    ]),

  BlockAssemblyDefinition: () =>
    new WidgetDefinition(
      'BlockAssembly',
      'Block Assembly',
      'Defines a new assembly of existing block types to display in the toolbox.'
    ).params([
      pt(
        'blockXml',
        'Block Assembly XML',
        'The XML to generate the block assembly. Use the XML syntax described in  <a target="_blank" class="external" href="https://developers.google.com/blockly/guides/configure/web/toolbox#preset_blocks">the Blockly docs</a>.'
      )
    ]),

  SeparatorDefinition: () =>
    new WidgetDefinition('Separator', 'Separator', 'Defines a separator between blocks in the toolbox.').params([
      pn('gap', 'Gap', 'Gap in pixels for the separator.')
    ]),

  UtilityFunction: () =>
    new WidgetDefinition(
      'UtilityFunction',
      'Utility Function',
      'Defines a function that will be injected once per script when needed by a block.'
    ).params([
      pt(
        'name',
        'Name',
        'The desired name of the function. Can be something else if there is a name collision, for instance an user variable with the same name.'
      ),
      pt(
        'code',
        'Code',
        'The code of the function. Use {{name}} to replace with the actual name, and {{utilityName}} to inject and use the name of another utility.'
      )
    ]),

  UtilityJavaType: () =>
    new WidgetDefinition(
      'UtilityJavaType',
      'Java Type Utility',
      'Defines a variable to a Java type that will be injected once per script when needed by a block.'
    ).params([
      pt(
        'name',
        'Name',
        'The desired name of the variable. Can be something else if there is a name collision, for instance an user variable with the same name.'
      ),
      pt('javaClass', 'Java Class', 'The desired Java class.')
    ]),

  UtilityFrameworkService: () =>
    new WidgetDefinition(
      'UtilityFrameworkService',
      'Framework Service Utility',
      'Defines a variable to the instance of a OSGi framework service that will be injected once per script when needed by a block.'
    ).params([
      pt(
        'name',
        'Name',
        'The desired name of the variable. Can be something else if there is a name collision, for instance an user variable with the same name.'
      ),
      pt('serviceClass', 'Service Class', 'The class of the desired framework service.')
    ])
}
