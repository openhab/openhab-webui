import { describe, it, expect } from 'vitest'
import { parseAppMenu } from './app-menu'

describe('parseAppMenu', () => {
  it('accepts a JSON string', () => {
    const menu = parseAppMenu('{"title":"App","items":[{"id":"settings","title":"Settings","icon":"material:settings"}]}')
    expect(menu).toEqual({
      title: 'App',
      items: [
        {
          id: 'settings',
          title: 'Settings',
          icon: 'material:settings',
          footer: undefined,
          active: false,
          badge: undefined,
          children: undefined
        }
      ]
    })
  })

  it('accepts an object and keeps one level of children', () => {
    const menu = parseAppMenu({
      title: 'App',
      items: [
        {
          id: 'servers',
          title: 'Servers',
          footer: 'Home',
          children: [
            { id: 'server:1', title: 'Home', active: true, children: [{ id: 'nested', title: 'Nested' }] },
            { id: 'server:2', title: 'Office' }
          ]
        }
      ]
    })
    expect(menu?.items[0].footer).toBe('Home')
    expect(menu?.items[0].children?.map((child) => child.id)).toEqual(['server:1', 'server:2'])
    expect(menu?.items[0].children?.[0].active).toBe(true)
    expect(menu?.items[0].children?.[0].children).toBeUndefined()
  })

  it('converts numbers to strings and ignores anything that is not plain text', () => {
    const menu = parseAppMenu({ items: [{ id: 5, title: 'Five', badge: 3, footer: { html: '<b>x</b>' }, active: 'yes' }] })
    expect(menu?.title).toBe('')
    expect(menu?.items[0]).toEqual({
      id: '5',
      title: 'Five',
      icon: undefined,
      footer: undefined,
      active: false,
      badge: '3',
      children: undefined
    })
  })

  it('drops entries without id or title', () => {
    const menu = parseAppMenu({ items: [{ title: 'No id' }, { id: 'no-title' }, null, 'text', { id: 'ok', title: 'Ok' }] })
    expect(menu?.items.map((item) => item.id)).toEqual(['ok'])
  })

  it('returns null if there is nothing to show', () => {
    expect(parseAppMenu(null)).toBeNull()
    expect(parseAppMenu('not json')).toBeNull()
    expect(parseAppMenu({ items: [] })).toBeNull()
    expect(parseAppMenu({ title: 'App' })).toBeNull()
  })
})
