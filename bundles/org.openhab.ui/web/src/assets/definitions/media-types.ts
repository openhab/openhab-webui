export type CodeEditorType = 'YAML' | 'DSL'

export enum MediaType {
  YAML = 'application/yaml',
  THING_YAML = 'application/yaml+thing',
  ITEM_YAML = 'application/yaml+item',
  THING_DSL = 'text/vnd.openhab.dsl.thing',
  ITEM_DSL = 'text/vnd.openhab.dsl.item',
  RULE_DSL = 'application/vnd.openhab.dsl.rule',
  JSON = 'application/json',
  JAVASCRIPT = 'application/javascript',
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
  }
}
