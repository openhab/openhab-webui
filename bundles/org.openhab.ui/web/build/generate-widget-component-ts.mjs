import fs from 'fs'

const outDir = './src/types/components/widgets'

import * as SystemWidgets from '../src/assets/definitions/widgets/system/index.js'
import * as StdCardWidgets from '../src/assets/definitions/widgets/standard/cards.js'
import * as StdListItemWidgets from '../src/assets/definitions/widgets/standard/listitems.js'
import * as StdCellWidgets from  '../src/assets/definitions/widgets/standard/cells.js'
import * as LayoutWidgets from '../src/assets/definitions/widgets/layout/index.js'
import * as PlanWidgets from '../src/assets/definitions/widgets/plan/index.js'
import * as MapWidgets from  '../src/assets/definitions/widgets/map/index.js'
import { OhChartPageDefinition } from '../src/assets/definitions/widgets/chart/page.js'
import ChartWidgetsDefinitions from '../src/assets/definitions/widgets/chart/index.js'
import { OhLocationCardParameters, OhEquipmentCardParameters, OhPropertyCardParameters } from '../src/assets/definitions/widgets/home/index.js'

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
  return mapCommonOptions
}

function generateCommonTS(mapCommonOptions) {
  let content = ''
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
  fs.writeFileSync(`${outDir}/common.ts`, content)
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
            commonComponents.push(typeStr)
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

      let preamble = ''
      let postamble = ''
      if (commonComponents.length > 0) {
        preamble += 'import {\n'
        preamble += commonComponents.map(name => `  ${name}`).join(',\n')
        const depth = widgetDir.split('/').length
        preamble += `\n} from '${'../'.repeat(depth)}common.ts'\n\n`

        postamble += '\nexport {\n'
        postamble += commonComponents.map(name => `  ${name}`).join(',\n')
        postamble += '\n}\n'
      }

      content = preamble + content + postamble

      if(configWidget['_All'] && typeof configWidget['_All'].modifier === 'function') {
        content = configWidget['_All'].modifier(content)
      }

      if(config['*'] && typeof config['*'].modifier === 'function') {
        content = config['*'].modifier(content)
      }

      fs.writeFileSync(`${outDir}/${widgetDir}/${widgetName}.ts`, content)
    })
  })
}

function generateIndexTS() {
  const componentNames = []
  let content = `export * from './common.ts'\n\n`
  Object.keys(widgetLibraries).forEach((l) => {
    const library = widgetLibraries[l]
    const widgetDir = widgetDirectories[l] || 'misc'
    Object.keys(library).forEach((w) => {
      const widget = (typeof library[w] === 'function') ? library[w]() : library[w]
      const widgetName = widget.name || w

      if (!widgetName.startsWith('oh-')) return

      componentNames.push(kebabToPascalCase(widgetName))
      content += `export * as ${kebabToPascalCase(widgetName)} from './${widgetDir}/${widgetName}.ts'\n`
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
generateComponentTS(mapCommonOptions)
generateIndexTS()
