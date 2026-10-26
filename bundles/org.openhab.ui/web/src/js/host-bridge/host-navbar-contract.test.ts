import { describe, expect, it } from 'vitest'

// Checks the rule in navbar.ts: every page describes all of its top bar.
const sources = import.meta.glob<string>(['/src/**/*.vue'], { query: '?raw', import: 'default', eager: true })

// Panels and popups keep their own bar and are not checked.
const PANELS = ['/src/pages/panel-right.vue', '/src/components/developer/developer-dock.vue']

function insidePopup(source: string, index: number) {
  const before = source.slice(0, index)
  const opened = (before.match(/<f7-popup\b/g) ?? []).length
  const closed = (before.match(/<\/f7-popup>/g) ?? []).length
  return opened > closed
}

describe('host navbar contract', () => {
  it('every page describes its top bar', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(100)
    const undescribed: string[] = []
    for (const [file, source] of Object.entries(sources)) {
      if (PANELS.includes(file) || source.includes('useHostNavbar(')) continue
      for (const match of source.matchAll(/<f7-navbar\b(?:[^>]*?\/>|[\s\S]*?<\/f7-navbar>)/g)) {
        if (insidePopup(source, match.index) || match[0].includes('<oh-nav-content')) continue
        undescribed.push(file)
      }
    }
    expect(undescribed).toEqual([])
  })

  it('no page puts buttons on the bar outside the actions prop', () => {
    const slotted = Object.entries(sources)
      .filter(([, source]) => /<template\b[^>]*(#right|v-slot:right)\b/.test(source))
      .map(([file]) => file)
    expect(slotted).toEqual([])
  })
})
