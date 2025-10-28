export const CodeSnippets = {
  dsl: 'var returnValue = "String has " + input.length + " characters"\n\nreturnValue',
  jinja: '{# Available values:\nvalue - The incoming value.\nvalue_json - The incoming value parsed as JSON. #}\n{{value_json[\'AM2301\'].Temperature}}',
  js: '(function(data) {\n  var returnValue = "String has " + data.length + " characters"\n  return returnValue\n})(input)',
  nashornjs: '(function(data) {\n  var returnValue = "String has " + data.length + " characters"\n  return returnValue\n})(input)',
  map: 'key=value\n=default',
  py: '"String has " + str(len(input)) + " characters"',
  rb: '"String has #{input.length} characters"',
  xslt: '<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n' +
    '<xsl:stylesheet version=\'2.0\' xmlns:xsl=\'http://www.w3.org/1999/XSL/Transform\'>\n' +
    '   <xsl:output method=\'xml\' indent=\'no\'/>\n' +
    '   <xsl:template match=\'/\'>\n' +
    '      <reRoot><reNode><xsl:value-of select=\'/root/node/@val\' /> world</reNode></reRoot>\n' +
    '   </xsl:template>\n' +
    '</xsl:stylesheet>'
}

export const DocumentationLinks = {
  exec: '/addons/transformations/exec/',
  jinja: '/addons/transformations/jinja/',
  js: '/link/jsscripting-transform',
  jsonpath: '/addons/transformations/jsonpath/',
  map: '/addons/transformations/map/',
  py: '/addons/automation/pythonscripting/#py-transformation',
  rb: '/link/jrubyscripting-transform',
  regex: '/addons/transformations/regex/',
  scale: '/addons/transformations/scale/',
  xpath: '/addons/transformations/xpath/',
  xslt: '/addons/transformations/xslt/'
}
