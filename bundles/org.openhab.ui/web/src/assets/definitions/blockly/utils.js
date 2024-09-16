import { javascriptGenerator } from 'blockly/javascript.js'

/*
* Function allowing to call classes within the OSGi container
* e.g. service -> 'ruleManager', class -> 'org.openhab.core.automation.RuleManager'
*/
export function addOSGiService (serviceName, serviceClass) {
  const addServiceName = javascriptGenerator.provideFunction_(
    'addFrameworkService', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' (serviceClass) {',
      '  var bundleContext = Java.type(\'org.osgi.framework.FrameworkUtil\').getBundle(scriptExtension.class).getBundleContext();',
      '  var serviceReference = bundleContext.getServiceReference(serviceClass);',
      '  return bundleContext.getService(serviceReference);',
      '}'
    ])

  return javascriptGenerator.provideFunction_(
    serviceName,
    [`var ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_} = ${addServiceName}('${serviceClass}');`])
}

export function addDateComparisonSupport () {
  const graalZdtCompare = javascriptGenerator.provideFunction_(
    'zdtCompare', [
      '// graalVM',
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(zdt1, zdt2, compareOp, precision, compDate) {',
      '  switch (precision) {',
      '    case \'years\':',
      '     zdt2 = zdt2.withMonth(zdt1.monthValue());',
      '    case \'months\':',
      '     zdt2 = zdt2.withDayOfMonth(zdt1.dayOfMonth());',
      '    case \'days\':',
      '     zdt2 = zdt2.withHour(zdt1.hour());',
      '    case \'hours\':',
      '     zdt2 = zdt2.withMinute(zdt1.minute());',
      '    case \'minutes\':',
      '     zdt2 = zdt2.withSecond(zdt1.second());',
      '    case \'seconds\':',
      '     zdt2 = zdt2.withNano(zdt1.nano());',
      '  }',
      '  if (compDate === \'date\') {',
      '    zdt1 = zdt1.toLocalDate();',
      '    zdt2 = zdt2.toLocalDate();',
      '  } else if (compDate === \'time\') {',
      '    zdt1 = zdt1.toLocalTime();',
      '    zdt2 = zdt2.toLocalTime();',
      '  }',
      '  switch (compareOp) {',
      '    case \'before\':',
      '      return zdt1.isBefore(zdt2);',
      '    case \'equal\':',
      '      return zdt1.equals(zdt2);',
      '    case \'after\':',
      '      return zdt1.isAfter(zdt2);',
      '    case \'beforeEqual\':',
      '      return zdt1.isBefore(zdt2) || zdt1.equals(zdt2);',
      '    case \'afterEqual\':',
      '      return zdt1.isAfter(zdt2) || zdt1.equals(zdt2);',
      '  }',
      '}'
    ])
  return graalZdtCompare
}

export function addGetItemMetaConfigValue () {
  return javascriptGenerator.provideFunction_(
    'getItemMetaConfigValue', [
      'function getItemMetaConfigValue(itemName, namespace, prop) {',
      '  if (items.metadata.getMetadata(itemName, namespace) === null) {',
      '     return \'undefined\';',
      '  };',
      '  let props = prop.split(\'.\');',
      '  let value = items.metadata.getMetadata(itemName, namespace).configuration;',
      '  props.forEach(property => {',
      '    value = value[property];',
      '  });',
      '  return value;',
      '}'
    ])
}

/**
 * Gets the type of passed input to a given block.
 *
 * @param block
 * @param {string} inputName
 * @returns {string}
 */
export function blockGetCheckedInputType (block, inputName) {
  // Get the input type checks for this block
  const thisBlock = block.getInput(inputName).connection.getCheck()
  // Get the output type checks for the connected block
  const connectedBlock = block.getInput(inputName).connection.targetBlock()?.outputConnection.getCheck()
  // Skip if no checks are available
  if (!thisBlock || !connectedBlock) return ''
  // Find any intersection in the checklist
  for (let i = 0; i < thisBlock.length; i++) {
    if (connectedBlock.indexOf(thisBlock[i]) !== -1) {
      return thisBlock[i]
    }
  }
  return ''
}
