export const AddonIcons = {
  automation: 'wand_stars',
  binding: 'circle_grid_hex_fill',
  persistence: 'download_circle',
  transformation: 'function',
  misc: 'rectangle_3_offgrid',
  ui: 'play_rectangle',
  voice: 'chat_bubble_2_fill'
}

export const ContentTypes = {
  'application/java-archive': 'Java Archive',
  'application/vnd.openhab.bundle': 'OSGi Bundle',
  'application/vnd.openhab.feature;type=karaf': 'Karaf Feature',
  'application/vnd.openhab.feature;type=karfile': 'Karaf KAR Archive',
  'application/vnd.openhab.ruletemplate': 'Rule Template',
  'application/vnd.openhab.uicomponent;type=widget': 'UI Widget',
  'application/vnd.openhab.uicomponent;type=blocks': 'Block Library'
}

export const Formats = {
  'yaml_content': 'Inline YAML Code',
  'json_content': 'Inline JSON Code',
  'yaml_download_url': 'Linked YAML File',
  'json_download_url': 'Linked JSON File',
  'jar_download_url': 'Linked JAR file',
  'kar_download_url': 'Linked KAR file',
  'eclipse': 'Eclipse',
  'karaf': 'Karaf'
}

export const AddonStoreTabShortcuts = [
  {
    id: 'bindings',
    label: 'Bindings',
    icon: 'circle_grid_hex',
    subtitle: 'Connect and control hardware and online services'
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: 'sparkles',
    subtitle: 'Scripting languages, templates and module types'
  },
  {
    id: 'ui',
    label: 'User Interfaces',
    icon: 'play_rectangle',
    subtitle: 'Community widgets & alternative frontends'
  },
  {
    id: 'other',
    label: 'Other Add-ons',
    icon: 'ellipsis',
    subtitle: 'System integrations, persistence, voice & more'
  }
]

export function compareAddons (a1, a2) {
  if (a1.installed && !a2.installed) return -1
  if (a2.installed && !a1.installed) return 1
  if (a1.verifiedAuthor && !a2.verifiedAuthor) return -1
  if (a2.verifiedAuthor && !a1.verifiedAuthor) return 1
  if (a2.properties && a2.properties) {
    if (a1.properties.like_count >= 0 && a2.properties.like_count >= 0 &&
      a1.properties.like_count !== a2.properties.like_count) {
      return (a1.properties.like_count > a2.properties.like_count) ? -1 : 1
    }

    if (a1.properties.views >= 0 && a2.properties.views >= 0 &&
      a1.properties.views !== a2.properties.views) {
      return (a1.properties.views > a2.properties.views) ? -1 : 1
    }
  }

  const nameOrId1 = a1.label || a1.id
  const nameOrId2 = a2.label || a2.name
  return nameOrId1.localeCompare(nameOrId2)
}
