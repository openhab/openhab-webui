import * as api from '@/api'

export function transformParameterDefault(p: api.ConfigDescriptionParameter & { default?: string }) {
  if (p.default === undefined) return undefined
  switch (p.type) {
    case 'BOOLEAN':
      return Boolean(p.default)
    case 'INTEGER':
    case 'DECIMAL':
      return Number(p.default)
    case 'TEXT':
      return p.default
    default:
      const exhaustiveCheck: never = p.type
      return p.default
  }
}
