import { computed } from 'vue'

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
