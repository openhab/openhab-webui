@{%
  const moo = require('moo')

  let lexer = moo.compile({
    WS:         /[ \t]+/,
    comment:    /\/\/.*?$/,
    number:     /\-?[0-9]+(?:\.[0-9]*)?/,
    string:     { match: /"(?:\\["\\]|[^\n"\\])*"/, value: x => x.slice(1, -1) },
    sitemap:    'sitemap ',
    name:        'name=',
    label:      'label=',
    item:       'item=',
    icon:       'icon=',
    widgetattr: ['url=', 'refresh=', 'service=', 'refresh=', 'period=', 'legend=', 'height=', 'frequency=', 'sendFrequency=',
                'switchEnabled=', 'mappings=', 'minValue=', 'maxValue=', 'step=', 'separator=', 'encoding='],
    nlwidget:   ['Switch ', 'Selection ', 'Slider ', 'List ', 'Setpoint ', 'Video ', 'Chart ', 'Webview ', 'Colorpicker ', 'Mapview ', 'Default '],
    lwidget:    ['Text', 'Group', 'Image', 'Frame'],
    identifier: /[A-Za-z0-9_]+/,
    lparen:     '(',
    rparen:     ')',
    colon:      ':',
    lbrace:     '{',
    rbrace:     '}',
    lbracket:   '[',
    rbracket:   ']',
    lt:         '<',
    gt:         '>',
    equals:     '=',
    comma:      ',',
    NL:         { match: /\n/, lineBreaks: true },
  })

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

  function getWidget(d,l,r) {
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

    return widget
  }

%}

@lexer lexer


Main -> _ Sitemap _                                                               {% (d) => d[1] %}
Sitemap -> %sitemap _ SitemapName __ SitemapLabel __ %lbrace _ Widgets _ %rbrace  {% getSitemap %}

SitemapName -> %identifier
SitemapLabel -> null                                                              {% (d) => { return {} } %}
  | %label %string                                                                {% (d) => { return { "label": d[1].value } } %}

Widgets -> Widget                                                                 {% (d) => [d[0]] %}
  | Widgets _ Widget                                                              {% (d) => d[0].concat([d[2]]) %}

Widget -> %nlwidget _ WidgetAttrs:*                                               {% getWidget %}
  | %lwidget _ WidgetAttrs:*                                                      {% getWidget %}
  | %lwidget _ WidgetAttrs:* __ %lbrace __ Widgets __ %rbrace                     {% getWidget %}

WidgetAttrs -> WidgetAttr                                                         {% (d) => [d[0]] %}
  | WidgetAttrs _ WidgetAttr                                                      {% (d) => d[0].concat([d[2]]) %}
WidgetAttr -> WidgetAttrName WidgetAttrValue                                      {% (d) => [d[0][0].value, d[1]] %}
WidgetAttrName -> %item | %label | %icon | %widgetattr
WidgetAttrValue -> %string                                                        {% (d) => d[0].value %}
  | %identifier                                                                   {% (d) => d[0].value %}
  | %number                                                                       {% (d) => { return parseFloat(d[0].value) } %}
  | %lbracket _ Mappings _ %rbracket                                              {% (d) => d[2] %}

Mappings -> Mapping                                                               {% (d) => [d[0]] %}
  | Mappings _ %comma _ Mapping                                                   {% (d) => d[0].concat([d[4]]) %}
Mapping -> MappingCommand %equals MappingLabel                                    {% (d) => d[0][0].value.toString() + '=' + d[2][0].value.toString() %}
MappingCommand -> %number | %identifier | %string
MappingLabel -> %number | %identifier | %string


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
