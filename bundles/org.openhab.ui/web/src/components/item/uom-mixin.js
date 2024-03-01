import * as Units from '@/assets/units.js'

export default {
  data () {
    return {
      measurementSystem: 'SI',
      dimensions: []
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
    })
  },
  methods: {
    getUnitHint (dimension, channelType) {
      const units = ((channelType && channelType.unitHint) ? channelType.unitHint : '').split(',')
      let unit = (this.measurementSystem === 'US' && units.length > 1) ? units[1].trim() : units[0].trim() 
      if (!unit) {
        const unitCurated = Units.Units.find(u => u.dimension === dimension)
        if (unitCurated) {
          if (this.measurementSystem === 'SI' && unitCurated.defaultSI) {
            unit = unitCurated.defaultSI
          } else if (this.measurementSystem === 'US' && unitCurated.defaultUS) {
            unit = unitCurated.defaultUS
          } else if (unitCurated.default) {
            unit = unitCurated.default
          }            
        }
      }
      if (!unit) {
        unit = this.dimensions.find(d => d.name === dimension).systemUnit
      }
      return unit
    },
    getUnitList (dimension) {
      let unitList = []
      const unitCurated = Units.Units.find(u => u.dimension === dimension)
      if (unitCurated) {
        if (this.measurementSystem === 'SI' && unitCurated.unitsSI) {
          unitList = unitList.concat(unitCurated.unitsSI)
        } else if (this.measurementSystem === 'US' && unitCurated.unitsUS) {
          unitList = unitList.concat(unitCurated.unitsUS)
        } else {
          unitList = unitList.concat(unitCurated.units)
        }
      }
      const systemUnit = this.dimensions.find(d => d.name === dimension).systemUnit
      if (!unitList.includes(systemUnit)) {
        unitList = [systemUnit].concat(unitList)
      }
      return unitList
    }
  }
}
