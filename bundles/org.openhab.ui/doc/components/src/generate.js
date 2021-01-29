import fs  from 'fs'

import * as SystemWidgets from './_definitions/widgets/system/index.js'
import * as StdCardWidgets from './_definitions/widgets/standard/cards.js'
import * as StdListItemWidgets from './_definitions/widgets/standard/listitems.js'
import * as StdCellWidgets from './_definitions/widgets/standard/cells.js'
import * as LayoutWidgets from './_definitions/widgets/layout/index.js'
import * as PlanWidgets from './_definitions/widgets/plan/index.js'
import * as MapWidgets from './_definitions/widgets/map/index.js'
import { OhChartPageDefinition } from './_definitions/widgets/chart/page.js'
import ChartWidgetsDefinitions from './_definitions/widgets/chart/index.js'
import { OhLocationCardParameters, OhEquipmentCardParameters, OhPropertyCardParameters } from './_definitions/widgets/home/index.js'

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

console.log(widgetLibraries)

let index = fs.readFileSync('./index.md', 'utf8')

const buildProp = (prop) => {
  let ret = '\n'
  ret += '- `' + prop.name + '` <small>' + prop.type + '</small> _' + prop.label + '_\n'
  if (prop.description) ret += '\n  ' + prop.description + '\n'
  if (prop.options) {
    // ret += '\n  Options:\n\n'
    ret += '  | Option | Label |\n'
    ret += '  |--------|-------|\n'
    prop.options.forEach((o) => {
      ret += '  | `' + o.value + '` | ' + o.label + ' |\n'
    })
    if (prop.multiple) ret += '\n  Multiple options are allowed.\n'
    ret += '\n'
  }
  return ret
}
const buildProps = (component) => {
  let ret = ''
  const propsWithoutGroup = component.props.parameters.filter((p) => p.groupName === undefined)
  propsWithoutGroup.forEach((p) => ret += buildProp(p))
  if (component.props.parameterGroups) {
    component.props.parameterGroups.forEach((g) => {
      ret += '\n### ' + g.label + '\n\n'
      if (g.description) ret += g.description + '\n\n'
      const propsInGroup = component.props.parameters.filter((p) => p.groupName === g.name)
      propsInGroup.forEach((p) => ret += buildProp(p))
    })
  }
  return ret
}

const processComponent = (component, name) => {
  const componentType = component.name || name
  console.log(componentType)
  const template = fs.readFileSync('./component.md', 'utf8')
  let final = template
  final = final.replace(/\{componentType\}/g, componentType + ' - ' + component.label)
  final = final.replace(/\{componentDescription\}/g, component.description || '')
  final = final.replace(/\{props\}/g, buildProps(component))
  fs.writeFileSync('../' + componentType + '.md', final)
}

Object.keys(widgetLibraries).forEach((l) => {
  const library = widgetLibraries[l]
  let table = ''
  Object.keys(library).forEach((w) => {
    const widget = (typeof library[w] === 'function') ? library[w]() : library[w]
    const widgetName = widget.name || w
    table += '| [`' + widgetName + '`](./' + widgetName + '.html) | ' + widget.label + ' | ' + (widget.description || '') + ' |\n'
    processComponent(widget, w)
  })
  index = index.replace('{' + l + '}', table)
})

fs.writeFileSync('../index.md', index)
