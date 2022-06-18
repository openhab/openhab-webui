import Blockly from 'blockly'

/*
* Function allowing to call classes within the OSGi container
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
  let dtf = Blockly.JavaScript.provideFunction_(
    'dtf',
    ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.format.DateTimeFormatter");'])

  let zdt = Blockly.JavaScript.provideFunction_(
    'zdt',
    ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])

  let getzdt = Blockly.JavaScript.provideFunction_(
    'getZonedDateTime', [
      '/* Try to detect the format based on its length */',
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(datetime) {',
      '  datetime = String(datetime).replace(\'T\', \' \')',
      '  switch (datetime.length) {',
      `    case 10: return ${zdt}.parse(datetime + ' 00:00:00+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case 16: return ${zdt}.parse(datetime + ':00+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case 19: return ${zdt}.parse(datetime + '+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case 25: return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));`,
      `    case 23: return ${zdt}.parse(datetime + ' +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSS z'));`,
      `    case 26: return ${zdt}.parse(datetime + ' +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSSS z'));`,
      `    case 29: return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSz'));`,
      `    case 32: return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSSSSz'));`,
      `    case 28: return ${zdt}.parse(datetime.slice(0,26) + ':' + datetime.slice(26,28), dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSz'));`,
      `    default: return ${zdt}.parse(datetime);`,
      '  }',
      '}'
    ])

  let createzdt = Blockly.JavaScript.provideFunction_(
    'createZonedDateTime', [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(year, month, day, hour, minute, second, nano, offsetString, timezoneString) {',
      '  stringToParse = \'\' + year;',
      '  stringToParse += \'-\' + (\'0\' + month).slice(-2);',
      '  stringToParse += \'-\' + (\'0\' + day).slice(-2);',
      '  stringToParse += \'T\' + (\'0\' + hour).slice(-2);',
      '  stringToParse += \':\' + (\'0\' + minute).slice(-2);',
      '  stringToParse += \':\' + (\'0\' + second).slice(-2);',
      '  stringToParse += \'.\' + nano + offsetString + \'[\' + timezoneString + \']\';',
      `  return ${zdt}.parse(stringToParse, dtf.ISO_ZONED_DATE_TIME);`,
      '}'
    ])

  return [dtf, zdt, getzdt, createzdt]
}

export function addGetZdtComponent () {
  let getZdtComponent = Blockly.JavaScript.provideFunction_(
    'getZdtComponent', [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(value) {',
      '  return (typeof value == \'number\') ? value : value.getValue();',
      '}'
    ])

  return getZdtComponent
}

export function addChrono () {
  let chrono = Blockly.JavaScript.provideFunction_(
    'chrono',
    ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.temporal.ChronoField");'])
  return chrono
}

export function addDateComparisonSupport () {
  let zdtCompare = Blockly.JavaScript.provideFunction_(
    'zdtCompare', [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(zdt1, zdt2, compareOp, precision, compDate) {',
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
      '      return zdt1.isEqual(zdt2);',
      '    case \'after\':',
      '      return zdt1.isAfter(zdt2);',
      '    case \'beforeEqual\':',
      '      return zdt1.isBefore(zdt2) || zdt1.isEqual(zdt2);',
      '    case \'afterEqual\':',
      '      return zdt1.isAfter(zdt2) || zdt1.isEqual(zdt2);',
      '  }',
      '}'
    ])
  return zdtCompare
}
