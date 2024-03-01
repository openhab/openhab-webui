export default {
  data () {
    return {
      measurementSystem: 'SI',
      dimensions: []
    }
  },
  created () {
    this.$oh.api.get('/').then((root) => {
      this.measurementSystem = root.measurementSystem
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
    getUnitHint (channelType) {
      let units = ((channelType && channelType.unitHint) ? channelType.unitHint : '').split(',')
      return (this.measurementSystem === 'US' && units.length > 1) ? units[1].trim() : units[0].trim()
    }
  }
}
