// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

  import moo from 'moo'

  let lexer = moo.compile({
    WS:               /[ \t]+/,
    sitemap:          'sitemap ',
    name:             'name=',
    label:            'label=',
    item:             'item=',
    staticIcon:       'staticIcon=',
    icon:             'icon=',
    widgetattr:       ['url=', 'refresh=', 'service=', 'height=', 'minValue=', 'maxValue=', 'step=', 'encoding=', 'yAxisDecimalPattern=', 'inputHint=', 'columns=', 'row=', 'column=', 'interpolation='],
    widgetboolattr:   ['legend='],
    widgetfrcitmattr: 'forceasitem=',
    widgetmapattr:    'mappings=',
    widgetbuttonsattr:'buttons=',
    widgetvisiattr:   'visibility=',
    widgetcolorattr:  ['labelcolor=', 'valuecolor=', 'iconcolor='],
    widgetswitchattr: 'switchSupport',
    widgetronlyattr:  'releaseOnly',
    widgetstatelattr: 'stateless',
    widgetclickattr:  'click=',
    widgetreleaseattr:'release=',
    widgetperiodattr: 'period=',
    nlwidget:         ['Switch ', 'Selection ', 'Slider ', 'Setpoint ', 'Input ', 'Video ', 'Chart ', 'Webview ', 'Colorpicker ', 'Colortemperaturepicker', 'Mapview ', 'Button ', 'Default '],
    lwidget:          ['Text ', 'Group ', 'Image ', 'Frame ', 'Buttongrid '],
    lparen:           '(',
    rparen:           ')',
    lbrace:           '{',
    rbrace:           '}',
    lbracket:         '[',
    rbracket:         ']',
    eq:               '==',
    noteq:            '!=',
    lteq:             '<=',
    gteq:             '>=',
    lt:               '<',
    gt:               '>',
    and:              'AND',
    equals:           '=',
    NL:               { match: /\n/, lineBreaks: true },
    SL_COMMENT:       /\/\/.*$/,
    ML_COMMENT:       /\/\*[\s\S]*?\*\//,
    boolean:          /(?:true)|(?:false)/,
    identifier:       /(?:[A-Za-z_][A-Za-z0-9_]*)|(?:[0-9]+[A-Za-z_][A-Za-z0-9_]*)/,
    comma:            ',',
    colon:            ':',
    hyphen:           '-',
    plus:             '+',
    dot:              '.',
    unsignedint:      /[0-9]+/,
    string:           { match: /"(?:\\["\\]|[^\n"\\])*"/, value: x => x.slice(1, -1) }
  })
  const requiresItem = ['Group', 'Chart', 'Switch', 'Mapview', 'Slider', 'Selection', 'Setpoint', 'Input ', 'Colorpicker', 'Colortemperaturepicker', 'Button', 'Default']

  function getSitemap(d) {
    return {
      "uid": d[2][0].text,
      "component": "Sitemap",
      "config": d[4],
      "slots": {
        "widgets": d[8]
      }
    }
  }

  function getWidget(d, l, reject) {
    let widget = {
      component: d[0].text.trim(),
      config: {}
    }
    if (d[2] && d[2][0]) {
      for (let a of d[2][0]) {
        widget.config[a[0].replace('=', '')] = a[1]
      }
    }
    if (d[6]) {
      widget.slots = {
        widgets: d[6]
      }
    }

    // if icon exists remove staticIcon, if not set icon to staticIcon and make staticIcon=true
    if (widget.config.icon) {
     delete widget.config.staticIcon
    }
    if (widget.config.staticIcon) {
      widget.config.icon = widget.config.staticIcon
      widget.config.staticIcon = true
    }
    return widget
  }

  // helper function to join values if array, pass through if string
  function joinValue(val) {
    return Array.isArray(val) ? val.join("") : val;
  }
let Lexer = lexer;
let ParserRules = [
    {"name": "Main", "symbols": ["_", "Sitemap", "_"], "postprocess": (d) => d[1]},
    {"name": "Sitemap", "symbols": [(lexer.has("sitemap") ? {type: "sitemap"} : sitemap), "_", "SitemapName", "__", "SitemapLabel", "__", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "Widgets", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": getSitemap},
    {"name": "SitemapName", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)]},
    {"name": "SitemapLabel", "symbols": [], "postprocess": (d) => { return {} }},
    {"name": "SitemapLabel", "symbols": [(lexer.has("label") ? {type: "label"} : label), "_", (lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => { return { 'label': d[2].value } }},
    {"name": "Widgets", "symbols": ["Widget"], "postprocess": (d) => [d[0]]},
    {"name": "Widgets", "symbols": ["Widgets", "_", "Widget"], "postprocess": (d) => d[0].concat([d[2]])},
    {"name": "Widget$ebnf$1", "symbols": []},
    {"name": "Widget$ebnf$1", "symbols": ["Widget$ebnf$1", "WidgetAttrs"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Widget", "symbols": [(lexer.has("nlwidget") ? {type: "nlwidget"} : nlwidget), "_", "Widget$ebnf$1"], "postprocess": getWidget},
    {"name": "Widget$ebnf$2", "symbols": []},
    {"name": "Widget$ebnf$2", "symbols": ["Widget$ebnf$2", "WidgetAttrs"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Widget", "symbols": [(lexer.has("lwidget") ? {type: "lwidget"} : lwidget), "_", "Widget$ebnf$2"], "postprocess": getWidget},
    {"name": "Widget$ebnf$3", "symbols": []},
    {"name": "Widget$ebnf$3", "symbols": ["Widget$ebnf$3", "WidgetAttrs"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Widget", "symbols": [(lexer.has("lwidget") ? {type: "lwidget"} : lwidget), "_", "Widget$ebnf$3", "_", (lexer.has("lbrace") ? {type: "lbrace"} : lbrace), "_", "Widgets", "_", (lexer.has("rbrace") ? {type: "rbrace"} : rbrace)], "postprocess": getWidget},
    {"name": "WidgetAttrs", "symbols": ["WidgetAttr"], "postprocess": (d) => [d[0]]},
    {"name": "WidgetAttrs", "symbols": ["WidgetAttrs", "_", "WidgetAttr"], "postprocess": (d) => d[0].concat([d[2]])},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetswitchattr") ? {type: "widgetswitchattr"} : widgetswitchattr)], "postprocess": (d) => ['switchEnabled', true]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetronlyattr") ? {type: "widgetronlyattr"} : widgetronlyattr)], "postprocess": (d) => ['releaseOnly', true]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetstatelattr") ? {type: "widgetstatelattr"} : widgetstatelattr)], "postprocess": (d) => ['stateless', true]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetfrcitmattr") ? {type: "widgetfrcitmattr"} : widgetfrcitmattr), "_", "WidgetBooleanAttrValue"], "postprocess": (d) => ['forceAsItem', d[2]]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetboolattr") ? {type: "widgetboolattr"} : widgetboolattr), "_", "WidgetBooleanAttrValue"], "postprocess": (d) => [d[0].value, d[2]]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetperiodattr") ? {type: "widgetperiodattr"} : widgetperiodattr), "_", "WidgetPeriodAttrValue"], "postprocess": (d) => ['period', d[2]]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetclickattr") ? {type: "widgetclickattr"} : widgetclickattr), "_", "WidgetAttrValue"], "postprocess": (d) => ['cmd', d[2]]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("widgetreleaseattr") ? {type: "widgetreleaseattr"} : widgetreleaseattr), "_", "WidgetAttrValue"], "postprocess": (d) => ['releaseCmd', d[2]]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("icon") ? {type: "icon"} : icon), "_", "WidgetIconRulesAttrValue"], "postprocess": (d) => ['iconrules', d[2]]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("icon") ? {type: "icon"} : icon), "_", "WidgetIconAttrValue"], "postprocess": (d) => [d[0].value, joinValue(d[2])]},
    {"name": "WidgetAttr", "symbols": [(lexer.has("staticIcon") ? {type: "staticIcon"} : staticIcon), "_", "WidgetIconAttrValue"], "postprocess": (d) => [d[0].value, joinValue(d[2])]},
    {"name": "WidgetAttr", "symbols": ["WidgetAttrName", "_", "WidgetAttrValue"], "postprocess": (d) => [d[0][0].value, d[2]]},
    {"name": "WidgetAttr", "symbols": ["WidgetMappingsAttrName", "WidgetMappingsAttrValue"], "postprocess": (d) => [d[0][0].value, d[1]]},
    {"name": "WidgetAttr", "symbols": ["WidgetButtonsAttrName", "WidgetButtonsAttrValue"], "postprocess": (d) => [d[0][0].value, d[1]]},
    {"name": "WidgetAttr", "symbols": ["WidgetVisibilityAttrName", "WidgetVisibilityAttrValue"], "postprocess": (d) => [d[0][0].value, d[1]]},
    {"name": "WidgetAttr", "symbols": ["WidgetColorAttrName", "WidgetColorAttrValue"], "postprocess": (d) => [d[0][0].value, d[1]]},
    {"name": "WidgetAttrName", "symbols": [(lexer.has("item") ? {type: "item"} : item)]},
    {"name": "WidgetAttrName", "symbols": [(lexer.has("label") ? {type: "label"} : label)]},
    {"name": "WidgetAttrName", "symbols": [(lexer.has("widgetattr") ? {type: "widgetattr"} : widgetattr)]},
    {"name": "WidgetBooleanAttrValue", "symbols": [(lexer.has("boolean") ? {type: "boolean"} : boolean)], "postprocess": (d) => (d[0].value === 'true')},
    {"name": "WidgetBooleanAttrValue", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => (d[0].value === 'true')},
    {"name": "WidgetIconAttrValue", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => d[0].value},
    {"name": "WidgetIconAttrValue", "symbols": ["WidgetIconAttrPart"]},
    {"name": "WidgetIconAttrValue", "symbols": ["WidgetIconAttrPart", (lexer.has("colon") ? {type: "colon"} : colon), "WidgetIconAttrPart"]},
    {"name": "WidgetIconAttrValue", "symbols": ["WidgetIconAttrPart", (lexer.has("colon") ? {type: "colon"} : colon), "WidgetIconAttrPart", (lexer.has("colon") ? {type: "colon"} : colon), "WidgetIconAttrPart"]},
    {"name": "WidgetIconAttrPart", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => d[0].value},
    {"name": "WidgetIconAttrPart", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier), (lexer.has("hyphen") ? {type: "hyphen"} : hyphen), "WidgetIconAttrPart"], "postprocess": (d) => d[0].value + "-" + d[2]},
    {"name": "WidgetIconRulesAttrValue", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "IconRules", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => d[2]},
    {"name": "WidgetPeriodAttrValue", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier), (lexer.has("hyphen") ? {type: "hyphen"} : hyphen), (lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => d[0].value + "-" + d[2].value},
    {"name": "WidgetPeriodAttrValue", "symbols": [(lexer.has("hyphen") ? {type: "hyphen"} : hyphen), (lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => "-" + d[1].value},
    {"name": "WidgetPeriodAttrValue", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => d[0].value},
    {"name": "WidgetPeriodAttrValue", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => d[0].value},
    {"name": "WidgetAttrValue", "symbols": ["Number"], "postprocess": (d) => d[0]},
    {"name": "WidgetAttrValue", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => d[0].value},
    {"name": "WidgetAttrValue", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => d[0].value},
    {"name": "WidgetMappingsAttrName", "symbols": [(lexer.has("widgetmapattr") ? {type: "widgetmapattr"} : widgetmapattr)]},
    {"name": "WidgetMappingsAttrValue", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "Mappings", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => d[2]},
    {"name": "WidgetButtonsAttrName", "symbols": [(lexer.has("widgetbuttonsattr") ? {type: "widgetbuttonsattr"} : widgetbuttonsattr)]},
    {"name": "WidgetButtonsAttrValue", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "Buttons", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => d[2]},
    {"name": "WidgetVisibilityAttrName", "symbols": [(lexer.has("widgetvisiattr") ? {type: "widgetvisiattr"} : widgetvisiattr)]},
    {"name": "WidgetVisibilityAttrValue", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "Visibilities", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => d[2]},
    {"name": "WidgetColorAttrName", "symbols": [(lexer.has("widgetcolorattr") ? {type: "widgetcolorattr"} : widgetcolorattr)]},
    {"name": "WidgetColorAttrValue", "symbols": [(lexer.has("lbracket") ? {type: "lbracket"} : lbracket), "_", "Colors", "_", (lexer.has("rbracket") ? {type: "rbracket"} : rbracket)], "postprocess": (d) => d[2]},
    {"name": "Mappings", "symbols": ["Mapping"], "postprocess": (d) => [d[0]]},
    {"name": "Mappings", "symbols": ["Mappings", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "Mapping"], "postprocess": (d) => d[0].concat([d[4]])},
    {"name": "Mapping", "symbols": ["Command", "_", (lexer.has("colon") ? {type: "colon"} : colon), "_", "Command", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "Label"], "postprocess": (d) => d[0] + ':' + d[4] + '=' + d[8]},
    {"name": "Mapping", "symbols": ["Command", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "Label"], "postprocess": (d) => d[0] + '=' + d[4]},
    {"name": "Mapping", "symbols": ["Command", "_", (lexer.has("colon") ? {type: "colon"} : colon), "_", "Command", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "Label", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "WidgetIconAttrValue"], "postprocess": (d) => d[0] + ':' + d[4] + '=' + d[8] + '=' + joinValue(d[12])},
    {"name": "Mapping", "symbols": ["Command", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "Label", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "WidgetIconAttrValue"], "postprocess": (d) => d[0] + '=' + d[4] + '=' + joinValue(d[8])},
    {"name": "Buttons", "symbols": ["ButtonDef"], "postprocess": (d) => [d[0]]},
    {"name": "Buttons", "symbols": ["Buttons", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "ButtonDef"], "postprocess": (d) => d[0].concat([d[4]])},
    {"name": "ButtonDef", "symbols": [(lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint), "_", (lexer.has("colon") ? {type: "colon"} : colon), "_", (lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint), "_", (lexer.has("colon") ? {type: "colon"} : colon), "_", "ButtonValue"], "postprocess": (d) => { return { 'row':  parseInt(d[0].value), 'column': parseInt(d[4].value), 'command': d[8] } }},
    {"name": "ButtonValue", "symbols": ["Command", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "Label"], "postprocess": (d) => d[0] + '=' + d[4]},
    {"name": "ButtonValue", "symbols": ["Command", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "Label", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "WidgetIconAttrValue"], "postprocess": (d) => d[0] + '=' + d[4] + '=' + joinValue(d[8])},
    {"name": "Command", "symbols": [(lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint)]},
    {"name": "Command", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => d[0].value},
    {"name": "Command", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => '"' + d[0].value + '"'},
    {"name": "Label", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => d[0].value},
    {"name": "Label", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => '"' + d[0].value + '"'},
    {"name": "Visibilities", "symbols": ["Conditions"], "postprocess": (d) => [d[0]]},
    {"name": "Visibilities", "symbols": ["Visibilities", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "Conditions"], "postprocess": (d) => d[0].concat(d[4])},
    {"name": "Colors", "symbols": ["Color"], "postprocess": (d) => [d[0]]},
    {"name": "Colors", "symbols": ["Colors", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "Color"], "postprocess": (d) => d[0].concat([d[4]])},
    {"name": "Color", "symbols": ["Conditions", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "ColorName"], "postprocess": (d) => d[0] + '=' + d[4][0].value},
    {"name": "Color", "symbols": ["ColorName"], "postprocess": (d) => d[0][0].value},
    {"name": "ColorName", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)]},
    {"name": "ColorName", "symbols": [(lexer.has("string") ? {type: "string"} : string)]},
    {"name": "IconRules", "symbols": ["IconRule"], "postprocess": (d) => [d[0]]},
    {"name": "IconRules", "symbols": ["IconRules", "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "IconRule"], "postprocess": (d) => d[0].concat([d[4]])},
    {"name": "IconRule", "symbols": ["Conditions", "_", (lexer.has("equals") ? {type: "equals"} : equals), "_", "WidgetIconAttrValue"], "postprocess": (d) => d[0] + '=' + joinValue(d[4])},
    {"name": "IconRule", "symbols": ["WidgetIconAttrValue"], "postprocess": (d) => joinValue(d[0])},
    {"name": "Conditions", "symbols": ["Condition"], "postprocess": (d) => d[0]},
    {"name": "Conditions", "symbols": ["Conditions", "_", (lexer.has("and") ? {type: "and"} : and), "_", "Condition"], "postprocess": (d) => d[0] + ' AND ' + d[4]},
    {"name": "Condition", "symbols": ["ConditionCommand", "_", "ConditionComparator", "_", "ConditionValue"], "postprocess": (d) => d[0][0].value + d[2][0].value + d[4]},
    {"name": "Condition", "symbols": ["ConditionComparator", "_", "ConditionValue"], "postprocess": (d) => d[0][0].value + d[2]},
    {"name": "Condition", "symbols": ["ConditionValue"], "postprocess": (d) => d[0]},
    {"name": "ConditionCommand", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)]},
    {"name": "ConditionComparator", "symbols": [(lexer.has("eq") ? {type: "eq"} : eq)]},
    {"name": "ConditionComparator", "symbols": [(lexer.has("noteq") ? {type: "noteq"} : noteq)]},
    {"name": "ConditionComparator", "symbols": [(lexer.has("lteq") ? {type: "lteq"} : lteq)]},
    {"name": "ConditionComparator", "symbols": [(lexer.has("gteq") ? {type: "gteq"} : gteq)]},
    {"name": "ConditionComparator", "symbols": [(lexer.has("lt") ? {type: "lt"} : lt)]},
    {"name": "ConditionComparator", "symbols": [(lexer.has("gt") ? {type: "gt"} : gt)]},
    {"name": "ConditionValue", "symbols": ["XState"], "postprocess": (d) => d[0]},
    {"name": "ConditionValue", "symbols": ["Sign", "XState"], "postprocess": (d) => d[0][0].value + d[1]},
    {"name": "XState", "symbols": [(lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint), (lexer.has("dot") ? {type: "dot"} : dot), (lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint)], "postprocess": (d) => parseFloat(d[0].value + '.' + d[2].value)},
    {"name": "XState", "symbols": [(lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint)], "postprocess": (d) => parseInt(d[0].value)},
    {"name": "XState", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": (d) => d[0].value},
    {"name": "XState", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (d) => '"' + d[0].value + '"'},
    {"name": "Sign", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus)]},
    {"name": "Sign", "symbols": [(lexer.has("hyphen") ? {type: "hyphen"} : hyphen)]},
    {"name": "Number", "symbols": [(lexer.has("hyphen") ? {type: "hyphen"} : hyphen), (lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint), (lexer.has("dot") ? {type: "dot"} : dot), (lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint)], "postprocess": (d) => parseFloat('-' + d[1].value + '.' + d[2].value)},
    {"name": "Number", "symbols": [(lexer.has("hyphen") ? {type: "hyphen"} : hyphen), (lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint)], "postprocess": (d) => parseInt('-' + d[1].value)},
    {"name": "Number", "symbols": [(lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint), (lexer.has("dot") ? {type: "dot"} : dot), (lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint)], "postprocess": (d) => parseFloat(d[0].value + '.' + d[2].value)},
    {"name": "Number", "symbols": [(lexer.has("unsignedint") ? {type: "unsignedint"} : unsignedint)], "postprocess": (d) => parseInt(d[0].value)},
    {"name": "_", "symbols": [], "postprocess": () => null},
    {"name": "_", "symbols": ["__"], "postprocess": () => null},
    {"name": "__", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": () => null},
    {"name": "__", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL)], "postprocess": () => null},
    {"name": "__", "symbols": ["Comment"], "postprocess": () => null},
    {"name": "__", "symbols": ["__", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": () => null},
    {"name": "__", "symbols": ["__", (lexer.has("NL") ? {type: "NL"} : NL)], "postprocess": () => null},
    {"name": "__", "symbols": ["__", "Comment"], "postprocess": () => null},
    {"name": "Comment", "symbols": [(lexer.has("SL_COMMENT") ? {type: "SL_COMMENT"} : SL_COMMENT)], "postprocess": () => null},
    {"name": "Comment", "symbols": [(lexer.has("ML_COMMENT") ? {type: "ML_COMMENT"} : ML_COMMENT)], "postprocess": () => null}
];
let ParserStart = "Main";
export default { Lexer, ParserRules, ParserStart };
