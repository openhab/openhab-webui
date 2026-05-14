export type AdminMenuSection = 'settings' | 'developer'

type AdminMenuPageGroupId = 'configuration' | 'ui' | 'automation' | 'advanced' | 'maintenance' | 'local'
type AdminMenuPageColumn = 'primary' | 'secondary'

type RuntimeStoreLike = {
  apiEndpoint?: (endpoint: string) => boolean
}

type VisibilityCheck = (runtimeStore: RuntimeStoreLike) => boolean

interface AdminMenuBaseItemDefinition {
  id: string
  titleKey: string // i18n key for the title
  footerKey?: string // i18n key for the footer/description
  icon: string
  pageGroup: AdminMenuPageGroupId
  className?: string
  sidebarDefault?: boolean
  sidebarEligible?: boolean
  isVisible?: VisibilityCheck
}

export interface AdminMenuLinkItemDefinition extends AdminMenuBaseItemDefinition {
  kind: 'link'
  link: string
}

export interface AdminMenuActionItemDefinition extends AdminMenuBaseItemDefinition {
  kind: 'action'
  actionId: string
}

export interface AdminMenuToggleItemDefinition extends AdminMenuBaseItemDefinition {
  kind: 'toggle'
  controlId: string
}

export interface AdminMenuSelectOptionDefinition {
  value: string
  label: string
}

export interface AdminMenuSelectItemDefinition extends AdminMenuBaseItemDefinition {
  kind: 'select'
  controlId: string
  options: AdminMenuSelectOptionDefinition[]
  smartSelectParams?: Record<string, unknown>
}

export type AdminMenuItemDefinition =
  | AdminMenuLinkItemDefinition
  | AdminMenuActionItemDefinition
  | AdminMenuToggleItemDefinition
  | AdminMenuSelectItemDefinition

interface AdminMenuPageGroup {
  id: AdminMenuPageGroupId
  titleKey: string // i18n key for the group title
  column: AdminMenuPageColumn
}

const hasEndpoint = (runtimeStore: RuntimeStoreLike, endpoint: string) => {
  return typeof runtimeStore?.apiEndpoint === 'function' ? runtimeStore.apiEndpoint(endpoint) : false
}

const adminMenuPageGroups: Record<AdminMenuSection, AdminMenuPageGroup[]> = {
  settings: [
    { id: 'configuration', titleKey: 'settings.groups.configuration', column: 'primary' },
    { id: 'ui', titleKey: 'settings.groups.ui', column: 'primary' },
    { id: 'automation', titleKey: 'settings.groups.automation', column: 'primary' }
  ],
  developer: [
    { id: 'advanced', titleKey: 'developer.groups.advanced', column: 'primary' },
    { id: 'maintenance', titleKey: 'developer.groups.maintenance', column: 'secondary' },
    { id: 'local', titleKey: 'developer.groups.local', column: 'secondary' }
  ]
}

const adminMenuItems: Record<AdminMenuSection, AdminMenuItemDefinition[]> = {
  settings: [
    {
      id: 'things',
      kind: 'link',
      titleKey: 'settings.things.title',
      footerKey: 'settings.things.footer',
      link: '/settings/things/',
      icon: 'lightbulb',
      pageGroup: 'configuration',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'things')
    },
    {
      id: 'model',
      kind: 'link',
      titleKey: 'settings.model.title',
      footerKey: 'settings.model.footer',
      link: '/settings/model/',
      icon: 'list_bullet_indent',
      pageGroup: 'configuration',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'items')
    },
    {
      id: 'items',
      kind: 'link',
      titleKey: 'settings.items.title',
      footerKey: 'settings.items.footer',
      link: '/settings/items/',
      icon: 'square_on_circle',
      pageGroup: 'configuration',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'items')
    },
    {
      id: 'transformations',
      kind: 'link',
      titleKey: 'settings.transformations.title',
      footerKey: 'settings.transformations.footer',
      link: '/settings/transformations/',
      icon: 'function',
      pageGroup: 'configuration',
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'transformations')
    },
    {
      id: 'persistence',
      kind: 'link',
      titleKey: 'settings.persistence.title',
      footerKey: 'settings.persistence.footer',
      link: '/settings/persistence/',
      icon: 'download_circle',
      pageGroup: 'configuration',
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'persistence')
    },
    {
      id: 'pages',
      kind: 'link',
      titleKey: 'settings.pages.title',
      footerKey: 'settings.pages.footer',
      link: '/settings/pages/',
      icon: 'tv',
      pageGroup: 'ui',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'ui')
    },
    {
      id: 'sitemaps',
      kind: 'link',
      titleKey: 'settings.sitemaps.title',
      footerKey: 'settings.sitemaps.footer',
      link: '/settings/sitemaps/',
      icon: 'menu',
      pageGroup: 'ui',
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'sitemaps')
    },
    {
      id: 'rules',
      kind: 'link',
      titleKey: 'settings.rules.title',
      footerKey: 'settings.rules.footer',
      link: '/settings/rules/',
      icon: 'wand_stars',
      pageGroup: 'automation',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    },
    {
      id: 'scenes',
      kind: 'link',
      titleKey: 'settings.scenes.title',
      footerKey: 'settings.scenes.footer',
      link: '/settings/scenes/',
      icon: 'film',
      pageGroup: 'automation',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    },
    {
      id: 'scripts',
      kind: 'link',
      titleKey: 'settings.scripts.title',
      footerKey: 'settings.scripts.footer',
      link: '/settings/scripts/',
      icon: 'doc_plaintext',
      pageGroup: 'automation',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    },
    {
      id: 'schedule',
      kind: 'link',
      titleKey: 'settings.schedule.title',
      footerKey: 'settings.schedule.footer',
      link: '/settings/schedule/',
      icon: 'calendar',
      pageGroup: 'automation',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    }
  ],
  developer: [
    {
      id: 'widgets',
      kind: 'link',
      titleKey: 'developer.widgets.title',
      footerKey: 'developer.widgets.footer',
      link: '/developer/widgets/',
      icon: 'rectangle_on_rectangle_angled',
      pageGroup: 'advanced',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'ui')
    },
    {
      id: 'blocks',
      kind: 'link',
      titleKey: 'developer.blocks.title',
      footerKey: 'developer.blocks.footer',
      link: '/developer/blocks/',
      icon: 'ticket',
      pageGroup: 'advanced',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'ui')
    },
    {
      id: 'semantics',
      kind: 'link',
      titleKey: 'developer.semantics.title',
      footerKey: 'developer.semantics.footer',
      link: '/developer/semantics/',
      icon: 'list_bullet_indent',
      pageGroup: 'advanced'
    },
    {
      id: 'add-items-dsl',
      kind: 'link',
      titleKey: 'developer.add-items-dsl.title',
      footerKey: 'developer.add-items-dsl.footer',
      link: '/developer/add-items-dsl/',
      icon: 'text_badge_plus',
      pageGroup: 'advanced'
    },
    {
      id: 'things-file-definitions',
      kind: 'action',
      actionId: 'copy-thing-file-definitions',
      titleKey: 'developer.things-file-definitions.title',
      footerKey: 'developer.things-file-definitions.footer',
      icon: 'lightbulb',
      pageGroup: 'advanced'
    },
    {
      id: 'items-file-definitions',
      kind: 'action',
      actionId: 'copy-item-file-definitions',
      titleKey: 'developer.items-file-definitions.title',
      footerKey: 'developer.items-file-definitions.footer',
      icon: 'square_on_circle',
      pageGroup: 'advanced'
    },
    {
      id: 'developer-sidebar',
      kind: 'toggle',
      controlId: 'developer-sidebar',
      titleKey: 'developer.developer-sidebar.title',
      footerKey: 'developer.developer-sidebar.footer',
      icon: 'wrench',
      pageGroup: 'maintenance',
      className: 'developer-sidebar-toggle'
    },
    {
      id: 'api-explorer',
      kind: 'link',
      titleKey: 'developer.api-explorer.title',
      footerKey: 'developer.api-explorer.footer',
      link: '/developer/api-explorer/',
      icon: 'burn',
      pageGroup: 'maintenance',
      sidebarDefault: true
    },
    {
      id: 'log-viewer',
      kind: 'link',
      titleKey: 'developer.log-viewer.title',
      footerKey: 'developer.log-viewer.footer',
      link: '/developer/log-viewer/',
      icon: 'square_list',
      pageGroup: 'maintenance',
      sidebarDefault: true
    },
    {
      id: 'ui-logging',
      kind: 'select',
      controlId: 'ui-logging',
      titleKey: 'developer.ui-logging.title',
      footerKey: 'developer.ui-logging.footer',
      icon: 'exclamationmark_circle',
      pageGroup: 'local',
      smartSelectParams: {
        openIn: 'popup',
        closeOnSelect: true
      },
      options: [
        { value: 'TRACE', label: 'Trace' },
        { value: 'DEBUG', label: 'Debug' },
        { value: 'INFO', label: 'Info' },
        { value: 'WARN', label: 'Warn' },
        { value: 'ERROR', label: 'Error' },
        { value: 'OFF', label: 'Off' }
      ]
    },
    {
      id: 'vim-mode',
      kind: 'toggle',
      controlId: 'vim-mode',
      titleKey: 'developer.vim-mode.title',
      footerKey: 'developer.vim-mode.footer',
      icon: 'keyboard',
      pageGroup: 'local'
    }
  ]
}

function isSidebarLinkItem(item: AdminMenuItemDefinition): item is AdminMenuLinkItemDefinition {
  return item.kind === 'link' && item.sidebarEligible !== false
}

function getVisibleAdminMenuItems(section: AdminMenuSection, runtimeStore: RuntimeStoreLike): AdminMenuItemDefinition[] {
  return adminMenuItems[section].filter((item) => !item.isVisible || item.isVisible(runtimeStore))
}

export function getAdminMenuPageSections(section: AdminMenuSection, runtimeStore: RuntimeStoreLike) {
  const visibleItems = getVisibleAdminMenuItems(section, runtimeStore)

  return adminMenuPageGroups[section]
    .map((group) => {
      return {
        ...group,
        items: visibleItems.filter((item) => item.pageGroup === group.id)
      }
    })
    .filter((group) => group.items.length > 0)
}

export function getAdminSidebarCandidates(section: AdminMenuSection, runtimeStore: RuntimeStoreLike) {
  return getVisibleAdminMenuItems(section, runtimeStore).filter((item) => isSidebarLinkItem(item))
}

export function getDefaultAdminSidebarIds(section: AdminMenuSection, runtimeStore: RuntimeStoreLike) {
  return getAdminSidebarCandidates(section, runtimeStore)
    .filter((item) => item.sidebarDefault)
    .map((item) => item.id)
}

export function getEffectiveAdminSidebarItems(section: AdminMenuSection, runtimeStore: RuntimeStoreLike, selectedIds?: string[]) {
  const candidates = getAdminSidebarCandidates(section, runtimeStore)

  if (!Array.isArray(selectedIds)) {
    return candidates.filter((item) => item.sidebarDefault)
  }

  const selected = new Set(selectedIds)
  return candidates.filter((item) => selected.has(item.id))
}
