export default {
  SNIPPETS: {
    DSL: 'var returnValue = "String has " + input.length + " characters"\n\nreturnValue',
    JINJA: '{# Available values:\nvalue - The incoming value.\nvalue_json - The incoming value parsed as JSON. #}\n{{value_json[\'AM2301\'].Temperature}}',
    JS: '(function(data) {\n  var returnValue = "String has " + data.length + " characters"\n  return returnValue\n})(input)',
    NASHORNJS: '(function(data) {\n  var returnValue = "String has " + data.length + " characters"\n  return returnValue\n})(input)',
    MAP: 'key=value\n=default',
    RB: '"String has #{input.length} characters"',
    XSLT: '<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n' +
      '<xsl:stylesheet version=\'2.0\' xmlns:xsl=\'http://www.w3.org/1999/XSL/Transform\'>\n' +
      '   <xsl:output method=\'xml\' indent=\'no\'/>\n' +
      '   <xsl:template match=\'/\'>\n' +
      '      <reRoot><reNode><xsl:value-of select=\'/root/node/@val\' /> world</reNode></reRoot>\n' +
      '   </xsl:template>\n' +
      '</xsl:stylesheet>'
  },
  EDITOR_MODES: {
    DSL: 'application/vnd.openhab.dsl.rule',
    EXEC: 'application/x-sh',
    MAP: 'text/x-properties',
    NASHORNJS: 'application/javascript;version=ECMAScript-5.1',
    SCALE: 'text/x-properties',
    XSLT: 'application/xml'
  }
}
