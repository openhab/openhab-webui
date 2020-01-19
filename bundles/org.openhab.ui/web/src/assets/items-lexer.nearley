@{%
	const moo = require('moo')

	let lexer = moo.compile({
		WS:         /[ \t]+/,
		comment:    /\/\/.*?$/,
		number:     /0|[1-9][0-9]*/,
		string:     { match: /"(?:\\["\\]|[^\n"\\])*"/, value: x => x.slice(1, -1) },
		itemtype:   ['Group', 'Number', 'Switch', 'Rollershutter', 'String', 'Dimmer', 'Contact', 'DateTime', 'Color', 'Player', 'Location', 'Call', 'Image'],
		identifier: /[A-Za-z0-9_-]+/,
		lparen:  	'(',
		rparen:  	')',
		colon:   	':',
		lbrace: 	'{',
		rbrace: 	'}',
		lbracket: 	'[',
		rbracket: 	']',
		lt: 		'<',
		gt: 		'>',
		comma: 		',',
		equals: 	'=',
		NL:      	{ match: /\n/, lineBreaks: true },
	})
%}

@lexer lexer


Main -> _ Items _ {% (d) => d[1] %}
Items -> Item {% (d) => [d[0]] %}
	| Items _ Item {% (d) => d[0].concat([d[2]]) %}
	
Item -> Type __ Name Label Icon Groups Tags Metadata
{% function (d) {
	return {
		type: d[0][0],
		groupType: d[0][1],
		function: d[0][2],
		name: d[2],
		label: d[3],
		category: d[4],
		groupNames: d[5],
		tags: d[6],
		metadata: d[7] // metadata (and bindings/links) are not part of the API model and should be processed separately
	}
} %}

# Type
# basic
Type -> %itemtype									{% (d) => [d[0].text] %}
	| "Number" ":" %identifier						{% (d) => ['Number:' + d[2].text] %}
	| "Group" ":" %itemtype							{% (d) => ['Group', d[2].text] %}
	| "Group" ":" %itemtype ":" %identifier AggArgs	{% (d) => ['Group', d[2].text, {name: d[4].text, args: d[5]}] %}
# group function aggregation arguments
AggArgs -> null										{% (d) => undefined %}
	| "(" %identifier ")"							{% (d) => [d[1].text] %}
	| "(" %identifier _ "," _ %identifier ")"		{% (d) => [d[1].text, d[5].text] %}

# Name
Name -> %identifier									{% (d) => d[0].text %}

# Label
Label -> null										{% (d) => undefined %}
	| __ %string		 							{% (d) => d[1].value %}

# Icon (category)
Icon -> null 										{% (d) => undefined %}
	| __ "<" _ %identifier _ ">" 					{% (d) => d[3].text %}

# Groups
Groups -> null										{% (d) => undefined %}
	| __ "(" GroupList ")"							{% (d) => d[2] %}
GroupList -> _ GroupName _ 							{% (d) => [d[1]] %}
	| GroupList "," GroupList						{% (d) => d[0].concat(d[2]) %}
GroupName -> %identifier							{% (d) => d[0].text %}

# Tags
Tags -> null										{% (d) => undefined %}
	| __ "[" TagList "]"							{% (d) => d[2] %}
TagList -> _ Tag _ 									{% (d) => [d[1]] %}
	| TagList "," TagList							{% (d) => d[0].concat(d[2]) %}
Tag -> %identifier									{% (d) => d[0].text %}
	| %string										{% (d) => d[0].value %}

# Metadata (+ links, OH1 bindings...)
Metadata -> null									{% (d) => undefined %}
	| __ "{" MetadataList "}"						{% (d) => d[2] %}
MetadataList -> _ MetadataEntry _					{% (d) => [d[1]] %}
	| MetadataList "," MetadataList					{% (d) => d[0].concat(d[2]) %}

MetadataEntry -> MetadataKey _ "=" _ MetadataValue	{% (d) => { return { key: d[0], value: d[4] } } %}
MetadataKey -> %identifier							{% (d) => d[0].text %}
MetadataValue -> %string							{% (d) => d[0].value %}
	| %number										{% (d) => parseInt(d[0].value) %}
	| %string _ MetadataConfig						{% (d) => { return { value: d[0].value, config: d[2] } } %}

MetadataConfig -> "[" MetadataConfigList "]"		{% (d) => d[1] %}
MetadataConfigList -> _ MetadataConfigItem _ 		{% (d) => [d[1]] %}
	| MetadataConfigList "," MetadataConfigList		{% (d) => d[0].concat(d[2]) %}
MetadataConfigItem -> MetadataConfigKey _ "=" _ MetadataConfigValue	{% (d) => { return { key: d[0], value: d[4] } } %}
MetadataConfigKey -> %identifier					{% (d) => d[0].text %}
MetadataConfigValue -> %string						{% (d) => d[0].value %}
	| %number										{% (d) => parseInt(d[0].value) %}


_ -> null {% () => null %}
	| _ %WS  {% () => null %}
	| _ %NL  {% () => null %}
	| _ %comment {% () => null %}

__ -> %WS			{% () => null %}
	| %NL			{% () => null %}
	| %comment		{% () => null %}
	| __ %WS    	{% () => null %}
	| __ %NL    	{% () => null %}
	| __ %comment 	{% () => null %}
