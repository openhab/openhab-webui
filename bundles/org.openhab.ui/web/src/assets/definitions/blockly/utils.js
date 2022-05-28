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
    'getZonedDateTime',
    [
      '/* Try to detect the input in a smart way */\n' +
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(datetime) {',
      '  datetime = datetime.replace(\'T\', \' \')\n' +
      '  switch (datetime.length) {\n' +
      `    case 10: return ${zdt}.parse(datetime + ' 00:00:00+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));\n` +
      `    case 16: return ${zdt}.parse(datetime + ':00+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));\n` +
      `    case 19: return ${zdt}.parse(datetime + '+00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));\n` +
      `    case 25: return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ssz'));\n` +
      `    case 23: return ${zdt}.parse(datetime + ' +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSS z'));\n` +
      `    case 26: return ${zdt}.parse(datetime + ' +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSSS z'));\n` +
      `    case 29: return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSz'));\n` +
      `    case 32: return ${zdt}.parse(datetime, dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSSSSz'));\n` +
      `    case 28: return ${zdt}.parse(datetime.slice(0,26) + ':' + datetime.slice(26,28), dtf.ofPattern('yyyy-MM-dd HH:mm:ss.SSSSz'));\n` +
      `    default: return ${zdt}.parse(datetime);\n` +
      '  }',
      '}'
    ])
  let createzdt = Blockly.JavaScript.provideFunction_(
    'createZonedDateTime',
    [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(year, month, day, hour, minute, second, nano, offsetString, timezoneString) {',
      '  stringToParse = \'\' + year;\n' +
      '  stringToParse += \'-\' + (\'0\' + month).slice(-2);\n' +
      '  stringToParse += \'-\' + (\'0\' + day).slice(-2);\n' +
      '  stringToParse += \'T\' + (\'0\' + hour).slice(-2);\n' +
      '  stringToParse += \':\' + (\'0\' + minute).slice(-2);\n' +
      '  stringToParse += \':\' + (\'0\' + second).slice(-2);\n' +
      '  stringToParse += \'.\' + nano + offsetString + \'[\' + timezoneString + \']\';\n' +
      `  return ${zdt}.parse(stringToParse, dtf.ISO_ZONED_DATE_TIME);`,
      '}'
    ])

  return [dtf, zdt, getzdt, createzdt]
}

export function addGetZdtComponent () {
  let getZdtComponent = Blockly.JavaScript.provideFunction_(
    'getZdtComponent',
    [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(value) {',
      '  return (typeof value == \'number\') ? value: value.getValue();\n' +
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
    'zdtCompare',
    [
      'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + '(zdt1, zdt2, compareOp, precision, compDate) {',
      '  switch (precision) {\n' +
      '    case \'years\':\n' +
      '     zdt2 = zdt2.withMonth(zdt1.getMonthValue());\n' +
      '    case \'months\':\n' +
      '     zdt2 = zdt2.withDayOfMonth(zdt1.getDayOfMonth());\n' +
      '    case \'days\':\n' +
      '     zdt2 = zdt2.withHour(zdt1.getHour());\n' +
      '    case \'hours\':\n' +
      '     zdt2 = zdt2.withMinute(zdt1.getMinute());\n' +
      '    case \'minutes\':\n' +
      '     zdt2 = zdt2.withSecond(zdt1.getSecond());\n' +
      '    case \'seconds\':\n' +
      '     zdt2 = zdt2.withNano(zdt1.getNano());\n' +
      '  }\n' +
      '  if (compDate === \'date\') {\n' +
      '    zdt1 = zdt1.toLocalDate();\n' +
      '    zdt2 = zdt2.toLocalDate();\n' +
      '  } else if (compDate === \'time\') {\n' +
      '    zdt1 = zdt1.toLocalTime();\n' +
      '    zdt2 = zdt2.toLocalTime();\n' +
      '  }\n' +
      '  switch (compareOp) {\n' +
      '    case \'before\':\n' +
      '      return zdt1.isBefore(zdt2);\n' +
      '    case \'equal\':\n' +
      '      return zdt1.isEqual(zdt2);\n' +
      '    case \'after\':\n' +
      '      return zdt1.isAfter(zdt2);\n' +
      '    case \'beforeEqual\':\n' +
      '      return zdt1.isBefore(zdt2) || zdt1.isEqual(zdt2);\n' +
      '    case \'afterEqual\':\n' +
      '      return zdt1.isAfter(zdt2) || zdt1.isEqual(zdt2);\n' +
      '  }\n' +
      '}'
    ])
  return zdtCompare
}
