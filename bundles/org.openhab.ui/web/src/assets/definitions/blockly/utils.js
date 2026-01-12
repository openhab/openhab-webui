import { javascriptGenerator } from 'blockly/javascript'

/*
 * Function allowing to call classes within the OSGi container
 * e.g. service -> 'ruleManager', class -> 'org.openhab.core.automation.RuleManager'
 */
export function addOSGiService(serviceName, serviceClass) {
  const addServiceName = javascriptGenerator.provideFunction_('addFrameworkService', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' (serviceClass) {',
    "  var bundleContext = Java.type('org.osgi.framework.FrameworkUtil').getBundle(scriptExtension.class).getBundleContext();",
    '  var serviceReference = bundleContext.getServiceReference(serviceClass);',
    '  return bundleContext.getService(serviceReference);',
    '}'
  ])

  return javascriptGenerator.provideFunction_(serviceName, [
    `var ${javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_} = ${addServiceName}('${serviceClass}');`
  ])
}

export function addDateComparisonSupport() {
  const graalZdtCompare = javascriptGenerator.provideFunction_('zdtCompare', [
    '// graalVM',
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(zdt1, zdt2, compareOp, precision, compDate) {',
    '  switch (precision) {',
    "    case 'years':",
    '     zdt2 = zdt2.withMonth(zdt1.monthValue());',
    "    case 'months':",
    '     zdt2 = zdt2.withDayOfMonth(zdt1.dayOfMonth());',
    "    case 'days':",
    '     zdt2 = zdt2.withHour(zdt1.hour());',
    "    case 'hours':",
    '     zdt2 = zdt2.withMinute(zdt1.minute());',
    "    case 'minutes':",
    '     zdt2 = zdt2.withSecond(zdt1.second());',
    "    case 'seconds':",
    '     zdt2 = zdt2.withNano(zdt1.nano());',
    '  }',
    "  if (compDate === 'date') {",
    '    zdt1 = zdt1.toLocalDate();',
    '    zdt2 = zdt2.toLocalDate();',
    "  } else if (compDate === 'time') {",
    '    zdt1 = zdt1.toLocalTime();',
    '    zdt2 = zdt2.toLocalTime();',
    '  }',
    '  switch (compareOp) {',
    "    case 'before':",
    '      return zdt1.isBefore(zdt2);',
    "    case 'equal':",
    '      return zdt1.equals(zdt2);',
    "    case 'after':",
    '      return zdt1.isAfter(zdt2);',
    "    case 'beforeEqual':",
    '      return zdt1.isBefore(zdt2) || zdt1.equals(zdt2);',
    "    case 'afterEqual':",
    '      return zdt1.isAfter(zdt2) || zdt1.equals(zdt2);',
    '  }',
    '}'
  ])
  return graalZdtCompare
}

export function addGetItemMetaConfigValue() {
  return javascriptGenerator.provideFunction_('getItemMetaConfigValue', [
    'function getItemMetaConfigValue(itemName, namespace, prop) {',
    '  if (items.metadata.getMetadata(itemName, namespace) === null) {',
    "     return 'undefined';",
    '  };',
    "  let props = prop.split('.');",
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
export function blockGetCheckedInputType(block, inputName) {
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

/**
 * Generate code representing the specified value input.
 *
 * Provides Blockly v10 behaviour for Blockly v11+: Don't throw a ReferenceError if specified input does not exist.
 *
 * @param {import('blockly/core/block.d.ts').Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @param {number} outerOrder The maximum binding strength (minimum order value) of any
 *     operators adjacent to "block".
 * @returns {string} Generated code or '' if no blocks are connected or the specified input does not exist.
 */
export function valueToCode(block, name, outerOrder) {
  let code = ''
  try {
    code = javascriptGenerator.valueToCode(block, name, outerOrder)
  } catch (e) {
    if (e instanceof ReferenceError) {
      // Ignore to restore Blockly v10 behavior
    } else {
      throw e
    }
  }
  return code
}

/**
 * Generate a code string representing the blocks attached to the named
 * statement input. Indent the code.
 * This is mainly used in generators. When trying to generate code to evaluate
 * look at using workspaceToCode or blockToCode.
 *
 * Provides Blockly v10 behaviour for Blockly v11+: Don't throw a ReferenceError if specified input does not exist.
 *
 * @param {import('blockly/core/block.d.ts').Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @returns {string} Generated code or '' if no blocks are connected or the specified input does not exist.
 */
export function statementToCode(block, name) {
  let code = ''
  try {
    code = javascriptGenerator.statementToCode(block, name)
  } catch (e) {
    if (e instanceof ReferenceError) {
      // Ignore to restore Blockly v10 behavior
    } else {
      throw e
    }
  }
  return code
}
