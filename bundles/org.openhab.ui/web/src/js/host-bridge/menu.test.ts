import { describe, expect, it } from 'vitest'
import { buildMenuState, UNLOCK_ID, type MenuInput } from './menu'

const link = (path: string, label = path) => ({ id: path, label, path })

function input(overrides: Partial<MenuInput> = {}): MenuInput {
  return {
    currentUrl: '/page/kitchen',
    pages: [link('/page/overview', 'Overview'), link('/page/kitchen', 'Kitchen')],
    chat: link('/chat', 'Chat'),
    admin: {
      title: 'Administration',
      settings: {
        ...link('/settings/', 'Settings'),
        children: [link('/settings/things/', 'Things')],
        more: [link('/settings/transformations/')]
      },
      addons: { ...link('/addons/', 'Add-on Store'), children: [link('/addons/automation/')] },
      developer: { ...link('/developer/', 'Developer Tools'), children: [], more: [] }
    },
    about: link('/about/', 'Help & About'),
    account: { unlock: { label: 'Unlock Administration' } },
    ...overrides
  }
}

describe('menu.state', () => {
  it('lists the sidebar in order, with the account last', () => {
    const menu = buildMenuState(input())
    expect(menu.sections.map((s) => s.id)).toEqual(['pages', 'chat', 'settings', 'about', 'account'])
    expect(menu.sections[2]!.title).toBe('Administration')
  })

  it('marks the page on screen', () => {
    const pages = buildMenuState(input()).sections[0]!.items
    expect(pages.find((i) => i.active)?.id).toBe('/page/kitchen')
  })

  it('keeps submenus and the rest behind Show all', () => {
    const settings = buildMenuState(input()).sections[2]!.items[0]!
    expect(settings.children?.map((c) => c.id)).toEqual(['/settings/things/'])
    expect(settings.more?.map((c) => c.id)).toEqual(['/settings/transformations/'])
  })

  it("marks a section active on its pages the submenu doesn't list", () => {
    const settingsFor = (currentUrl: string) => buildMenuState(input({ currentUrl })).sections[2]!.items[0]!
    expect(settingsFor('/settings/services/').active).toBe(true)
    expect(settingsFor('/settings/things/').active).toBeUndefined()
    expect(settingsFor('/settings/things/').children![0]!.active).toBe(true)
  })

  it('leaves out the admin section and pages when there are none', () => {
    const menu = buildMenuState(input({ admin: null, pages: [] }))
    expect(menu.sections.map((s) => s.id)).toEqual(['chat', 'about', 'account'])
  })

  it('offers sign-in without a path, or the signed-in user', () => {
    const unlock = buildMenuState(input()).sections.at(-1)!.items[0]!
    expect(unlock.id).toBe(UNLOCK_ID)
    expect(unlock.path).toBeUndefined()

    const user = buildMenuState(
      input({ account: { user: { ...link('/profile/', 'dan'), footer: 'https://oh.example.com' } } })
    ).sections.at(-1)!.items[0]!
    expect(user).toMatchObject({ id: '/profile/', label: 'dan', footer: 'https://oh.example.com' })
  })
})
