import type { ConfigDescription, ConfigDescriptionParameter, ConfigDescriptionParameterGroup, ParameterOption } from '@/api'

/**
 * Parameter types supported by widget definitions
 */
export type ParameterType = ConfigDescriptionParameter['type']

/**
 * Visibility function type
 * @param value the current value of the parameter
 * @param configuration the full configuration object
 * @param configDescription the configuration description of the parameter
 * @param parameters the widget parameter object
 * @returns whether the parameter should be visible
 */
export type VisibilityFunction = (
  value: unknown,
  configuration: Record<string, unknown>,
  configDescription: ConfigDescriptionParameter,
  parameters: ConfigDescription
) => boolean

export interface WidgetDefinitionParameter extends ConfigDescriptionParameter {
  visible?: VisibilityFunction
}

/**
 * A configuration parameter builder class
 */
export class Parameter implements WidgetDefinitionParameter {
  type: ParameterType
  name: string
  label: string
  description: string

  advanced?: boolean
  context?: string
  groupName?: string
  multiple?: boolean
  options?: ParameterOption[]
  limitToOptions?: boolean
  default?: string
  defaultValues?: string[]
  required?: boolean

  visible?: VisibilityFunction

  /**
   * Creates a new configuration parameter
   *
   * @param type the type of the parameter
   * @param name the name of the parameter
   * @param label the untranslated (English) label of the parameter
   * @param description the untranslated (English) description of the parameter
   */
  constructor(type: ParameterType, name: string, label: string, description: string) {
    this.type = type
    this.name = name
    this.label = label
    this.description = description
  }

  /**
   * Sets the parameter as advanced
   */
  a(): this {
    this.advanced = true
    return this
  }

  /**
   * Sets the context of the parameter
   */
  c(context: string): this {
    this.context = context
    return this
  }

  /**
   * Sets the groupName of the parameter
   */
  g(groupName: string): this {
    this.groupName = groupName
    return this
  }

  /**
   * Sets the parameter as holding multiple values
   */
  m(): this {
    this.multiple = true
    return this
  }

  /**
   * Sets the options of the parameter
   * @param opts the array of options
   * @param limitToOptions whether valid values should be restricted to options
   * @param multiple whether multiple options may be selected
   */
  o(opts: ParameterOption[], limitToOptions: boolean = true, multiple: boolean = false): this {
    this.options = opts
    this.limitToOptions = limitToOptions
    this.multiple = multiple
    return this
  }

  /**
   * Sets the default value of the parameter
   * @param value the default value
   */
  d(value: string | string[]): this {
    if (Array.isArray(value)) {
      this.defaultValues = value
    } else {
      this.default = value
    }
    return this
  }

  /**
   * Sets the parameter as required
   */
  r(): this {
    this.required = true
    return this
  }

  /**
   * The visibility function
   * @param vfn the visibility function
   */
  v(vfn: VisibilityFunction): this {
    this.visible = vfn
    return this
  }
}

/**
 * Builds a parameter
 * @param type the type of the parameter
 * @param name the name of the parameter
 * @param label the untranslated (English) label of the parameter
 * @param description the untranslated (English) description of the parameter
 */
export function p(type: 'TEXT' | 'INTEGER' | 'BOOLEAN' | 'DECIMAL', name: string, label: string, description: string): Parameter {
  return new Parameter(type, name, label, description)
}

/**
 * Builds a boolean parameter
 * @param name the name of the parameter
 * @param label the untranslated (English) label of the parameter
 * @param description the untranslated (English) description of the parameter
 */
export function pb(name: string, label: string, description: string): Parameter {
  return p('BOOLEAN', name, label, description)
}

/**
 * Builds a decimal parameter
 * @param name the name of the parameter
 * @param label the untranslated (English) label of the parameter
 * @param description the untranslated (English) description of the parameter
 */
export function pd(name: string, label: string, description: string): Parameter {
  return new Parameter('DECIMAL', name, label, description)
}

/**
 * Builds a parameter group
 * @param name the name of the group
 * @param label the untranslated (English) label of the group
 * @param description the untranslated (English) description of the group
 */
export function pg(name: string, label: string, description?: string): ConfigDescriptionParameterGroup {
  return { name, label, description, advanced: false }
}

/**
 * Builds an item parameter
 * @param name the name of the parameter
 * @param label the untranslated (English) label of the parameter
 * @param description the untranslated (English) description of the parameter
 */
export function pi(name: string, label: string, description: string): Parameter {
  return new Parameter('TEXT', name, label, description).c('item')
}

/**
 * Builds a text parameter with options
 * @param name the name of the parameter
 * @param label the untranslated (English) label of the parameter
 * @param description the untranslated (English) description of the parameter
 * @param options an array of options with untranslated (English) labels
 */
export function po(name: string, label: string, description: string, options: ParameterOption[]): Parameter {
  return new Parameter('TEXT', name, label, description).o(options)
}

/**
 * Builds a numerical (integer) parameter
 * @param name the name of the parameter
 * @param label the untranslated (English) label of the parameter
 * @param description the untranslated (English) description of the parameter
 */
export function pn(name: string, label: string, description: string): Parameter {
  return new Parameter('INTEGER', name, label, description)
}

/**
 * Builds a text parameter
 * @param name the name of the parameter
 * @param label the untranslated (English) label of the parameter
 * @param description the untranslated (English) description of the parameter
 */
export function pt(name: string, label: string, description: string): Parameter {
  return new Parameter('TEXT', name, label, description)
}

/**
 * The widget definition, describing the widget and its props (config parameters)
 */
export class WidgetDefinition {
  name: string
  label: string
  description: string
  icon?: string
  hidden: boolean
  props: {
    parameterGroups: ConfigDescriptionParameterGroup[]
    parameters: WidgetDefinitionParameter[]
  }
  docLink?: string

  /**
   * Creates a new widget definition
   *
   * @param name the name of the widget (in kebab case)
   * @param label the untranslated (English) name of the widget
   * @param description the untranslated (English) description of the widget
   * @param icon an optional icon to illustrate the widget, used for map/plan markers
   * @param hidden whether the widget is hidden and should not be shown in the widget picker
   */
  constructor(name: string, label: string, description: string, icon?: string, hidden: boolean = false) {
    this.name = name
    this.label = label
    this.description = description
    this.icon = icon
    this.hidden = hidden
    this.props = {
      parameterGroups: [],
      parameters: []
    }
  }

  paramGroup(group: ConfigDescriptionParameterGroup, params?: Parameter[], advanced?: boolean): this {
    this.props.parameterGroups.push(group)
    if (params) {
      this.props.parameters.push(...params.map((p) => (advanced ? p.g(group.name).a() : p.g(group.name))))
    }
    return this
  }

  params(p: WidgetDefinitionParameter[]): this {
    this.props.parameters.push(...p)
    return this
  }

  doc(url: string) {
    this.docLink = url
    return this
  }
}
