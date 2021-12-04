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
