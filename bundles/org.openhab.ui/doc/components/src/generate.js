import fs from 'fs'

import * as SystemWidgets from '../../../web/src/assets/definitions/widgets/system/index.js'
import * as StdCardWidgets from '../../../web/src/assets/definitions/widgets/standard/cards.js'
import * as StdListItemWidgets from '../../../web/src/assets/definitions/widgets/standard/listitems.js'
import * as StdCellWidgets from '../../../web/src/assets/definitions/widgets/standard/cells.js'
import * as LayoutWidgets from '../../../web/src/assets/definitions/widgets/layout/index.js'
import * as PlanWidgets from '../../../web/src/assets/definitions/widgets/plan/index.js'
import * as MapWidgets from '../../../web/src/assets/definitions/widgets/map/index.js'
import { OhChartPageDefinition } from '../../../web/src/assets/definitions/widgets/chart/page.js'
import ChartWidgetsDefinitions from '../../../web/src/assets/definitions/widgets/chart/index.js'
import { OhLocationCardParameters, OhEquipmentCardParameters, OhPropertyCardParameters } from '../../../web/src/assets/definitions/widgets/home/index.js'

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

const replaceBetweenComments = (commentTag, text, value) => {
  const regexp = new RegExp('(<!-- \\\w* ' + commentTag + ' -->\r?\n)[\\\s\\\S]*(\r?\n<!-- \\\w* \\\/' + commentTag + ' -->)', 'm')
  // console.log(regexp)
  // console.log(regexp.test(text))
  return text.replace(regexp, '$1' + value + '$2')
}

const buildProp = (prop) => {
  let ret = ''

  ret += '| <a href="#' + prop.name + '">`' + prop.name + '`</a><br>' + prop.type + ' | ' + prop.label + ' | '
  if (prop.description) {
    ret += prop.description + ' | '
  } else {
    ret += ' | '
  }
  if (prop.type === 'BOOLEAN') ret += ' `true`<br>`false`'
  if (prop.options) {
    prop.options.forEach((o) => {
      ret += '<a href="#' + prop.name + '-' + (o.value || '(empty)') + '">`' + (o.value || '(empty)') + '`&nbsp;</a>' + o.label + '<br>'
    })
    if (prop.multiple) ret += '\n\n  Multiple options are allowed.\n'
      ret += ' |\n'
  } else {
      ret += ' |\n'
  }
  return ret
}

const buildProps = (component) => {
  let ret = '\n'
  ret += '| `Property name`<br>Data type | Label | Description | <div width=200px>Options</div> |\n'
  ret += '|:---|:---|:----|:----|\n'
  const propsWithoutGroup = component.props.parameters.filter((p) => p.groupName === undefined)
  propsWithoutGroup.forEach((p) => ret += buildProp(p))
  if (component.props.parameterGroups) {
    component.props.parameterGroups.forEach((g) => {
      ret += '\n### ' + g.label + '\n\n'
      if (g.description) ret += g.description + '\n\n'
      ret += '| `Property name`<br>Data type | Label | Description | Options |\n'
      ret += '|:---|:---|:----|:----|\n'
      const propsInGroup = component.props.parameters.filter((p) => p.groupName === g.name)
      propsInGroup.forEach((p) => ret += buildProp(p))
    })
  }
  return ret
}

const processComponent = (component, name) => {
  const componentType = component.name || name
  console.log(componentType)
  const targetFile = '../' + componentType + '.md'
  const sourceFile = fs.existsSync(targetFile) ? targetFile : './component.md'
  let doc = fs.readFileSync(sourceFile, 'utf8')
  let final = doc
  final = final.replace(/\{componentType\}/g, componentType)
  final = final.replace(/\{componentLabel\}/g, component.label)
  final = final.replace(/\{componentDescription\}/g, component.description || 'Reference documentation for the ' + componentType + ' component')
  final = replaceBetweenComments('componentDescription', final, component.description || '')
  final = replaceBetweenComments('props', final, buildProps(component))
  // final = final.replace(/\{componentDescription\}/g, component.description || '')
  // final = final.replace(/\{props\}/g, buildProps(component))
  fs.writeFileSync('../' + componentType + '.md', final)
}

Object.keys(widgetLibraries).forEach((l) => {
  const library = widgetLibraries[l]
  let table = ''
  Object.keys(library).forEach((w) => {
    const widget = (typeof library[w] === 'function') ? library[w]() : library[w]
    const widgetName = widget.name || w
    if (widgetName.indexOf('oh-') < 0) return
    table += '| [`' + widgetName + '`](./' + widgetName + '.html) |  [' + widget.label + '](./' + widgetName + '.html) | ' + (widget.description || '') + ' |\n'
    processComponent(widget, w)
  })
  index = index.replace('{' + l + '}', table)
})

fs.writeFileSync('../index.md', index)
