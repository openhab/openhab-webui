export const AddonIcons = {
  binding: 'circle_grid_hex_fill',
  automation: 'wand_stars',
  transformation: 'function',
  persistence: 'download_circle',
  ui: 'play_rectangle',
  misc: 'rectangle_3_offgrid',
  voice: 'chat_bubble_2_fill'
}

export const AddonTitles = {
  binding: 'Bindings',
  automation: 'Automation',
  transformation: 'Transformations',
  persistence: 'Persistence',
  ui: 'User Interfaces',
  misc: 'System Integrations',
  voice: 'Voice & Speech'
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
