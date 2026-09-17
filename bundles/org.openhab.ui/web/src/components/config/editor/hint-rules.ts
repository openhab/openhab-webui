import { CompletionContext, insertCompletionText, type Completion, type CompletionResult } from '@codemirror/autocomplete'
import { findParent, lineIndent, findRootSection, isConfig } from './yaml-utils'
import { completionStart, hintItems, hintParameterValues, hintParameters } from './hint-utils'
import type { Line } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

import * as api from '@/api'

let moduleTypesCache: { [section: string]: api.ModuleType[] | null } = {}
let templatesCache: api.RuleTemplateDto[] = []

async function getModuleTypes(section: string) {
  if (moduleTypesCache[section]) return moduleTypesCache[section]

  const result = await api.getModuleTypes({ type: section })

  if (result) {
    moduleTypesCache[section] = result
    return moduleTypesCache[section]
  }

  return []
}

async function getTemplates() {
  if (templatesCache?.length) return [...templatesCache]

  const result = await api.getTemplates()
  if (result) {
    templatesCache = result
    return [...templatesCache]
  }
  return []
}

function findModuleType(context: CompletionContext, arrayElementLine: Line) {
  if (!arrayElementLine) return null
  const arrayIndent = lineIndent(arrayElementLine, true)
  for (let l = arrayElementLine.number; l <= context.state.doc.lines; l++) {
    const line = context.state.doc.line(l)
    const indent = lineIndent(line, true)
    if (indent < arrayIndent) break
    if (indent > arrayIndent) continue
    const match = line.text.match(/^(?: {8}| {6}- )type:\s*(\w+)\s*$/)
    if (match && match.length === 2) {
      return match[1]
    }
  }
  return null
}

function getChildLines(context: CompletionContext, line: Line, ignoreHyphen = false): Line[] {
  const childIndent = lineIndent(line, ignoreHyphen) + 2
  let childLine
  let indent
  let result: Line[] = []
  for (let l = line.number + 1; l <= context.state.doc.lines; l++) {
    childLine = context.state.doc.line(l)
    indent = lineIndent(childLine, ignoreHyphen)
    if (indent < childIndent) break
    if (indent > childIndent) continue
    if (!childLine.text.trim()) continue
    result.push(childLine)
  }
  return result
}

function getTemplateUid(context: CompletionContext, grandParentLine: Line): string | null {
  if (!grandParentLine) return null

  const rulePropsIndent = lineIndent(grandParentLine, true) + 2
  const regex = new RegExp(`^ {${rulePropsIndent}}(?:template|templateUID):\\s*(\\S+)\\s*$`, 'i')
  for (let l = grandParentLine.number + 1; l <= context.state.doc.lines; l++) {
    const line = context.state.doc.line(l)
    const indent = lineIndent(line, true)
    if (indent < rulePropsIndent) break
    if (indent > rulePropsIndent) continue
    const match = line.text.match(regex)
    if (match && match.length === 2) {
      return match[1]
    }
  }
  return null
}

function applyAliasToMimeType(section: string, completionResult: CompletionResult | null): CompletionResult | null {
  if (!completionResult || !completionResult.options || !completionResult.options.length) return completionResult
  completionResult.options.forEach((option) => {
    const alias = mimeTypeToAlias(section, option.label)
    if (alias !== option.label) {
      option.label = `${alias} (${option.label})`
      option.apply = (view: EditorView, _completion: Completion, _from: number, _to: number) => {
        view.dispatch(insertCompletionText(view.state, alias, _from, _to))
      }
    }
  })
  return completionResult
}

async function hintTemplateConfig(
  context: CompletionContext,
  templateUid: string,
  line: Line,
  parentLine: Line
): Promise<CompletionResult | null> {
  const templates = await getTemplates()
  const template = templates.find((t) => t.uid === templateUid)
  if (!template) {
    return null
  }

  const cursor = context.pos - line.from
  const colonPos = line.text.indexOf(':')
  const afterColon = colonPos > 0 && cursor > colonPos
  const parameters = template.configDescriptions

  if (afterColon) {
    const result = hintParameterValues(context, parameters, line, colonPos)
    if (result) {
      return result
    }

    const parameterName = line.text.substring(0, colonPos).trim()
    const parameter = parameters.find((p) => p.name === parameterName)
    if (parameter?.default) {
      const defaultStr = parameter.default || ''

      const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
        const from = line.from + colonPos + 2
        const to = view.state.doc.lineAt(context.pos).to
        view.dispatch(insertCompletionText(view.state, defaultStr, from, to))
      }
      return {
        from: completionStart(context),
        validFor: /\w+/,
        options: [{ label: 'Default: ' + defaultStr, info: parameter.description ? parameter.description : parameter.label, apply }]
      }
    }
    return result
  } else {
    let existing = []
    for (const sibling of getChildLines(context, parentLine, false)) {
      const colonPos = sibling.text.indexOf(':')
      if (colonPos > 0) {
        const siblingName = sibling.text.substring(0, colonPos).trim()
        if (siblingName) {
          existing.push(siblingName)
        }
      }
    }
    const result = hintParameters(context, parameters, lineIndent(line, true))
    result.options = result.options.filter((c) => existing.indexOf(c.label) < 0)
    return result
  }
}

async function hintTemplate(context: CompletionContext, line: Line, colonPos: number): Promise<CompletionResult | null> {
  const templates = await getTemplates()
  if (!templates?.length) return null

  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const from = line.from + colonPos + 2
    const to = view.state.doc.lineAt(context.pos).to
    const insert = completion.label
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  return {
    from: completionStart(context),
    validFor: /.*\S/,
    options: templates.map((t) => {
      return {
        label: t.uid,
        detail: t.label,
        info: t.description,
        apply
      }
    })
  } satisfies CompletionResult
}

function hintModuleConfig(
  context: CompletionContext,
  line: Line,
  parentLine: Line,
  grandParentLine: Line
): CompletionResult | Promise<CompletionResult | null> | null {
  const cursor = context.pos - line.from
  let arrayElementLine = parentLine
  const parentIndent = lineIndent(parentLine, true)
  while (!arrayElementLine.text.trimStart().startsWith('- ')) {
    arrayElementLine = context.state.doc.line(arrayElementLine.number - 1)
    if (lineIndent(arrayElementLine, true) < parentIndent) return null
  }
  let moduleTypeUid = findModuleType(context, arrayElementLine)
  if (!moduleTypeUid) return null

  const section = grandParentLine.text.replace('s:', '').trim()
  if (!section) return null
  moduleTypeUid = aliasToModuleTypeType(section, moduleTypeUid)

  const colonPos = line.text.indexOf(':')
  const afterColon = colonPos > 0 && cursor > colonPos
  const indent = lineIndent(line, true)
  return getModuleTypes(section).then((moduleTypes): CompletionResult | Promise<CompletionResult | null> | null => {
    const moduleType = moduleTypes.find((m) => m.uid === moduleTypeUid)
    if (!moduleType) return null
    const parameters = moduleType.configDescriptions
    if (afterColon) {
      const result = hintParameterValues(context, parameters, line, colonPos)
      const parameterName = line.text.substring(0, colonPos).trim()
      if (result && parameterName === 'type') {
        if (result instanceof Promise) {
          return result.then((r) => {
            applyAliasToMimeType(section, r)
            return r
          })
        } else {
          applyAliasToMimeType(section, result)
        }
      }
      return result
    }
    return hintParameters(context, parameters, indent)
  })
}

const MODULE_TYPE_ALIASES: { [section: string]: { [key: string]: string } } = {
  action: {
    'core.RuleEnablementAction': 'EnableRule',
    'core.ItemCommandAction': 'SendCommand',
    'core.ItemStateUpdateAction': 'PostUpdate',
    'core.RunRuleAction': 'RunRule',
    'media.PlayAction': 'Play',
    'media.SayAction': 'Say',
    'script.ScriptAction': 'Script'
  },
  trigger: {
    'core.ChannelEventTrigger': 'ChannelEvent',
    'timer.GenericCronTrigger': 'Cron',
    'timer.DateTimeTrigger': 'DateTime',
    'core.GenericEventTrigger': 'GenericEvent',
    'core.GroupCommandTrigger': 'MemberReceivedCommand',
    'core.GroupStateChangeTrigger': 'MemberChanged',
    'core.GroupStateUpdateTrigger': 'MemberUpdated',
    'core.ItemCommandTrigger': 'ItemReceivedCommand',
    'core.ItemStateChangeTrigger': 'ItemChanged',
    'core.ItemStateUpdateTrigger': 'ItemUpdated',
    'core.SystemStartlevelTrigger': 'StartLevel',
    'core.ThingStatusChangeTrigger': 'ThingChanged',
    'core.ThingStatusUpdateTrigger': 'ThingUpdated',
    'timer.TimeOfDayTrigger': 'TimeOfDay'
  },
  condition: {
    'timer.DayOfWeekCondition': 'DayOfWeek',
    'ephemeris.DaysetCondition': 'Dayset',
    'ephemeris.HolidayCondition': 'Holiday',
    'timer.IntervalCondition': 'Interval',
    'core.ItemStateCondition': 'ItemState',
    'ephemeris.NotHolidayCondition': 'NotHoliday',
    'script.ScriptCondition': 'Script',
    'core.ThingStatusCondition': 'ThingStatus',
    'core.TimeOfDayCondition': 'TimeOfDay',
    'ephemeris.WeekdayCondition': 'Weekday',
    'ephemeris.WeekendCondition': 'Weekend'
  }
}

function moduleTypeTypeToAlias(section: string, type: string) {
  return MODULE_TYPE_ALIASES[section]?.[type] ?? type
}

function aliasToModuleTypeType(section: string, alias: string) {
  const sectionAliases = MODULE_TYPE_ALIASES[section]
  if (!sectionAliases) return alias

  // Find the key that maps to this alias
  for (const [fullType, typeAlias] of Object.entries(sectionAliases)) {
    if (typeAlias === alias) {
      return fullType
    }
  }
  return alias
}

function mimeTypeToAlias(section: string, type: string) {
  // For well-known MIME types, we can use a shorter alias in the hint insert text
  switch (type) {
    case 'application/vnd.openhab.dsl.rule':
      return 'DSL'
    case 'application/x-groovy':
      return 'Groovy'
    case 'application/javascript':
      return 'JavaScript'
    case 'application/python':
      return 'Python'
    case 'application/x-python2':
      return 'Jython'
    case 'application/x-ruby':
      return 'Ruby'
    case 'application/javascript;version=ECMAScript-5.1':
      return 'NashornJS'
  }
  return type
}

function buildModuleStructure(section: string, moduleType: api.ModuleType, baseIndent: number = 0) {
  const indent = ' '.repeat(baseIndent + 2)
  const itemIndent = ' '.repeat(baseIndent + 4)
  const configIndent = ' '.repeat(baseIndent + 6)

  let ret = `${indent}- type: ${moduleTypeTypeToAlias(section, moduleType.uid)}\n${itemIndent}label: ${moduleType.label}\n`
  if (moduleType.description) {
    ret += `${itemIndent}description: ${moduleType.description}\n`
  }
  if (moduleType.configDescriptions.some((p) => p.required)) {
    ret += `${itemIndent}config:\n`
    for (const configDescription of moduleType.configDescriptions.filter((m) => m.required)) {
      ret += `${configIndent}${configDescription.name}: \n`
    }
  }
  ret += `${indent}  `
  return ret
}

function hintSceneItems(context: CompletionContext): CompletionResult | Promise<CompletionResult | null> | null {
  console.info('hinting in the items section (scenes)')
  return hintItems(context, { indent: 2, suffix: ': ' })
}

function hintModuleElementStructure(
  context: CompletionContext,
  line: Line,
  grandParentLine: Line
): CompletionResult | Promise<CompletionResult | null> | null {
  const section = grandParentLine.text.trim()
  const includeInputs = section === 'actions:' || section === 'conditions:'
  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: [
      {
        label: 'Add ID',
        info: 'Adds an explicit module ID',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `id: `
          view.dispatch(insertCompletionText(view.state, insert, context.pos, line.to))
        }
      },
      {
        label: 'Add type',
        info: 'Adds the module type',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `type: `
          view.dispatch(insertCompletionText(view.state, insert, context.pos, line.to))
        }
      },
      {
        label: 'Add label',
        info: 'Adds the module label',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `label: `
          view.dispatch(insertCompletionText(view.state, insert, context.pos, line.to))
        }
      },
      {
        label: 'Add description',
        info: 'Adds the module description',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `description: `
          view.dispatch(insertCompletionText(view.state, insert, context.pos, line.to))
        }
      },
      {
        label: 'Add configuration section',
        info: 'Adds the module configuration section',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `config:\n          `
          view.dispatch(insertCompletionText(view.state, insert, context.pos, line.to))
        }
      },
      ...(includeInputs
        ? [
            {
              label: 'Add inputs section',
              info: 'Adds an inputs section for references to other modules in the rule',
              apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
                const insert = `inputs:\n          - `
                view.dispatch(insertCompletionText(view.state, insert, context.pos, line.to))
              }
            }
          ]
        : [])
    ]
  }
}

function hintRuleStructure(context: CompletionContext, line: Line): CompletionResult | Promise<CompletionResult | null> | null {
  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: [
      {
        label: 'Add label',
        info: 'Adds the rule label (name)',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    label: `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      },
      {
        label: 'Add description',
        info: 'Adds the rule description',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    description: `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      },
      {
        label: 'Add tags section',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    tags:\n      - `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      },
      {
        label: 'Add triggers section',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    triggers:\n      - `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      },
      {
        label: 'Add conditions section',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    conditions:\n      - `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      },
      {
        label: 'Add actions section',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    actions:\n      - `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      },
      {
        label: 'Add configuration section',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    config:\n      `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      },
      {
        label: 'Add template',
        info: 'Adds the rule template reference',
        apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
          const insert = `    template: `
          view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
        }
      }
    ]
  }
}

function isModuleElement(line: Line | undefined): boolean {
  if (!line) return false
  return line.text.match(/^ {4}(triggers|conditions|actions):\s*$/) ? true : false
}

function hintModuleType(
  context: CompletionContext,
  parentLine: Line | undefined
): CompletionResult | Promise<CompletionResult | null> | null {
  if (!parentLine) return null
  const section = parentLine.text.replace('s:', '').trim()
  if (!section) return null
  return getModuleTypes(section).then((moduleTypes): CompletionResult => {
    return {
      from: completionStart(context),
      validFor: /[\w.]+/,
      options: moduleTypes.map((m) => {
        const alias = moduleTypeTypeToAlias(section, m.uid)
        return {
          label: alias === m.uid ? m.uid : `${alias} (${m.uid})`,
          apply: (view: EditorView, _completion: Completion, _from: number, _to: number) => {
            view.dispatch(insertCompletionText(view.state, alias, _from, _to))
          },
          info: m.description
        }
      })
    }
  })
}

function hintModuleValue(
  context: CompletionContext,
  line: Line,
  parentLine: Line
): CompletionResult | Promise<CompletionResult | null> | null {
  if (!line) return null
  const colonPos = line.text.indexOf(':')
  if (colonPos < 0) return null
  const key = line.text.substring(0, colonPos).trim().replace(/^- /, '') // remove array element hyphen if present
  if (key === 'type') {
    return hintModuleType(context, parentLine)
  }
  return null
}

function hintModuleStructure(
  context: CompletionContext,
  line: Line,
  parentLine: Line
): CompletionResult | Promise<CompletionResult | null> | null {
  const section = parentLine.text.replace('s:', '').trim()
  if (section === 'item') {
    if (!line.text.includes(':')) return hintSceneItems(context)
    return null // todo: hint commands?
  }

  const parentIndent = lineIndent(parentLine)
  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const insert = buildModuleStructure(section, (completion as Completion & { moduleType: api.ModuleType }).moduleType, parentIndent)
    view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
  }

  return getModuleTypes(section).then((moduleTypes): CompletionResult => {
    return {
      from: completionStart(context),
      validFor: /\w+/,
      options: moduleTypes.map((m) => {
        return {
          label: `${section}: ${m.label}`,
          info: m.uid,
          moduleType: m,
          apply
        }
      })
    }
  })
}

export default function hint(context: CompletionContext): CompletionResult | Promise<CompletionResult | null> | null {
  const line = context.state.doc.lineAt(context.pos)

  const rootSection = findRootSection(context, line)
  if (!(rootSection?.type === 'rules')) {
    return null
  }

  const parentLine = findParent(context, line, true)

  if (!parentLine) return null

  const parentIndent = lineIndent(parentLine, true)
  const cursor = context.pos - line.from
  const colonPos = line.text.indexOf(':')
  const afterColon = colonPos > 0 && cursor > colonPos
  const arrayElement = line.text.trimStart().startsWith('- ') || parentLine.from !== findParent(context, line, false)?.from

  if (parentIndent === 2) {
    if (afterColon) {
      const element = line.text.substring(0, colonPos).trim()
      if (element.match(/^template(?:uid)?$/i)) {
        return hintTemplate(context, line, colonPos)
      }
    } else {
      return hintRuleStructure(context, line)
    }
  } else {
    const grandParentLine = findParent(context, parentLine, true)
    if (parentIndent === 4 && grandParentLine) {
      if (isModuleElement(parentLine)) {
        if (afterColon) {
          return hintModuleValue(context, line, parentLine)
        }
        if (arrayElement) {
          return hintModuleElementStructure(context, line, parentLine)
        }
        return hintModuleStructure(context, line, parentLine)
      } else if (isConfig(parentLine)) {
        // Rule configuration
        const templateUid = getTemplateUid(context, grandParentLine)
        if (templateUid) {
          return hintTemplateConfig(context, templateUid, line, parentLine)
        }
      }
    } else if (grandParentLine) {
      if (parentIndent === 6) {
        if (isModuleElement(grandParentLine)) {
          if (afterColon) {
            return hintParameterValues(context, [], line, colonPos)
          }
          return hintModuleElementStructure(context, line, grandParentLine)
        }
      } else {
        if (parentIndent === 8) {
          if (isModuleElement(grandParentLine)) {
            return hintModuleConfig(context, line, parentLine, grandParentLine)
          }
        }
      }
    }
  }

  return null
}
