import fs  from 'fs'

import * as SystemWidgets from './_definitions/widgets/system/index.js'
import * as StdCardWidgets from './_definitions/widgets/standard/cards.js'
import * as StdListItemWidgets from './_definitions/widgets/standard/listitems.js'
import * as StdCellWidgets from './_definitions/widgets/standard/cells.js'

const widgetLibraries = {
  SystemWidgets,
  StdCardWidgets,
  StdListItemWidgets,
  StdCellWidgets
}

console.log(widgetLibraries)

let index = fs.readFileSync('./index.md', 'utf8')

const buildProp = (prop) => {
  let ret = '\n'
  ret += '- `' + prop.name + '` <small>' + prop.type + '</small> _' + prop.label + '_\n'
  ret += '\n  ' + prop.description + '\n'
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

const processComponent = (component) => {
  const componentType = component.name
  console.log(componentType)
  const template = fs.readFileSync('./component.md', 'utf8')
  let final = template
  final = final.replace(/\{componentType\}/g, componentType + ' - ' + component.label)
  final = final.replace(/\{componentDescription\}/g, component.description)
  final = final.replace(/\{props\}/g, buildProps(component))
  fs.writeFileSync('../' + componentType + '.md', final)
}

Object.keys(widgetLibraries).forEach((l) => {
  const library = widgetLibraries[l]
  let table = ''
  Object.keys(library).forEach((w) => {
    const widget = library[w]()
    table += '| [`' + widget.name + '`](./' + widget.name + '.html) | ' + widget.label + ' | ' + widget.description + ' |\n'
    processComponent(widget)
  })
  index = index.replace('{' + l + '}', table)
})

fs.writeFileSync('../index.md', index)
