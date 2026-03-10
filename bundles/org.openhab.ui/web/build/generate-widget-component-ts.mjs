import fs from 'fs'

const outDir = './src/types/components/widgets'

import * as SystemWidgets from '../src/assets/definitions/widgets/system/index.ts'
import * as StdCardWidgets from '../src/assets/definitions/widgets/standard/cards.ts'
import * as StdListItemWidgets from '../src/assets/definitions/widgets/standard/listitems.ts'
import * as StdCellWidgets from  '../src/assets/definitions/widgets/standard/cells.ts'
import * as LayoutWidgets from '../src/assets/definitions/widgets/layout/index.ts'
import * as PlanWidgets from '../src/assets/definitions/widgets/plan/index.ts'
import * as MapWidgets from  '../src/assets/definitions/widgets/map/index.ts'
import { OhChartPageDefinition } from '../src/assets/definitions/widgets/chart/page.ts'
import ChartWidgetsDefinitions from '../src/assets/definitions/widgets/chart/index.ts'
import { OhLocationCardParameters, OhEquipmentCardParameters, OhPropertyCardParameters } from '../src/assets/definitions/widgets/home/index.ts'
import { actionParams } from '../src/assets/definitions/widgets/actions.ts'

const ActionParams = [...actionParams(), ...actionParams('taphold')]

const widgetLibraries = {
  SystemWidgets,
  StdCardWidgets,
  StdListItemWidgets,
  StdCellWidgets,
  LayoutWidgets,
  PlanWidgets,
  MapWidgets,
  ChartWidgets: {
    OhChartPageDefinition,
    ...ChartWidgetsDefinitions
  },
  HomePageWidgets: {
    OhLocationCardParameters,
    OhEquipmentCardParameters,
    OhPropertyCardParameters
  }
}

const widgetDirectories = {
  SystemWidgets: 'system',
  StdCardWidgets: 'standard',
  StdListItemWidgets: 'standard/list',
  StdCellWidgets: 'standard/cell',
  LayoutWidgets: 'layout',
  PlanWidgets: 'plan',
  MapWidgets: 'map',
  ChartWidgets: 'chart',
  HomePageWidgets: 'standard'
}

function kebabToPascalCase(kebabCaseString) {
  return kebabCaseString
    .replace(/(^-*|-+)\S/g, (match) => match.slice(-1).toUpperCase()) // Capitalize letters after hyphens and handle leading hyphens
    .replace(/^./, (match) => match.toUpperCase()) // Capitalize the first letter of the entire string
}

function kebabToCamelCase(kebabCaseString) {
  return kebabCaseString
    .replace(/[-_]+(\w)/g, (match, p1) => p1.toUpperCase()) // Capitalize letters after hyphens
    .replace(/[^a-zA-Z0-9]/g, '_') // Remove any non-alphanumeric characters
}

function optionsMapKey(prop) {
  return JSON.stringify({
    name: prop.name,
    options: prop.options
  })
}

async function loadConfig() {
  const configFile = 'generate-widget-component-ts.config.js'
  if (fs.existsSync(`./build/${configFile}`)) {
    const configModule = await import(`./${configFile}`)
    return configModule.default || {}
  }
  return {}
}

function renderEnum(name, options) {
  let content = `export enum ${kebabToPascalCase(name)} {\n`
  content += options.map(o => {
    if(!o.value || o.value === '') return '  none = \'\''
    if(!isNaN(parseInt(o.value))) return ''
    return `  ${kebabToCamelCase(o.value)} = '${o.value}'`}).join(',\n')
  content += `\n}\n\n`
  return content
}

function renderType(name, options) {
  let content = `export type ${kebabToPascalCase(name)} = `
  content += options.map(o => {
    if(!o.value || o.value === '') return ''
    if(!isNaN(parseInt(o.value))) return ''
    return `'${kebabToCamelCase(o.value)}'`}).join(' | ')
  content += '\n'
  return content
}

function renderDict(name, options) {
  let content = `export const ${kebabToPascalCase(name)} = {\n`
  content += options.map(o => {
    if(!o.value || o.value === '') return `  none: ''`
    if(!isNaN(parseInt(o.value))) return ''
    return `  ${kebabToCamelCase(o.value)}: '${o.value}'`}).join(',\n')
  content += `\n} as const\n\n`
  content += `export type ${kebabToPascalCase(name)}Key = typeof ${kebabToPascalCase(name)}[keyof typeof ${kebabToPascalCase(name)}]\n\n`
  return content
}

function renderOption(name, options, type) {
  const textOptions = options.filter(o => isNaN(parseInt(o.value)))
  switch(type) {
    case 'type':
      return renderType(name, textOptions)
    case 'enum':
      return renderEnum(name, textOptions)
    case 'dict':
    default:
      return renderDict(name, textOptions)
  }
}

function createCommonOptionsMap() {
  const mapCommonOptions = new Map()
  Object.keys(widgetLibraries).forEach((l) => {
    const library = widgetLibraries[l]
    Object.keys(library).forEach((w) => {
      const widget = (typeof library[w] === 'function') ? library[w]() : library[w]
      const widgetName = widget.name || w
      if (!widgetName.startsWith('oh-')) return
      widget.pascalCaseName = kebabToPascalCase(widgetName)

      widget.props.parameters.forEach((p) => {
        if (p.options) {
          const key = optionsMapKey(p)

          if (mapCommonOptions.has(key)) {
            const componentsPresent = mapCommonOptions.get(key)
            componentsPresent.push(widget.pascalCaseName)
          } else {
            mapCommonOptions.set(key, [widget.pascalCaseName])
          }
        }
      })
    })
  })

  // Add ActionParams to common options map
  ActionParams.forEach((p) => {
    if (p.options) {
      const key = optionsMapKey(p)

      if (mapCommonOptions.has(key)) {
        const componentsPresent = mapCommonOptions.get(key)
        if (!componentsPresent.includes('ActionConfig')) {
          componentsPresent.push('ActionConfig')
        }
      } else {
        mapCommonOptions.set(key, ['ActionConfig'])
      }
    }
  })

  return mapCommonOptions
}

function generateCommonTS(mapCommonOptions) {
  let content = '// note: this file is generated and should not be edited by hand\n\n'
  const configCommon = config['_Common'] || {}
  mapCommonOptions.forEach((components, optionProp) => {
    if (components.length > 1) {
      const parsedOptionProp = JSON.parse(optionProp)
      const pascalCaseName = kebabToPascalCase(parsedOptionProp.name)
      const configOption = configCommon[pascalCaseName] || {}
      const exportAs = configOption.exportAs || config.defaultExportAs || 'type'

      let optionStr = renderOption(parsedOptionProp.name, parsedOptionProp.options, exportAs)
      if(configOption.modifier && typeof configOption.modifier === 'function') {
        optionStr = configOption.modifier(optionStr)
      }
      content += optionStr
    }
  })

  if(configCommon['*'] && typeof configCommon['*'].modifier === 'function') {
    content = configCommon['*'].modifier(content)
  }

  fs.writeFileSync(`${outDir}/common.gen.ts`, content)
}

function generateActionTS(mapCommonOptions) {
  const configWidget = config['ActionConfig'] || {}
  const commonComponents = []
  let content = ''

  // Action specific options
  ActionParams.forEach((p) => {
    if (p.options) {
      const key = optionsMapKey(p)

      if (mapCommonOptions.has(key) && mapCommonOptions.get(key).length === 1) {
        const pascalCaseName = kebabToPascalCase(p.name)
        const configOption = configWidget[pascalCaseName] || {}
        const exportAs = configOption.exportAs || config.defaultExportAs || 'dict'

        let optionStr = renderOption(p.name, p.options, exportAs)
        if(configOption.modifier && typeof configOption.modifier === 'function') {
          optionStr = configOption.modifier(optionStr)
        }
        content += optionStr
      }
    }
  })

  // Action config type
  let configStr = 'export interface ActionConfig {\n'
  ActionParams.forEach((p) => {
    const optionalMark = p.required ? '' : '?'

    let typeStr = 'any'
    if (p.name === '') return
    if (p.options && mapCommonOptions.has(optionsMapKey(p))) {
      typeStr = kebabToPascalCase(p.name)
      if (mapCommonOptions.get(optionsMapKey(p)).length > 1) {
        if (!commonComponents.includes(typeStr)) {
          commonComponents.push(typeStr)
        }
      }
    } else {
      switch (p.type) {
        case 'TEXT':
          typeStr = 'string'
          break
        case 'BOOLEAN':
          typeStr = 'boolean'
          break
        case 'INTEGER':
        case 'DECIMAL':
          typeStr = 'number'
          break
        default:
          console.log(`Unknown type ${p.type} for property ${p.name} in ActionParams`)
      }
    }

    const name = p.name.includes('-') ? `'${p.name}'` : p.name
    configStr += `  ${name}${optionalMark}: ${typeStr}\n`
  })
  configStr += '}\n'

  content += configStr

  let preamble = '// note: this file is generated and should not be edited by hand\n\n'
  let postamble = ''
  if (commonComponents.length > 0) {
    preamble += 'import {\n'
    preamble += commonComponents.map(name => `  ${name}`).join(',\n')
    preamble += `\n} from './common.gen.ts'\n\n`
  }

  content = preamble + content + postamble

  if(configWidget['_All'] && typeof configWidget['_All'].modifier === 'function') {
    content = configWidget['_All'].modifier(content)
  }

  if(config['*'] && typeof config['*'].modifier === 'function') {
    content = config['*'].modifier(content)
  }

  fs.writeFileSync(`${outDir}/actions.gen.ts`, content)
}

function generateComponentTS(mapCommonOptions) {
  Object.keys(widgetLibraries).forEach((l) => {
    const library = widgetLibraries[l]
    const widgetDir = widgetDirectories[l] || 'misc'
    Object.keys(library).forEach((w) => {
      const widget = (typeof library[w] === 'function') ? library[w]() : library[w]
      const widgetName = widget.name || w
      const widgetPascalCaseName = kebabToPascalCase(widgetName)
      const configWidget = config[widgetPascalCaseName] || {}

      if (!widgetName.startsWith('oh-')) return

      const commonComponents = []

      let content = ''
      // component specific options
      widget.props.parameters.forEach((p) => {
        if (p.options) {
          const key = optionsMapKey(p)

          if (mapCommonOptions.has(key) && mapCommonOptions.get(key).length === 1) {
            const pascalCaseName = kebabToPascalCase(p.name)
            const configOption = configWidget[pascalCaseName] || {}
            const exportAs = configOption.exportAs || config.defaultExportAs || 'dict'

            let optionStr = renderOption(p.name, p.options, exportAs)
            if(configOption.modifier && typeof configOption.modifier === 'function') {
              optionStr = configOption.modifier(optionStr)
            }
            content += optionStr
          }
        }
      })

      // component config type
      let configStr = 'export interface Config {\n'
      widget.props.parameters.forEach((p) => {
        const optionalMark = p.required ? '' : '?'

        let typeStr = 'any'
        if (p.name === '') return
        if (p.options && mapCommonOptions.has(optionsMapKey(p))) {
          typeStr = kebabToPascalCase(p.name)
          if (mapCommonOptions.get(optionsMapKey(p)).length > 1) {
            if (!commonComponents.includes(typeStr)) {
              commonComponents.push(typeStr)
            }
          }
        } else {
          switch (p.type) {
            case 'TEXT':
              typeStr = 'string'
              break
            case 'BOOLEAN':
              typeStr = 'boolean'
              break
            case 'INTEGER':
            case 'DECIMAL':
              typeStr = 'number'
              break
            default:
              console.log(`Unknown type ${p.type} for property ${p.name} in widget ${widgetName}`)
          }
        }

        const name = p.name.includes('-') ? `'${p.name}'` : p.name
        configStr += `  ${name}${optionalMark}: ${typeStr}\n`
      })
      configStr += '}\n'

      content += configStr

      let preamble = '// note: this file is generated and should not be edited by hand\n\n'
      let postamble = ''
      if (commonComponents.length > 0) {
        preamble += 'import {\n'
        preamble += commonComponents.map(name => name === 'Period' ? `  type ${name}` : `  ${name}`).join(',\n')
        const depth = widgetDir.split('/').length
        preamble += `\n} from '${'../'.repeat(depth)}common.gen.ts'\n\n`

        postamble += '\nexport {\n'
        postamble += commonComponents.map(name => name === 'Period' ? `  type ${name}` : `  ${name}`).join(',\n')
        postamble += '\n}\n'
      }

      content = preamble + content + postamble

      if(configWidget['_All'] && typeof configWidget['_All'].modifier === 'function') {
        content = configWidget['_All'].modifier(content)
      }

      if(config['*'] && typeof config['*'].modifier === 'function') {
        content = config['*'].modifier(content)
      }

      fs.writeFileSync(`${outDir}/${widgetDir}/${widgetName}.gen.ts`, content)
    })
  })
}

function generateIndexTS() {
  const componentNames = []
  let content = `export * from './common.gen.ts'\n`
  content += `export { type ActionConfig } from './actions.gen.ts'\n\n`

  Object.keys(widgetLibraries).forEach((l) => {
    const library = widgetLibraries[l]
    const widgetDir = widgetDirectories[l] || 'misc'
    Object.keys(library).forEach((w) => {
      const widget = (typeof library[w] === 'function') ? library[w]() : library[w]
      const widgetName = widget.name || w

      if (!widgetName.startsWith('oh-')) return

      componentNames.push(kebabToPascalCase(widgetName))
      content += `export * as ${kebabToPascalCase(widgetName)} from './${widgetDir}/${widgetName}.gen.ts'\n`
    })
  })

  fs.writeFileSync(`${outDir}/index.ts`, content)
}

const config = await loadConfig()

Object.keys(widgetLibraries).forEach((l) => {
  const widgetDir = widgetDirectories[l] || 'misc'
  if(!fs.existsSync(`${outDir}/${widgetDir}`)) {
    fs.mkdirSync(`${outDir}/${widgetDir}`, { recursive: true })
  }
})

const mapCommonOptions = createCommonOptionsMap()
generateCommonTS(mapCommonOptions)
generateActionTS(mapCommonOptions)
generateComponentTS(mapCommonOptions)
generateIndexTS()

