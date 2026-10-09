/**
 * Sanitizes the menu a native app (Android, iOS) passes to `window.MainUI.setAppMenu()`.
 * Only known fields are kept and everything is converted to plain strings/booleans, groups are limited to one level.
 *
 * @param menu the menu as object or JSON string
 * @returns the menu, or null if there is nothing (valid) to show
 */
export function parseAppMenu(menu: unknown): OHAppMenu | null {
  let parsed: unknown
  try {
    parsed = typeof menu === 'string' ? JSON.parse(menu) : menu
  } catch {
    return null
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.items)) return null

  const items = toItems(parsed.items, true)
  if (!items.length) return null
  return { title: typeof parsed.title === 'string' ? parsed.title : '', items }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Apps pass texts and numbers only, anything else (objects, markup holders, ...) is ignored */
function toText(value: unknown): string | undefined {
  if (typeof value === 'string') return value || undefined
  if (typeof value === 'number') return String(value)
  return undefined
}

function toItems(items: unknown[], allowChildren: boolean): OHAppMenuItem[] {
  const result: OHAppMenuItem[] = []
  for (const item of items) {
    if (!isRecord(item)) continue
    const id = toText(item.id)
    const title = toText(item.title)
    if (id === undefined || title === undefined) continue
    const children = allowChildren && Array.isArray(item.children) ? toItems(item.children, false) : []
    result.push({
      id,
      title,
      icon: toText(item.icon),
      footer: toText(item.footer),
      active: item.active === true,
      badge: toText(item.badge),
      children: children.length ? children : undefined
    })
  }
  return result
}
