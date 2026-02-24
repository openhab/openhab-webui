import { pickedCompletion, insertCompletionText, type CompletionContext, type Completion, type CompletionResult } from '@codemirror/autocomplete'
import type { Line } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

import * as api from '@/api'

// Pattern for ParameterOptions.
// It can include things like `application/javascript;version=ECMAScript-2021`
// so let's match any non-space
const ParameterOptions = /\S+/

/**
 * Finds the start of the word at the cursor position.
 *
 * If the cursor is inside or at the end of a "word", find the start of that word
 * otherwise just return the cursor position.
 *
 * See also CodeMirror's EditorState.wordAt, which uses /\w/ to search.
 *
 * @param context completion context
 * @param regex a regex that matches the characters of the completion options
 * @returns the position from the start of the document
 */
export function completionStart(context: CompletionContext, regex = /\w+/) {
  return context.matchBefore(regex)?.from ?? context.pos
}

/**
 * Converts a Parameter Type to CodeMirror's completion type
 *
 * Icons are styled with a CSS class created by appending the type name to "cm-completionIcon-".
 * You can define or restyle icons by defining these selectors.
 *
 * script-editor.vue also supports:
 * - string
 * - number
 * - boolean
 * - unknown
 *
 * The base library defines simple icons for:
 * - class
 * - constant
 * - enum
 * - function
 * - interface
 * - keyword
 * - method
 * - namespace
 * - property
 * - text
 * - type
 * - variable
 */
export function getCompletionType(parameterType: string) {
  switch (parameterType) {
    case 'TEXT':
      return 'string'
    case 'INTEGER':
      return 'number'
    case 'BOOLEAN':
      return 'boolean'
    default:
      return 'unknown'
  }
}

/**
 * Returns a CodeMirror CompletionResult object for boolean values after a colon
 *
 * @param {CompletionContext} context CodeMirror CompletionContext
 * @param {Line} line The current line
 * @param {number} colonPos The position of the colon
 * @returns {CompletionResult}
 */
export function hintBooleanValue(context: CompletionContext, line: Line, colonPos: number): CompletionResult | undefined {
  const trimmedLine = line.text.trimEnd()
  if (trimmedLine.endsWith('true') || trimmedLine.endsWith('false')) return undefined

  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const from = line.from + colonPos + 2
    const to = view.state.doc.lineAt(context.pos).to
    const insert = completion.label
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: [
      { label: 'true', apply, boost: 1 },
      { label: 'false', apply }
    ]
  }
}

let itemsCache : (api.EnrichedItem | api.EnrichedGroupItem)[] | null = null

async function getItems() {
  if (itemsCache) return itemsCache

  const result = await api.getItems({ staticDataOnly: true })
  if (result) {
     itemsCache = result
     return itemsCache
  }
  return []
}

/**
 * Returns a CodeMirror CompletionResult object for item names
 *
 * The returned Promise resolves to a CompletionResult suitable for use with
 * CodeMirror's autocomplete. The function will fetch items (cached) and
 * construct CompletionResult that inserts the selected item into the editor.
 *
 * @param {CompletionContext} context CodeMirror CompletionContext
 * @param {Object} [options] - Optional modifiers.
 * @param {boolean} [options.replaceAfterColon=false] - If true, replace the text after the first colon on the current line.
 * @param {number|null} [options.indent=null] - If set, replace the entire current line and prepend this many spaces to the insertion.
 * @param {string} [options.prefix=''] - Prefix to add before the item name when inserting.
 * @param {string} [options.suffix=''] - Suffix to add after the item name when inserting.
 * @param {boolean} [options.groupsOnly=false] - If true, only include Group items in the completion list.
 * @returns {Promise<CompletionResult>} Promise that resolves to a CompletionResult.
 */
export async function hintItems(context: CompletionContext, { replaceAfterColon = false, indent = null, prefix = '', suffix = '', groupsOnly = false }: { replaceAfterColon?: boolean; indent?: number | null; prefix?: string; suffix?: string; groupsOnly?: boolean } = {}): Promise<CompletionResult> {
  const itemsCached = await getItems()

  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    let from, to
    const currentLine = view.state.doc.lineAt(context.pos)
    if (indent) {
      from = currentLine.from
      to = currentLine.to
      prefix = ' '.repeat(indent) + prefix
    } else if (replaceAfterColon) {
      const colonPos = currentLine.text.indexOf(':')
      from = currentLine.from + colonPos + 2
      to = currentLine.to
    } else {
      const wordAtCursor = view.state.wordAt(context.pos)
      if (wordAtCursor) {
        // if the user typed a word, replace it
        from = wordAtCursor.from
        to = wordAtCursor.to
      } else {
        from = to = context.pos
      }
    }

    const insert = prefix + completion.label + suffix
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  const items = groupsOnly ? itemsCached.filter((item) => item.type === 'Group') : itemsCached
  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: items.map((item) => {
      return {
        label: item.name,
        info: `${item.label ? item.label + ' ' : ''}(${item.type})`,
        type: item.type === 'Group' ? 'groupitem' : 'item',
        apply
      }
    })
  }
}

/**
 * Provide completion entries for a list of parameters.
 *
 * Creates a CompletionResult that inserts parameter names at the current line,
 * prepending the requested indentation so the inserted text aligns with the desired column.
 *
 * @param {CompletionContext} context - CodeMirror completion context.
 * @param {Array<api.ConfigDescriptionParameter>} parameters - Array of parameter descriptors.
 *        Each descriptor should have a `name` and may include `description` and `type`.
 * @param {number} indent - Number of spaces to prepend so the inserted parameter lines match the target indent.
 * @returns {CompletionResult} A CompletionResult with `from`, `validFor` and `options`.
 */
export function hintParameters(context: CompletionContext, parameters: Array<api.ConfigDescriptionParameter>, indent: number) {
  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const line = view.state.doc.lineAt(context.pos)
    const { from, to } = line
    const insert = ' '.repeat(indent) + completion.label + ': '
    view.dispatch({
      ...insertCompletionText(view.state, insert, from, to),
      annotations: pickedCompletion.of(completion) // trigger subsequent completion (parameter options)
    })
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: parameters.map((p) => {
      return {
        label: p.name,
        info: p.description,
        apply,
        type: getCompletionType(p.type)
      }
    })
  }
}

/**
 * Provide completion entries for a parameter's allowed options.
 *
 * @param {CompletionContext} context - CodeMirror completion context.
 * @param {api.ConfigDescriptionParameter} parameter - Parameter descriptor containing an `options` array:
 *        { options: Array<{ value: string, label?: string }> }.
 * @param {number} colonPos - Zero-based index of the colon character on the line; insertion starts after `colonPos + 2`.
 * @returns {CompletionResult} CompletionResult.
 */
export function hintParameterOptions(context: CompletionContext, parameter: api.ConfigDescriptionParameter, colonPos: number) {
  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const line = view.state.doc.lineAt(context.pos)
    const from = line.from + colonPos + 2
    const to = line.to
    const insert = completion.label
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  let boost = 0
  return {
    from: completionStart(context, ParameterOptions),
    validFor: ParameterOptions,
    options: parameter.options!
      .map((o) => {
        return {
          label: o.value,
          info: o.label || o.value,
          apply,
          boost: boost-- // preserve the original order, don't sort alphabetically
        }
      })
      .filter((o) => o.label) // discard empty options
  }
}

/**
 * Provide completion entries for parameter values based on parameter type.
 *
 * @param {import("@codemirror/autocomplete").CompletionContext} context - CodeMirror completion context.
 * @param {Array<api.ConfigDescriptionParameter>} parameters - Array of parameter descriptors.
 *        Each descriptor should have a `name` and may include `description` and `type`.
 * @param {Line} line The current line
 * @param {number} colonPos The position of the colon
 * @returns {CompletionResult}
 */
export async function hintParameterValues(context: CompletionContext, parameters: Array<api.ConfigDescriptionParameter>, line: Line, colonPos: number) {
  const parameterName = line.text.substring(0, colonPos).trim()
  const parameter = parameters.find((p) => p.name === parameterName)
  if (parameter) {
    if (parameter.type === 'BOOLEAN') {
      return hintBooleanValue(context, line, colonPos)
    } else if (parameter.context === 'item') {
      return hintItems(context, { replaceAfterColon: true })
    } else if (parameter.options) {
      return hintParameterOptions(context, parameter, colonPos)
    }
  }
}
