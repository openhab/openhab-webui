@{%
  const moo = require('moo')

  let lexer = moo.compile({
    WS:               /[ \t]+/,
    comment:          /\/\/.*?$/,
    number:           /\-?[0-9]+(?:\.[0-9]*)?/,
    string:           { match: /"(?:\\["\\]|[^\n"\\])*"/, value: x => x.slice(1, -1) },
    sitemap:          'sitemap ',
    name:             'name=',
    label:            'label=',
    item:             'item=',
    icon:             'icon=',
    widgetattr:       ['url=', 'refresh=', 'service=', 'period=', 'legend=', 'height=', 'mappings=', 'minValue=', 'maxValue=', 'step=', 'separator=', 'encoding=', 'yAxisDecimalPattern='],
    widgetfreqattr:   'sendFrequency=',
    widgetfrcitmattr: 'forceasitem=',
    widgetvisiattr:   'visibility=',
    widgetcolorattr:  ['labelcolor=', 'valuecolor=', 'iconcolor='],
    widgetswitchattr: 'switchSupport',
    nlwidget:         ['Switch ', 'Selection ', 'Slider ', 'List ', 'Setpoint ', 'Input ', 'Video ', 'Chart ', 'Webview ', 'Colorpicker ', 'Mapview ', 'Default '],
    lwidget:          ['Text ', 'Group ', 'Image ', 'Frame '],
    identifier:       /[A-Za-z0-9_]+/,
    lparen:           '(',
    rparen:           ')',
    colon:            ':',
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
    equals:           '=',
    comma:            ',',
    NL:               { match: /\n/, lineBreaks: true }
  })
  const requiresItem = ['Group', 'Chart', 'Switch', 'Mapview', 'Slider', 'Selection', 'List', 'Setpoint', 'Input ', 'Colorpicker', 'Default']

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

    // reject widgets with missing parameters
    if (requiresItem.includes(widget.component) && !widget.config.item) return reject
    if (widget.component === 'List' && !widget.config.separator) return reject
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
  | %label %string                                                                {% (d) => { return { 'label': d[1].value } } %}

Widgets -> Widget                                                                 {% (d) => [d[0]] %}
  | Widgets _ Widget                                                              {% (d) => d[0].concat([d[2]]) %}

Widget -> %nlwidget _ WidgetAttrs:*                                               {% getWidget %}
  | %lwidget _ WidgetAttrs:*                                                      {% getWidget %}
  | %lwidget _ WidgetAttrs:* _ %lbrace _ Widgets _ %rbrace                        {% getWidget %}

WidgetAttrs -> WidgetAttr                                                         {% (d) => [d[0]] %}
  | WidgetAttrs _ WidgetAttr                                                      {% (d) => d[0].concat([d[2]]) %}
WidgetAttr -> %widgetswitchattr                                                   {% (d) => ['switchEnabled', true] %}
  | %widgetfreqattr                                                               {% (d) => ['frequency', d[1]] %}
  | %widgetfrcitmattr                                                             {% (d) => ['forceAsItem', d[1]] %}
  | WidgetAttrName WidgetAttrValue                                                {% (d) => [d[0][0].value, d[1]] %}
  | WidgetVisibilityAttrName WidgetVisibilityAttrValue                            {% (d) => [d[0][0].value, d[1]] %}
  | WidgetColorAttrName WidgetColorAttrValue                                      {% (d) => [d[0][0].value, d[1]] %}
WidgetAttrName -> %item | %label | %icon | %widgetattr
WidgetAttrValue -> %number                                                        {% (d) => { return parseFloat(d[0].value) } %}
  | %identifier                                                                   {% (d) => d[0].value %}
  | %string                                                                       {% (d) => d[0].value %}
  | %lbracket _ Mappings _ %rbracket                                              {% (d) => d[2] %}
WidgetVisibilityAttrName -> %widgetvisiattr
WidgetVisibilityAttrValue -> %lbracket _ Visibilities _ %rbracket                 {% (d) => d[2] %}
WidgetColorAttrName -> %widgetcolorattr
WidgetColorAttrValue -> %lbracket _ Colors _ %rbracket                            {% (d) => d[2] %}

Mappings -> Mapping                                                               {% (d) => [d[0]] %}
  | Mappings _ %comma _ Mapping                                                   {% (d) => d[0].concat([d[4]]) %}
Mapping -> MappingCommand _ %equals _ MappingLabel                                {% (d) => d[0][0].value + '=' + d[4][0].value %}
MappingCommand -> %number | %identifier | %string
MappingLabel -> %number | %identifier | %string

Visibilities -> Visibility                                                        {% (d) => [d[0]] %}
  | Visibilities _ %comma _ Visibility                                            {% (d) => d[0].concat([d[4]]) %}
Visibility -> VisibilityCommand _ VisibilityComparator _ VisibilityValue          {% (d) => d[0][0].value + d[2][0].value + d[4][0].value %}
VisibilityCommand -> %identifier
VisibilityComparator -> %eq | %noteq | %lteq | %gteq | %lt | %gt
VisibilityValue -> %number | %identifier | %string

Colors -> Color                                                                   {% (d) => [d[0]] %}
  | Colors _ %comma _ Color                                                       {% (d) => d[0].concat([d[4]]) %}
Color -> ColorCommand _ ColorComparator _ ColorValue _ %equals _ ColorName        {% (d) => d[0][0].value + d[2][0].value + d[4][0].value + '=' + d[8][0].value %}
  | ColorComparator _ ColorValue _ %equals _ ColorName                            {% (d) => d[0][0].value + d[2][0].value + '=' + d[6][0].value %}
  | ColorValue _ %equals _ ColorName                                              {% (d) => d[0][0].value + '=' + d[4][0].value %}
  | ColorName                                                                     {% (d) => d[0][0].value %}
ColorCommand -> %identifier
ColorComparator -> %eq | %noteq | %lteq | %gteq | %lt | %gt
ColorValue ->  %number | %identifier | %string
ColorName ->  %identifier | %string

_ -> null {% () => null %}
	| _ %WS  {% () => null %}
	| _ %NL  {% () => null %}
# | _ %comment {% () => null %}

__ -> %WS			{% () => null %}
	| %NL			{% () => null %}
	| %comment		{% () => null %}
	| __ %WS    	{% () => null %}
	| __ %NL    	{% () => null %}
	| __ %comment 	{% () => null %}

NL -> %NL {% () => null %}
  | _ %NL {% () => null %}
