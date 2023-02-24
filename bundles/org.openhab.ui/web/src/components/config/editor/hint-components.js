import { lineIndent, findParent, isConfig, isComponent, isSlots, findComponentType } from './yaml-utils'
import { cls, filterPartialCompletions, addTooltipHandlers, getClassNamesForParameter } from './hint-utils'

import Vue from 'vue'
import * as f7vue from 'framework7-vue'

import * as SystemWidgets from '@/components/widgets/system'
import * as StandardWidgets from '@/components/widgets/standard'
import * as StandardListWidgets from '@/components/widgets/standard/list'
import * as StandardCellWidgets from '@/components/widgets/standard/cell'
import * as LayoutWidgets from '@/components/widgets/layout'
import * as PlanWidgets from '@/components/widgets/plan'
import * as MapWidgets from '@/components/widgets/map'
import { OhChartPageDefinition } from '@/assets/definitions/widgets/chart/page'
import ChartWidgetsDefinitions from '@/assets/definitions/widgets/chart/index'
import { OhLocationCardParameters, OhEquipmentCardParameters, OhPropertyCardParameters } from '@/assets/definitions/widgets/home'
import { BlockLibrariesComponentDefinitions } from '@/assets/definitions/blockly/libraries-components'

let itemsCache = null

function getWidgetDefinitions (cm) {
  const mode = cm.state.originalMode
  const componentType = (mode.indexOf(';type=') > 0) ? mode.split('=')[1] : undefined
  switch (componentType) {
    case 'chart':
      return [
        OhChartPageDefinition(),
        ...Object.keys(ChartWidgetsDefinitions).map((name) => {
          return Object.assign({}, ChartWidgetsDefinitions[name], { name })
        })
      ]
    case 'plan':
      return Object.values(PlanWidgets).map((c) => c.widget()).sort((c1, c2) => c1.name.localeCompare(c2.name))
    case 'map':
      return Object.values(MapWidgets).map((c) => c.widget()).sort((c1, c2) => c1.name.localeCompare(c2.name))
    case 'blocks':
      return Object.values(BlockLibrariesComponentDefinitions).map((c) => c()).sort((c1, c2) => c1.name.localeCompare(c2.name))
    default:
      const ohComponents = Object.values({ ...SystemWidgets, ...LayoutWidgets, ...StandardWidgets, ...StandardListWidgets, ...StandardCellWidgets })
        .filter((w) => w.widget && typeof w.widget === 'function')
      const f7Components = Object.values(f7vue).filter((m) => m.name && m.name.indexOf('f7-') === 0)
      return [
        ...(componentType === 'home') ? [OhLocationCardParameters(), OhEquipmentCardParameters(), OhPropertyCardParameters()] : [],
        ...ohComponents.map((c) => c.widget()).sort((c1, c2) => c1.name.localeCompare(c2.name)),
        ...f7Components.sort((c1, c2) => c1.name.localeCompare(c2.name)),
        ...Object.keys(ChartWidgetsDefinitions).map((name) => {
          return Object.assign({}, ChartWidgetsDefinitions[name], { name })
        })
      ]
  }
}

function hintItems (cm, line, replaceAfterColon, addStatePropertySuffix, addQuotes) {
  const cursor = cm.getCursor()
  const promise = (itemsCache) ? Promise.resolve(itemsCache) : cm.state.$oh.api.get('/rest/items')
  return promise.then((data) => {
    if (!itemsCache) itemsCache = data
    let ret = {
      list: data.map((item) => {
        return {
          text: (addQuotes ? '\'' : '') + item.name + ((addStatePropertySuffix ? '.state' : '')) + (addQuotes ? '\'' : ''),
          displayText: item.name,
          description: `${(item.label) ? item.label + ' ' : ''}(${item.type})<br />${item.state}`
        }
      }).sort((i1, i2) => i1.text.localeCompare(i2.text))
    }
    ret.list = filterPartialCompletions(cm, line, ret.list)
    if (replaceAfterColon) {
      const colonPos = line.indexOf(':')
      ret.from = { line: cursor.line, ch: colonPos + 2 }
      ret.to = { line: cursor.line, ch: line.length }
    } else if (addQuotes) {
      const lastAtOp = line.substring(0, cursor.ch).replace(/@[A-Za-z0-9_-]*$/, '@')
      ret.to = { line: cursor.line, ch: lastAtOp.length }
    } else {
      const lastDot = line.substring(0, cursor.ch).replace(/\.[A-Za-z0-9_-]*$/, '.')
      ret.to = { line: cursor.line, ch: lastDot.length }
    }
    addTooltipHandlers(cm, ret)
    return ret
  })
}

function hintOptions (cm, line, parameter) {
  const cursor = cm.getCursor()
  const colonPos = line.indexOf(':')
  let ret = {
    list: parameter.options.map((o) => {
      return {
        text: o.value,
        description: o.label || o.value
      }
    })
  }
  ret.list = filterPartialCompletions(cm, line, ret.list)
  ret.from = { line: cursor.line, ch: colonPos + 2 }
  ret.to = { line: cursor.line, ch: line.length }
  return ret
}

function hintExpression (cm, line) {
  const cursor = cm.getCursor()
  if (line[cursor.ch - 1] === ' ' || line[cursor.ch - 1] === '=') {
    return {
      list: [
        { text: 'items.', displayText: 'items', description: 'Access to item states' },
        { text: 'props.', displayText: 'props', description: 'Access to the props of the parent root component' },
        { text: 'config.', displayText: 'config', description: 'Access to the configuration of the current component' },
        { text: 'vars.', displayText: 'vars', description: 'Access to context vars' },
        { text: 'loop.', displayText: 'loop', description: 'Access to oh-repeater loop variables' },
        { text: 'JSON.', displayText: 'JSON', description: 'Access to the JSON object functions' },
        { text: 'Math.', displayText: 'Math', description: 'Access to the Math object functions' },
        { text: 'Number.', displayText: 'Number', description: 'Access to the Number object functions' },
        { text: 'theme', displayText: 'theme', description: 'The current theme: aurora, ios, or md' },
        { text: 'themeOptions', displayText: 'themeOptions', description: 'Object with current theme options' },
        { text: 'device', displayText: 'device', description: 'Object with information about the current device & browser' },
        { text: 'user', displayText: 'user', description: 'Access the username and roles of the logged in user' },
        { text: 'screen', displayText: 'screen', description: 'Object with information about the screen and available view area' },
        { text: 'dayjs', displayText: 'dayjs', description: 'Access to the Day.js object for date manipulation & formatting' }
      ]
    }
  } else {
    const lastAtOp = line.substring(0, cursor.ch).replace(/@[A-Za-z0-9_-]*$/, '@')
    if (lastAtOp.endsWith('@')) {
      return hintItems(cm, line, false, false, true)
    }
    const lastDot = line.substring(0, cursor.ch).replace(/\.[A-Za-z0-9_-]*$/, '.')
    if (lastDot.endsWith('items.')) {
      return hintItems(cm, line, false, true)
    }
  }
}

function f7ComponentParameters (componentName) {
  console.debug(f7vue)
  const Component = Vue.options.components[componentName]
  if (!Component) return []
  let f7vueComponent

  for (const m in f7vue) {
    // eslint-disable-next-line import/namespace
    if (f7vue[m].name === componentName) f7vueComponent = f7vue[m]
  }
  console.debug(f7vueComponent)
  if (!f7vueComponent) return []
  const params = []
  const instance = new Component()
  for (const propName in f7vueComponent.props) {
    const prop = f7vueComponent.props[propName]
    const propType = (Array.isArray(prop.type)) ? prop.type.map((t) => t.name).join(' | ') : prop.type.name
    const paramType = (propType === 'String') ? 'TEXT' : (propType === 'Number') ? 'INTEGER' : (propType === 'Boolean') ? 'BOOLEAN' : 'UNKNOWN'
    params.push({
      name: propName,
      label: propName,
      description: `${propType}<br />${(instance.props[propName] !== undefined) ? `Default value: ${JSON.stringify(instance.props[propName])}` : ''}<br /><br />See ${componentName} docs`,
      type: paramType
    })
  }

  return params
}

function hintConfig (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const componentType = findComponentType(cm, parentLineNr)
  console.debug(`hinting config for component type: ${componentType}`)
  const indent = lineIndent(cm, parentLineNr)
  if (!componentType) return
  const colonPos = line.indexOf(':')
  const afterColon = colonPos > 0 && cursor.ch > colonPos
  const widgetDefinition = getWidgetDefinitions(cm).find((d) => d.name === componentType)
  let parameters = (componentType.indexOf('f7-') === 0) ? f7ComponentParameters(componentType)
    : (widgetDefinition && widgetDefinition.props) ? widgetDefinition.props.parameters : []
  if (componentType.indexOf('oh-') === 0) {
    // try our luck and find a matching underlying f7-vue component...
    const f7parameters = f7ComponentParameters(componentType.replace('oh-', 'f7-').replace('-card', ''))
    if (f7parameters.length) {
      parameters.push(...f7parameters.filter((p) => !parameters.find((p2) => p2.name === p.name)))
    }
  }
  if (afterColon) {
    if (line.indexOf('=') > 0) {
      return hintExpression(cm, line)
    }
    const parameterName = line.substring(0, colonPos).trim()
    const parameter = parameters.find((p) => p.name === parameterName)
    if (parameter) {
      if (parameter.type === 'BOOLEAN') {
        if (line.endsWith('true') || line.endsWith('false')) return
        return {
          list: [{ text: 'true' }, { text: 'false' }],
          from: { line: cursor.line, ch: colonPos + 2 },
          to: { line: cursor.line, ch: line.length }
        }
      } else if (parameter.context === 'item') {
        return hintItems(cm, line, true)
      } else if (parameter.options) {
        return hintOptions(cm, line, parameter)
      }
    }
  } else {
    console.debug(widgetDefinition)
    let completions = parameters.map((p) => {
      return {
        text: p.name + ': ',
        displayText: p.name,
        description: p.description,
        className: getClassNamesForParameter(p)
      }
    })
    completions = filterPartialCompletions(cm, line, completions)
    const ret = {
      list: completions,
      from: { line: cursor.line, ch: indent + 2 },
      to: { line: cursor.line, ch: line.length }
    }
    addTooltipHandlers(cm, ret, true)
    return ret
  }
}

function hintComponentStructure (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const indent = (parentLineNr !== undefined) ? lineIndent(cm, parentLineNr) : -2
  let ret = {
    list: [
      {
        text: ' '.repeat(indent + 2) + 'config:\n' + ' '.repeat(indent + 4),
        displayText: 'config'
      },
      {
        text: ' '.repeat(indent + 2) + 'slots:\n' + ' '.repeat(indent + 4),
        displayText: 'slots'
      },
      {
        text: ' '.repeat(indent + 2) + 'slots:\n' +
          ' '.repeat(indent + 4) + 'default:\n' +
          ' '.repeat(indent + 6) + '- component: ',
        displayText: 'default slot'
      }
    ]
  }
  ret.from = { line: cursor.line, ch: 0 }
  ret.to = { line: cursor.line, ch: cm.getLine(cursor.line).length }
  addTooltipHandlers(cm, ret, true)
  return ret
}

function hintSlots (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const indent = lineIndent(cm, parentLineNr)
  const definitions = getWidgetDefinitions(cm)
  let completions = definitions.map((c) => {
    return {
      text: ' '.repeat(indent + 2) + `- component: ${c.name}\n` +
// ' '.repeat(indent + 4) + 'config:\n' +
' '.repeat(indent + 4),
      displayText: c.name,
      componentName: c.name,
      className: `${cls}completion ${cls}completion-unknown`,
      description: c.description || 'A component of type ' + c.name
    }
  })
  completions = filterPartialCompletions(cm, line, completions, 'componentName')
  let ret = {
    list: completions
  }
  ret.from = { line: cursor.line, ch: 0 }
  ret.to = { line: cursor.line, ch: cm.getLine(cursor.line).length }
  addTooltipHandlers(cm, ret, true)
  return ret
}

export default function hint (cm, option, mode) {
  const cursor = cm.getCursor()
  const line = cm.getLine(cursor.line)

  const parentLineNr = findParent(cm, cursor.line)
  const parentLine = cm.getLine(parentLineNr)
  console.debug(`parent line (${parentLineNr}): ${parentLine}`)

  let ret
  if (parentLine && isConfig(parentLine)) {
    ret = hintConfig(cm, line, parentLineNr)
  } else if (isComponent(parentLine) || lineIndent(cm, cursor.line) === 0) {
    ret = hintComponentStructure(cm, line, parentLineNr)
  } else {
    if (parentLine) {
      const grandparentLineNr = findParent(cm, parentLineNr)
      const grandparentLine = cm.getLine(grandparentLineNr)
      if (isSlots(grandparentLine)) {
        ret = hintSlots(cm, line, parentLineNr)
      }
    }
  }

  if (!(ret instanceof Promise)) addTooltipHandlers(cm, ret)

  return ret
}
