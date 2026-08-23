import Fuse from 'fuse.js'
import type { Ref } from 'vue'

export interface FilterDefinition {
  label: string
  options?: string[] | (() => string[])
  singleSelect?: boolean
  advanced?: boolean
  path?: string
  getFn?: (item: unknown) => string
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

// Tokenize a query string into an array of tokens or a single token at the cursor position`
export function tokenizeString(queryString: string): ParsedToken[]
export function tokenizeString(queryString: string, cursorPosition: number): ParsedToken | null
export function tokenizeString(queryString: string, cursorPosition?: number): ParsedToken[] | ParsedToken | null {
  const regex = /\b(?:AND|OR)\b|[()]|(?:[^\s()"']+|"[^"]*"|'[^']*')+/g
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

  const colonIndex = cleanToken.indexOf(':')
  const valuePart = colonIndex !== -1 ? cleanToken.slice(colonIndex + 1) : cleanToken
  const fieldPart = colonIndex !== -1 ? cleanToken.slice(0, colonIndex) : null

  if (fieldPart) {
    const splitRegex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/
    const valueParts = valuePart.split(splitRegex).map((val) => {
      return val.startsWith('"') && val.endsWith('"') ? val.slice(1, -1) : val
    })

    return { ...token, type: 'fieldValue', field: fieldPart, values: valueParts, negated: isNegated }
  } else {
    const cleanStandaloneValue = valuePart.startsWith('"') && valuePart.endsWith('"') ? valuePart.slice(1, -1) : valuePart

    return { ...token, type: 'value', values: [cleanStandaloneValue], negated: isNegated }
  }
}

function getTokenFuseExpression(token: FieldValueToken | ValueToken, haystackFields: string[], fieldAliases?: Record<string, string>) {
  const isNegated = token.negated

  if (isFieldValueToken(token)) {
    let fieldPart = fieldAliases?.[token.field] || token.field

    if (token.values.length === 1) {
      return { [fieldPart]: isNegated ? `!${token.values?.[0]}` : token.values?.[0] }
    }

    return { $or: (token.values ?? []).map((v) => ({ [fieldPart]: isNegated ? `!${v}` : v })) }
  } else if (isValueToken(token)) {
    // plain text, search across all haystack fields
    if (haystackFields.length === 1) {
      return { [haystackFields[0]]: isNegated ? `!${token.values?.[0]}` : token.values?.[0] }
    }
    return { $or: haystackFields.map((field) => ({ [field]: isNegated ? `!${token.values?.[0]}` : (token.values?.[0] ?? '') })) }
  }

  return null
}

export function tokensToString(tokens: ParsedToken[]): string {
  let result = ''
  tokens.forEach((token) => {
    result += token.rawToken ?? ''
    if (token.type === 'fieldValue' || token.type === 'value') {
      result += ' '
    }
  })

  return result.trim()
}

/**
 * parses a user query string into a robust deep object structure suitable for Fuse.js.
 * This parser supports nested parentheses, AND/OR operators, negation, and field:value pairs with alias resolution.
 *
 * @param queryString
 * @param haystackFields
 * @param fieldAliases
 * @returns
 */
export function tokensToFuse(
  tokens: ParsedToken[],
  haystackFields: string[],
  fieldAliases?: Record<string, string>
): Record<string, any> | string {
  let index = 0

  function processExpression(): Record<string, any> | null {
    let currentOrGroup: Record<string, any>[] = []
    let currentAndGroup: Record<string, any>[] = []

    const finish = (): Record<string, any> | null => {
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
    newToken = { ...token }

    newToken.values[token.values.length - 1] = value
    const valueList = newToken.values.map((v) => (v.includes(' ') ? `"${v}"` : v)).join(',')
    newToken.rawToken = `${token.negated ? '-' : ''}${token.field}:${valueList}`
    newSearchString = existingQuery.slice(0, start) + newToken.rawToken + existingQuery.slice(end)
  } else {
    newSearchString = existingQuery + ' ' + value
    newToken = { type: 'value', rawToken: value, values: [value], negated: false, start: existingQuery.length + 1 }
  }

  return { newSearchString, newToken }
}
