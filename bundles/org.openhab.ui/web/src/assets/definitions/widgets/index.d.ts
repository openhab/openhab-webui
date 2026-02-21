import * as api from '@/api'

/**
 * Parameter types supported by widget definitions
 */
export type ParameterType = (typeof api.ConfigDescriptionParameter)['type']

/**
 * Visibility function type
 * @param value - The current value of the parameter
 * @param configuration - The full configuration object
 * @param configDescription - The configuration description
 * @param parameters - The parameters object
 * @returns Whether the parameter should be visible
 */
export type VisibilityFunction = (value: any, configuration: Record<string, any>, configDescription: any, parameters: any) => boolean

/**
 * Parameter class for building widget configuration parameters
 */
export declare class Parameter implements api.ConfigDescriptionParameter {
  type: ParameterType
  name: string
  label: string
  description: string
  advanced?: boolean
  context?: string
  groupName?: string
  multiple?: boolean
  options?: Array<api.ParameterOption>
  limitToOptions?: boolean
  default?: any
  required?: boolean
  visible?: VisibilityFunction

  constructor(type: ParameterType, name: string, label: string, description: string)

  /**
   * Sets the parameter as advanced
   */
  a(): this

  /**
   * Sets the context of the parameter
   */
  c(context: string): this

  /**
   * Sets the groupName of the parameter
   */
  g(groupName: string): this

  /**
   * Sets the parameter as holding multiple values
   */
  m(): this

  /**
   * Sets the options of the parameter
   * @param opts - The array of options
   * @param limitToOptions - Whether valid values should be restricted to options
   * @param multiple - Whether multiple options may be selected
   */
  o(opts: api.ParameterOption[], limitToOptions?: boolean, multiple?: boolean): this

  /**
   * Sets the default value of the parameter
   * @param value - The default value
   */
  d(value: any): this

  /**
   * Sets the parameter as required
   */
  r(): this

  /**
   * The visibility function
   * @param vfn - The visibility function
   */
  v(vfn: VisibilityFunction): this
}

/**
 * Widget definition interface
 */
export interface _WidgetDefinition {
  name: string
  label: string
  description: string
  icon?: string
  hidden: boolean
  props: api.ConfigDescription
}

/**
 * The widget definition class, describing the widget and its props (config parameters)
 */
export declare class WidgetDefinition implements _WidgetDefinition {
  name: string
  label: string
  description: string
  icon?: string
  hidden: boolean
  docLink?: string
  props: api.ConfigDescription

  constructor(name: string, label: string, description: string, icon?: string, hidden?: boolean)

  /**
   * Add a parameter group with optional parameters
   * @param group - The parameter group
   * @param params - Optional array of parameters
   * @param advanced - Whether to mark all parameters as advanced
   */
  paramGroup(group: api.ConfigDescriptionParameterGroup, params?: Parameter[], advanced?: boolean): this

  /**
   * Add parameters to the widget
   * @param p - Array of parameters
   */
  params(p: Parameter[]): this
}

// Helper functions

/**
 * Builds a parameter
 * @param type - The type of the parameter
 * @param name - The name of the parameter
 * @param label - The untranslated (English) label of the parameter
 * @param description - The untranslated (English) description of the parameter
 */
export declare function p(type: ParameterType, name: string, label: string, description: string): Parameter

/**
 * Builds a boolean parameter
 * @param name - The name of the parameter
 * @param label - The untranslated (English) label of the parameter
 * @param description - The untranslated (English) description of the parameter
 */
export declare function pb(name: string, label: string, description: string): Parameter

/**
 * Builds a decimal parameter
 * @param name - The name of the parameter
 * @param label - The untranslated (English) label of the parameter
 * @param description - The untranslated (English) description of the parameter
 */
export declare function pd(name: string, label: string, description: string): Parameter

/**
 * Builds a parameter group
 * @param name - The name of the group
 * @param label - The untranslated (English) label of the group
 * @param description - The untranslated (English) description of the group
 */
export declare function pg(name: string, label: string, description?: string): api.ConfigDescriptionParameterGroup

/**
 * Builds an item parameter
 * @param name - The name of the parameter
 * @param label - The untranslated (English) label of the parameter
 * @param description - The untranslated (English) description of the parameter
 */
export declare function pi(name: string, label: string, description: string): Parameter

/**
 * Builds a text parameter with options
 * @param name - The name of the parameter
 * @param label - The untranslated (English) label of the parameter
 * @param description - The untranslated (English) description of the parameter
 * @param options - An array of options with untranslated (English) labels
 */
export declare function po(name: string, label: string, description: string, options: api.ParameterOption[]): Parameter

/**
 * Builds a numerical (integer) parameter
 * @param name - The name of the parameter
 * @param label - The untranslated (English) label of the parameter
 * @param description - The untranslated (English) description of the parameter
 */
export declare function pn(name: string, label: string, description: string): Parameter

/**
 * Builds a text parameter
 * @param name - The name of the parameter
 * @param label - The untranslated (English) label of the parameter
 * @param description - The untranslated (English) description of the parameter
 */
export declare function pt(name: string, label: string, description: string): Parameter
