import { javascriptLanguage } from '@codemirror/lang-javascript'
import { autocompletion, CompletionContext } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
// @ts-expect-error - hint-utils is not typed
import * as hintUtils from './hint-utils'

// Vite generate named exports for JSON keys by creating JS identifiers for each property
// This caused a security violation when parsing `eval` inside ecmascript.json!
// So we import the raw data and parse it manually to avoid it
// @ts-expect-error - raw import has no type declaration
import EcmascriptRaw from '@/assets/ecmascript.json?raw'
const EcmascriptDefs: any = JSON.parse(EcmascriptRaw)
import NashornDefs from '@/assets/nashorn-tern-defs.json'
import OpenhabJsDefs from '@/assets/openhab-js-tern-defs.json'

type Definitions = Record<string, any>

let GlobalTypes: Definitions = {}
let GlobalIdentifiers: Definitions = {}

/**************************************************************
 * Copied and adapted from @codemirror/lang-javascript
 * We need to use `completionPath` but
 * with `pathFor` altered to support "CallExpression"
 **************************************************************/
function getPath (read: (n: any) => string, callNode: any, name: string | null) {
  let path: string[] = []
  let member = callNode
  let callExpression = false
  const Literals: Record<string, string> = { Number: 'Number()', String: 'String()', ArrayExpression: 'Array()' }
  for (;;) {
    const obj = member.firstChild
    if (!obj) return null

    const suffix = callExpression ? '()' : ''
    callExpression = false

    // '', 12.5 or [] -> String, Number, or ArrayExprression
    if (Literals[obj.name]) {
      path.push(Literals[obj.name]) // resolve the literal to its prototype
      if (obj.name === 'ArrayExpression') {

      }
      if (!obj.firstChild || obj.name === 'ArrayExpression') {
        return { path: path.reverse(), name: '' }
      }
      member = obj
      continue
    }

    // items -> VariableName
    if (obj.name === 'VariableName') {
      path.push(read(obj) + suffix)
      return { path: path.reverse(), name }
    }

    // items.foo -> MemberExpression + PropertyName
    if (obj.name === 'MemberExpression') {
      const prop = obj.lastChild
      if (prop?.name === 'PropertyName') {
        path.push(read(prop) + suffix)
        member = obj
        continue
      }
      return null
    }

    // nested call: treat CallExpression as another step and continue
    if (obj.name === 'CallExpression') {
      callExpression = true
      member = obj
      continue
    }

    return null
  }
}

function completionPathWithCallExpression (context: CompletionContext, from: number) {
  const read = (node: any) => context.state.doc.sliceString(node.from, node.to)
  const inner = syntaxTree(context.state).resolveInner(from, -1)
  if (inner && (inner.name === '.' || inner.name === '?.') && inner.parent?.name === 'MemberExpression') {
    return getPath(read, inner.parent, '')
  }
  return null
}

// Deal with definition that returns a reference (string instead of an object) to another definition.
// e.g. "Int8Array": "TypedArray"
// Recursively look up the reference until we find the actual definition
function dereferencedDefinition (definition: Definitions | string | undefined, depth: number = 0): Definitions | undefined {
  if (depth > 10) {
    console.error('Maximum dereference depth reached for', definition)
    return // Just support up to 10 deep to prevent infinite recursion
  }
  if (typeof definition === 'string') { // string -> alias to another definition
    return dereferencedDefinition(GlobalTypes[definition], depth + 1) || dereferencedDefinition(GlobalIdentifiers[definition], depth + 1)
  }
  return definition
}

function resolveDefinition (identifier: string, scopedDef: Definitions): Definitions | undefined {
  const isCallExpression = identifier.endsWith('()')
  if (isCallExpression) {
    identifier = identifier.slice(0, -2)
  }
  const def = dereferencedDefinition(scopedDef[identifier])
  if (!def) return

  let type = def['!type']
  if (!type) {
    return def
  }

  if (isFunction(type)) {
    if (isCallExpression) {
      if (def.prototype) {
        return def.prototype
      }
      const returnType = getReturnType(type)
      if (!returnType) return
      return dereferencedDefinition(GlobalTypes[returnType]) || dereferencedDefinition(GlobalIdentifiers[returnType]?.prototype)
    } else {
      return def
    }
  }
  let ret = dereferencedDefinition(GlobalTypes[type])
  if (!ret) {
    type = type.charAt(0).toUpperCase() + type.slice(1)
    ret = dereferencedDefinition(GlobalIdentifiers[type]?.prototype)
  }
  return ret
}

function resolveDefinitionFromPath (path: readonly string[]) {
  let def: Definitions | undefined = GlobalIdentifiers
  for (let segment of path) {
    def = resolveDefinition(segment, def!)
    if (!def) return
  }
  return def
}

// Split multiple alternative types and return the first non null: null|a|b -> a
function extractType (def: string | null) {
  if (!def || def === '?') return null
  if (def.startsWith('[')) return 'array'
  return def?.split('|').filter((t: string) => t !== 'null')[0]
}

function isFunction (type: string | null) {
  return type ? String(type).startsWith('fn(') : false
}

function isObject (properties: Record<string, any>) {
  const type = properties['!type']
  if (type) {
    return !!String(type).match(/^\+?[A-Z]/)
  }
  return Object.keys(properties).some((key) => !key.startsWith('!'))
}

function completionType (properties: Record<string, any>) {
  if (isObject(properties)) return 'object'

  const type = properties['!type']
  if (!type) return null
  if (isFunction(type)) return 'function'
  return extractType(type)
}

function getReturnType (type: string | null) {
  if (!isFunction(type)) return
  const ret = String(type).split(' -> ')
  const returnType = extractType(ret.length > 1 ? ret[ret.length - 1] : null)
  if (!returnType) return
  return returnType.charAt(0).toUpperCase() + returnType.slice(1)
}

function convertDefinitionToCompletionOptions (def: Definitions | undefined) {
  if (!def) return null
  return Object
    .entries(def)
    .filter(([key]) => !key.startsWith('!') && !key.startsWith(':') && key !== '<i>')
    .map(([name, properties]) => {
      return {
        label: name,
        info: properties['!doc'],
        type: completionType(properties) || 'unknown'
      }
    })
}

function setObjectDefs (...defs: Definitions[]) {
  GlobalTypes = {}
  GlobalIdentifiers = {}
  defs.forEach((def) => {
    Object.assign(GlobalTypes, def['!define'])
    Object.assign(GlobalIdentifiers, Object.fromEntries(Object.entries(def).filter(([key]) => !key.startsWith('!'))))
  })
}

function hintOpenhabJs (context: CompletionContext) {
  const from = hintUtils.completionStart(context)
  const path = completionPathWithCallExpression(context, from)
  const defs = resolveDefinitionFromPath(path?.path || [])
  const options = convertDefinitionToCompletionOptions(defs)
  if (!options) return null

  return {
    from,
    validFor: /\w+/,
    options
  }
}

function hintJsItems (context: any) {
  if (context.matchBefore(/(\s|^)items\.(getItem\(['"])?[\w]*/)) {
    return hintUtils.hintItems(context)
  }
}

export default function javascriptAutocompletions (mode: string) {
  setObjectDefs(EcmascriptDefs, mode.includes('ECMAScript-5.1') ? NashornDefs : OpenhabJsDefs)

  return [
    javascriptLanguage.data.of({ autocomplete: hintOpenhabJs }),
    javascriptLanguage.data.of({ autocomplete: hintJsItems }),
    autocompletion({
      compareCompletions: (a, b) => {
        // Custom comparison logic: put all lowercased labels first
        // e.g. 'apple', 'banana', 'Apple'
        const aLabel = a.label
        const bLabel = b.label
        const aLower = aLabel.toLowerCase()
        const bLower = bLabel.toLowerCase()

        const aIsLower = aLabel[0] === aLower[0]
        const bIsLower = bLabel[0] === bLower[0]

        // lowercase comes before uppercase
        if (aIsLower && !bIsLower) return -1
        if (!aIsLower && bIsLower) return 1

        return aLabel.localeCompare(bLabel)
      }
    })
  ]
}
