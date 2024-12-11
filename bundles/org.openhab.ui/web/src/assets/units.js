// Units defines the possible units for UI unit selection.
// If nothing is defined for an allowed dimension, the UI will fall back on the OH core default unit in the configured measurement system.
// For dimensions defined, any of the fields can be omitted. Logical defaults will be used.
// Units from curated units lists will always be added to the full unit list constructed from baseUnits and prefixes.
// So it is not necessary to explicitly add what is already in the curated units for the full units list.
// However, no prefixes will be applied to these. If you want prefixes to be applied, you should add them in the respective baseUnits Array as well.

/**
 * @typedef Unit
 * @property {string} dimension unit dimension (required)
 * @property {string[]} [units] units used in a curated shortlist of units, not specific to SI or Imperial measurement system
 * @property {string[]} [unitsSI] units used in a curated shortlist of units, specific to the SI measurement system
 * @property {string[]} [unitsUS] units used in a curated shortlist of units, specific to the Imperial measurement system
 * @property {string} [default] default unit, to be set to override core default unit, not specific to SI or Imperial measurement system
 * @property {string} [defaultsSI] default unit in SI measurement system, to be set to override OH core default SI unit
 * @property {string} [defaultUS] default unit in Imperial measurement system, to be set to override OH core default Imperial unit
 * @property {string[]} [baseUnits] all supported base units that don't allow metric or binary prefixes
 * @property {string[]} [baseUnitsMetric] metric base units, the full list of units will include all of these with all metric prefixes
 * @property {string[]} [baseUnitsBinary] binary base units, the full list of units will include all of these with all binary prefixes
 */

/**
 * Defines the possible units for UI unit selection.
 * @type {Unit[]}
 */
export const Units = [{
  dimension: 'Acceleration',
  baseUnits: ['gₙ'],
  baseUnitsSI: ['m/s²']
}, {
  dimension: 'AmountOfSubstance',
  baseUnitsSI: ['mol']
}, {
  dimension: 'Angle',
  units: ['°', '\'', '"', 'rad']
}, {
  dimension: 'Area',
  unitsSI: ['m²', 'km²', 'ha'],
  unitsUS: ['ft²', 'mi²'],
  baseUnits: ['ca', 'a', 'in²', 'ac'],
  baseUnitsMetric: ['m²']
}, {
  dimension: 'ArealDensity',
  unitsSI: ['kg/m²'],
  unitsUS: ['DU']
}, {
  dimension: 'DataAmount',
  units: ['bit', 'B', 'kB', 'kiB', 'MB', 'MiB', 'GB', 'GiB', 'TB', 'TiB'],
  baseUnitsMetric: ['bit', 'B', 'o'],
  baseUnitsBinary: ['bit', 'B', 'o']
}, {
  dimension: 'DataTransferRate',
  units: ['bit/s', 'kbit/s', 'Mbit/s', 'Gbit/s'],
  baseUnitsMetric: ['bit/s'],
  baseUnitsBinary: ['bit/s']
}, {
  dimension: 'Density',
  units: ['g/l', 'g/m³', 'kg/m³'],
  baseUnits: ['lb/in³', 'gr/ft³'],
  baseUnitsMetric: ['g/m³', 'g/mm³', 'g/cm³', 'g/dm³', 'g/ml', 'g/cl', 'g/dl', 'g/l']
}, {
  dimension: 'Dimensionless',
  units: ['one', '%', 'dB', 'ppm', 'ppb', '°dH'],
  default: '%'
}, {
  dimension: 'ElectricCapcitance',
  baseUnitsMetric: ['F']
}, {
  dimension: 'ElectricCharge',
  units: ['Ah', 'C'],
  baseUnitsMetric: ['C']
}, {
  dimension: 'ElectricConductance',
  baseUnitsMetric: ['S']
}, {
  dimension: 'ElectricConductivity',
  baseUnitsMetric: ['S/m']
}, {
  dimension: 'ElectricCurrent',
  baseUnitsMetric: ['A']
}, {
  dimension: 'ElectricInductance',
  baseUnitsMetric: ['H']
}, {
  dimension: 'ElectricPotential',
  baseUnitsMetric: ['V']
}, {
  dimension: 'ElectricResistance',
  baseUnitsMetric: ['Ω']
}, {
  dimension: 'Energy',
  units: ['kWh', 'Wh', 'J', 'kJ', 'cal', 'kcal'],
  baseUnitsMetric: ['Ws', 'Wh', 'J', 'cal']
}, {
  dimension: 'Force',
  units: ['N', 'kN'],
  baseUnitsMetric: ['N']
}, {
  dimension: 'Frequency',
  units: ['Hz', 'kHz', 'MHz', 'GHz', 'rpm'],
  baseUnitsMetric: ['Hz']
}, {
  dimension: 'Intensity',
  units: ['W/m²', 'µW/cm²'],
  baseUnitsMetric: ['W/mm²', 'W/cm²', 'W/dm²', 'W/m²']
}, {
  dimension: 'Length',
  unitsSI: ['mm', 'cm', 'dm', 'm', 'km'],
  unitsUS: ['in', 'ft', 'mi'],
  baseUnits: ['yd', 'ch', 'fur', 'lea']
}, {
  dimension: 'LuminousFlux',
  baseUnitsMetric: ['lm']
}, {
  dimension: 'LuminousIntensity',
  baseUnitsMetric: ['cd']
}, {
  dimension: 'MagneticFlux',
  baseUnitsMetric: ['T']
}, {
  dimension: 'Mass',
  unitsSI: ['mg', 'g', 'kg', 't'],
  baseUnits: ['lb', 'oz', 'st', 'gr'],
  baseUnitsMetric: ['g', 't']
}, {
  dimension: 'Power',
  units: ['W', 'kW', 'VA', 'kVA', 'var', 'kvar', 'dBm'],
  baseUnits: ['hp', 'kgf', 'lbf'],
  baseUnitsMetric: ['W', 'VA', 'var']
}, {
  dimension: 'Pressure',
  unitsSI: ['Pa', 'hPa', 'bar', 'mbar', 'mmHg'],
  unitsUS: ['inHg', 'psi'],
  baseUnits: ['atm'],
  baseUnitsMetric: ['Pa', 'bar']
}, {
  dimension: 'RadiantExposure',
  units: ['Wh/m²'],
  unitsSI: ['J/m²'],
  baseUnitsMetric: ['J/m²', 'Wh/m²']
}, {
  dimension: 'RadiationAbsorbedDose',
  baseUnitsMetric: ['Gy']
}, {
  dimension: 'RadiationEffectiveDose',
  baseUnitsMetric: ['Sv']
}, {
  dimension: 'Radioactivity',
  unitsSI: ['Bq', 'Ci'],
  baseUnitsMetric: ['Ci']
}, {
  dimension: 'Speed',
  unitsSI: ['km/h', 'm/s'],
  unitsUS: ['mph', 'in/h'],
  baseUnits: ['kn'],
  baseUnitsMetric: ['m/s', 'm/h']
}, {
  dimension: 'Temperature',
  unitsSI: ['°C', 'K'],
  unitsUS: ['°F', 'K'],
  baseUnits: ['mired']
}, {
  dimension: 'Time',
  units: ['s', 'min', 'h', 'd', 'wk', 'mo', 'y']
}, {
  dimension: 'Volume',
  unitsSI: ['ml', 'cl', 'l', 'm³'],
  unitsUS: ['gal'],
  baseUnits: ['in³', 'ft³'],
  baseUnitsMetric: ['l', 'm³']
}, {
  dimension: 'VolumetricFlowRate',
  unitsSI: ['l/s', 'l/min', 'm³/s', 'm³/min', 'm³/h', 'm³/d'],
  unitsUS: ['gal/min'],
  baseUnitsMetric: ['m³/s', 'm³/min', 'm³/h', 'm³/d']
}]

/**
 * Metric prefixes for metric base units.
 * @type {string[]}
 */
export const MetricPrefixes = ['y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm', 'c', 'd', 'da', 'h', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

/**
 * Binary prefixes for binary base units.
 * @type {string[]}
 */
export const BinaryPrefixes = ['ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi']
