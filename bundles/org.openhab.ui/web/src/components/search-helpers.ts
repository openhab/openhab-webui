import list from '@/assets/definitions/widgets/system/list'
import Fuse from 'fuse.js'

function sanitizeParenthesesAndTokenize(queryString: string) {
  const regex = /(\(|\)|\bAND\b|\bOR\b|-?\w+:[\S]+|-?\w+:"[^"]+"|-?"[^"]+"|-[^\s|,]+|[^\s|,]+)/g

  const rawTokens = queryString.match(regex) || []

  let balance = 0
  const sanitizedTokens = []

  for (let token of rawTokens) {
    if (token === '(') {
      balance++
      sanitizedTokens.push(token)
    } else if (token === ')') {
      if (balance > 0) {
        balance--
        sanitizedTokens.push(token)
      } else {
        // Ignore unmatched closing parenthesis: structural noise dropped
        continue
      }
    } else {
      sanitizedTokens.push(token)
    }
  }

  // If user left unclosed structural groups (e.g. balance > 0),
  // automatically append missing closing brackets to fix the tree safely.
  while (balance > 0) {
    sanitizedTokens.push(')')
    balance--
  }

  return sanitizedTokens
}

function getTokenExpression(token: string, haystackFields: string[], fieldAliases?: Record<string, string>) {
  const isNegated = token.startsWith('-')
  let cleanToken = isNegated ? token.slice(1) : token

  const colonIndex = cleanToken.indexOf(':')
  let valuePart = colonIndex !== -1 ? cleanToken.slice(colonIndex + 1) : cleanToken
  let fieldPart = colonIndex !== -1 ? cleanToken.slice(0, colonIndex) : null

  let expression
  if (fieldPart) {
    fieldPart = fieldAliases?.[fieldPart] || fieldPart
    const isQuoted = valuePart.startsWith('"') && valuePart.endsWith('"')

    if (!isQuoted) {
      valuePart = valuePart.replace(/,/g, '|') // Convert comma-separated values into a regex OR pattern
    }

    expression = { [fieldPart]: isNegated ? `!${valuePart}` : valuePart }
  } else {
    expression = { $or: haystackFields.map((field) => ({ [field]: isNegated ? `!${valuePart}` : valuePart })) }
  }

  return expression
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
export function parseAdvancedQueryRobustDeep(
  queryString: string,
  haystackFields: string[],
  fieldAliases?: Record<string, string>
): Record<string, any> | string {
  const tokens = sanitizeParenthesesAndTokenize(queryString) // Using the balancer from the previous step
  console.log('Tokens after sanitization:', tokens) // Debugging output to verify tokenization
  let index = 0

  function parseExpression(): Record<string, any> | null {
    let currentOrGroup = []
    let currentAndGroup = []

    while (index < tokens.length) {
      let token = tokens[index]

      if (token === ')') {
        index++
        break
      }
      if (token === '(') {
        index++
        const subExpression = parseExpression()
        if (subExpression) currentAndGroup.push(subExpression)
        continue
      }
      if (token === 'OR') {
        if (currentAndGroup.length > 0) {
          currentOrGroup.push(currentAndGroup.length === 1 ? currentAndGroup : { $and: currentAndGroup })
          currentAndGroup = []
        }
        index++
        continue
      }
      if (token === 'AND') {
        index++
        continue
      }

      const expression = getTokenExpression(token, haystackFields, fieldAliases)
      currentAndGroup.push(expression)
      index++
    }

    if (currentAndGroup.length > 0) {
      currentOrGroup.push(currentAndGroup.length === 1 ? currentAndGroup[0] : { $and: currentAndGroup })
    }

    if (currentOrGroup.length === 0) return null
    if (currentOrGroup.length === 1) return currentOrGroup[0]
    return { $or: currentOrGroup }
  }

  return parseExpression() || ''
}

export function getUniqueValuesForField(fuseInstance: Fuse<any>, fieldName: string): string[] {
  const keys = fuseInstance.getIndex().keys
  const fieldIndex = keys.findIndex((key) => key.id === fieldName)

  if (fieldIndex === -1) return []

  const uniqueValues = new Set<string>()
  fuseInstance.getIndex().records.forEach((record) => {
    // Fuse stores field data matching the order of the keys array
    const fieldData = record.$![fieldIndex]
    if (!fieldData) return []

    if (Array.isArray(fieldData)) {
      fieldData.forEach((val) => uniqueValues.add(val.v.toLowerCase()))
    } else {
      uniqueValues.add(fieldData.v.toLowerCase())
    }
  })

  return Array.from(uniqueValues).sort()
}

interface AutocompleteContext {
  type: 'field' | 'value'
  field?: string
  query: string
  isMultiple?: boolean
}

export function getAutocompleteContext(text: string, cursorPosition: number): AutocompleteContext {
  if (!text) return { type: 'field', query: '' }

  console.log('getAutocompleteContext: text:', text, 'cursorPosition:', cursorPosition)

  const left = text.slice(0, cursorPosition).search(/\S+$/)
  const right = text.slice(cursorPosition).search(/\s/)
  const start = left === -1 ? 0 : left
  const end = right === -1 ? text.length : cursorPosition + right
  const activeToken = text.slice(start, end)

  if (activeToken.includes(':')) {
    const colonIndex = activeToken.indexOf(':')
    const [rawField, rawQuery] = [activeToken.slice(0, colonIndex), activeToken.slice(colonIndex + 1)]
    const cleanField = rawField.replace(/^[-(]+/, '')

    // Look at the very last value after a comma for active typing
    const commaParts = rawQuery.split(',')
    const activeQuery = commaParts[commaParts.length - 1]

    return {
      type: 'value',
      field: cleanField,
      query: activeQuery.replace(/^"|"$/g, '').trim(),
      isMultiple: true // Flag to notify append logic
    }
  }

  return { type: 'field', query: activeToken.replace(/^[-(]+/, '') }
}

export function applySuggestion(fullText: string, selectedValue: string, context: AutocompleteContext, cursorPosition: number) {
  const left = fullText.slice(0, cursorPosition).search(/\S+$/)
  const right = fullText.slice(cursorPosition).search(/\s/)
  const start = left === -1 ? 0 : left
  const end = right === -1 ? fullText.length : cursorPosition + right

  let replacement = ''

  if (context.type === 'field') {
    const prefix = fullText.slice(start, cursorPosition).match(/^[-(]+/)?.[0] || ''
    replacement = `${prefix}${selectedValue}`
  } else {
    const cleanValue = selectedValue.includes(' ') ? `"${selectedValue}"` : selectedValue
    const currentToken = fullText.slice(start, end)
    const colonIndex = currentToken.indexOf(':')
    const fieldPart = currentToken.slice(0, colonIndex)
    const valuePart = currentToken.slice(colonIndex + 1)

    // Grab existing values up to the last comma
    const lastCommaIndex = valuePart.lastIndexOf(',')

    if (lastCommaIndex !== -1) {
      // Append with a comma if values already exist
      const existingValues = valuePart.slice(0, lastCommaIndex + 1)
      replacement = `${fieldPart}:${existingValues}${cleanValue} `
    } else {
      // First value in the comma sequence
      replacement = `${fieldPart}:${cleanValue} `
    }
  }

  return fullText.slice(0, start) + replacement + fullText.slice(end)
}
