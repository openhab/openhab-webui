Main -> Statement                                   {% function(d) { return [d[0]]; } %}
	| Main _ Statement								{% function(d) { return d[0].concat(d[2]); } %}
Statement -> ItemModel 								{% function(d) { return d[0]; } %}
	| Comment 										{% function(d)  { return null; } %}
Comment -> "#" _ _string _ NL
	| "/*" _ _string _ "*/"
	| "//" _ _string NL

ItemModel -> Type __ Name Label Icon Groups Tags Metadata
{% function(d) {
	return {
		type: d[0].type,
		groupType: d[0].groupType,
        function: d[0].function,
		name: d[2],
		label: d[3],
		category: d[4],
		groupNames: d[5],
		tags: d[6],
		metadata: d[7] // metadata (and bindings/links) are not part of the API model and should be processed separately
	};
} %}

Type -> BaseType                                    {% function(d) { return { type: d[0] }; } %}
    | "Number"	                                    {% function(d) { return { type: "Number" }; } %}
    | "Group"	                                    {% function(d) { return { type: "Number" }; } %}
	| "Number:" ID                                  {% function(d) { return { type: "Number", dimension: d[1] }; } %}
	| "Group"	                                    {% function(d) { return { type: "Group" }; } %}
	| "Group:" BaseType				                {% function(d) { return { type: "Group", groupType: d[1] }; } %}
	| "Group:" BaseType ":" ID FunctionArguments    {% function(d) { return { type: "Group", groupType: d[1], function: { name: d[3], args: d[4] } } } %}
FunctionArguments -> "(" ID ")"						{% function(d) { return [d[1]]; } %}
	| "(" ID "," ID ")"								{% function(d) { return [d[1], d[3]]; } %}
# BaseType -> "Group" | "Number" | "Switch" | "Rollershutter" | "String" | "Dimmer" | "Contact" | "DateTime" | "Color" | "Player" | "Location" | "Call" | "Image"
BaseType -> "Switch" | "Rollershutter" | "String" | "Dimmer" | "Contact" | "DateTime" | "Color" | "Player" | "Location" | "Call" | "Image"
Dimension -> null									{% function(d) { return null; } %}
	| ":" ID										{% function(d) { return d[1]; } %}
Name -> ID 											{% function(d) { return d[0]; } %}
Label -> null | __ String 							{% function(d) { return d[1]; } %}
Icon -> null 										{% function(d) { return null; } %}
	| __ "<" _ ID _ ">" 							{% function(d) { return d[3]; } %}
Groups -> null										{% function(d) { return null; } %}
	| __ "(" GroupList ")"							{% function(d) { return d[2]; } %}
GroupList -> _ GroupName _ 							{% function(d) { return [d[1]]; } %}
	| GroupList "," GroupList						{% function(d) { return d[0].concat(d[2]); } %}
GroupName -> ID										{% function(d) { return d[0]; } %}

Tags -> null										{% function(d) { return null; } %}
	| __ "[" TagList "]"							{% function(d) { return d[2]; } %}
TagList -> _ Tag _									{% function(d) { return [d[1]]; } %}
	| TagList "," TagList							{% function(d) { return d[0].concat(d[2]); } %}
Tag -> ID											{% function(d) { return d[0]; } %}
	| "\"" ID "\""									{% function(d) { return d[1]; } %}

Metadata -> null									{% function(d) {return null; } %}
	| __ "{" MetadataList "}"						{% function(d) { return d[2]; } %}
MetadataList -> _ MetadataEntry _					{% function(d) { return [d[1]]; } %}
	| MetadataList "," MetadataList					{% function(d) { return d[0].concat(d[2]); } %}

MetadataEntry -> MetadataNamespace _ "=" _ MetadataValue	{% function(d) { return [d[0], d[4]]; } %}
MetadataNamespace -> ID								{% function(d) { return d[0]; } %}
MetadataValue -> String								{% function(d) { return d[0]; } %}

ID -> _id											{% function(d) {return d[0]; } %}
_id -> null											{% function() {return ""; } %}
	| _id _idchar									{% function(d) {return d[0] + d[1];} %}
_idchar -> [a-zA-Z0-9_]

String -> "\"" _string "\""							{% function(d) {return d[1]; } %}
_string -> null										{% function(d) {return ""; } %}
	| _string _stringchar							{% function(d) {return d[0] + d[1];} %}
 
_stringchar -> [^\\"]								{% id %}
	| "\\" [^]										{% function(d) {return JSON.parse("\"" + d[0] + d[1] + "\""); } %}
 
# Whitespace
_ -> null | _ [\s]									{% function() {} %}
__ -> [\s] | __ [\s]								{% function() {} %}

# New line
NL -> [\n]:+										{% function() {} %}
