// note: this script is run at build time (npm prebuild) to produce widget-catalog.json,
// a manifest of every WidgetDefinition that ships with the Main UI.
//
// The file is served as a static asset from the bundle (UIServlet) at
// http://<server>:8080/widget-catalog.json and consumed by external tools that need a
// machine readable inventory of available components and their props/slots without
// having to parse the TypeScript source. The MCP add-on (org.openhab.io.mcp) fetches
// this at runtime to give AI agents an authoritative schema for page/widget authoring.

import fs from 'fs'
import path from 'path'

import * as SystemWidgets from '../src/assets/definitions/widgets/system/index.ts'
import * as StdCardWidgets from '../src/assets/definitions/widgets/standard/cards.ts'
import * as StdListItemWidgets from '../src/assets/definitions/widgets/standard/listitems.ts'
import * as StdCellWidgets from '../src/assets/definitions/widgets/standard/cells.ts'
import * as LayoutWidgets from '../src/assets/definitions/widgets/layout/index.ts'
import * as PlanWidgets from '../src/assets/definitions/widgets/plan/index.ts'
import * as MapWidgets from '../src/assets/definitions/widgets/map/index.ts'
import * as TabsWidgets from '../src/assets/definitions/widgets/tabs/index.ts'
import { OhChartPageDefinition } from '../src/assets/definitions/widgets/chart/page.ts'
import ChartWidgetsDefinitions from '../src/assets/definitions/widgets/chart/index.ts'
import { OhHomePageDefinition } from '../src/assets/definitions/widgets/home/index.ts'

const OUTPUT = './public/widget-catalog.json'

// Define which library maps to which catalog category.
const libraries = [
  { name: 'system', category: 'system', mod: SystemWidgets },
  { name: 'standard-card', category: 'standard-card', mod: StdCardWidgets },
  { name: 'list-item', category: 'list-item', mod: StdListItemWidgets },
  { name: 'list-cell', category: 'list-cell', mod: StdCellWidgets },
  { name: 'layout', category: 'layout', mod: LayoutWidgets },
  { name: 'plan-marker', category: 'plan-marker', mod: PlanWidgets },
  { name: 'map-marker', category: 'map-marker', mod: MapWidgets },
  { name: 'tabs', category: 'system', mod: TabsWidgets },
  { name: 'chart-page', category: 'page-type', mod: { OhChartPageDefinition } },
  { name: 'home-page', category: 'page-type', mod: { OhHomePageDefinition } },
  {
    name: 'chart-pieces',
    category: 'system',
    mod: Object.fromEntries(
      Object.entries(ChartWidgetsDefinitions).map(([k, v]) => [k, v])
    )
  }
]

// Page types not declared as WidgetDefinitions in the TS source (rendered by Vue
// components with stable schemas). Hand-encoded so the catalog covers all 6 page types.
const supplementaryPageTypes = [
  {
    name: 'oh-layout-page',
    label: 'Layout Page',
    category: 'page-type',
    description: 'Free-form page composed of blocks, grids, or canvas layers. The most common page type for dashboards.',
    props: [
      { name: 'label', type: 'TEXT', label: 'Label', description: 'User-facing page title.' },
      { name: 'hideNavbar', type: 'BOOLEAN', label: 'Hide Navbar', description: 'Hide the top navigation bar.', default: false },
      { name: 'hideSidebarIcon', type: 'BOOLEAN', label: 'Hide Sidebar Icon', default: false },
      { name: 'showFullscreenIcon', type: 'BOOLEAN', label: 'Show Fullscreen Icon', default: false },
      { name: 'layoutType', type: 'TEXT', label: 'Layout Type', description: "'responsive' (default) or 'fixed' with fixedType set.", default: 'responsive', options: ['responsive', 'fixed'] },
      { name: 'fixedType', type: 'TEXT', label: 'Fixed Type', description: "'grid' or 'canvas' when layoutType='fixed'.", options: ['grid', 'canvas'] },
      { name: 'colNum', type: 'INTEGER', label: 'Grid Columns', description: 'Number of columns for fixed-grid layout.', default: 16 },
      { name: 'margin', type: 'INTEGER', label: 'Grid Margin (px)' },
      { name: 'verticalCompact', type: 'BOOLEAN', label: 'Vertical Compact' },
      { name: 'screenWidth', type: 'INTEGER', label: 'Screen Width (px)' },
      { name: 'screenHeight', type: 'INTEGER', label: 'Screen Height (px)' },
      { name: 'scale', type: 'DECIMAL', label: 'Scale' },
      { name: 'imageUrl', type: 'TEXT', label: 'Background Image URL', description: 'For canvas layouts only.' }
    ],
    notes: 'For dashboards. Default is responsive — children are oh-block containing cards. Switch to fixed + canvas for absolutely-positioned widgets.'
  },
  {
    name: 'oh-tabs-page',
    label: 'Tabbed Page',
    category: 'page-type',
    description: 'Container with multiple tabs, each linking to another page or rendering its own children.',
    props: [
      { name: 'label', type: 'TEXT', label: 'Label' },
      { name: 'hideNavbar', type: 'BOOLEAN', label: 'Hide Navbar' }
    ],
    notes: 'Each oh-tab in the default slot has config {title, icon, page: "page:other-uid"} to reference another page by UID.'
  }
]

// Page types live across a few directories; collect them explicitly to ensure the
// 'page-type' category is fully populated.
const pageTypeMarkers = new Set([
  'oh-layout-page',
  'oh-home-page',
  'oh-tabs-page',
  'oh-chart-page',
  'oh-map-page',
  'oh-plan-page'
])

function extractDefinition(value) {
  // Definition exports may be functions returning a WidgetDefinition, or the
  // WidgetDefinition instance directly.
  return typeof value === 'function' ? value() : value
}

function paramToProp(p) {
  const prop = {
    name: p.name,
    type: p.type,
    label: p.label || p.name,
    description: p.description || ''
  }
  if (p.required) prop.required = true
  if (p.context) prop.context = p.context
  if (p.advanced) prop.advanced = true
  if (p.multiple) prop.multiple = true
  if (p.default !== undefined) prop.default = p.default
  if (p.defaultValues !== undefined) prop.defaultValues = p.defaultValues
  if (p.groupName) prop.groupName = p.groupName
  if (p.options && p.options.length) {
    prop.options = p.options.map((o) => (typeof o === 'string' ? o : o.value))
  }
  if (p.limitToOptions === false) prop.limitToOptions = false
  return prop
}

function mapDefinition(def, category) {
  if (!def || !def.name || typeof def.name !== 'string') return null
  const finalCategory = pageTypeMarkers.has(def.name) ? 'page-type' : category
  const entry = {
    name: def.name,
    label: def.label || def.name,
    category: finalCategory,
    description: def.description || ''
  }
  if (def.icon) entry.icon = def.icon
  if (def.hidden) entry.hidden = true
  if (def.docLink) entry.docLink = def.docLink

  const params = def.props && Array.isArray(def.props.parameters) ? def.props.parameters : []
  // Skip action and visibility params from the catalog
  entry.props = params
    .filter((p) => {
      if (p.groupName?.startsWith('action')) return false
      if (p.groupName === 'taphold' || p.groupName === 'visibility') return false
      if (p.name?.startsWith('action') || p.name?.startsWith('taphold_action')) return false
      return true
    })
    .map(paramToProp)

  const groups = def.props && Array.isArray(def.props.parameterGroups) ? def.props.parameterGroups : []
  const hasActionGroup = groups.some((g) => g.name?.startsWith('action'))
  const hasTapholdGroup = groups.some((g) => g.name === 'taphold')
  const notes = []
  if (hasActionGroup) {
    notes.push(hasTapholdGroup
      ? 'Supports click and tap-hold actions (see manage_ui_component action grammar reference).'
      : 'Supports click actions (see manage_ui_component action grammar reference).')
  }
  notes.push("Supports `visible` expression and `visibleTo` role/user gating.")
  entry.notes = notes.join(' ')

  // Slots are not declared in WidgetDefinition
  entry.slots = [{ name: 'default', description: 'Default content slot.' }]
  return entry
}

// Page-types and layout primitives have well-known slot structures that aren't in
// the TS definitions; encode them here.
const slotOverrides = {
  'oh-layout-page': [
    { name: 'default', description: 'Child blocks/widgets for responsive layouts.' },
    { name: 'masonry', description: 'Children rendered in a masonry layout.' },
    { name: 'grid', description: 'Children for fixed-grid layouts.' },
    { name: 'canvas', description: 'oh-canvas-layer children for canvas layouts.' }
  ],
  'oh-chart-page': [
    { name: 'series', description: 'Array of oh-data-series widgets — one per plotted item.' },
    { name: 'grid', description: 'ECharts grid config.' },
    { name: 'xAxis', description: 'X-axis customization.' },
    { name: 'yAxis', description: 'Y-axis customization.' },
    { name: 'title', description: 'Chart title widget.' },
    { name: 'legend', description: 'Chart legend widget.' },
    { name: 'tooltip', description: 'Tooltip widget.' }
  ],
  'oh-tabs-page': [
    { name: 'default', description: 'Array of oh-tab children.' }
  ],
  'oh-map-page': [
    { name: 'default', description: 'oh-map-marker / oh-map-circle-marker children.' }
  ],
  'oh-plan-page': [
    { name: 'default', description: 'oh-plan-marker children with pixel coordinates.' }
  ],
  'oh-block': [
    { name: 'default', description: 'Card children (oh-toggle-card, oh-label-card, etc.).' }
  ]
}

function applySlotOverrides(entry) {
  if (slotOverrides[entry.name]) {
    entry.slots = slotOverrides[entry.name]
  }
}

const widgets = []
const seen = new Set()

for (const lib of libraries) {
  for (const key of Object.keys(lib.mod)) {
    const def = extractDefinition(lib.mod[key])
    const entry = mapDefinition(def, lib.category)
    if (!entry) continue
    // Skip helper exports that aren't real widgets (no oh- prefix, no props).
    if (!entry.name.startsWith('oh-') && (!entry.props || entry.props.length === 0)) continue
    if (seen.has(entry.name)) continue // dedupe across libraries
    seen.add(entry.name)
    applySlotOverrides(entry)
    widgets.push(entry)
  }
}

// Add supplementary page types (not declared as WidgetDefinitions in TS).
for (const entry of supplementaryPageTypes) {
  if (seen.has(entry.name)) continue
  seen.add(entry.name)
  entry.notes = (entry.notes ? entry.notes + ' ' : '') + 'Supports `visible` expression and `visibleTo` role/user gating.'
  applySlotOverrides(entry)
  widgets.push(entry)
}

// Stable sort by category then name so diffs are reviewable.
widgets.sort((a, b) => {
  const c = (a.category || '').localeCompare(b.category || '')
  return c !== 0 ? c : a.name.localeCompare(b.name)
})

const out = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  sourceNote:
    'Auto-generated by web/build/generate-widget-catalog.mjs from the WidgetDefinition TypeScript source. ' +
    'Do not edit by hand — regenerate via `npm run generate-widget-catalog`.',
  widgets
}

function writeJson(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2))
  console.log(`Wrote widget catalog (${widgets.length} entries) to ${filePath}`)
}

writeJson(OUTPUT)
