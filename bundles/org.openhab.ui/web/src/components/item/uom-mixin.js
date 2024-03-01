import { Units, MetricPrefixes, BinaryPrefixes } from '@/assets/units'

export default {
  data () {
    return {
      measurementSystem: this.$store.state.measurementSystem,
      dimensions: [],
      dimensionsReady: false
    }
  },
  created () {
    this.$oh.api.get('/rest/systeminfo/uom').then((data) => {
      data.uomInfo.dimensions.forEach((d) => {
        this.dimensions.push({
          name: d.dimension,
          label: d.dimension + ' (' + d.systemUnit + ')',
          systemUnit: d.systemUnit
        })
      })
    }).then(this.dimensionsReady = true)
  },
  computed: {
    /**
     * The unit shown in the UI when configuring the Item.
     * It is pre-filled with the unit hint if in `createMode`, or else the {@link configuredUnit}.
     * @returns {string}
     */
    unit () {
      if (!this.item) return ''
      if (!this.dimensionsReady) return ''
      return this.item.unit ? this.item.unit : (this.createMode ? this.getUnitHint(this.dimension) : this.configuredUnit)
    },
    /**
     * The unit currently configured and used by the openHAB server.
     * @returns {string}
     */
    configuredUnit () {
      if (!this.item) return ''
      if (this.item.unitSymbol) return this.item.unitSymbol
      if (!this.dimensionsReady) return ''
      return this.item.type === 'Group' ? this.getSystemUnit(this.groupDimension) : this.getSystemUnit(this.itemDimension)
    },
    dimension () {
      const parts = this.item.type === 'Group' ? this.item.groupType?.split(':') : this.item.type?.split(':')
      return parts && parts.length > 1 ? parts[1] : ''
    }
  },
  methods: {
    getSystemUnit (dimension) {
      return this.dimensions.find(d => d.name === dimension)?.systemUnit
    },
    getUnitHint (dimension, channelType) {
      const units = ((channelType && channelType.unitHint) ? channelType.unitHint : '').split(',')
      let unitHint = (this.measurementSystem === 'US' && units.length > 1) ? units[1].trim() : units[0].trim()
      if (!unitHint) {
        const unitCurated = Units.find(u => u.dimension === dimension)
        if (unitCurated) {
          if (this.measurementSystem === 'SI' && unitCurated.defaultSI) {
            unitHint = unitCurated.defaultSI
          } else if (this.measurementSystem === 'US' && unitCurated.defaultUS) {
            unitHint = unitCurated.defaultUS
          } else if (unitCurated.default) {
            unitHint = unitCurated.default
          }
        }
      }
      if (!unitHint) {
        unitHint = this.getSystemUnit(dimension)
      }
      return unitHint
    },
    /**
     * Get the list of curated units for the given dimension.
     * @param dimension
     * @returns {string[]}
     */
    getUnitList (dimension) {
      let unitList = []
      const unitCurated = Units.find(u => u.dimension === dimension)
      if (unitCurated?.units) {
        unitList = unitList.concat(unitCurated.units)
      }
      if (this.measurementSystem === 'SI') {
        if (unitCurated?.unitsSI) {
          unitList = unitList.concat(unitCurated.unitsSI)
        }
        if (unitCurated?.unitsUS) {
          unitList = unitList.concat(unitCurated.unitsUS)
        }
      } else if (this.measurementSystem === 'US') {
        if (unitCurated?.unitsUS) {
          unitList = unitList.concat(unitCurated.unitsUS)
        }
        if (unitCurated?.unitsSI) {
          unitList = unitList.concat(unitCurated.unitsSI)
        }
      }
      const systemUnit = this.getSystemUnit(dimension)
      if (systemUnit && !unitList.includes(systemUnit)) {
        unitList = [systemUnit].concat(unitList)
      }
      // remove duplicates
      unitList = [...new Set(unitList)]
      return unitList
    },
    /**
     * Get the full list of units for the given dimensions, i.e. the curated units plus all base units with all prefixes.
     * @param dimension
     * @returns {string[]}
     */
    getFullUnitList (dimension) {
      let unitList = []
      const unit = Units.find(u => u.dimension === dimension)
      let units = unit?.baseUnits
      if (units) {
        unitList = unitList.concat(units)
      }
      let metricUnits = unit?.baseUnitsMetric?.flatMap(
        u => MetricPrefixes.map(
          p => p.concat(u)
        ))
      if (metricUnits) {
        unitList = unitList.concat(metricUnits)
      }
      let binaryUnits = unit?.baseUnitsBinary?.flatMap(
        u => BinaryPrefixes.map(
          p => p.concat(u)
        ))
      if (binaryUnits) {
        unitList = unitList.concat(binaryUnits)
      }
      // Make sure all curated units are also included at top, even if missing info in units.js
      // This avoids having to double define them if they are already all in the curated list
      unitList = unitList.concat(this.getUnitList(dimension))
      unitList = [...new Set(unitList)]
      return unitList
    }
  }
}
