@{%
  const moo = require('moo')

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
%}

@lexer lexer

Main -> _ Sitemap _                                                               {% (d) => d[1] %}
Sitemap -> %sitemap _ SitemapName __ SitemapLabel __ %lbrace _ Widgets _ %rbrace  {% getSitemap %}

SitemapName -> %identifier
SitemapLabel -> null                                                              {% (d) => { return {} } %}
  | %label _ %string                                                              {% (d) => { return { 'label': d[2].value } } %}

Widgets -> Widget                                                                 {% (d) => [d[0]] %}
  | Widgets _ Widget                                                              {% (d) => d[0].concat([d[2]]) %}

Widget -> %nlwidget _ WidgetAttrs:*                                               {% getWidget %}
  | %lwidget _ WidgetAttrs:*                                                      {% getWidget %}
  | %lwidget _ WidgetAttrs:* _ %lbrace _ Widgets _ %rbrace                        {% getWidget %}

WidgetAttrs -> WidgetAttr                                                         {% (d) => [d[0]] %}
  | WidgetAttrs _ WidgetAttr                                                      {% (d) => d[0].concat([d[2]]) %}
WidgetAttr -> %widgetswitchattr                                                   {% (d) => ['switchEnabled', true] %}
  | %widgetronlyattr                                                              {% (d) => ['releaseOnly', true] %}
  | %widgetstatelattr                                                             {% (d) => ['stateless', true] %}
  | %widgetfrcitmattr _ WidgetBooleanAttrValue                                    {% (d) => ['forceAsItem', d[2]] %}
  | %widgetboolattr _ WidgetBooleanAttrValue                                      {% (d) => [d[0].value, d[2]] %}
  | %widgetperiodattr _ WidgetPeriodAttrValue                                     {% (d) => ['period', d[2]] %}
  | %widgetclickattr _ WidgetAttrValue                                            {% (d) => ['cmd', d[2]] %}
  | %widgetreleaseattr _ WidgetAttrValue                                          {% (d) => ['releaseCmd', d[2]] %}
  | %icon _ WidgetIconRulesAttrValue                                              {% (d) => ['iconrules', d[2]] %}
  | %icon _ WidgetIconAttrValue                                                   {% (d) => [d[0].value, joinValue(d[2])] %}
  | %staticIcon _ WidgetIconAttrValue                                             {% (d) => [d[0].value, joinValue(d[2])] %}
  | WidgetAttrName _ WidgetAttrValue                                              {% (d) => [d[0][0].value, d[2]] %}
  | WidgetMappingsAttrName WidgetMappingsAttrValue                                {% (d) => [d[0][0].value, d[1]] %}
  | WidgetButtonsAttrName WidgetButtonsAttrValue                                  {% (d) => [d[0][0].value, d[1]] %}
  | WidgetVisibilityAttrName WidgetVisibilityAttrValue                            {% (d) => [d[0][0].value, d[1]] %}
  | WidgetColorAttrName WidgetColorAttrValue                                      {% (d) => [d[0][0].value, d[1]] %}
WidgetAttrName -> %item | %label | %widgetattr
WidgetBooleanAttrValue -> %boolean                                                {% (d) => (d[0].value === 'true') %}
  | %string                                                                       {% (d) => (d[0].value === 'true') %}
WidgetIconAttrValue -> %string                                                    {% (d) => d[0].value %}
  | WidgetIconAttrPart
  | WidgetIconAttrPart %colon WidgetIconAttrPart
  | WidgetIconAttrPart %colon WidgetIconAttrPart %colon WidgetIconAttrPart
WidgetIconAttrPart -> %identifier                                                 {% (d) => d[0].value %}
  | %identifier %hyphen WidgetIconAttrPart                                        {% (d) => d[0].value + "-" + d[2] %}
WidgetIconRulesAttrValue -> %lbracket _ IconRules _ %rbracket                     {% (d) => d[2] %}
WidgetPeriodAttrValue -> %identifier %hyphen %identifier                          {% (d) => d[0].value + "-" + d[2].value %}
  | %hyphen %identifier                                                           {% (d) => "-" + d[1].value %}
  | %identifier                                                                   {% (d) => d[0].value %}
  | %string                                                                       {% (d) => d[0].value %}
WidgetAttrValue -> Number                                                         {% (d) => d[0] %}
  | %identifier                                                                   {% (d) => d[0].value %}
  | %string                                                                       {% (d) => d[0].value %}
WidgetMappingsAttrName -> %widgetmapattr
WidgetMappingsAttrValue -> %lbracket _ Mappings _ %rbracket                       {% (d) => d[2] %}
WidgetButtonsAttrName -> %widgetbuttonsattr
WidgetButtonsAttrValue -> %lbracket _ Buttons _ %rbracket                         {% (d) => d[2] %}
WidgetVisibilityAttrName -> %widgetvisiattr
WidgetVisibilityAttrValue -> %lbracket _ Visibilities _ %rbracket                 {% (d) => d[2] %}
WidgetColorAttrName -> %widgetcolorattr
WidgetColorAttrValue -> %lbracket _ Colors _ %rbracket                            {% (d) => d[2] %}

Mappings -> Mapping                                                               {% (d) => [d[0]] %}
  | Mappings _ %comma _ Mapping                                                   {% (d) => d[0].concat([d[4]]) %}
Mapping -> Command _ %colon _ Command _ %equals _ Label                           {% (d) => d[0] + ':' + d[4] + '=' + d[8] %}
  | Command _ %equals _ Label                                                     {% (d) => d[0] + '=' + d[4] %}
  | Command _ %colon _ Command _ %equals _ Label _ %equals _ WidgetIconAttrValue  {% (d) => d[0] + ':' + d[4] + '=' + d[8] + '=' + d[12].join("") %}
  | Command _ %equals _ Label _ %equals _ WidgetIconAttrValue                     {% (d) => d[0] + '=' + d[4] + '=' + d[8].join("") %}

Buttons -> ButtonDef                                                              {% (d) => [d[0]] %}
  | Buttons _ %comma _ ButtonDef                                                  {% (d) => d[0].concat([d[4]]) %}
ButtonDef -> %unsignedint _ %colon _ %unsignedint _ %colon _ ButtonValue          {% (d) => { return { 'row':  parseInt(d[0].value), 'column': parseInt(d[4].value), 'command': d[8] } } %}
ButtonValue -> Command _ %equals _ Label                                          {% (d) => d[0] + '=' + d[4] %}
  | Command _ %equals _ Label _ %equals _ WidgetIconAttrValue                     {% (d) => d[0] + '=' + d[4] + '=' + d[8].join("") %}

Command -> %unsignedint | %identifier                                             {% (d) => d[0].value %}
  | %string                                                                       {% (d) => '"' + d[0].value + '"' %}
Label -> %identifier                                                              {% (d) => d[0].value %}
  | %string                                                                       {% (d) => '"' + d[0].value + '"' %}

Visibilities -> Conditions                                                        {% (d) => [d[0]] %}
  | Visibilities _ %comma _ Conditions                                            {% (d) => d[0].concat(d[4]) %}

Colors -> Color                                                                   {% (d) => [d[0]] %}
  | Colors _ %comma _ Color                                                       {% (d) => d[0].concat([d[4]]) %}
Color -> Conditions _ %equals _ ColorName                                         {% (d) => d[0] + '=' + d[4][0].value %}
  | ColorName                                                                     {% (d) => d[0][0].value %}
ColorName ->  %identifier | %string

IconRules -> IconRule                                                             {% (d) => [d[0]] %}
  | IconRules _ %comma _ IconRule                                                 {% (d) => d[0].concat([d[4]]) %}
IconRule -> Conditions _ %equals _ WidgetIconAttrValue                            {% (d) => d[0] + '=' + d[4].join("") %}
  | WidgetIconAttrValue                                                           {% (d) => d[0].join("") %}

Conditions -> Condition                                                           {% (d) => d[0] %}
  | Conditions _ %and _ Condition                                                 {% (d) => d[0] + ' AND ' + d[4] %}
Condition -> ConditionCommand _ ConditionComparator _ ConditionValue              {% (d) => d[0][0].value + d[2][0].value + d[4] %}
  | ConditionComparator _ ConditionValue                                          {% (d) => d[0][0].value + d[2] %}
  | ConditionValue                                                                {% (d) => d[0] %}
ConditionCommand -> %identifier
ConditionComparator -> %eq | %noteq | %lteq | %gteq | %lt | %gt
ConditionValue -> XState                                                          {% (d) => d[0] %}
  | Sign XState                                                                   {% (d) => d[0][0].value + d[1] %}
XState -> %unsignedint %dot %unsignedint                                          {% (d) => parseFloat(d[0].value + '.' + d[2].value) %}
  | %unsignedint                                                                  {% (d) => parseInt(d[0].value) %}
  | %identifier                                                                   {% (d) => d[0].value %}
  | %string                                                                       {% (d) => '"' + d[0].value + '"' %}

Sign -> %plus
  | %hyphen

Number -> %hyphen %unsignedint %dot %unsignedint                                  {% (d) => parseFloat('-' + d[1].value + '.' + d[2].value) %}
  | %hyphen %unsignedint                                                          {% (d) => parseInt('-' + d[1].value) %}
  | %unsignedint %dot %unsignedint                                                {% (d) => parseFloat(d[0].value + '.' + d[2].value) %}
  | %unsignedint                                                                  {% (d) => parseInt(d[0].value) %}

_ -> null               {% () => null %}
	| __                  {% () => null %}

__ -> %WS               {% () => null %}
	| %NL                 {% () => null %}
	| Comment 		        {% () => null %}
	| __ %WS    	        {% () => null %}
	| __ %NL    	        {% () => null %}
	| __ Comment 	        {% () => null %}

Comment -> %SL_COMMENT  {% () => null %}
  | %ML_COMMENT         {% () => null %}

