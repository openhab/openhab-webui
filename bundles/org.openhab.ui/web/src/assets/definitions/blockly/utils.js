import Blockly from 'blockly'

/*
* function that allow to call classes within the osgi container
* e.g. service -> 'ruleManager', class -> 'org.openhab.core.automation.RuleManager'
*/
export function addOSGiService (serviceName, serviceClass) {
  const addServiceName = Blockly.JavaScript.provideFunction_(
    'addFrameworkService', [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' (serviceClass) {',
      '  var bundleContext = Java.type(\'org.osgi.framework.FrameworkUtil\').getBundle(scriptExtension.class).getBundleContext();',
      '  var serviceReference = bundleContext.getServiceReference(serviceClass);',
      '  return bundleContext.getService(serviceReference);',
      '}'
    ])
  return Blockly.JavaScript.provideFunction_(
    serviceName,
    [`var ${Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_} = ${addServiceName}('${serviceClass}');`])
}

/*
* Add ZoneDateTime and DateTimeFormatter support to rule
*/
export function addDateSupport () {
  const dtf = Blockly.JavaScript.provideFunction_(
    'dtf',
    ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.format.DateTimeFormatter");'])
  const zdt = Blockly.JavaScript.provideFunction_(
    'zdt',
    ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
  const getZonedDateTime = Blockly.JavaScript.provideFunction_(
    'getZonedDateTime',
    [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' (datetime) {',
      '  switch (datetime.length) {\n' +
      `    case 10: return ${zdt}.parse(datetime + ' 00:00:00 +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss z'));\n` +
      `    case 19: return ${zdt}.parse(datetime + ' +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss z'));\n` +
      `    case 26: return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ss z'));\n` +
      '  }',
      '}'
    ])
  return { dtf, zdt, getZonedDateTime }
}
