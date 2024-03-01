import * as Units from '@/assets/units.js'

export default {
  data () {
    return {
      measurementSystem: '',
      dimensions: [],
      dimensionsReady: false
    }
  },
  created () {
    this.$oh.api.get('/rest/').then((data) => {
      this.measurementSystem = data.measurementSystem
    })
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
    unitsReady () {
      const ready = this.measurementSystem && this.dimensionsReady
      if (!ready) return false
      if (this.item.type === 'Group') {
        this.initializeAutocompleteGroupUnit(this.groupDimension)
      } else {
        this.initializeAutocompleteUnit(this.itemDimension)
      }
      return true
    },
    unit () {
      if (!this.unitsReady) return ''
      return this.item.unit ? this.item.unit : (this.createMode ? this.getUnitHint(this.dimension) : this.configuredUnit)
    },
    configuredUnit () {
      if (this.item.unitSymbol) return this.item.unitSymbol
      if (!this.unitsReady) return ''
      return this.item.type === 'Group' ? this.systemUnit(this.groupDimension) : this.systemUnit(this.itemDimension)
    },
    dimension () {
      const parts = this.item.type === 'Group' ? this.item.groupType?.split(':') : this.item.type?.split(':')
      return parts && parts.length > 1 ? parts[1] : ''
    }
  },
  methods: {
    systemUnit (dimension) {
      return this.dimensions.find(d => d.name === dimension)?.systemUnit
    },
    getUnitHint (dimension, channelType) {
      const units = ((channelType && channelType.unitHint) ? channelType.unitHint : '').split(',')
      let unitHint = (this.measurementSystem === 'US' && units.length > 1) ? units[1].trim() : units[0].trim()
      if (!unitHint) {
        const unitCurated = Units.Units.find(u => u.dimension === dimension)
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
        unitHint = this.systemUnit(dimension)
      }
      return unitHint
    },
    getUnitList (dimension) {
      let unitList = []
      const unitCurated = Units.Units.find(u => u.dimension === dimension)
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
      const systemUnit = this.systemUnit(dimension)
      if (systemUnit && !unitList.includes(systemUnit)) {
        unitList = [systemUnit].concat(unitList)
      }
      // remove duplicates
      unitList = [...new Set(unitList)]
      return unitList
    },
    getFullUnitList (dimension) {
      let unitList = []
      const unit = Units.Units.find(u => u.dimension === dimension)
      let units = unit?.baseUnits
      if (units) {
        unitList = unitList.concat(units)
      }
      let metricUnits = unit?.baseUnitsMetric?.flatMap(
        u => Units.prefixesMetric.map(
          p => p.concat(u)
        ))
      if (metricUnits) {
        unitList = unitList.concat(metricUnits)
      }
      let binaryUnits = unit?.baseUnitsBinary?.flatMap(
        u => Units.prefixesBinary.map(
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
