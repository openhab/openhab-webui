export type CodeEditorType = 'YAML' | 'DSL'

export enum MediaType {
  YAML = 'application/yaml',
  THING_DSL = 'text/vnd.openhab.dsl.thing',
  ITEM_DSL = 'text/vnd.openhab.dsl.item',
  JSON = 'application/json'
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
    YAML: MediaType.YAML,
    DSL: MediaType.ITEM_DSL
  },
  things: {
    YAML: MediaType.YAML,
    DSL: MediaType.THING_DSL
  }
}
