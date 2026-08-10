import type { FuseResultMatch } from 'fuse.js'

export function getListTitle(filtered: boolean, filteredCount: number, totalCount: number, listName: string, selected: number = 0) {
  let title
  if (!filtered) {
    title = `${totalCount} ${listName}${totalCount === 1 ? '' : 's'}`
  } else if (filteredCount === 0) {
    title = `No ${listName}s found`
  } else {
    title = `${filteredCount} of ${totalCount} ${listName}s found`
  }

  if (selected > 0) {
    title += ` (${selected} selected)`
  }
  return title
}

export function findElementsInObject(data: unknown, element: string): string[] {
  if (typeof data !== 'object' || data === null) return []

  return Object.entries(data).reduce((acc, [key, value]) => {
    if (key === element && typeof value === 'string') acc.push(value)

    if (typeof value === 'object' && value !== null) {
      acc.push(...findElementsInObject(value, element))
    }

    return acc
  }, [] as string[])
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ai-assisted code
export function highlightMatches(text: string | undefined, matches: readonly FuseResultMatch[] | undefined, key: string): string {
  if (!text) return ''
  const indices = matches?.find((m) => m.key === key)?.indices
  if (!indices?.length) return escapeHtml(text)

  // Merge overlapping/adjacent ranges (sorted by start)
  const merged: [number, number][] = []
  for (const [start, end] of [...indices].sort((a, b) => a[0] - b[0])) {
    const last = merged[merged.length - 1]
    if (last && start <= last[1] + 1) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }

  let result = ''
  let pos = 0
  for (const [start, end] of merged) {
    result += escapeHtml(text.slice(pos, start)) + '<mark>' + escapeHtml(text.slice(start, end + 1)) + '</mark>'
    pos = end + 1
  }
  return result + escapeHtml(text.slice(pos))
}
