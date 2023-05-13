import { javascriptGenerator } from 'blockly/javascript'

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

/*
* Add ZoneDateTime and DateTimeFormatter support to rule
* Supports a number of common formats out of the box like
* - 2022-04-10 (10)
* - 2022-04-09 10:11 (16)
* - 2022-04-09 10:11:12 (19)
* - 2022-04-10T18:50:55+02:00 (25)
* - 2022-04-10T18:50:55.537 (23)
* - 2022-04-10T18:50:55.537123 (26)
* - 2022-04-10T18:50:55.537+02:00 (29)
* - 2022-04-10T18:50:55.537123+02:00 (32) -> local date time standard output
* - 2022-05-01T12:28:50.662+0200 (28) -> OH standard output format
* - all of the above work with or without the "T"
*/
export function addDateSupport () {
  let dtf = javascriptGenerator.provideFunction_(
    'dtf',
    ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.format.DateTimeFormatter");'])

  let zdt = javascriptGenerator.provideFunction_(
    'zdt',
    ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])

  let getzdt = javascriptGenerator.provideFunction_(
    'getZonedDateTime', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(datetime) {',
      '  datetime = String(datetime).replace(\'T\', \' \')',
      '  var regex_time_min =         /^\\d{2}:\\d{2}$/;',
      '  var regex_time_sec =         /^\\d{2}:\\d{2}:\\d{2}$/;',
      '  var regex_date =             /^\\d{4}-\\d{2}-\\d{2}$/;',
      '  var regex_date_time_min =    /^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}$/;',
      '  var regex_date_time_sec =    /^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/;',
      '  var regex_date_time_sec_tz = /^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}[+-]\\d{2}:\\d{2}$/;',
      '  var regex_date_time_ms =     /^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{3}$/;',
      '  var regex_date_time_us =     /^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{6}$/;',
      '  var regex_date_time_ms_tz =  /^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{3}[+-]\\d{2}:\\d{2}$/;',
      '  var regex_date_time_us_tz =  /^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{6}[+-]\\d{2}:\\d{2}$/;',
      '  var regex_oh =               /^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}\\.\\d{3}[+-]\\d{4}$/;',
      '  var now = zdt.now();',
      '  var now_year = now.getYear();',
      '  var now_month = now.getMonthValue();',
      '  var now_day = now.getDayOfMonth();',
      '  var today = \'\' + now_year;',
      '  today += \'-\' + (\'0\' + now_month).slice(-2);',
      '  today += \'-\' + (\'0\' + now_day).slice(-2)+\' \';',
      '  switch (true) {',
      `    case regex_time_min.test(datetime): return ${zdt}.parse(today + datetime + ':00+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case regex_time_sec.test(datetime): return ${zdt}.parse(today + datetime + '+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case regex_date.test(datetime): return ${zdt}.parse(datetime + ' 00:00:00+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case regex_date_time_min.test(datetime): return ${zdt}.parse(datetime + ':00+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case regex_date_time_sec.test(datetime): return ${zdt}.parse(datetime + '+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case regex_date_time_sec_tz.test(datetime): return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case regex_date_time_ms.test(datetime): return ${zdt}.parse(datetime + ' +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSS z'));`,
      `    case regex_date_time_us.test(datetime): return ${zdt}.parse(datetime + ' +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSSS z'));`,
      `    case regex_date_time_ms_tz.test(datetime): return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSz'));`,
      `    case regex_date_time_us_tz.test(datetime): return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSSSSz'));`,
      `    case regex_oh.test(datetime): return ${zdt}.parse(datetime.slice(0,26) + ':' + datetime.slice(26,28), dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSz'));`,
      `    default: return ${zdt}.parse(datetime);`,
      '  }',
      '}'
    ])

  let createzdt = javascriptGenerator.provideFunction_(
    'createZonedDateTime', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(year, month, day, hour, minute, second, nano, offsetString, timezoneString) {',
      '  stringToParse = \'\' + year;',
      '  stringToParse += \'-\' + (\'0\' + month).slice(-2);',
      '  stringToParse += \'-\' + (\'0\' + day).slice(-2);',
      '  stringToParse += \'T\' + (\'0\' + hour).slice(-2);',
      '  stringToParse += \':\' + (\'0\' + minute).slice(-2);',
      '  stringToParse += \':\' + (\'0\' + second).slice(-2);',
      '  stringToParse += \'.\' + nano + offsetString + \'[\' + timezoneString + \']\';',
      '  return stringToParse;',
      '}'
    ])

  return [dtf, zdt, getzdt, createzdt]
}

export function addGetZdtComponent () {
  let getZdtComponent = javascriptGenerator.provideFunction_(
    'getZdtComponent', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value) {',
      '  return (typeof value == \'number\') ? value : value.getValue();',
      '}'
    ])

  return getZdtComponent
}

export function addChrono () {
  let chrono = javascriptGenerator.provideFunction_(
    'chrono',
    ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.temporal.ChronoField");'])
  return chrono
}

export function addDateComparisonSupportNashorn () {
  let zdtCompare = javascriptGenerator.provideFunction_(
    'zdtCompare', [
      '// Nashorn',
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(zdt1, zdt2, compareOp, precision, compDate) {',
      '  switch (precision) {',
      '    case \'years\':',
      '     zdt2 = zdt2.withMonth(zdt1.getMonthValue());',
      '    case \'months\':',
      '     zdt2 = zdt2.withDayOfMonth(zdt1.getDayOfMonth());',
      '    case \'days\':',
      '     zdt2 = zdt2.withHour(zdt1.getHour());',
      '    case \'hours\':',
      '     zdt2 = zdt2.withMinute(zdt1.getMinute());',
      '    case \'minutes\':',
      '     zdt2 = zdt2.withSecond(zdt1.getSecond());',
      '    case \'seconds\':',
      '     zdt2 = zdt2.withNano(zdt1.getNano());',
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
  return zdtCompare
}

export function addDateComparisonSupportGraalVM () {
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

export function addDict () {
  let dict = javascriptGenerator.provideFunction_(
    'dictionary',
    ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ';'])
  return dict
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
  const connectedBlock = block.getInput(inputName).connection.targetBlock().outputConnection.getCheck()
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
