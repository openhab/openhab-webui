import {
  insertCompletionText,
  pickedCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult
} from '@codemirror/autocomplete'
import { lineIndent, findParent, isConfig, isComponent, isSlots, findComponentType } from './yaml-utils'
import { completionStart, hintItems, hintParameterValues, hintParameters } from './hint-utils'

import * as f7vue from 'framework7-vue'

import * as SystemWidgets from '@/components/widgets/system'
import * as StandardWidgets from '@/components/widgets/standard'
import * as StandardListWidgets from '@/components/widgets/standard/list'
import * as StandardCellWidgets from '@/components/widgets/standard/cell'
import * as LayoutWidgets from '@/components/widgets/layout'
import * as PlanWidgets from '@/components/widgets/plan'
import * as MapWidgets from '@/components/widgets/map'
import ChartWidgetsDefinitions, { OhChartPageDefinition } from '@/assets/definitions/widgets/chart'
import { OhLocationCardParameters, OhEquipmentCardParameters, OhPropertyCardParameters } from '@/assets/definitions/widgets/home'
import { BlockLibrariesComponentDefinitions } from '@/assets/definitions/blockly/libraries-components'
import type { Line } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import type { ExtendedEditorView } from './types'
import type { OhComponent } from '@/components/widgets/types'
import type { WidgetDefinition } from '@/assets/definitions/widgets'
import type * as api from '@/api'

const ComponentID = /[\w-]+/

interface F7VueComponent {
  name: string
  props?: Record<string, object>
}

let ohComponents: WidgetDefinition[] | null = null
let f7Components: F7VueComponent[] | null = null

function getOhComponents() {
  ohComponents ??= Object.values<OhComponent>({
    ...SystemWidgets,
    ...LayoutWidgets,
    ...StandardWidgets,
    ...StandardListWidgets,
    ...StandardCellWidgets
  })
    .filter((w) => w.widget && typeof w.widget === 'function')
    .map((c) => c.widget())
    .sort((c1, c2) => c1.name.localeCompare(c2.name))
  return ohComponents
}

const isF7VueComponent = (value: unknown): value is F7VueComponent => {
  return (
    value != null &&
    typeof value === 'object' &&
    'name' in value &&
    typeof (value as F7VueComponent).name === 'string' &&
    (value as F7VueComponent).name.startsWith('f7-')
  )
}

function getF7Components() {
  f7Components ??= (Object.values(f7vue) as unknown[]).filter(isF7VueComponent).sort((c1, c2) => c1.name.localeCompare(c2.name))
  return f7Components
}

function getWidgetDefinitions(context: CompletionContext): (WidgetDefinition | F7VueComponent)[] {
  const mode = (context.view as ExtendedEditorView).originalMode
  const componentType = mode.includes(';type=') ? mode.split('=')[1] : undefined
  switch (componentType) {
    case 'chart':
      return [
        OhChartPageDefinition(),
        ...Object.entries(ChartWidgetsDefinitions).map(([name, chartWidgetDefinition]) => {
          return Object.assign({}, chartWidgetDefinition, { name })
        })
      ]
    case 'plan':
      return Object.values(PlanWidgets)
        .map((c) => c.widget())
        .sort((c1, c2) => c1.name.localeCompare(c2.name))
    case 'map':
      return Object.values(MapWidgets)
        .map((c) => c.widget())
        .sort((c1, c2) => c1.name.localeCompare(c2.name))
    case 'blocks':
      return (Object.values(BlockLibrariesComponentDefinitions) as Array<() => WidgetDefinition>)
        .map((c) => c())
        .sort((c1, c2) => c1.name.localeCompare(c2.name))
    default:
      return [
        ...(componentType === 'home' ? [OhLocationCardParameters(), OhEquipmentCardParameters(), OhPropertyCardParameters()] : []),
        ...getOhComponents(),
        ...getF7Components(),
        ...Object.entries(ChartWidgetsDefinitions).map(([name, chartWidgetDefinition]) => {
          return Object.assign({}, chartWidgetDefinition, { name })
        })
      ]
  }
}

function hintExpression(context: CompletionContext, line: Line): CompletionResult | Promise<CompletionResult | null> | null {
  const cursor = context.pos - line.from

  const lastOp = line.text.substring(0, cursor).replace(/([@#.])[A-Za-z0-9_-]*$/, '$1')
  if (lastOp.endsWith('@') || lastOp.endsWith('#')) {
    return hintItems(context, { prefix: "'", suffix: "'" })
  } else if (lastOp.endsWith('items.')) {
    return hintItems(context, { suffix: '.state' })
  } else if (lastOp.endsWith('.')) {
    return null
  }

  const Expression = /[\w@#]+/
  let boost = 0
  return {
    from: completionStart(context, Expression),
    validFor: Expression,
    options: [
      {
        label: '@',
        info: 'Shortcut for accessing item displayState\nwith fall back to raw item state'
      },
      {
        label: '@@',
        info: 'Shortcut for accessing raw item state'
      },
      {
        label: '#',
        info: 'Shortcut for accessing items numeric state'
      },
      {
        label: 'items',
        apply: 'items.',
        info: 'Access to item states'
      },
      {
        label: 'items',
        apply: 'items.',
        info: 'Access to item states'
      },
      {
        label: 'props',
        apply: 'props.',
        info: 'Access to the props of the parent root component'
      },
      {
        label: 'config',
        apply: 'config.',
        info: 'Access to the configuration of the current component'
      },
      {
        label: 'vars',
        apply: 'vars.',
        info: 'Access to context vars'
      },
      {
        label: 'fn',
        apply: 'fn.',
        info: 'Access to oh-context functions'
      },
      {
        label: 'const',
        apply: 'const.',
        info: 'Access to oh-context constants'
      },
      {
        label: 'loop',
        apply: 'loop.',
        info: 'Access to oh-repeater loop variables'
      },
      {
        label: 'JSON',
        apply: 'JSON.',
        info: 'Access to the JSON object functions'
      },
      {
        label: 'Math',
        apply: 'Math.',
        info: 'Access to the Math object functions'
      },
      {
        label: 'Number',
        apply: 'Number.',
        info: 'Access to the Number object functions'
      },
      {
        label: 'theme',
        info: 'The current theme: aurora, ios, or md'
      },
      {
        label: 'themeOptions',
        info: 'Object with current theme options'
      },
      {
        label: 'device',
        info: 'Object with information about the current device & browser'
      },
      {
        label: 'user',
        info: 'Access the username and roles of the logged in user'
      },
      {
        label: 'screen',
        info: 'Object with information about the screen and available view area'
      },
      {
        label: 'dayjs',
        info: 'Access to the Day.js object for date manipulation & formatting'
      }
    ].map((option) => {
      // Enforce insertion order by applying boost to override CodeMirror's automatic sorting
      return { ...option, boost: boost-- }
    })
  }
}

function f7ComponentParameters(componentName: string): api.ConfigDescriptionParameter[] {
  console.debug(f7vue)
  const f7VueComponent = getF7Components().find((c) => c.name === componentName)
  console.debug(f7VueComponent)
  if (!f7VueComponent) return []

  const defaultProps: Record<string, any> = {}
  if (f7VueComponent.props && typeof f7VueComponent.props === 'object') {
    for (const [name, prop] of Object.entries(f7VueComponent.props)) {
      if (prop && typeof prop === 'object' && 'default' in prop) defaultProps[name] = prop.default
    }
  }

  enum PARAM_TYPE {
    String = 'TEXT',
    Number = 'INTEGER',
    Boolean = 'BOOLEAN'
  }

  const resolvePropTypeName = (p: { type?: unknown }): string | null => {
    if (!p) return null
    const extract = (t: unknown): string | null => {
      if (!t) return null
      if (typeof t === 'function') return t.name || 'Object'
      if (Array.isArray(t)) return t.map(extract).join(' | ')
      if (typeof t === 'string') return t
      return null
    }
    if (p.type !== undefined) return extract(p.type)
    return extract(p)
  }

  if (!f7VueComponent.props || typeof f7VueComponent.props !== 'object') return []

  const params: api.ConfigDescriptionParameter[] = Object.entries(f7VueComponent.props).map(([propName, prop]) => {
    const propType = resolvePropTypeName(prop)
    const defaultValue = defaultProps[propName] !== undefined ? 'Default value: ' + JSON.stringify(defaultProps[propName]) : ''
    return {
      name: propName,
      description: `${propType}\n${defaultValue}\n\nSee ${componentName} docs`,
      type: propType === PARAM_TYPE.Number || propType === PARAM_TYPE.Boolean ? propType : PARAM_TYPE.String
    }
  })

  return params
}

function hintConfig(context: CompletionContext, line: Line, parentLine: Line): CompletionResult | Promise<CompletionResult | null> | null {
  const componentType = findComponentType(context, parentLine)
  console.debug('hinting config for component type:', componentType)
  if (!componentType) return null
  const colonPos = line.text.indexOf(':')
  const column = context.pos - line.from
  const afterColon = colonPos > 0 && column > colonPos
  const widgetDefinition = getWidgetDefinitions(context).find((d) => d.name === componentType)
  const widgetParameters =
    widgetDefinition && 'props' in widgetDefinition && widgetDefinition.props && 'parameters' in widgetDefinition.props
      ? (widgetDefinition.props.parameters as api.ConfigDescriptionParameter[])
      : []
  const parameters: api.ConfigDescriptionParameter[] = componentType.startsWith('f7-')
    ? f7ComponentParameters(componentType)
    : widgetParameters
  if (componentType.startsWith('oh-')) {
    // try our luck and find a matching underlying f7-vue component...
    const f7parameters = f7ComponentParameters(componentType.replace('oh-', 'f7-').replace('-card', ''))
    if (f7parameters.length) {
      parameters.push(...f7parameters.filter((p) => !parameters.find((p2) => p2.name === p.name)))
    }
  }
  if (afterColon) {
    if (line.text.includes('=')) {
      return hintExpression(context, line)
    }
    return hintParameterValues(context, parameters, line, colonPos)
  } else {
    console.debug(widgetDefinition)
    const parentIndent = lineIndent(parentLine)
    return hintParameters(context, parameters, parentIndent + 2)
  }
}

function hintComponents(context: CompletionContext, line: Line): CompletionResult | null {
  const colonPos = line.text.indexOf(':')
  const column = context.pos - line.from
  if (column < colonPos + 2) return null

  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const from = line.from + colonPos + 2
    const to = view.state.doc.lineAt(context.pos).to
    const insert = completion.label
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  const components = getWidgetDefinitions(context)
  let boost = 0
  return {
    from: completionStart(context, ComponentID),
    validFor: ComponentID,
    options: components.map((c) => {
      return {
        label: c.name,
        info: 'description' in c ? c.description : 'A component of type ' + c.name,
        apply,
        boost: boost-- // preserve order
      }
    })
  }
}

function hintComponentStructure(context: CompletionContext, parentLine: Line | undefined) {
  const indent = parentLine ? lineIndent(parentLine) : -2
  type StructuredCompletion = Completion & { code: string }
  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const line = view.state.doc.lineAt(context.pos)
    const { from, to } = line
    const insert = (completion as StructuredCompletion).code
    view.dispatch({
      ...insertCompletionText(view.state, insert, from, to),
      annotations: pickedCompletion.of(completion) // trigger subsequent completion
    })
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: [
      {
        label: 'config',
        apply,
        code: ' '.repeat(indent + 2) + 'config:\n' + ' '.repeat(indent + 4)
      },
      {
        label: 'slots',
        apply,
        code: ' '.repeat(indent + 2) + 'slots:\n' + ' '.repeat(indent + 4)
      },
      {
        label: 'default slot',
        apply,
        code: ' '.repeat(indent + 2) + 'slots:\n' + ' '.repeat(indent + 4) + 'default:\n' + ' '.repeat(indent + 6) + '- component: '
      }
    ]
  }
}

function hintSlots(context: CompletionContext, line: Line, parentLine: Line) {
  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const indent = lineIndent(parentLine)
    const insert =
      ' '.repeat(indent + 2) +
      `- component: ${completion.label}\n` +
      // ' '.repeat(indent + 4) + 'config:\n' +
      ' '.repeat(indent + 4)
    const from = line.from
    const to = view.state.doc.lineAt(context.pos).to
    view.dispatch({
      ...insertCompletionText(view.state, insert, from, to),
      annotations: pickedCompletion.of(completion) // trigger subsequent completion
    })
  }

  const definitions = getWidgetDefinitions(context)
  let boost = 0
  return {
    from: completionStart(context, ComponentID),
    validFor: ComponentID,
    options: definitions.map((c) => {
      return {
        label: c.name,
        info: 'description' in c ? c.description : 'A component of type ' + c.name,
        apply,
        boost: boost--
      }
    })
  }
}

export default function hint(context: CompletionContext): CompletionResult | Promise<CompletionResult | null> | null {
  const currentLine = context.state.doc.lineAt(context.pos)
  const parentLine = findParent(context, currentLine)
  console.debug('parent line', parentLine)

  if (parentLine && isConfig(parentLine)) {
    return hintConfig(context, currentLine, parentLine)
  } else if ((parentLine && isComponent(parentLine)) || lineIndent(currentLine) === 0) {
    return hintComponentStructure(context, parentLine)
  } else if (isComponent(currentLine)) {
    return hintComponents(context, currentLine)
  } else if (parentLine) {
    const grandparentLine = findParent(context, parentLine)
    if (isSlots(grandparentLine)) {
      return hintSlots(context, currentLine, parentLine)
    }
  }
  return null
}
