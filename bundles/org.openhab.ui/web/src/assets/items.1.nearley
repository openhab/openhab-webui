Main -> Statement   									{% function(d) { return [d[0]]; } %}
	| Main _ Statement									{% function(d) { return d[0].concat(d[2]); } %}
Statement -> ItemModel 										{% function(d) { return d[0]; } %}
	| Comment 												{% function(d)  { return null; } %}
Comment -> "#" _ _string _ NL
	| "/*" _ _string _ "*/"
	| "//" _ _string NL

ItemModel -> Type Dimension __ Name Label Icon Groups Tags Metadata
{% function(d) {
	return {
		type: d[0][0],
        dimension: d[1],
		name: d[3],
		label: d[4],
		category: d[5],
		groupNames: d[6],
		tags: d[7],
		metadata: d[8] // metadata (and bindings/links) are not part of the API model and should be processed separately
	};
} %}

Type -> "Group" | "Number" | "Switch" | "Rollershutter" | "String" | "Dimmer" | "Contact" | "DateTime" | "Color" | "Player" | "Location" | "Call" | "Image"
Dimension -> null										{% function(d) { return null; } %}
	| ":" ID											{% function(d) { return d[1]; } %}
Name -> ID 													{% function(d) { return d[0]; } %}
Label -> null | __ String 										{% function(d) { return d[1]; } %}
Icon -> null 												{% function(d) { return null; } %}
	| __ "<" _ ID _ ">" 										{% function(d) { return d[2]; } %}
Groups -> null												{% function(d) { return null; } %}
	| __ "(" GroupList ")"										{% function(d) { return d[2]; } %}
GroupList -> _ GroupName _ 									{% function(d) { return [d[1]]; } %}
	| GroupList "," GroupList								{% function(d) { return d[0].concat(d[2]); } %}
GroupName -> ID												{% function(d) { return d[0]; } %}

Tags -> null												{% function(d) { return null; } %}
	| __ "[" TagList "]"										{% function(d) { return d[2]; } %}
TagList -> _ Tag _											{% function(d) { return [d[1]]; } %}
	| TagList "," TagList									{% function(d) { return d[0].concat(d[2]); } %}
Tag -> ID													{% function(d) { return d[0]; } %}
	| "\"" ID "\""											{% function(d) { return d[1]; } %}

Metadata -> null											{% function(d) {return null; } %}
	| __ "{" MetadataList "}"									{% function(d) { return d[2]; } %}
MetadataList -> _ MetadataEntry _							{% function(d) { return [d[1]]; } %}
	| MetadataList "," MetadataList							{% function(d) { return d[0].concat(d[2]); } %}

MetadataEntry -> MetadataNamespace _ "=" _ MetadataValue	{% function(d) { return [d[0], d[4]]; } %}
MetadataNamespace -> ID										{% function(d) { return d[0]; } %}
MetadataValue -> String										{% function(d) { return d[0]; } %}

ID -> _id													{% function(d) {return d[0]; } %}
_id -> null													{% function() {return ""; } %}
	| _id _idchar											{% function(d) {return d[0] + d[1];} %}
_idchar -> [a-zA-Z0-9_]

String -> "\"" _string "\""									{% function(d) {return d[1]; } %}
_string -> null												{% function(d) {return ""; } %}
	| _string _stringchar									{% function(d) {return d[0] + d[1];} %}
 
_stringchar -> [^\\"]										{% id %}
	| "\\" [^]												{% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}
 
# Whitespace
_ -> null | _ [\s]											{% function() {} %}
__ -> [\s] | __ [\s]										{% function() {} %}

# New line
NL -> [\n]:+													{% function() {} %}
