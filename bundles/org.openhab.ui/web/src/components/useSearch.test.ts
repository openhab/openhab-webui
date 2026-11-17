import { nextTick, ref, type Ref } from 'vue'
import Fuse from 'fuse.js'
import { describe, expect, it, vi } from 'vitest'
import { getKinds } from '@/pages/list-helpers'
import { isValueToken, negateKeywordInput, tokenizeString, tokensToString } from './search-helpers'
import { useSearch } from './useSearch'

interface Item {
  id: string
  name: string
  description?: string
  tags?: string[]
  type: string
}

describe('kind membership', () => {
  interface KindItem {
    uid: string
    editable?: boolean
    tags?: string[]
    templateUID?: string
  }

  it('indexes overlapping rule kinds and the marketplace tag prefix', async () => {
    const rules: KindItem[] = [
      { uid: 'all', editable: true, tags: ['marketplace:123'], templateUID: 'template' },
      { uid: 'template', editable: true, templateUID: 'template' },
      { uid: 'readonly', editable: false },
      { uid: 'marketplace', editable: false, tags: ['marketplace:456'] },
      { uid: 'default' },
      { uid: 'plain-tag', tags: ['marketplace'] }
    ]
    const search = useSearch(rules, {
      filtersDefinitions: { is: { label: 'Kind', getFn: (item) => getKinds(item as KindItem, !!(item as KindItem).editable) } },
      uidField: 'uid'
    })
    for (const [query, expected] of [
      ['is:Template', ['all', 'template']],
      ['is:Marketplace', ['all', 'marketplace']],
      ['is:Editable', ['all', 'template']],
      ['is:Readonly', ['readonly', 'marketplace', 'default', 'plain-tag']],
      ['is:Template,Marketplace', ['all', 'template', 'marketplace']],
      ['is:Editable AND is:Template', ['all', 'template']],
      ['-is:Marketplace', ['template', 'readonly', 'default', 'plain-tag']]
    ] as const) {
      search.onUpdateTokenizedSearch(tokenizeString(query))
      await nextTick()
      expect(search.filteredUids.value, query).toEqual(expected)
    }
  })

  it('indexes overlapping widget kinds and preserves the editable default', async () => {
    const widgets: KindItem[] = [
      { uid: 'editable', editable: true, tags: ['marketplace:123'] },
      { uid: 'readonly', editable: false, tags: ['marketplace:456'] },
      { uid: 'default' }
    ]
    const search = useSearch(widgets, {
      filtersDefinitions: { is: { label: 'Kind', getFn: (item) => getKinds(item as KindItem, (item as KindItem).editable !== false) } },
      uidField: 'uid'
    })
    for (const [query, expected] of [
      ['is:Marketplace', ['editable', 'readonly']],
      ['is:Editable', ['editable', 'default']],
      ['is:Readonly', ['readonly']],
      ['-is:Marketplace', ['default']]
    ] as const) {
      search.onUpdateTokenizedSearch(tokenizeString(query))
      await nextTick()
      expect(search.filteredUids.value, query).toEqual(expected)
    }
  })
})

const items: Item[] = [
  { id: 'kitchen', name: 'Light', description: 'unused light', tags: ['Kitchen', 'Outdoor'], type: 'Switch' },
  { id: 'outdoor', name: 'Outdoor light', tags: ['Outdoor'], type: 'Dimmer' },
  { id: 'empty', name: 'Fan', description: '', tags: [], type: 'Number' },
  { id: 'missing', name: 'Heater', type: 'Number' }
]

function createSearch(list: Item[] | Ref<Item[]>) {
  return useSearch(list, {
    filtersDefinitions: {
      name: { label: 'Name' },
      description: { label: 'Description' },
      tag: { label: 'Tag', path: 'tags' },
      type: { label: 'Type' }
    },
    haystackFields: ['name', 'description', 'tag'],
    uidField: 'id',
    includeMatches: true
  })
}

describe('useSearch record-level negation', () => {
  it('excludes plain text matches while retaining missing and empty fields', async () => {
    const search = createSearch(items)
    search.onUpdateTokenizedSearch(tokenizeString('-unused'))
    await nextTick()
    expect(search.isFiltered.value).toBe(true)
    expect(search.filteredUids.value).toEqual(['outdoor', 'empty', 'missing'])
  })

  describe('useSearch quoted phrases', () => {
    const phraseItems: Item[] = [
      { id: 'exact', name: 'hello world', tags: ['hello world'], type: 'Switch' },
      { id: 'embedded', name: 'Say HELLO WORLD today', type: 'Switch' },
      { id: 'reversed', name: 'world hello', tags: ['world hello'], type: 'Switch' },
      { id: 'separated', name: 'hello beautiful world', tags: ['hello beautiful world'], type: 'Dimmer' },
      { id: 'description', name: 'Other', description: 'hello world', type: 'Dimmer' },
      { id: 'punctuation', name: 'hello: world | goodbye', tags: ['hello: world | goodbye'], type: 'Number' },
      { id: 'long', name: 'a phrase much longer than thirty two characters in total', type: 'Number' },
      { id: 'long-partial', name: 'a phrase much longer than thirty two unrelated words in total', type: 'Number' },
      { id: 'special', name: 'Error! Warning $ | critical', tags: ['Kitchen, Main'], type: 'Number' }
    ]

    it('matches a contiguous phrase in any haystack field, case insensitively', async () => {
      const search = createSearch(phraseItems)
      search.onUpdateTokenizedSearch(tokenizeString('"hello world"'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['exact', 'embedded', 'description'])
      expect(search.filteredResults.value[1].matches?.[0].indices).toEqual([[4, 14]])

      search.onUpdateTokenizedSearch(tokenizeString('hello world'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['exact', 'embedded', 'reversed', 'separated', 'description', 'punctuation'])
    })

    describe('useSearch rebuilt queries', () => {
      it('retains grouped alternatives when include or exclude keywords are edited', async () => {
        const list: Item[] = [
          { id: 'switch', name: 'Light', tags: ['Kitchen'], type: 'Switch' },
          { id: 'dimmer', name: 'Light', tags: ['Kitchen'], type: 'Dimmer' },
          { id: 'other', name: 'Light', tags: ['Kitchen'], type: 'Number' },
          { id: 'outdoor', name: 'Light', tags: ['Outdoor'], type: 'Switch' }
        ]
        const search = createSearch(list)
        const tokens = tokenizeString('(type:Switch OR type:Dimmer) tag:Kitchen')
        search.onUpdateTokenizedSearch(
          tokenizeString(`${tokensToString(tokens.filter((token) => !isValueToken(token) || token.negated))} Light`)
        )
        await nextTick()
        expect(search.filteredUids.value).toEqual(['switch', 'dimmer'])

        const query = `${tokensToString(tokens.filter((token) => !isValueToken(token) || !token.negated))} ${negateKeywordInput('unused')}`
        search.onUpdateTokenizedSearch(tokenizeString(query))
        await nextTick()
        expect(search.filteredUids.value).toEqual(['switch', 'dimmer'])
      })
    })

    it('handles quoted field alternatives, aliases and negation', async () => {
      const search = createSearch(phraseItems)
      search.onUpdateTokenizedSearch(tokenizeString('tag:"hello world",Outdoor'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['exact'])

      search.onUpdateTokenizedSearch(tokenizeString('-tag:"hello world",Outdoor'))
      await nextTick()
      expect(search.filteredUids.value).toEqual([
        'embedded',
        'reversed',
        'separated',
        'description',
        'punctuation',
        'long',
        'long-partial',
        'special'
      ])

      search.onUpdateTokenizedSearch(tokenizeString('-"hello world"'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['reversed', 'separated', 'punctuation', 'long', 'long-partial', 'special'])

      search.onUpdateTokenizedSearch(tokenizeString('type:Switch AND (name:"hello world" OR tag:"world hello")'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['exact', 'embedded', 'reversed'])
    })

    it('treats punctuation and long phrases literally', async () => {
      const search = createSearch(phraseItems)
      search.onUpdateTokenizedSearch(tokenizeString('"hello: world | goodbye"'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['punctuation'])

      search.onUpdateTokenizedSearch(tokenizeString('tag:"hello: world | goodbye"'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['punctuation'])

      search.onUpdateTokenizedSearch(tokenizeString('"a phrase much longer than thirty two characters in total"'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['long'])

      search.onUpdateTokenizedSearch(tokenizeString('tag:"Kitchen, Main"'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['special'])

      search.onUpdateTokenizedSearch(tokenizeString('"! Warning $"'))
      await nextTick()
      expect(search.filteredUids.value).toEqual(['special'])
    })
  })

  it('excludes records with any matching array value and retains missing arrays', async () => {
    const search = createSearch(items)
    search.onUpdateTokenizedSearch(tokenizeString('-tag:Kitchen'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['outdoor', 'empty', 'missing'])

    search.onUpdateTokenizedSearch(tokenizeString('tag:Kitchen'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['kitchen'])
    expect(search.filteredResults.value[0].matches?.[0].key).toBe('tags')
  })

  it('excludes every alternative, even when values occur in different array entries', async () => {
    const search = createSearch(items)
    search.onUpdateTokenizedSearch(tokenizeString('-tag:Kitchen,Outdoor'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['empty', 'missing'])

    search.onUpdateTokenizedSearch(tokenizeString('-type:Switch,Dimmer'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['empty', 'missing'])
  })

  it('combines negated and positive terms with grouping and preserves positive highlights', async () => {
    const search = createSearch(items)
    search.onUpdateTokenizedSearch(tokenizeString('(name:light AND -tag:Kitchen) OR name:fan'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['outdoor', 'empty'])
    expect(search.filteredResults.value.map((result) => result.matches?.map((match) => match.key))).toEqual([['name'], ['name']])

    search.onUpdateTokenizedSearch(tokenizeString('name:light OR -tag:Outdoor'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['kitchen', 'outdoor', 'empty', 'missing'])

    search.onUpdateTokenizedSearch(tokenizeString('-tag:Outdoor AND -type:Number'))
    await nextTick()
    expect(search.filteredUids.value).toEqual([])

    search.onUpdateTokenizedSearch(tokenizeString('-tag:Kitchen OR -type:Number'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['kitchen', 'outdoor', 'empty', 'missing'])
  })

  it('uses the same Fuse matching for positive and negated custom getters', async () => {
    const search = useSearch(items, {
      filtersDefinitions: {
        kind: { label: 'Kind', getFn: (item) => (item as Item).type }
      },
      uidField: 'id'
    })
    search.onUpdateTokenizedSearch(tokenizeString('kind:witch'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['kitchen'])

    search.onUpdateTokenizedSearch(tokenizeString('-kind:witch'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['outdoor', 'empty', 'missing'])
  })

  it('applies query interceptors to plans containing negated expressions', async () => {
    const search = useSearch(items, {
      filtersDefinitions: {
        tag: { label: 'Tag', path: 'tags' },
        type: { label: 'Type' }
      },
      uidField: 'id',
      fuseSearchInterceptor: (query) => (query ? { $and: [query, { type: 'Number' }] } : query)
    })
    search.onUpdateTokenizedSearch(tokenizeString('-tag:Kitchen'))
    await nextTick()
    expect(search.filteredUids.value).toEqual(['empty', 'missing'])
  })

  it('recomputes negated searches when reactive data changes', async () => {
    const list = ref<Item[]>([items[0]])
    const search = createSearch(list)
    search.onUpdateTokenizedSearch(tokenizeString('-tag:Kitchen'))
    await nextTick()
    expect(search.filteredUids.value).toEqual([])

    list.value = [items[0], items[1], items[3]]
    await nextTick()
    expect(search.filteredUids.value).toEqual(['outdoor', 'missing'])
  })

  it('applies negation and updates indices during incremental additions and eviction', async () => {
    const search = createSearch([items[0], items[1]])
    search.onUpdateTokenizedSearch(tokenizeString('-tag:Kitchen'))
    await nextTick()
    search.addDataToFuse(items[3], true)
    expect(search.filteredUids.value).toEqual(['outdoor', 'missing'])
    expect(search.filteredIndices.value).toEqual([0, 1])

    search.addDataToFuse(items[0], false)
    expect(search.filteredUids.value).toEqual(['outdoor', 'missing'])

    search.addDataToFuse(items[2], false)
    expect(search.filteredUids.value).toEqual(['outdoor', 'missing', 'empty'])
    expect(search.filteredIndices.value).toEqual([0, 1, 3])
  })

  it('retains match details for incrementally added positive results', async () => {
    const search = createSearch([])
    search.onUpdateTokenizedSearch(tokenizeString('name:light -tag:Kitchen'))
    await nextTick()
    search.addDataToFuse(items[1], false)
    expect(search.filteredUids.value).toEqual(['outdoor'])
    expect(search.filteredResults.value[0].matches?.[0].key).toBe('name')
  })

  it('evicts matching results, shifts indices and searches only the added item', async () => {
    const search = createSearch([items[0], items[1], items[2]])
    search.onUpdateTokenizedSearch(tokenizeString('name:light'))
    await nextTick()
    const remainingMatches = search.filteredResults.value[1].matches
    const searchSpy = vi.spyOn(Fuse.prototype, 'search')
    try {
      search.addDataToFuse(items[3], true)
      expect(search.filteredUids.value).toEqual(['outdoor'])
      expect(search.filteredIndices.value).toEqual([0])
      expect(search.filteredResults.value[0].matches).toEqual(remainingMatches)
      expect(searchSpy).toHaveBeenCalledTimes(1)
      expect(searchSpy.mock.instances[0].getIndex().docs).toEqual([items[3]])
    } finally {
      searchSpy.mockRestore()
    }
  })

  it('handles repeated capped additions with no active filter and an initially empty index', () => {
    const list: Item[] = []
    const search = createSearch(list)
    search.addDataToFuse(items[0], true)
    expect(search.filteredUids.value).toEqual(['kitchen'])
    expect(search.filteredIndices.value).toEqual([0])
    search.addDataToFuse(items[1], true)
    expect(list).toEqual([items[1]])
    expect(search.filteredUids.value).toEqual(['outdoor'])
    expect(search.filteredIndices.value).toEqual([0])
  })

  it('adjusts non-matching evictions and adds matches for compound negated queries', async () => {
    const search = createSearch([items[0], items[1], items[2]])
    search.onUpdateTokenizedSearch(tokenizeString('name:light AND -tag:Kitchen'))
    await nextTick()
    const searchSpy = vi.spyOn(Fuse.prototype, 'search')
    try {
      search.addDataToFuse({ id: 'new', name: 'Light', type: 'Switch' }, true)
      expect(search.filteredUids.value).toEqual(['outdoor', 'new'])
      expect(search.filteredIndices.value).toEqual([0, 2])
      expect(search.filteredResults.value.map((result) => result.matches?.[0].key)).toEqual(['name', 'name'])
      expect(searchSpy.mock.instances.every((instance) => instance.getIndex().docs.length === 1)).toBe(true)
      expect(searchSpy).toHaveBeenCalled()
    } finally {
      searchSpy.mockRestore()
    }
  })
})
