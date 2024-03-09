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
    widgetattr:       ['url=', 'refresh=', 'service=', 'period=', 'height=', 'minValue=', 'maxValue=', 'step=', 'encoding=', 'yAxisDecimalPattern=', 'inputHint=', 'columns='],
    widgetboolattr:   ['legend='],
    widgetfreqattr:   'sendFrequency=',
    widgetfrcitmattr: 'forceasitem=',
    widgetmapattr:    'mappings=',
    widgetbuttonattr: 'buttons=',
    widgetvisiattr:   'visibility=',
    widgetcolorattr:  ['labelcolor=', 'valuecolor=', 'iconcolor='],
    widgetswitchattr: 'switchSupport',
    widgetronlyattr:  'releaseOnly',
    nlwidget:         ['Switch ', 'Selection ', 'Slider ', 'Setpoint ', 'Input ', 'Video ', 'Chart ', 'Webview ', 'Colorpicker ', 'Mapview ', 'Buttongrid ', 'Default '],
    lwidget:          ['Text ', 'Group ', 'Image ', 'Frame '],
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
    number:           /-?[0-9]+(?:\.[0-9]*)?/,
    comma:            ',',
    colon:            ':',
    hyphen:           '-',
    string:           { match: /"(?:\\["\\]|[^\n"\\])*"/, value: x => x.slice(1, -1) }
  })
  const requiresItem = ['Group', 'Chart', 'Switch', 'Mapview', 'Slider', 'Selection', 'Setpoint', 'Input ', 'Colorpicker', 'Default']

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

    // if icon exists remove staticIcon, if not set icon to staticIcon and make saticIcon=true
    if (widget.config.icon) {
     delete widget.config.staticIcon
    }
    if (widget.config.staticIcon) {
      widget.config.icon = widget.config.staticIcon
      widget.config.staticIcon = true
    }

    // reject widgets with missing parameters
    if (requiresItem.includes(widget.component) && !widget.config.item) return reject
    if ((widget.component === 'Video' || widget.component === 'Webview') && !widget.config.url) return reject
    if (widget.component === 'Chart' && !widget.config.period) return reject

    return widget
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
  | %widgetfrcitmattr _ WidgetBooleanAttrValue                                    {% (d) => ['forceAsItem', d[2]] %}
  | %widgetboolattr _ WidgetBooleanAttrValue                                      {% (d) => [d[0].value, d[2]] %}
  | %widgetfreqattr _ WidgetAttrValue                                             {% (d) => ['frequency', d[2]] %}
  | %icon _ WidgetIconRulesAttrValue                                              {% (d) => ['iconrules', d[2]] %}
  | %icon _ WidgetIconAttrValue                                                   {% (d) => [d[0].value, d[2].join("")] %}
  | %staticIcon _ WidgetIconAttrValue                                             {% (d) => [d[0].value, d[2].join("")] %}
  | WidgetAttrName _ WidgetAttrValue                                              {% (d) => [d[0][0].value, d[2]] %}
  | WidgetMappingsAttrName WidgetMappingsAttrValue                                {% (d) => [d[0][0].value, d[1]] %}
  | WidgetButtonsAttrName WidgetButtonsAttrValue                                  {% (d) => [d[0][0].value, d[1]] %}
  | WidgetVisibilityAttrName WidgetVisibilityAttrValue                            {% (d) => [d[0][0].value, d[1]] %}
  | WidgetColorAttrName WidgetColorAttrValue                                      {% (d) => [d[0][0].value, d[1]] %}
WidgetAttrName -> %item | %label | %widgetattr
WidgetBooleanAttrValue -> %boolean                                                {% (d) => (d[0].value === 'true') %}
  | %string                                                                       {% (d) => (d[0].value === 'true') %}
WidgetIconAttrValue -> %string
  | WidgetIconName
  | %identifier %colon WidgetIconName
  | %identifier %colon %identifier %colon WidgetIconName
WidgetIconRulesAttrValue -> %lbracket _ IconRules _ %rbracket                     {% (d) => d[2] %}
WidgetIconName -> %identifier
  | WidgetIconName %hyphen %identifier                                            {% (d) => d[0] + "-" + d[2].value %}
WidgetAttrValue -> %number                                                        {% (d) => { return parseFloat(d[0].value) } %}
  | %identifier                                                                   {% (d) => d[0].value %}
  | %string                                                                       {% (d) => d[0].value %}
WidgetMappingsAttrName -> %widgetmapattr
WidgetMappingsAttrValue -> %lbracket _ Mappings _ %rbracket                       {% (d) => d[2] %}
WidgetButtonsAttrName -> %widgetbuttonattr
WidgetButtonsAttrValue -> %lbracket _ Buttons _ %rbracket                         {% (d) => d[2] %}
WidgetVisibilityAttrName -> %widgetvisiattr
WidgetVisibilityAttrValue -> %lbracket _ Visibilities _ %rbracket                 {% (d) => d[2] %}
WidgetColorAttrName -> %widgetcolorattr
WidgetColorAttrValue -> %lbracket _ Colors _ %rbracket                            {% (d) => d[2] %}

Mappings -> Mapping                                                               {% (d) => [d[0]] %}
  | Mappings _ %comma _ Mapping                                                   {% (d) => d[0].concat([d[4]]) %}
Mapping -> Command _ %equals _ Label                                              {% (d) => d[0][0].value + '=' + d[4][0].value %}
  |  Command _ %equals _ Label _ %equals _ WidgetIconAttrValue                    {% (d) => d[0][0].value + '=' + d[4][0].value + '=' + d[8].join("") %}

Buttons -> Button                                                                 {% (d) => [d[0]] %}
  | Buttons _ %comma _ Button                                                     {% (d) => d[0].concat([d[4]]) %}
Button -> %number _ %colon _ %number _ %colon _ ButtonValue                       {% (d) => { return { 'row':  parseInt(d[0].value), 'column': parseInt(d[4].value), 'command': d[8] } } %}
ButtonValue -> Command _ %equals _ Label                                          {% (d) => d[0][0].value + '=' + d[4][0].value %}
  | Command _ %equals _ Label _ %equals _ WidgetIconAttrValue                     {% (d) => d[0][0].value + '=' + d[4][0].value + '=' + d[8].join("") %}

Command -> %number | %identifier | %string
Label -> %number | %identifier | %string

Visibilities -> Conditions                                                        {% (d) => d[0] %}
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

Conditions -> Condition
  | Conditions _ %and _ Condition                                                 {% (d) => d[0] + ' AND ' + d[4] %}
Condition -> ConditionCommand _ ConditionComparator _ ConditionValue              {% (d) => d[0][0].value + d[2][0].value + d[4][0].value %}
  | ConditionComparator _ ConditionValue                                          {% (d) => d[0][0].value + d[2][0].value %}
  | ConditionValue                                                                {% (d) => d[0][0].value %}
ConditionCommand -> %identifier
ConditionComparator -> %eq | %noteq | %lteq | %gteq | %lt | %gt
ConditionValue -> %number | %identifier | %string

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

