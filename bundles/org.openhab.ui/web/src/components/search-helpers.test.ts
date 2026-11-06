import { describe, expect, it } from 'vitest'
import { tokenizeString, tokensToFuse } from './search-helpers'

describe('tokenized', () => {
  it('returns an empty array for an empty query', () => {
    const tokens = tokenizeString('')
    expect(tokens).toEqual([])
    expect(tokensToFuse(tokens, [])).toEqual('')
  })

  it('tokenizes plain values with correct start positions', () => {
    const tokens = tokenizeString('alpha beta gamma')
    expect(tokens).toEqual([
      { rawToken: 'alpha', type: 'value', values: ['alpha'], negated: false, start: 0 },
      { rawToken: 'beta', type: 'value', values: ['beta'], negated: false, start: 6 },
      { rawToken: 'gamma', type: 'value', values: ['gamma'], negated: false, start: 11 }
    ])
    expect(tokensToFuse(tokens, ['field1', 'field2'])).toEqual({
      $and: [
        {
          $or: [
            {
              field1: 'alpha'
            },
            {
              field2: 'alpha'
            }
          ]
        },
        {
          $or: [
            {
              field1: 'beta'
            },
            {
              field2: 'beta'
            }
          ]
        },
        {
          $or: [
            {
              field1: 'gamma'
            },
            {
              field2: 'gamma'
            }
          ]
        }
      ]
    })
  })

  it('recognizes uppercase AND/OR as operators', () => {
    const tokens = tokenizeString('alpha AND beta OR gamma')
    expect(tokens).toEqual([
      { rawToken: 'alpha', type: 'value', values: ['alpha'], negated: false, start: 0 },
      { type: 'AND', start: 6 },
      { rawToken: 'beta', type: 'value', values: ['beta'], negated: false, start: 10 },
      { type: 'OR', start: 15 },
      { rawToken: 'gamma', type: 'value', values: ['gamma'], negated: false, start: 18 }
    ])

    expect(tokensToFuse(tokens, ['field1'])).toEqual({
      $or: [
        {
          $and: [
            {
              field1: 'alpha'
            },
            {
              field1: 'beta'
            }
          ]
        },
        {
          field1: 'gamma'
        }
      ]
    })
  })

  it('does not treat lowercase and/or as operators', () => {
    const tokens = tokenizeString('and AND or OR')
    expect(tokens).toEqual([
      { rawToken: 'and', type: 'value', values: ['and'], negated: false, start: 0 },
      { type: 'AND', start: 4 },
      { rawToken: 'or', type: 'value', values: ['or'], negated: false, start: 8 },
      { type: 'OR', start: 11 }
    ])
    expect(tokensToFuse(tokens, ['field1', 'field2'])).toEqual({
      $and: [
        {
          $or: [
            {
              field1: 'and'
            },
            {
              field2: 'and'
            }
          ]
        },
        {
          $or: [
            {
              field1: 'or'
            },
            {
              field2: 'or'
            }
          ]
        }
      ]
    })
  })

  it('tokenizes fielded values with comma-separated values', () => {
    const tokens = tokenizeString('location:Kitchen,Garage')
    expect(tokens).toEqual([
      {
        rawToken: 'location:Kitchen,Garage',
        type: 'fieldValue',
        field: 'location',
        values: ['Kitchen', 'Garage'],
        negated: false,
        start: 0
      }
    ])
    expect(tokensToFuse(tokens, ['field1'])).toEqual({
      $or: [
        {
          location: 'Kitchen'
        },
        {
          location: 'Garage'
        }
      ]
    })
  })

  it('does not split commas inside quoted field values without whitespace in the quoted token', () => {
    const tokens = tokenizeString('name:"Kitchen,Main",Garage')
    expect(tokens).toEqual([
      {
        field: 'name',
        negated: false,
        rawToken: 'name:"Kitchen,Main",Garage',
        start: 0,
        type: 'fieldValue',
        values: ['Kitchen,Main', 'Garage']
      }
    ])
    expect(tokensToFuse(tokens, ['field1', 'field2'])).toEqual({
      $or: [
        {
          name: 'Kitchen,Main'
        },
        {
          name: 'Garage'
        }
      ]
    })
  })

  it('splits quoted field values at whitespace due to token regex limitation', () => {
    const tokens = tokenizeString('name:"Kitchen, Main",Garage')
    expect(tokens).toEqual([
      {
        field: 'name',
        negated: false,
        rawToken: 'name:"Kitchen, Main",Garage',
        start: 0,
        type: 'fieldValue',
        values: ['Kitchen, Main', 'Garage']
      }
    ])
    expect(tokensToFuse(tokens, ['field1'])).toEqual({
      $or: [
        {
          name: 'Kitchen, Main'
        },
        {
          name: 'Garage'
        }
      ]
    })
  })

  it('marks negated fielded values as negated', () => {
    const tokens = tokenizeString('-status:ONLINE,OFFLINE')
    expect(tokens).toEqual([
      {
        rawToken: '-status:ONLINE,OFFLINE',
        type: 'fieldValue',
        field: 'status',
        values: ['ONLINE', 'OFFLINE'],
        negated: true,
        start: 0
      }
    ])
    expect(tokensToFuse(tokens, ['field1'])).toEqual({
      $or: [
        {
          status: '!ONLINE'
        },
        {
          status: '!OFFLINE'
        }
      ]
    })
  })

  it('marks negated quoted plain values as negated values', () => {
    const tokens = tokenizeString('-"hello world"')
    expect(tokens).toEqual([
      {
        rawToken: '-"hello world"',
        type: 'value',
        values: ['hello world'],
        negated: true,
        start: 0
      }
    ])
    expect(tokensToFuse(tokens, ['field1'])).toEqual({
      field1: '!hello world'
    })
  })

  it('tracks grouping but keeps trailing closing parenthesis in a field token', () => {
    const tokens = tokenizeString('(status:ONLINE OR tag:test)')
    expect(tokens).toEqual([
      { type: '(', start: 0 },
      {
        rawToken: 'status:ONLINE',
        type: 'fieldValue',
        field: 'status',
        values: ['ONLINE'],
        negated: false,
        start: 1
      },
      { type: 'OR', start: 15 },
      {
        rawToken: 'tag:test',
        type: 'fieldValue',
        field: 'tag',
        values: ['test'],
        negated: false,
        start: 18
      },
      { type: ')', start: 26 }
    ])
    expect(tokensToFuse(tokens, ['field1'])).toEqual({
      $or: [
        {
          status: 'ONLINE'
        },
        {
          tag: 'test'
        }
      ]
    })
  })

  it('ignores unmatched closing parentheses', () => {
    const tokens = tokenizeString('alpha ) beta')
    expect(tokens).toEqual([
      { rawToken: 'alpha', type: 'value', values: ['alpha'], negated: false, start: 0 },
      { rawToken: 'beta', type: 'value', values: ['beta'], negated: false, start: 8 }
    ])
    expect(tokensToFuse(tokens, ['field1'])).toEqual({
      $and: [
        {
          field1: 'alpha'
        },
        {
          field1: 'beta'
        }
      ]
    })
  })

  it('auto-appends missing closing parentheses at end of query', () => {
    const tokens = tokenizeString('((alpha')
    expect(tokens).toEqual([
      { type: '(', start: 0 },
      { type: '(', start: 1 },
      { rawToken: 'alpha', type: 'value', values: ['alpha'], negated: false, start: 2 },
      { type: ')', start: 7 },
      { type: ')', start: 7 }
    ])
    expect(tokensToFuse(tokens, ['field1', 'field2'])).toEqual({
      $or: [
        {
          field1: 'alpha'
        },
        {
          field2: 'alpha'
        }
      ]
    })
  })

  // TODO - This is incorrect - needs to honor the parentheses and operator precedence, but for now it is a good enough approximation
  it('handles mixed complex query with operators and documents quoted-value whitespace splitting', () => {
    const tokens = tokenizeString('(status:ONLINE OR location:"Living Room") AND -label:"Test Thing"')
    expect(tokens).toEqual([
      { type: '(', start: 0 },
      { rawToken: 'status:ONLINE', type: 'fieldValue', field: 'status', values: ['ONLINE'], negated: false, start: 1 },
      { type: 'OR', start: 15 },
      { rawToken: 'location:"Living Room"', type: 'fieldValue', field: 'location', values: ['Living Room'], negated: false, start: 18 },
      { type: ')', start: 40 },
      { type: 'AND', start: 42 },
      { rawToken: '-label:"Test Thing"', type: 'fieldValue', field: 'label', values: ['Test Thing'], negated: true, start: 46 }
    ])
    expect(tokensToFuse(tokens, ['field1', 'field2'])).toEqual({
      $and: [
        {
          $or: [
            {
              status: 'ONLINE'
            },
            {
              location: 'Living Room'
            }
          ]
        },
        {
          label: '!Test Thing'
        }
      ]
    })
  })
})
