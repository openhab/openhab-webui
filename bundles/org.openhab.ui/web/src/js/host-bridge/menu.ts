import type { Icon, MenuItem, MenuSection, MenuState } from './protocol'

export interface MenuLink {
  id: string
  label: string
  path: string
  icon?: Icon
}

/** The sidebar content. */
export interface MenuInput {
  currentUrl: string
  pages: MenuLink[]
  chat: MenuLink
  /** Null when the user isn't an admin. */
  admin: {
    title: string
    settings: MenuLink & { children: MenuLink[]; more: MenuLink[] }
    addons: MenuLink & { children: MenuLink[] }
    developer: MenuLink & { children: MenuLink[]; more: MenuLink[] }
  } | null
  about: MenuLink
  /** The signed-in user, or the sign-in entry. Null when the server has no sign-in. */
  account: { user: MenuLink & { footer?: string } } | { unlock: { label: string } } | null
}

export const UNLOCK_ID = 'unlock'

function samePath(a: string, b: string) {
  const strip = (s: string) => s.replace(/\?.*$/, '').replace(/\/$/, '')
  return strip(a) === strip(b)
}

function item(link: MenuLink, currentUrl: string): MenuItem {
  const result: MenuItem = { id: link.id, label: link.label, path: link.path }
  if (link.icon) result.icon = link.icon
  if (samePath(link.path, currentUrl)) result.active = true
  return result
}

// Mark a section active when the current page is in the section but not in its submenu, as the
// sidebar does.
function sectionItem(link: MenuLink & { children: MenuLink[]; more?: MenuLink[] }, currentUrl: string): MenuItem {
  const result = item(link, currentUrl)
  const children = link.children.map((child) => item(child, currentUrl))
  const more = (link.more ?? []).map((child) => item(child, currentUrl))
  if (children.length) result.children = children
  if (more.length) result.more = more
  const inSection = currentUrl.startsWith(link.path)
  if (inSection && !children.some((c) => c.active)) result.active = true
  return result
}

export function buildMenuState(input: MenuInput): MenuState {
  const url = input.currentUrl
  const sections: MenuSection[] = []
  if (input.pages.length) sections.push({ id: 'pages', items: input.pages.map((p) => item(p, url)) })
  sections.push({ id: 'chat', items: [item(input.chat, url)] })
  if (input.admin) {
    const { title, settings, addons, developer } = input.admin
    sections.push({
      id: 'settings',
      title,
      items: [sectionItem(settings, url), sectionItem(addons, url), sectionItem(developer, url)]
    })
  }
  sections.push({ id: 'about', items: [item(input.about, url)] })
  if (input.account && 'user' in input.account) {
    const user = item(input.account.user, url)
    if (input.account.user.footer) user.footer = input.account.user.footer
    sections.push({ id: 'account', items: [user] })
  } else if (input.account) {
    sections.push({
      id: 'account',
      items: [{ id: UNLOCK_ID, label: input.account.unlock.label, icon: { name: 'f7:lock_shield_fill' } }]
    })
  }
  return { sections }
}
