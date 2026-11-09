import type Fuse from 'fuse.js'
import type { FuseResult, FuseResultMatch } from 'fuse.js'

/**
 * Marks a query whose matching records must be excluded from the complete Fuse index.
 * The symbol is an application-only operator, distinct from Fuse's field-level `$not`;
 * it must be preserved when a query plan is copied and cannot be serialized as JSON.
 */
export const RECORD_NEGATION = Symbol('record-level negation')

export interface RecordNegation extends Record<string, unknown> {
  [RECORD_NEGATION]: SearchQuery
}

export type SearchQuery = string | Record<string, unknown>

export interface FilterDefinition {
  label: string
  options?: string[] | (() => string[])
  singleSelect?: boolean
  advanced?: boolean
  path?: string
  getFn?: (item: unknown) => string | readonly string[] | null | undefined
}

export type TokenType = 'fieldValue' | 'value' | 'AND' | 'OR' | '(' | ')' | undefined

export interface Token {
  type: TokenType
  rawToken?: string
  start?: number
}

export interface FieldValueToken extends Token {
  type: 'fieldValue'
  field: string
  values: string[]
  negated: boolean
}

export interface ValueToken extends Token {
  type: 'value'
  values: string[]
  negated: boolean
}

export interface GroupingToken extends Token {
  type: '(' | ')'
}

export interface LogicalToken extends Token {
  type: 'AND' | 'OR'
}

export type ParsedToken = FieldValueToken | ValueToken | GroupingToken | LogicalToken

export function isFieldValueToken(token: Token | null): token is FieldValueToken {
  return token != null && token.type === 'fieldValue' && 'field' in token && 'values' in token && 'negated' in token
}

export function isValueToken(token: Token | null): token is ValueToken {
  return token != null && token.type === 'value' && 'values' in token && 'negated' in token
}

export function isGroupingToken(token: Token | null): token is GroupingToken {
  return token != null && (token.type === '(' || token.type === ')')
}

export function isLogicalToken(token: Token | null): token is LogicalToken {
  return token != null && (token.type === 'AND' || token.type === 'OR')
}

function splitFieldValues(value: string): string[] {
  return value.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
}

function isQuoted(value: string): boolean {
  return value.length >= 2 && value.startsWith('"') && value.endsWith('"')
}

export function formatFieldValueToken(token: FieldValueToken): string {
  const rawToken = token.rawToken?.replace(/^-/, '') ?? ''
  const rawValues = splitFieldValues(rawToken.slice(rawToken.indexOf(':') + 1))
  const quotedValues = new Set(rawValues.filter(isQuoted).map((value) => value.slice(1, -1)))
  const values = token.values.map((value) => (quotedValues.has(value) || /[\s,]/.test(value) ? `"${value}"` : value))
  return `${token.negated ? '-' : ''}${token.field}:${values.join(',')}`
}

export function negateKeywordInput(input: string): string {
  return (input.match(/("[^"]*(?:"|$)|[^\s"]+)/g) ?? []).map((value) => `-${value}`).join(' ')
}

// Tokenize a query string into an array of tokens or a single token at the cursor position`
export function tokenizeString(queryString: string): ParsedToken[]
export function tokenizeString(queryString: string, cursorPosition: number): ParsedToken | null
export function tokenizeString(queryString: string, cursorPosition?: number): ParsedToken[] | ParsedToken | null {
  const regex = /\b(?:AND|OR)\b|[()]|(?:[^\s()"']+|"[^"]*(?:"|$)|'[^']*')+/g
  const matches = queryString.matchAll(regex)
  const tokens: Token[] = []
  let token: Token | null = null
  let balance = 0

  for (const match of matches) {
    token = null
    switch (match[0]) {
      case '(':
        balance++
        token = { type: '(', start: match.index }
        break
      case ')':
        if (balance > 0) {
          balance--
          token = { type: ')', start: match.index }
        } // Ignore unmatched closing parenthesis: structural noise dropped
        break
      case 'AND':
        token = { type: 'AND', start: match.index }
        break
      case 'OR':
        token = { type: 'OR', start: match.index }
        break
      default:
        token = { type: undefined, rawToken: match[0], start: match.index }
        break
    }

    if (!token) continue

    if (cursorPosition === undefined) {
      const parsed = parseToken(token)
      if (parsed) tokens.push(parsed)
    } else if (cursorPosition >= match.index && cursorPosition <= match.index + match[0].length) {
      return parseToken(token)
    }
  }

  // If user left unclosed structural groups (e.g. balance > 0),
  // automatically append missing closing brackets to fix the tree safely.
  while (balance > 0) {
    tokens.push({ type: ')', start: queryString.length })
    balance--
  }

  return tokens as ParsedToken[]
}

export function parseToken(token: Token): ParsedToken | null {
  if (token.type !== undefined) return token as ParsedToken
  if (!token.rawToken || token.type != undefined) return null

  const rawToken = token.rawToken

  const isNegated = rawToken.startsWith('-')
  const cleanToken = isNegated ? rawToken.slice(1) : rawToken

  const colonIndex = cleanToken.startsWith('"') ? -1 : cleanToken.indexOf(':')
  const valuePart = colonIndex !== -1 ? cleanToken.slice(colonIndex + 1) : cleanToken
  const fieldPart = colonIndex !== -1 ? cleanToken.slice(0, colonIndex) : null

  if (fieldPart) {
    const valueParts = splitFieldValues(valuePart).map((val) => (isQuoted(val) ? val.slice(1, -1) : val))

    return { ...token, type: 'fieldValue', field: fieldPart, values: valueParts, negated: isNegated }
  } else {
    const cleanStandaloneValue = isQuoted(valuePart) ? valuePart.slice(1, -1) : valuePart

    return { ...token, type: 'value', values: [cleanStandaloneValue], negated: isNegated }
  }
}

function getTokenFuseExpression(token: FieldValueToken | ValueToken, haystackFields: string[], fieldAliases?: Record<string, string>) {
  const rawToken = token.rawToken?.replace(/^-/, '') ?? ''
  const rawValues = isFieldValueToken(token) ? splitFieldValues(rawToken.slice(rawToken.indexOf(':') + 1)) : [rawToken]
  const values = token.values.map((value, index) =>
    isQuoted(rawValues[index] ?? '') && value ? `'"${value.replaceAll('|', '\\|')}"` : value
  )
  let expression: Record<string, unknown>
  if (isFieldValueToken(token)) {
    const fieldPart = fieldAliases?.[token.field] || token.field

    if (token.values.length === 1) {
      expression = { [fieldPart]: values[0] }
    } else {
      expression = { $or: values.map((value) => ({ [fieldPart]: value })) }
    }
  } else if (isValueToken(token)) {
    if (haystackFields.length === 1) {
      expression = { [haystackFields[0]]: values[0] }
    } else {
      expression = { $or: haystackFields.map((field) => ({ [field]: values[0] ?? '' })) }
    }
  } else {
    return null
  }

  return token.negated ? { [RECORD_NEGATION]: expression } : expression
}

export function tokensToString(tokens: ParsedToken[]): string {
  return tokens
    .map((token) => (isLogicalToken(token) || isGroupingToken(token) ? token.type : (token.rawToken ?? '')))
    .join(' ')
    .trim()
}

/**
 * Builds a query plan supporting parentheses, AND/OR, field aliases and quoted phrases.
 * Negated tokens become {@link RECORD_NEGATION} nodes around the corresponding positive
 * Fuse expression. Pass the resulting plan to {@link searchFuse}, not directly to Fuse.
 */
export function tokensToFuse(tokens: ParsedToken[], haystackFields: string[], fieldAliases?: Record<string, string>): SearchQuery {
  let index = 0

  function processExpression(): SearchQuery | null {
    let currentOrGroup: SearchQuery[] = []
    let currentAndGroup: SearchQuery[] = []

    const finish = (): SearchQuery | null => {
      if (currentAndGroup.length > 0) {
        currentOrGroup.push(currentAndGroup.length === 1 ? currentAndGroup[0] : { $and: currentAndGroup })
      }

      if (currentOrGroup.length === 0) return null
      return currentOrGroup.length === 1 ? currentOrGroup[0] : { $or: currentOrGroup }
    }

    while (index < tokens.length) {
      const token = tokens[index]

      switch (token.type) {
        case '(':
          index++
          const subExpression = processExpression()
          if (subExpression) currentAndGroup.push(subExpression)
          continue

        case ')':
          index++
          return finish()

        case 'AND':
          index++
          continue

        case 'OR':
          if (currentAndGroup.length > 0) {
            currentOrGroup.push(currentAndGroup.length === 1 ? currentAndGroup[0] : { $and: currentAndGroup })
            currentAndGroup = []
          }
          index++
          continue
      }

      if (isFieldValueToken(token) || isValueToken(token)) {
        const fuseExpression = getTokenFuseExpression(token, haystackFields, fieldAliases)
        if (fuseExpression) {
          currentAndGroup.push(fuseExpression)
        }
      }

      index++
    }

    return finish()
  }

  return processExpression() || ''
}

/**
 * Evaluates a query plan, preserving the position of record-level negation in AND/OR groups.
 *
 * Fuse's inverse string matcher ! (and its documented field-level `$not`) negates individual
 * field values, not the record's positive match. For example, `!Kitchen` may match the
 * `Outdoor` value of `['Kitchen', 'Outdoor']`, while an absent or empty field has no value
 * to match. For `-tag:Kitchen`, the intended result excludes the first record and includes
 * the second. We therefore search for the positive expression and complement its result
 * indices against all indexed documents.
 *
 * A global exclusion after searching would break expressions such as
 * `name:light OR -tag:Kitchen`. Instead, this evaluator recursively intersects or unions
 * child result sets at each logical node. Subtrees without our marker are passed directly
 * to Fuse; its own `$not` syntax is not interpreted as record-level negation here.
 *
 * Combined results retain positive match details for highlighting and use document order.
 * Negation-only matches have no positive match details.
 *
 * AI Assisted implementation for handling record-level negation in Fuse search queries.
 */
export function searchFuse<T>(fuse: Fuse<T>, expression: SearchQuery): FuseResult<T>[] {
  function isSearchQuery(value: unknown): value is SearchQuery {
    return typeof value === 'string' || (value !== null && typeof value === 'object' && !Array.isArray(value))
  }

  function isRecordNegation(query: SearchQuery): query is RecordNegation {
    return typeof query !== 'string' && RECORD_NEGATION in query
  }

  function hasNegation(query: SearchQuery): boolean {
    if (typeof query === 'string') return false
    if (isRecordNegation(query)) return true
    const children = query.$and ?? query.$or
    return Array.isArray(children) && children.some((child: unknown) => isSearchQuery(child) && hasNegation(child))
  }

  function evaluate(query: SearchQuery): FuseResult<T>[] {
    if (!hasNegation(query)) return fuse.search(query)
    if (typeof query === 'string') return fuse.search(query)
    if (isRecordNegation(query)) {
      if (!isSearchQuery(query[RECORD_NEGATION])) throw new TypeError('Invalid negated search expression')
      const excluded = new Set(evaluate(query[RECORD_NEGATION]).map((result) => result.refIndex))
      return fuse.getIndex().docs.flatMap((item, refIndex) => (excluded.has(refIndex) ? [] : [{ item, refIndex }]))
    }

    const isAnd = Array.isArray(query.$and)
    const children: unknown = isAnd ? query.$and : query.$or
    if (!Array.isArray(children) || !children.every(isSearchQuery)) throw new TypeError('Invalid logical search expression')
    const resultSets = children.map((child) => new Map(evaluate(child).map((result) => [result.refIndex, result])))
    return fuse.getIndex().docs.flatMap((item, refIndex) => {
      const matches = resultSets.map((results) => results.get(refIndex)).filter((result) => result !== undefined)
      if (isAnd ? matches.length !== resultSets.length : matches.length === 0) return []
      const details = matches.flatMap((result) => result.matches ?? [])
      return [{ item, refIndex, ...(details.length > 0 ? { matches: details } : {}) }]
    })
  }

  return evaluate(expression)
}

export function applySuggestion(
  existingQuery: string,
  token: ParsedToken | null,
  value: string,
  appendValue: boolean = false
): { newSearchString: string; newToken: ParsedToken | null } {
  let newSearchString = ''
  let newToken: ParsedToken | null = null
  if (isValueToken(token)) {
    const start = token.start ?? 0
    const end = start + (token.rawToken?.length ?? 0)
    newToken = { ...token, values: [value], type: 'fieldValue', field: 'value' }
    newToken.rawToken = `${token.negated ? '-' : ''}${value.includes(' ') ? `"${value}"` : value}`
    newSearchString = existingQuery.slice(0, start) + newToken.rawToken + existingQuery.slice(end)
  } else if (isFieldValueToken(token)) {
    const start = token.start ?? 0
    const end = start + (token.rawToken?.length ?? 0)
    newToken = { ...token, values: [...token.values] }
    newToken.values[token.values.length - 1] = value
    newToken.rawToken = formatFieldValueToken(newToken)
    newSearchString = existingQuery.slice(0, start) + newToken.rawToken + existingQuery.slice(end)
  } else {
    newSearchString = existingQuery + ' ' + value
    newToken = { type: 'value', rawToken: value, values: [value], negated: false, start: existingQuery.length + 1 }
  }

  return { newSearchString, newToken }
}
