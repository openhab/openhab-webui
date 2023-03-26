export default {
  SNIPPETS: {
    SCRIPT: {
      'application/vnd.openhab.dsl.rule': 'var returnValue = "String has " + input.length + " characters"\n\nreturnValue',
      'application/javascript': '(function(data) {\n  var returnValue = "String has " + data.length + " characters"\n  return returnValue\n})(input)',
      'application/javascript;version=ECMAScript-5.1': '(function(data) {\n  var returnValue = "String has " + data.length + " characters"\n  return returnValue\n})(input)',
      'application/x-ruby': '"String has #{input.length} characters"'
    }
  },
  EDITOR_MODES: {
    MAP: 'text/x-properties',
    SCALE: 'text/x-properties'
  }
}
