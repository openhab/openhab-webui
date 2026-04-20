import type * as api from '@/api'
import type { DeepReadonly } from 'vue'

type PageType = {
  type: string
  label: string
  icon: string
}

const pageTypes: Record<string, PageType> = {
  Sitemap: { type: 'sitemap', label: 'Sitemap', icon: 'f7:menu' },
  'oh-layout-page': { type: 'layout', label: 'Layout', icon: 'f7:rectangle_grid_2x2' },
  'oh-home-page': { type: 'home', label: 'Home', icon: 'f7:house' },
  'oh-tabs-page': { type: 'tabs', label: 'Tabbed', icon: 'f7:squares_below_rectangle' },
  'oh-map-page': { type: 'map', label: 'Map', icon: 'f7:map' },
  'oh-plan-page': { type: 'plan', label: 'Floor plan', icon: 'f7:square_stack_3d_up' },
  'oh-chart-page': { type: 'chart', label: 'Chart', icon: 'f7:graph_square' }
}

const unknownPageType: PageType = { type: 'unknown', label: 'Unknown Page Type!', icon: 'f7:question_circle' }

/**
 * Returns the PageType for the given page, or a default "unknown" PageType if the page type is unknown.
 * The page type is determined by matching the page's component type against the known page types.
 * @param page
 * @returns The PageType for the given page, or a default "unknown" PageType if the page type is unknown.
 */
export function getPageType(page?: api.RootUiComponent | DeepReadonly<api.RootUiComponent> | null): PageType {
  if (!page) return unknownPageType
  return pageTypes[page.component] || unknownPageType
}

/**
 * Returns the icon for the given page, or a default icon if the page type is unknown.
 * The page type is determined by matching the page's component type against the known page types.
 *
 * Special cases:
 * - If the page is null or undefined, it is considered an unknown page type and gets a question mark icon.
 * - If the page has a uid of "overview", it is considered the overview page and gets a house icon.
 * - If the page has a config with an icon, that icon is used.
 *
 * @param page
 * @returns The icon for the given page, or a default icon if the page type is unknown.
 */
export function getPageIcon(page?: api.RootUiComponent | DeepReadonly<api.RootUiComponent> | null): string {
  if (!page) return unknownPageType.icon
  if (page.uid === 'overview') return 'f7:house'
  if (page.config && page.config.icon) return page.config.icon as string
  return getPageType(page).icon
}
