export type CodeEditorType = 'YAML' | 'DSL'

export enum MediaType {
  YAML = 'application/yaml',
  JSON = 'application/json',
  JAVASCRIPT = 'application/javascript',
  // openHAB vendor specific:
  THING_YAML = 'application/yaml+thing',
  ITEM_YAML = 'application/yaml+item',
  THING_DSL = 'text/vnd.openhab.dsl.thing',
  ITEM_DSL = 'text/vnd.openhab.dsl.item',
  SITEMAP_YAML = 'application/yaml+sitemap',
  SITEMAP_DSL = 'text/vnd.openhab.dsl.sitemap',
  RULE_YAML = 'application/vnd.openhab.rule+yaml',
  RULE_DSL = 'application/vnd.openhab.dsl.rule',
  UI_COMPONENT = 'application/vnd.openhab.uicomponent'
}

/**
 * Supported media types for all configuration.
 */
export const DefaultMediaTypes = {
  YAML: MediaType.YAML
}

/**
 * Specific media types supported additionally to the {@link DefaultMediaTypes} for specific configuration.
 */
export const SupportedMediaTypes = {
  items: {
    YAML: MediaType.ITEM_YAML,
    DSL: MediaType.ITEM_DSL
  },
  things: {
    YAML: MediaType.THING_YAML,
    DSL: MediaType.THING_DSL
  },
  sitemaps: {
    YAML: MediaType.SITEMAP_YAML,
    DSL: MediaType.SITEMAP_DSL
  }
}
