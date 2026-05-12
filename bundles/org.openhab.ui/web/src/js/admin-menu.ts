export type AdminMenuSection = 'settings' | 'developer'

type AdminMenuPageGroupId = 'configuration' | 'ui' | 'automation' | 'advanced' | 'maintenance' | 'local'
type AdminMenuPageColumn = 'primary' | 'secondary'

type RuntimeStoreLike = {
  apiEndpoint?: (endpoint: string) => boolean
}

type VisibilityCheck = (runtimeStore: RuntimeStoreLike) => boolean

interface AdminMenuBaseItemDefinition {
  id: string
  title: string
  icon: string
  pageGroup: AdminMenuPageGroupId
  footer?: string
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
  title: string
  column: AdminMenuPageColumn
}

const hasEndpoint = (runtimeStore: RuntimeStoreLike, endpoint: string) => {
  return typeof runtimeStore?.apiEndpoint === 'function' ? runtimeStore.apiEndpoint(endpoint) : false
}

const adminMenuPageGroups: Record<AdminMenuSection, AdminMenuPageGroup[]> = {
  settings: [
    { id: 'configuration', title: 'Configuration', column: 'primary' },
    { id: 'ui', title: 'User Interface', column: 'primary' },
    { id: 'automation', title: 'Automation', column: 'primary' }
  ],
  developer: [
    { id: 'advanced', title: 'Advanced Object Management', column: 'primary' },
    { id: 'maintenance', title: 'Maintenance Tools', column: 'secondary' },
    { id: 'local', title: 'Local Developer Settings', column: 'secondary' }
  ]
}

const adminMenuItems: Record<AdminMenuSection, AdminMenuItemDefinition[]> = {
  settings: [
    {
      id: 'things',
      kind: 'link',
      title: 'Things',
      link: '/settings/things/',
      icon: 'lightbulb',
      pageGroup: 'configuration',
      footer: 'things',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'things')
    },
    {
      id: 'model',
      kind: 'link',
      title: 'Model',
      link: '/settings/model/',
      icon: 'list_bullet_indent',
      pageGroup: 'configuration',
      footer: 'model',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'items')
    },
    {
      id: 'items',
      kind: 'link',
      title: 'Items',
      link: '/settings/items/',
      icon: 'square_on_circle',
      pageGroup: 'configuration',
      footer: 'items',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'items')
    },
    {
      id: 'transformations',
      kind: 'link',
      title: 'Transformations',
      link: '/settings/transformations/',
      icon: 'function',
      pageGroup: 'configuration',
      footer: 'transform',
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'transformations')
    },
    {
      id: 'persistence',
      kind: 'link',
      title: 'Persistence',
      link: '/settings/persistence/',
      icon: 'download_circle',
      pageGroup: 'configuration',
      footer: 'persistence'
    },
    {
      id: 'pages',
      kind: 'link',
      title: 'Pages',
      link: '/settings/pages/',
      icon: 'tv',
      pageGroup: 'ui',
      footer: 'pages',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'ui')
    },
    {
      id: 'sitemaps',
      kind: 'link',
      title: 'Sitemaps',
      link: '/settings/sitemaps/',
      icon: 'menu',
      pageGroup: 'ui',
      footer: 'sitemaps',
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'sitemaps')
    },
    {
      id: 'rules',
      kind: 'link',
      title: 'Rules',
      link: '/settings/rules/',
      icon: 'wand_stars',
      pageGroup: 'automation',
      footer: 'rules',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    },
    {
      id: 'scenes',
      kind: 'link',
      title: 'Scenes',
      link: '/settings/scenes/',
      icon: 'film',
      pageGroup: 'automation',
      footer: 'scenes',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    },
    {
      id: 'scripts',
      kind: 'link',
      title: 'Scripts',
      link: '/settings/scripts/',
      icon: 'doc_plaintext',
      pageGroup: 'automation',
      footer: 'scripts',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    },
    {
      id: 'schedule',
      kind: 'link',
      title: 'Schedule',
      link: '/settings/schedule/',
      icon: 'calendar',
      pageGroup: 'automation',
      footer: 'schedule',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'rules')
    }
  ],
  developer: [
    {
      id: 'widgets',
      kind: 'link',
      title: 'Widgets',
      link: '/developer/widgets/',
      icon: 'rectangle_on_rectangle_angled',
      pageGroup: 'advanced',
      footer: 'Develop custom widgets to use on pages',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'ui')
    },
    {
      id: 'blocks',
      kind: 'link',
      title: 'Block Libraries',
      link: '/developer/blocks/',
      icon: 'ticket',
      pageGroup: 'advanced',
      footer: 'Develop custom extensions for Blockly scripts',
      sidebarDefault: true,
      isVisible: (runtimeStore) => hasEndpoint(runtimeStore, 'ui')
    },
    {
      id: 'semantics',
      kind: 'link',
      title: 'Semantic Tags',
      link: '/developer/semantics/',
      icon: 'list_bullet_indent',
      pageGroup: 'advanced',
      footer: 'Extend the list of semantic tags for the model'
    },
    {
      id: 'add-items-dsl',
      kind: 'link',
      title: 'Add Items from Textual Definition',
      link: '/developer/add-items-dsl/',
      icon: 'text_badge_plus',
      pageGroup: 'advanced',
      footer: 'Create or update items & links in bulk'
    },
    {
      id: 'things-file-definitions',
      kind: 'action',
      actionId: 'copy-thing-file-definitions',
      title: 'Things File Definitions',
      icon: 'lightbulb',
      pageGroup: 'advanced',
      footer: "Copy all Things' file definitions to clipboard"
    },
    {
      id: 'items-file-definitions',
      kind: 'action',
      actionId: 'copy-item-file-definitions',
      title: 'Items File Definitions',
      icon: 'square_on_circle',
      pageGroup: 'advanced',
      footer: "Copy all Items' file definitions to clipboard"
    },
    {
      id: 'developer-sidebar',
      kind: 'toggle',
      controlId: 'developer-sidebar',
      title: 'Developer Sidebar',
      icon: 'wrench',
      pageGroup: 'maintenance',
      footer: 'Show a panel with various tools and help',
      className: 'developer-sidebar-toggle'
    },
    {
      id: 'api-explorer',
      kind: 'link',
      title: 'API Explorer',
      link: '/developer/api-explorer/',
      icon: 'burn',
      pageGroup: 'maintenance',
      footer: 'Discover and access the REST API directly',
      sidebarDefault: true
    },
    {
      id: 'log-viewer',
      kind: 'link',
      title: 'Log Viewer',
      link: '/developer/log-viewer/',
      icon: 'square_list',
      pageGroup: 'maintenance',
      footer: 'Monitor openHAB log output',
      sidebarDefault: true
    },
    {
      id: 'ui-logging',
      kind: 'select',
      controlId: 'ui-logging',
      title: 'UI Logging',
      icon: 'exclamationmark_circle',
      pageGroup: 'local',
      footer: 'Set the log level for the browser console logs',
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
      title: 'Code Editor: Vim Mode',
      icon: 'keyboard',
      pageGroup: 'local',
      footer: 'Enable Vim keybindings in code editors'
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
