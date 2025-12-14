// helpers to build widget definitions and their parameters

/**
 * A configuration parameter
 * @param {('TEXT'|'INTEGER'|'BOOLEAN'|'DECIMAL')} type the type of the parameter
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 */
function Parameter (type, name, label, description) {
  this.type = type
  this.name = name
  this.label = label
  this.description = description
}

Parameter.prototype = {
  /**
   * Sets the parameter as advanced
   */
  a () {
    this.advanced = true
    return this
  },
  /**
   * Sets the context of the parameter
   */
  c (context) {
    this.context = context
    return this
  },
  /**
   * Sets the groupName of the parameter
   */
  g (groupName) {
    this.groupName = groupName
    return this
  },
  /**
   * Sets the parameter as holding multiple values
   */
  m () {
    this.multiple = true
    return this
  },
  /**
   * Sets the options of the parameter
   * @param {*} opts the array of options
   * @param {boolean} limitToOptions whether valid values should be restricted to options
   * @param {boolean} multiple whether multiple options may be selected
   */
  o (opts, limitToOptions = true, multiple = false) {
    this.options = opts
    this.limitToOptions = limitToOptions
    this.multiple = multiple
    return this
  },
  /**
   * Sets the default value of the parameter
   * @param {*} value the default value
   */
  d (value) {
    this.default = value
    return this
  },
  /**
   * Sets the parameter as required
   */
  r () {
    this.required = true
    return this
  },
  /**
   * The visibility function
   * @param {(visible) => boolean} vfn the visibility function
   */
  v (vfn) {
    this.visible = vfn
    return this
  }
}

/**
 * Builds a parameter
 * @param {('TEXT'|'INTEGER'|'BOOLEAN'|'DECIMAL')} type the type of the parameter
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 */
export function p (type, name, label, description) {
  return new Parameter(type, name, label, description)
}

/**
 * Builds a boolean parameter
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 */
export function pb (name, label, description) {
  return p('BOOLEAN', name, label, description)
}

/**
 * Builds a decimal parameter
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 */
export function pd (name, label, description) {
  return new Parameter('DECIMAL', name, label, description)
}

/**
 * Builds a parameter group
 * @param {string} name the name of the group
 * @param {string} label the untranslated (English) label of the group
 * @param {string} description the untranslated (English) description of the group
 */
export function pg (name, label, description) {
  return { name, label, description }
}

/**
 * Builds an item parameter
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 */
export function pi (name, label, description) {
  return new Parameter('TEXT', name, label, description).c('item')
}

/**
 * Builds a text parameter with options
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 * @param {*} options an array of options with untranslated (English) labels
 */
export function po (name, label, description, options) {
  return new Parameter('TEXT', name, label, description).o(options)
}

/**
 * Builds a numerical (integer) parameter
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 */
export function pn (name, label, description) {
  return new Parameter('INTEGER', name, label, description)
}

/**
 * Builds a text parameter
 * @param {string} name the name of the parameter
 * @param {string} label the untranslated (English) label of the parameter
 * @param {string} description the untranslated (English) description of the parameter
 */
export function pt (name, label, description) {
  return new Parameter('TEXT', name, label, description)
}

/**
 * The widget definition, describing the widget and its props (config parameters)
 * @param {string} name the name of the widget (in kebab case)
 * @param {string} label the untranslated (English) name of the widget
 * @param {string} description the untranslated (English) description of the widget
 * @param {string} [icon] an optional icon to illustrate the widget, used for map/plan markers
 * @param {boolean} [hidden=false] whether the widget is hidden and should not be shown in the widget picker
 */
export function WidgetDefinition (name, label, description, icon, hidden = false) {
  this.name = name
  this.label = label
  this.description = description
  if (icon) this.icon = icon
  this.hidden = hidden
  this.props = {
    parameterGroups: [],
    parameters: []
  }
}

WidgetDefinition.prototype = {
  paramGroup (group, params, advanced) {
    this.props.parameterGroups.push(group)
    if (params) {
      this.props.parameters.push(...params.map((p) => (advanced) ? p.g(group.name).a() : p.g(group.name)))
    }
    return this
  },
  params (p) {
    this.props.parameters.push(...p)
    return this
  }
}
